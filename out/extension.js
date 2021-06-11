"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate({ subscriptions, extensionUri }) {
    subscriptions.push(vscode.commands.registerCommand('bongocat-buddy.bongoCat', () => {
        // make web panel in panel 2 for bongo cat friend
        const panel = vscode.window.createWebviewPanel('bongoCat', 'Bongo Cat', vscode.ViewColumn.Two, { enableScripts: true });
        // get its frame paths
        const bongoRightPath = vscode.Uri.joinPath(extensionUri, 'media', 'bongo_right.png');
        const bongoRightUri = panel.webview.asWebviewUri(bongoRightPath);
        const bongoLeftPath = vscode.Uri.joinPath(extensionUri, 'media', 'bongo_left.png');
        const bongoLeftUri = panel.webview.asWebviewUri(bongoLeftPath);
        const bongoMiddlePath = vscode.Uri.joinPath(extensionUri, 'media', 'bongo_middle.png');
        const bongoMiddleUri = panel.webview.asWebviewUri(bongoMiddlePath);
        const bongoFrameGenerator = getBongoState();
        // set the html content with the resolved paths
        panel.webview.html = getWebviewContent(bongoLeftUri, bongoRightUri, bongoMiddleUri);
        // trigger the animation on the typing event, but still trigger default type command
        let typeCommand = vscode.commands.registerCommand('type', (...args) => {
            panel.webview.postMessage(bongoFrameGenerator.next().value);
            return vscode.commands.executeCommand('default:type', ...args);
        });
        subscriptions.push(typeCommand);
        //set up dispose
        panel.onDidDispose(() => {
            typeCommand.dispose();
        }, null, subscriptions);
    }));
}
exports.activate = activate;
function getWebviewContent(bongoLeftUri, bongoRightUri, bongoMiddleUri) {
    return `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Bongo Cat</title>
		</head>
		<body>
			<img id="bongo-middle" src=${bongoMiddleUri} width="100%"/>
			<img id="bongo-left" src=${bongoLeftUri} width="100%" hidden/>
			<img id="bongo-right" src=${bongoRightUri} width="100%" hidden/>
		</body>
		<script>
			const bongoLeft = document.getElementById('bongo-left');
			const bongoRight= document.getElementById('bongo-right');
			const bongoMiddle= document.getElementById('bongo-middle');
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
				timeout = setTimeout(() => {bongoLeft.hidden = true; bongoRight.hidden = true; bongoMiddle.hidden = false; }, 200);
			});
		</script>
	</html>`;
}
var BongoState;
(function (BongoState) {
    BongoState["LEFT"] = "left";
    BongoState["RIGHT"] = "right";
})(BongoState || (BongoState = {}));
function* getBongoState() {
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
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map