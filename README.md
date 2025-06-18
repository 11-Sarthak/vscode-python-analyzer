🚀Python Function Analyzer — VS Code Extension
I built a Visual Studio Code extension that analyzes Python files in any folder and counts the number of top-level functions per file. The results are displayed in a clear, folder-wise tree format right inside VS Code.
🔹 Key Features
One-click analysis: Select any folder and instantly see function counts for all .py files.
Tree view results: Output is shown in a readable, folder-wise tree structure.
Python-powered: Uses a Python backend (AST) for accurate function detection.
Seamless integration: Built with TypeScript and Python, following VS Code’s best practices.
🛠️ Tech Stack
VS Code Extension API (TypeScript)
Python (AST module)
Node.js child_process for backend communication
📦 How it works
Run the command Analyze Python Functions from the Command Palette.
Select any folder to analyze.
View a panel with a tree view of function counts per file.
