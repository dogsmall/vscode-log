import * as vscode from 'vscode';
import { getFunctionNode } from './handlers';

export function activate(context: vscode.ExtensionContext) {
	// 添加代码提示
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems(document, position, token, context) {
            console.log('provideCompletionItems', document, position, token);
            let linePrefix = document.lineAt(position).text.substring(0, position.character);
            if (!linePrefix.trim().startsWith('//')||!linePrefix.endsWith('@')) {
                return undefined;
            }
            let completionItem = new vscode.CompletionItem('@log-ignore', vscode.CompletionItemKind.Snippet);
            completionItem.insertText = new vscode.SnippetString('log-ignore');
            completionItem.documentation = new vscode.MarkdownString("自动添加日志忽略此函数");

            return [completionItem];
        }
    }, '@'));

	let disposable = vscode.commands.registerCommand('add-log.addLog', () => {

		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const languageType = vscode.window.activeTextEditor?.document.languageId;
			if (!languageType) {
				return;
			  }
			// 获取当前光标所在位置
			let curPos = editor.selection.active;
			let offset = editor.document.offsetAt(curPos);
			console.log(offset, languageType);
			// 获取当前文件内容
			const text = editor.document.getText();
			// console.log(text);

			// text to ast
			const list  = getFunctionNode(offset, text, languageType);
			// 获取要添加日志的代码范围和添加了日志的代码
			console.log(list);
			list.forEach((item) => {
				const {start, end, text} = item;
				const range = new vscode.Range(new vscode.Position(start.line-1,start.column), new vscode.Position(end.line-1,end.column));
				replaceText(range, text);
			});
		}


		// TODO 获取当前光标所在位置
		// TODO 获取当前光标所在函数的位置
		// TODO 获取当前光标所在函数的参数
		// TODO 添加日志
		// TODO 转换为字符串
		// TODO 替换当前光标所在函数
		// TODO 获取当前光标所在文件
		vscode.window.showInformationMessage('Hello World from add-log!');
	});

	context.subscriptions.push(disposable);
}


function replaceText(range: vscode.Range, newText: string) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		let document = editor.document;
		let edit = new vscode.WorkspaceEdit();
		// 修改第一行的前5个字符
		edit.replace(document.uri, range, newText); // 将第一行的前5个字符替换为'new text'
		vscode.workspace.applyEdit(edit);
	}
}
// This method is called when your extension is deactivated
export function deactivate() {}
