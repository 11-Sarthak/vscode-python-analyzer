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
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
function activate(context) {
    let disposable = vscode.commands.registerCommand('python-analyzer.analyzeFunctions', async () => {
        // Prompt the user to select a folder
        const folderUris = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            openLabel: 'Select folder to analyze'
        });
        if (!folderUris || folderUris.length === 0) {
            vscode.window.showWarningMessage('No folder selected.');
            return;
        }
        const folderPath = folderUris[0].fsPath;
        console.log('Analyzing folder:', folderPath); // LOGGING
        const panel = vscode.window.createWebviewPanel('pythonFunctionAnalysis', 'Python Function Analysis', vscode.ViewColumn.One, { enableScripts: true });
        const config = vscode.workspace.getConfiguration('pythonFunctionAnalyzer');
        const pythonPath = config.get('pythonPath') || 'python';
        const pythonScriptPath = path.join(context.extensionPath, 'pythonFiles', 'analyze_functions.py');
        try {
            const result = await new Promise((resolve, reject) => {
                cp.execFile(pythonPath, [pythonScriptPath, folderPath], (error, stdout, stderr) => {
                    console.log('Python script called with:', pythonScriptPath, folderPath); // LOGGING
                    // Only treat as error if there is no stdout (i.e., Bandit failed)
                    if (error) {
                        reject(error);
                        return;
                    }
                    if (!stdout) {
                        reject(new Error(stderr));
                        return;
                    }
                    resolve(stdout);
                });
            });
            const results = JSON.parse(result);
            const htmlContent = generateHtmlContent(results);
            panel.webview.html = htmlContent;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error analyzing Python functions: ${error}`);
            panel.webview.html = `<h2>Error</h2><pre>${error}</pre>`;
            panel.dispose();
        }
    });
    context.subscriptions.push(disposable);
}
function generateHtmlContent(results) {
    if (results.error) {
        return `<h2>Error</h2><p>${results.error}</p>`;
    }
    let html = `<h2>Bandit Analysis Results</h2>`;
    html += `<pre>${JSON.stringify(results, null, 2)}</pre>`;
    return html;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map