import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
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

        const panel = vscode.window.createWebviewPanel(
            'pythonFunctionAnalysis',
            'Python Function Analysis',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const config = vscode.workspace.getConfiguration('pythonFunctionAnalyzer');
        const pythonPath = config.get<string>('pythonPath') || 'python';
        const pythonScriptPath = path.join(context.extensionPath, 'pythonFiles', 'analyze_functions.py');

        try {
            const result = await new Promise<string>((resolve, reject) => {
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
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing Python functions: ${error}`);
            panel.webview.html = `<h2>Error</h2><pre>${error}</pre>`;
            panel.dispose();
        }
    });

    context.subscriptions.push(disposable);
}

function generateHtmlContent(results: any): string {
    if (results.error) {
        return `<h2>Error</h2><p>${results.error}</p>`;
    }
    let html = `<h2>Bandit Analysis Results</h2>`;
    html += `<pre>${JSON.stringify(results, null, 2)}</pre>`;
    return html;
}

export function deactivate() {}