import * as vscode from 'vscode';

let selectCatSpecie: string | undefined = '';
let provider: BongoCatViewProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bongocat-sidebar" is now active!');

  provider = new BongoCatViewProvider(context.extensionUri);

  context.subscriptions.push(
	vscode.window.registerWebviewViewProvider(
	  'bongoCatView',
	  provider,
	  { webviewOptions: { retainContextWhenHidden: true } }
	)
  );

  context.subscriptions.push(
	vscode.commands.registerCommand('bongocat-sidebar.bongoCat', async () => {
	  const catSpeciesList: string[] = ['original', 'siamese'];
	  let getSpecie: string | undefined = await vscode.window.showQuickPick(catSpeciesList, {
		placeHolder: 'Select a cat 🐱 !!'
	  });

	  if (!getSpecie) {
		getSpecie = 'original';
		console.error("Unable to load a cat specie...");
	  }

	  getSpecie = getSpecie === 'original' ? '' : ('_' + getSpecie);
	  selectCatSpecie = getSpecie;
	  console.log('selectCatSpecie :: ', selectCatSpecie);

	  provider.updateWebview();
	  vscode.commands.executeCommand('bongoCatView.focus');
	})
  );

  // 👉 ดักพิมพ์
  context.subscriptions.push(
	vscode.workspace.onDidChangeTextDocument(() => {
	  provider.triggerBongoAnimation();
	})
  );
}

export function deactivate() { }

class BongoCatViewProvider implements vscode.WebviewViewProvider {
  public _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private bongoStateGenerator: Generator<string>;

  constructor(extensionUri: vscode.Uri) {
	this._extensionUri = extensionUri;
	this.bongoStateGenerator = this.getBongoState();
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
	this._view = webviewView;
	webviewView.webview.options = {
	  enableScripts: true
	};

	this.updateWebview();
  }

  public updateWebview() {
	if (!this._view) return;

	const webview = this._view.webview;

	const img_name = {
	  left: 'bongo_right' + selectCatSpecie + '.png',
	  right: 'bongo_left' + selectCatSpecie + '.png',
	  middle: 'bongo_middle' + selectCatSpecie + '.png',
	};
	console.log('img_name :: ', img_name);

	const bongoRightPath = vscode.Uri.joinPath(this._extensionUri, 'media', img_name.right);
	const bongoRightUri = webview.asWebviewUri(bongoRightPath);
	const bongoLeftPath = vscode.Uri.joinPath(this._extensionUri, 'media', img_name.left);
	const bongoLeftUri = webview.asWebviewUri(bongoLeftPath);
	const bongoMiddlePath = vscode.Uri.joinPath(this._extensionUri, 'media', img_name.middle);
	const bongoMiddleUri = webview.asWebviewUri(bongoMiddlePath);

	webview.html = this.getWebviewContent(bongoLeftUri, bongoRightUri, bongoMiddleUri);
  }

  public triggerBongoAnimation() {
	if (!this._view) return;

	const webview = this._view.webview;
	const nextState = this.bongoStateGenerator.next().value;
	webview.postMessage(nextState);
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
		body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #1e1e1e; }
		img { max-width: 100%; max-height: 100%; object-fit: contain }
	  </style>
	</head>
	<body>
	  <img id="bongo-middle" src="${bongoMiddleUri}" width="100%" />
	  <img id="bongo-left" src="${bongoLeftUri}" width="100%" hidden />
	  <img id="bongo-right" src="${bongoRightUri}" width="100%" hidden />
	
	  <script>
		const bongoLeft = document.getElementById('bongo-left');
		const bongoRight = document.getElementById('bongo-right');
		const bongoMiddle = document.getElementById('bongo-middle');
		let timeout;
	
		window.addEventListener('message', event => {
		  const message = event.data;
		  clearTimeout(timeout);
	
		  if (message === 'left') {
			bongoMiddle.hidden = true;
			bongoLeft.hidden = false;
			bongoRight.hidden = true;
		  } else {
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
	  current = current === BongoState.LEFT ? BongoState.RIGHT : BongoState.LEFT;
	  yield current;
	}
  }
}
