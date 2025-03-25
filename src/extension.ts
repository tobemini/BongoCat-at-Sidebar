import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "bongocat-sidebar" is now active!');
	const provider = new BongoCatViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		  'bongoCatView', 
		  provider, 
		  { webviewOptions: { retainContextWhenHidden: true } }
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('bongocat-sidebar.bongoCat', () => {
		  vscode.commands.executeCommand('bongoCatView.focus');
		})
	);

}

// This method is called when your extension is deactivated
export function deactivate() {}

class BongoCatViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;
	private _extensionUri: vscode.Uri;
  
	constructor(extensionUri: vscode.Uri) {
	  this._extensionUri = extensionUri;
	}
  
	resolveWebviewView(webviewView: vscode.WebviewView) {
	  this._view = webviewView;
	  webviewView.webview.options = {
		enableScripts: true
	  };
  
	  const bongoRightPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'bongo_right.png');
	  const bongoRightUri = webviewView.webview.asWebviewUri(bongoRightPath);
	  const bongoLeftPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'bongo_left.png');
	  const bongoLeftUri = webviewView.webview.asWebviewUri(bongoLeftPath);
	  const bongoMiddlePath = vscode.Uri.joinPath(this._extensionUri, 'media', 'bongo_middle.png');
	  const bongoMiddleUri = webviewView.webview.asWebviewUri(bongoMiddlePath);
  
	  const bongoFrameGenerator = this.getBongoState();
  
	  webviewView.webview.html = this.getWebviewContent(bongoLeftUri, bongoRightUri, bongoMiddleUri);
  
	  const typeCommand = vscode.commands.registerCommand('type', (...args) => {
		webviewView.webview.postMessage(bongoFrameGenerator.next().value);
		return vscode.commands.executeCommand('default:type', ...args);
	  });
  
	  webviewView.onDidDispose(() => {
		typeCommand.dispose();
	  });
	}
  
	private getWebviewContent(bongoLeftUri: vscode.Uri, bongoRightUri: vscode.Uri, bongoMiddleUri: vscode.Uri) {
	  return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Bongo Cat</title>
		  <style>
			  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
			  img { max-width: 100%; max-height: 100%; object-fit: contain }
		  </style>
	  </head>
	  <body>
		  <img id="bongo-middle" src="${bongoMiddleUri}" width="100%"/>
		  <img id="bongo-left" src="${bongoLeftUri}" width="100%" hidden/>
		  <img id="bongo-right" src="${bongoRightUri}" width="100%" hidden/>
		  
		  <script>
			  const bongoLeft = document.getElementById('bongo-left');
			  const bongoRight = document.getElementById('bongo-right');
			  const bongoMiddle = document.getElementById('bongo-middle');
			  let timeout;
  
			  window.addEventListener('message', event => {
				  const message = event.data;
				  clearTimeout(timeout);
				  
				  if(message == 'left'){
					  bongoMiddle.hidden = true;
					  bongoLeft.hidden = false;
					  bongoRight.hidden = true;
				  }else{
					  bongoMiddle.hidden = true;
					  bongoLeft.hidden = true;
					  bongoRight.hidden = false;
				  }
				  
				  timeout = setTimeout(() => {
					  bongoLeft.hidden = true;
					  bongoRight.hidden = true;
					  bongoMiddle.hidden = false;
				  }, 200);
			  });
		  </script>
	  </body>
	  </html>`;
	}
  
	private *getBongoState() {
	  enum BongoState {
		LEFT = 'left',
		RIGHT = 'right'
	  }
  
	  let current = BongoState.LEFT;
	  while (true) {
		if (current === BongoState.LEFT) {
		  current = BongoState.RIGHT;
		  yield BongoState.RIGHT;
		} else {
		  current = BongoState.LEFT;
		  yield BongoState.LEFT;
		}
	  }
	}
  }