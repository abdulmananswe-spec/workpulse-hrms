import sys

def main():
    yaml_path = r"d:\Attendence System\employee-attendance-system\.github\workflows\desktop-build.yml"
    print(f"Validating YAML syntax for: {yaml_path}")
    
    try:
        import yaml
        with open(yaml_path, 'r', encoding='utf-8') as f:
            try:
                data = yaml.safe_load(f)
                print("YAML parsing: SUCCESS")
                print("Jobs defined:")
                for job_name in data.get("jobs", {}).keys():
                    print(f"  - {job_name}")
            except yaml.YAMLError as exc:
                print(f"YAML Syntax Error: {exc}")
                sys.exit(1)
    except ImportError:
        print("PyYAML is not installed. Performing basic brace and indentation check...")
        try:
            with open(yaml_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for idx, line in enumerate(lines):
                    # Basic indentation check (tabs are invalid in YAML)
                    if '\t' in line:
                        print(f"Error: Tab character found on line {idx + 1}")
                        sys.exit(1)
            print("Basic text-level scan complete. No tabs found. (Install pyyaml for deep validation).")
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
