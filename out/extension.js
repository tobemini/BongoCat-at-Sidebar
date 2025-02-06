"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Congratulations, your extension "bongocat-sidebar" is now active!');
    const provider = new BongoCatViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('bongoCatView', provider, { webviewOptions: { retainContextWhenHidden: true } }));
    context.subscriptions.push(vscode.commands.registerCommand('bongocat-sidebar.bongoCat', () => {
        vscode.commands.executeCommand('bongoCatView.focus');
    }));
}
// This method is called when your extension is deactivated
function deactivate() { }
class BongoCatViewProvider {
    _view;
    _extensionUri;
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView) {
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
    getWebviewContent(bongoLeftUri, bongoRightUri, bongoMiddleUri) {
        return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Bongo Cat</title>
		  <style>
			  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
			  img { max-width: 100%; max-height: 100%; }
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
    *getBongoState() {
        let BongoState;
        (function (BongoState) {
            BongoState["LEFT"] = "left";
            BongoState["RIGHT"] = "right";
        })(BongoState || (BongoState = {}));
        let current = BongoState.LEFT;
        while (true) {
            if (current === BongoState.LEFT) {
                current = BongoState.RIGHT;
                yield BongoState.RIGHT;
            }
            else {
                current = BongoState.LEFT;
                yield BongoState.LEFT;
            }
        }
    }
}
//# sourceMappingURL=extension.js.map