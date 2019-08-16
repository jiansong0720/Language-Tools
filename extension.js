const vscode = require('vscode');
const request = require('request-promise');

function activate(context) {

	vscode.window.showInformationMessage('泛微-多语言插件启动成功');

	//获取标签
	let getlabel = vscode.commands.registerTextEditorCommand('extension.getlabel', (textEditor, edit) => {
		let cookie = vscode.workspace.getConfiguration().get('cookie');
		if (!cookie) {
			vscode.window.showInformationMessage('Cookie不存在，请配置后使用');
		} else {
			const document = textEditor.document
			let selection = textEditor.selection;
			let text = document.getText(selection);
			var options = {
				method: 'POST',
				uri: 'https://www.e-cology.com.cn/api/todo/tool/batchTrans',
				form: {
					'data': text
				},
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
					'cookie': cookie
				},
			};
			request(options).then(list => {
				let { ids } = JSON.parse(list);
				vscode.window.activeTextEditor.edit(editBuilder => {
					editBuilder.replace(selection, 'getLabel(' + ids + ',\'' + text + '\')')
				});
			}).catch(error => {
				vscode.window.showInformationMessage(error);
			})
		}
	});
	context.subscriptions.push(getlabel);

	//检查标签是否存在
	let checklabel = vscode.commands.registerTextEditorCommand('extension.checklabel', async (textEditor, edit) => {
		const cookie = vscode.workspace.getConfiguration().get('cookie');
		if (!cookie) {
			vscode.window.showInformationMessage('cookie不存在，请配置后使用');
		} else {
			const document = textEditor.document
			const text = document.getText(textEditor.selection);
			const options = {
				method: 'POST',
				uri: 'https://www.e-cology.com.cn/api/todo/tool/batchTransTest',
				form: {
					'data': text,
					'create': 'n'
				},
				headers: {
					'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
					'cookie': cookie
				}
			};
			let result;
			await request(options).then(res => {
				let { list } = JSON.parse(res);
				result = list
			}).catch(error => {
				vscode.window.showInformationMessage(error);
			})
			if (result.indexOf("已经存在的字符编号") == -1) {
				vscode.window.showInformationMessage('标签不存在！');
			} else {
				let id = result.replace(/[^0-9]/ig, "");
				vscode.window.showInformationMessage('标签存在！getLabel(' + id + ',"' + text + '")');
			}
		}
	})
	context.subscriptions.push(checklabel);

	//获取脚本sql
	let getSql = vscode.commands.registerCommand('extension.getSql', () => {
		let cookie = vscode.workspace.getConfiguration().get('cookie');
		let modulecode = vscode.workspace.getConfiguration().get('modulecode');
		if (!cookie) {
			vscode.window.showInformationMessage('Cookie不存在，请配置后使用！');
		} else if (!modulecode) {
			vscode.window.showInformationMessage('模块名称尚未配置，请配置后使用！');
		} else {
			//获取当前tab标签的全部文本
			const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
			const content = vscode.window.activeTextEditor.document.getText(new vscode.Range(new vscode.Position(0, 0), end));

			//获取文本中所有的getLabel
			let arr = content.match(/getLabel\((.*),/g);
			if (arr) {
				let setId = new Set();
				arr.forEach(item => {
					if ((item.match(/[1-9][0-9]*/)[0])) {
						setId.add((item.match(/[1-9][0-9]*/)[0]))
					}
				})

				let ids = '';
				for (let x of setId) {
					ids += x + ',';
				}
				ids = (ids.substring(ids.length - 1) == ',') ? ids.substring(0, ids.length - 1) : ids;

				vscode.window.showInformationMessage('查询的id共有：' + setId.size + '个，分别是：' + ids);

				//发送请求
				var options = {
					method: 'POST',
					uri: 'https://www.e-cology.com.cn/api/todo/resource/exportLabelSql2',
					form: {
						'ids': ids,
						'modulecode': modulecode
					},
					headers: {
						'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
						'cookie': cookie
					}
				};
				request(options).then(res => {
					let { mysql, oracle, sqlserver } = JSON.parse(res);
					// 创建webview
					const panel = vscode.window.createWebviewPanel(
						'testWebview', // viewType
						"sql语句", // 视图标题
						vscode.ViewColumn.One, // 显示在编辑器的哪个部位
						{
							enableScripts: true, // 启用JS，默认禁用
							retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
						}
					);
					panel.webview.html = `<html><body><textarea rows="18" cols="150">` + mysql + `</textarea><textarea rows="18" cols="150">` + oracle + `</textarea><textarea rows="18" cols="150">` + sqlserver + `</textarea></body></html>`
				}).catch(error => {
					vscode.window.showInformationMessage(error);
				})
			} else {
				vscode.window.showInformationMessage('当前文件没有找到标签！');
			}
		}
	})
	context.subscriptions.push(getSql);
}

exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate,
};