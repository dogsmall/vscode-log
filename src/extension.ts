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
            completionItem.documentation = new vscode.MarkdownString("babel自动添加日志将忽略此函数");

            return [completionItem];
        }
    }, '@'));

	let disposable = vscode.commands.registerCommand('add-log.addLog', () => {
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
			const node  = getFunctionNode(offset, sourceText, languageType);

			// 如果没有找到函数节点，直接返回
			if(!node) {
				return;
			}
			const {start, end, text} = node;
			// 生成range
			const range = new vscode.Range(new vscode.Position(start.line-1,start.column), new vscode.Position(end.line-1,end.column));
			// 替换代码
			replaceText(range, text);
		}
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
