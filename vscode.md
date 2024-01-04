## Web 工程化：使用 vscode 插件 实现前端日志无痕插桩

### 前言

在之前一篇 ttc 文章中[Web 工程化：使用 Babel 实现前端日志无痕插桩](https://ttc.zhiyinlou.com/#/articleDetail?id=4921),我们描述了前端添加日志的一些难点和痛点,所以当时采用了 babel 通过编译时全量添加日志,解决了日志的从无到有的问题.但是全量增加有利有弊,在上篇文章中也有表述.总的来说,它在项目比较老旧,现有人员对代码不清楚,日志大量缺少的时候能快速添加日志,解决了当时的燃眉之急.而弊端就是全量日志导致的日志量大,写入频繁,遇到循环代码中添加的日志可能导致的性能问题和日志最后上传压力,排查问题的时候会被大量无用日志干扰等等.所以在度过了一段混乱阶段后,日志的精细化运营提上了日程

### 又一次回到了手动时代

我们计划在新增的代码中,过滤掉 babel 的自动添加代码,通过手动添加日志,来做到日志的精细化.但是这样似乎是走了历史的倒车,手动添加日志的苦又要再吃一遍吗?

我们相信技术总是以一种螺旋上升的方式在前进

在一次组内学习过程中从一个视频看到了别的团队通过 vscode 插件实现组件自动引入操作,给了我一个思考方向,我们可不可以通过 vscode 插件来快捷方便的实现日志的添加

### 如何实现一个 vscode 插件

如何创建第一个插件请先阅读官方文档[your-first-extension](https://code.visualstudio.com/api/get-started/your-first-extension),根据官网文档,安装依赖和通过 `yo code` 搭建第一个插件项目

第一步,如果你完全按照文档搭建的话,在`src/extension.ts`文件中,可以看到以下代码:

```ts
import * as vscode from "vscode";
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "helloworld" is now active!');
  let disposable = vscode.commands.registerCommand(
    "helloworld.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from HelloWorld!");
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
```

第二步,在 package.json 文化中可以看到:

```json
  "contributes": {
    "commands": [
      {
        "command": "helloworld.helloWorld",
        "title": "Hello World"
      }
    ]
  }
```

第三步,这个时候,按 F5 启动插件调试模式,在新打开的 vscode 中按`shift+command+P`唤起命令行,输入`hello` 可以看到:

![image.png](https://pa-oss-cn-prod.oss-cn-beijing.aliyuncs.com/img/vscode-logimg.png?Expires=1704278582&OSSAccessKeyId=TMP.3Khu5GJ1UyQPGc37NwP8AGDLyKC5HdLbQyCT6iLAVMqFmGEbdtAJ7tdNjL829PWpb969hUDxDRcBdMS13SiTR7dYipNdsH&Signature=Xq6dE09U7AnzG2zyNmH1Y3gbOnw%3D)

第四步,选中后就可以看到:

![image1.png](https://pa-oss-cn-prod.oss-cn-beijing.aliyuncs.com/img/vscode-logimg1.png?Expires=1704278603&OSSAccessKeyId=TMP.3Khu5GJ1UyQPGc37NwP8AGDLyKC5HdLbQyCT6iLAVMqFmGEbdtAJ7tdNjL829PWpb969hUDxDRcBdMS13SiTR7dYipNdsH&Signature=8Zj2GwLUo3FhIhnE2f%2B8mjxugb8%3D)

最后,一个 vscode 插件就这样完成了,他的作用是当你调用命令时,弹出一个提示框.

分析一下上面的代码可以看出,`activate`方法在插件被启用的时候被调用(如果想配置指定格式的文件例如*.js,*.vue 等才会启动该插件,在 package.json 中的`activationEvents`字段配置),我们在方法中注册一个事件`helloworld.helloWorld`,并在 package.json 中配置了该事件的启动项,通过配置的命令 title `Hello World`在命令行中调用事件

到这里你应该对整个插件的运行原理有了一定了解,相信你一定也想到了很多利用 vscode 插件的好点子,但是还是让我们把目光放回到如何添加日志上来

### 如何添加日志

我们先拆解一下想要利用 vscode 在代码中添加日志,需要几个必要步骤:

1. 获取当前光标位置
2. 判断当前光标在哪个函数代码块
3. 创建要添加的日志代码并把它添加到对应代码块
4. 将编辑后的代码覆盖到编辑器中原代码的位置

我直接展示一下最终的代码

```ts
let disposable = vscode.commands.registerCommand("add-log.addLog", () => {
  // 获取当前编辑器
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // 获取当前文件类型
    const languageType = vscode.window.activeTextEditor?.document.languageId;

    if (!languageType) {
      return;
    }
    // 获取当前光标所在位置
    let curPos = editor.selection.active;
    // 获取当前光标所在位置的偏移量
    let offset = editor.document.offsetAt(curPos);
    // 获取当前文件内容
    const sourceText = editor.document.getText();

    // sourceText to AST
    // 1. 获取当前光标所在的函数节点
    // 2. 并添加日志
    // 3. 返回最终的代码和开始结束位置
    const node = getFunctionNode(offset, sourceText, languageType);

    // 如果没有找到函数节点，直接返回
    if (!node) {
      return;
    }
    // 返回的node中提供原有代码的开始位置和结束位置,并返回添加日志代码后的代码字符串
    const { start, end, text } = node;
    // 生成range
    const range = new vscode.Range(
      new vscode.Position(start.line - 1, start.column),
      new vscode.Position(end.line - 1, end.column)
    );
    // 替换原来代码
    replaceText(range, text);
  }
});
```

### getFunctionNode 的思路

在上一篇文章中我们介绍了 babel, 可以说一但涉及到的代码的动态修改,那 babel 是必不可少的,因为只有在 AST 树的时候,我们才能对每个节点做删除,替换和新增

强烈推荐一个网站[astexplorer](https://astexplorer.net/),该网站会把代码转换成 AST 树,试试把自己的代码转换成更直观的 AST 树

`getFunctionNode`函数可以获取到 `offset` 光标位置, `sourceText` 原窗口代码,那么通过 babel 将`sourceText`转换成 AST 树后,遍历树的节点,判断该节点的起始位置和结束位置是否涵盖`offset`位置,即可找到光标的对应节点

找到对应节点,那么接下来的事情就变成了在 AST 树中对应的某个节点中添加一个日志子节点,具体操作思路同上一篇文章一直,请参考之前的文章

那么现在我们就有了该节点所对应代码在编辑器中原本起始位置和添加了日志的节点,接下来只需要替换该节点在编辑器上的代码即可

getFunctionNode 代码量比较大,就不直接粘贴了,有兴趣的朋友可以去 git 上[vscode-log](https://github.com/dogsmall/vscode-log)看源码

### 替换原有代码

```ts
function replaceText(range: vscode.Range, newText: string) {
  const editor = vscode.window.activeTextEditor;
  let document = editor.document;
  let edit = new vscode.WorkspaceEdit();
  edit.replace(document.uri, range, newText);
  vscode.workspace.applyEdit(edit);
}
```

我发现 copilot 解释的比我说的更细致,所以大家直接把代码 copy 一下到 copilot 问问吧
copilot 解释:
这段代码是一个名为 replaceText 的函数，它是在一个 Visual Studio Code 扩展中使用的。这个函数的目的是替换活动编辑器中的一段文本。

函数接受两个参数：range 和 newText。range 是一个 vscode.Range 对象，表示要替换的文本的范围。newText 是一个字符串，表示要插入的新文本。

在函数体中，首先获取当前活动的文本编辑器，然后获取编辑器中的文档。然后，创建一个新的 vscode.WorkspaceEdit 对象，这个对象可以用来创建和管理对工作区的编辑。

接下来，使用 edit.replace 方法来添加一个替换操作。这个方法接受三个参数：要编辑的文档的 URI，要替换的范围，以及要插入的新文本。

最后，使用 vscode.workspace.applyEdit 方法来应用这个编辑。这个方法会返回一个 Promise，当编辑被成功应用时，这个 Promise 会被解析。

### 如何打包上传

[上传官方文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension),注意不要直接就跟着官方文档一步一步来,先把这篇文章全部阅读一遍,然后再开始操作,因为需要的依赖项被放在了下面,如果直接按照文章的步骤会被卡住

有一些踩坑项:

1. 需要在两个地方创建相关账号,一个是 Azure DevOps 创建一个组织,这里仅仅是为了后面获取 Personal access tokens,并不是管理插件的地方,真正管理插件的(类似 npm 管理)的地方是 [Visual Studio Marketplace publisher management page](https://marketplace.visualstudio.com/manage)
1. 如果最初使用的是 npm 的话,打包可能会失败,建议使用 yarn,pnpm
1. 需要注意的是,默认的 package.json 中缺少 `publisher` 配置,需要根据上面你申请的 publisher 来配置,否则上传肯定失败,可以参考我 git [vscode-log](https://github.com/dogsmall/vscode-log)上代码中的 package.json

最终我们完成了 打包, 申请 Azure DevOps,申请 Marketplace publisher,之后就可以使用命令`vsce publish`完成插件上传

但是跟 npm 包 不一致的是,上传并不就代码发布成功,你需要在 publisher 管理后台点击发布之后才能在 vscode 的插件 store 里搜到自己的插件

### 如何给命令添加快捷键

平时开发中可以发现,有些命令是可以通过快捷键调用的,例如 copilot 可以通过 shift + command + i 调用,那我们自己的插件是否可以通过快捷键调用呢,答案是可以的.只需要在 package.json 中配置对应的快捷键即可,注意命令关键字一定要一致,默认是 window 键盘,如果是 mac 需要单独配置 注意,如果想配置成 ctrl + D + L ,需要写成 `ctrl+D ctrl+L`,而不是`ctrl + D + L`

```json
  "contributes": {
    "commands": [
      {
        "command": "add-log.addLog",
        "category": "AddLog",
        "title": "Add Log"
      }
    ],
    "keybindings": [
      {
        "command": "add-log.addLog",
        "key": "ctrl+D ctrl+L",
        "mac": "cmd+D cmd+L"
      }
    ]
  },
```

### 扩展一下

大家在用 vscode 中一定遇到过输入一个开头字母,vscode 就会提示你整个单词或者选项,例如在 ts 文件中,在注释符后面输入一个@会立刻提示`@ts-ignore`,这种代码提示如何实现呢?

```ts
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "javascript",
      {
        provideCompletionItems(document, position, token, context) {
          console.log("provideCompletionItems", document, position, token);
          let linePrefix = document
            .lineAt(position)
            .text.substring(0, position.character);
          if (
            !linePrefix.trim().startsWith("//") ||
            !linePrefix.endsWith("@")
          ) {
            return undefined;
          }
          let completionItem = new vscode.CompletionItem(
            "@log-ignore",
            vscode.CompletionItemKind.Snippet
          );
          completionItem.insertText = new vscode.SnippetString("log-ignore");
          completionItem.documentation = new vscode.MarkdownString(
            "babel自动添加日志将忽略此函数"
          );

          return [completionItem];
        },
      },
      "@"
    )
  );
}
```

大家可以看下这段代码在有什么用,可以通过 copilot 更进一步了解

### 成果演示

![示例GIF](https://pa-oss-cn-prod.oss-cn-beijing.aliyuncs.com/img/vscode-log.gif?Expires=1704278283&OSSAccessKeyId=TMP.3Khu5GJ1UyQPGc37NwP8AGDLyKC5HdLbQyCT6iLAVMqFmGEbdtAJ7tdNjL829PWpb969hUDxDRcBdMS13SiTR7dYipNdsH&Signature=DWsI3lnXozK3zWKwFzveBNZKn2k%3D)
