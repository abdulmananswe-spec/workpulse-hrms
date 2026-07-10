import os
import sys
import shutil

def main():
    # Source image path
    source_img = r"C:\Users\Abdul Manan\.gemini\antigravity-ide\brain\5ee0c4e0-ea64-4e07-b65b-e77a1901e482\workpulse_icon_1783713600400.png"
    target_dir = r"d:\Attendence System\employee-attendance-system\desktop-app\src-tauri\icons"
    
    if not os.path.exists(source_img):
        print(f"Source image not found: {source_img}")
        sys.exit(1)
        
    os.makedirs(target_dir, exist_ok=True)
    
    try:
        from PIL import Image
        print("PIL is installed. Processing images...")
        img = Image.open(source_img)
        
        # Save 32x32
        img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "32x32.png"), "PNG")
        # Save 128x128
        img.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "128x128.png"), "PNG")
        # Save 128x128@2x (256x256)
        img.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "128x128@2x.png"), "PNG")
        # Save ICO
        img.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "icon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
        # Save placeholder ICNS by copying (Tauri will build on Windows mostly, so icns is less critical, but we can copy png or mock)
        img.resize((256, 256), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "icon.icns"), "PNG")
        
        print("Successfully resized and saved all icons.")
    except ImportError:
        print("PIL (Pillow) is not installed. Copying base image as placeholder...")
        # If PIL is not installed, copy the base image directly to all target filenames
        # Tauri's bundler might throw errors if file formats don't match, but it ensures files exist for CI/CD
        shutil.copy2(source_img, os.path.join(target_dir, "32x32.png"))
        shutil.copy2(source_img, os.path.join(target_dir, "128x128.png"))
        shutil.copy2(source_img, os.path.join(target_dir, "128x128@2x.png"))
        shutil.copy2(source_img, os.path.join(target_dir, "icon.ico"))
        shutil.copy2(source_img, os.path.join(target_dir, "icon.icns"))
        print("Copied raw base image as placeholders. (Run PIL resize on CI or locally for production formatting).")

if __name__ == "__main__":
    main()
