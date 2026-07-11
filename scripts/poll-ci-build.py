import urllib.request
import json
import time
import sys

def main():
    repo = "abdulmananswe-spec/workpulse-hrms"
    # Target commit SHA we want to check is the latest commit we just pushed: 039976a
    target_sha = "039976af5996cc9e0feccbc72622f6fa72e50cf1"
    
    print(f"Monitoring GitHub Actions build for commit: {target_sha[:7]}...")
    
    # Wait 10 seconds initially for GitHub to register the run
    time.sleep(10)
    
    run_id = None
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    # Poll until we find the run ID
    for attempt in range(10):
        url = f"https://api.github.com/repos/{repo}/actions/runs"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as r:
                data = json.loads(r.read().decode())
                for run in data.get("workflow_runs", []):
                    if run.get("head_sha") == target_sha and "desktop" in run.get("path", "").lower():
                        run_id = run.get("id")
                        print(f"Found active workflow run ID: {run_id}")
                        break
        except Exception as e:
            print(f"Error checking runs: {e}")
        
        if run_id:
            break
        print("Waiting for run to register on GitHub...")
        time.sleep(10)
        
    if not run_id:
        print("Could not find the workflow run on GitHub. Exiting.")
        sys.exit(1)
        
    # Poll the specific run ID until it completes
    url_run = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}"
    while True:
        req = urllib.request.Request(url_run, headers=headers)
        try:
            with urllib.request.urlopen(req) as r:
                data = json.loads(r.read().decode())
                status = data.get("status")
                conclusion = data.get("conclusion")
                
                print(f"Status: {status} / Conclusion: {conclusion}")
                
                if status == "completed":
                    print(f"\nBuild complete! Conclusion: {conclusion}")
                    if conclusion == "success":
                        print("MSI and EXE installers built and uploaded successfully!")
                        sys.exit(0)
                    else:
                        print("Build failed. Fetching job logs and annotations...")
                        fetch_job_errors(repo, run_id, headers)
                        sys.exit(1)
        except Exception as e:
            print(f"Error polling run: {e}")
            
        time.sleep(30)

def fetch_job_errors(repo, run_id, headers):
    url_jobs = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}/jobs"
    req = urllib.request.Request(url_jobs, headers=headers)
    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            for job in data.get("jobs", []):
                print(f"\nJob: {job.get('name')} ({job.get('status')} / {job.get('conclusion')})")
                print("Steps:")
                for step in job.get("steps", []):
                    if step.get("conclusion") == "failure":
                        print(f"  [X] Failed Step: {step.get('name')}")
                        
                # Fetch annotations if any
                fetch_annotations(repo, job.get("id"), headers)
    except Exception as e:
        print(f"Error fetching job errors: {e}")

def fetch_annotations(repo, job_id, headers):
    # Check runs endpoint contains annotations
    url_check = f"https://api.github.com/repos/{repo}/check-runs/{job_id}"
    req = urllib.request.Request(url_check, headers=headers)
    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            output = data.get("output", {})
            if output:
                print(f"  Title: {output.get('title')}")
                print(f"  Summary: {output.get('summary')}")
                print(f"  Text: {output.get('text')}")
    except Exception as e:
        pass

if __name__ == "__main__":
    main()
