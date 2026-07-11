import urllib.request
import json

def main():
    run_id = "29122614202"
    repo = "abdulmananswe-spec/workpulse-hrms"
    
    url = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    
    try:
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read().decode())
            print("RUN INFO:")
            print(f"  ID: {data.get('id')}")
            print(f"  Name: {data.get('name')}")
            print(f"  Ref: {data.get('head_branch')}")
            print(f"  SHA: {data.get('head_sha')}")
            print(f"  Commit Message: {data.get('head_commit', {}).get('message', '').strip()}")
            print(f"  Status: {data.get('status')} / Conclusion: {data.get('conclusion')}")
    except Exception as e:
        print(f"Error fetching run {run_id}: {e}")

if __name__ == "__main__":
    main()
