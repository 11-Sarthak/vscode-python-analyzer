import sys
import os
import json
import subprocess
from typing import Dict, Any, List, Tuple

print("sys.argv:", sys.argv, file=sys.stderr)  # LOGGING: Show the arguments passed to the script

def run_bandit_analysis(directory_path: str) -> Dict[str, Any]:
    """Run bandit analysis on the given directory."""
    try:
        print(f"Using directory path: {directory_path}", file=sys.stderr)
        print(f"Analyzing directory: {os.path.abspath(directory_path)}", file=sys.stderr)
        
        # Run bandit with JSON output and additional flags
        result = subprocess.run(
            ['bandit', '-r', '-f', 'json', '-ll', directory_path],
            capture_output=True,
            text=True
        )
        
        # Parse bandit output
        try:
            bandit_results = json.loads(result.stdout)
        except json.JSONDecodeError:
            print(f"Error parsing bandit output: {result.stdout}", file=sys.stderr)
            return {
                'error': 'Failed to parse bandit output',
                'files': {},
                'total_issues': 0,
                'severity_counts': {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
            }
        
        # Process results
        analysis_results = {
            'files': {},
            'total_issues': len(bandit_results.get('results', [])),
            'severity_counts': {
                'LOW': 0,
                'MEDIUM': 0,
                'HIGH': 0
            }
        }
        
        # Process each issue
        for issue in bandit_results.get('results', []):
            filename = issue.get('filename')
            severity = issue.get('issue_severity', 'LOW')
            
            if filename:
                print(f"Processing file: {filename}", file=sys.stderr)
                if filename not in analysis_results['files']:
                    analysis_results['files'][filename] = {
                        'issues': [],
                        'total_issues': 0,
                        'severity_counts': {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
                    }
                
                analysis_results['files'][filename]['issues'].append({
                    'line': issue.get('line_number'),
                    'severity': severity,
                    'message': issue.get('issue_text'),
                    'code': issue.get('code'),
                    'test_id': issue.get('test_id'),
                    'test_name': issue.get('test_name')
                })
                analysis_results['files'][filename]['total_issues'] += 1
                analysis_results['files'][filename]['severity_counts'][severity] += 1
                analysis_results['severity_counts'][severity] += 1
        
        return analysis_results
    except Exception as e:
        print(f"Error running bandit analysis: {str(e)}", file=sys.stderr)
        return {
            'error': str(e),
            'files': {},
            'total_issues': 0,
            'severity_counts': {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python analyze_functions.py <directory_path>", file=sys.stderr)
        sys.exit(1)
    
    directory_path = sys.argv[1]
    results = run_bandit_analysis(directory_path)
    print(json.dumps(results))  # Only this prints to stdout!