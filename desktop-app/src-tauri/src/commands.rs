use tauri::Manager;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppEnvInfo {
    pub env: String,
    pub api_url: String,
    pub version: String,
}

/// Closes the splashscreen loader window and reveals the main application panel.
/// Triggered by the remote web app once it completes loading, or by local timeouts.
#[tauri::command]
pub fn close_splashscreen(app: tauri::AppHandle) -> Result<(), String> {
    log::info!("close_splashscreen command invoked. Swapping windows...");
    
    // Hide and close the splashscreen loader
    if let Some(splashscreen) = app.get_webview_window("splashscreen") {
        splashscreen.close().map_err(|e| {
            let err = format!("Failed to close splashscreen: {}", e);
            log::error!("{}", err);
            err
        })?;
    }
    
    // Make the main window visible and focus it
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.show().map_err(|e| {
            let err = format!("Failed to reveal main window: {}", e);
            log::error!("{}", err);
            err
        })?;
        
        main_window.set_focus().map_err(|e| {
            let err = format!("Failed to focus main window: {}", e);
            log::error!("{}", err);
            err
        })?;
    } else {
        let err = "Main window not found".to_string();
        log::error!("{}", err);
        return Err(err);
    }
    
    log::info!("Splashscreen closed successfully. Main window focused.");
    Ok(())
}

/// Returns the current runtime environment configurations to the frontend.
#[tauri::command]
pub fn get_app_env() -> Result<AppEnvInfo, String> {
    let env = std::env::var("APP_ENV").unwrap_or_else(|_| "production".to_string());
    
    let api_url = match env.as_str() {
        "development" => "http://localhost:3000".to_string(),
        "staging" => "https://staging-admin.workpulsehrms.com".to_string(),
        _ => "https://admin.workpulsehrms.com".to_string(),
    };
    
    Ok(AppEnvInfo {
        env,
        api_url,
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

/// Triggers a native desktop Toast notification.
#[tauri::command]
pub fn trigger_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    log::info!("Triggering native notification: {} - {}", title, body);
    
    tauri_plugin_notification::NotificationExt::notification(&app)
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| {
            let err = format!("Failed to display notification: {}", e);
            log::error!("{}", err);
            err
        })?;
        
    Ok(())
}

/// Native file download mock supporting local system path file downloads.
#[tauri::command]
pub fn download_file(app: tauri::AppHandle, url: String, filename: String) -> Result<String, String> {
    log::info!("Initiating download from {} as {}", url, filename);
    
    // In the future, this can be hooked to tauri::api::http or rust reqwest crate
    // to download the data to the user's Download directory and show native alerts.
    // For now, it returns a mock success status indicating the bridge is functional.
    
    let user_downloads = app.path().download_dir()
        .unwrap_or_else(|_| std::env::temp_dir());
    let target_path = user_downloads.join(&filename);
    
    log::info!("File scheduled to save in: {:?}", target_path);
    Ok(format!("Download started for {} (Destination: {:?})", filename, target_path))
}

/// Native printing bridge wrapper.
#[tauri::command]
pub fn print_document(html_content: String) -> Result<(), String> {
    log::info!("Print document bridge invoked (content length: {} bytes).", html_content.len());
    
    // In production, this integrates with custom windows libraries or spawns the OS spooler.
    // For our wrapper client, we route basic print triggers to JavaScript window.print().
    // If the wrapper requires direct quiet thermal printing (e.g. badge printing), 
    // it will utilize rust print libraries (like printer-rs) here.
    
    Ok(())
}
