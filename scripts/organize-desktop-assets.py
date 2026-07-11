import os
import shutil

def main():
    desktop_app_dir = r"d:\Attendence System\employee-attendance-system\desktop-app"
    dist_dir = os.path.join(desktop_app_dir, "dist")
    
    print(f"Creating assets directory: {dist_dir}")
    os.makedirs(dist_dir, exist_ok=True)
    
    files_to_move = ["offline.html", "splashscreen.html"]
    for filename in files_to_move:
        src = os.path.join(desktop_app_dir, filename)
        dst = os.path.join(dist_dir, filename)
        
        if os.path.exists(src):
            print(f"Moving {filename} to dist/")
            shutil.move(src, dst)
        else:
            print(f"File {filename} already moved or does not exist at source.")
            
    print("Desktop assets organization complete!")

if __name__ == "__main__":
    main()
