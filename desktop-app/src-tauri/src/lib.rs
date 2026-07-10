pub mod setup;
pub mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register single-instance lock plugin. Focuses existing window if a duplicate launch is tried.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            log::info!("Single-instance check: Duplicate launch blocked. Bringing main window to front.");
            if let Some(main) = app.get_webview_window("main") {
                let _ = main.show();
                let _ = main.set_focus();
            }
        }))
        // Register window state cache plugin to save window size, position, and maximizes.
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // Register file logging engine plugin to pipe structured console and native events.
        .plugin(tauri_plugin_log::Builder::default().build())
        // Register updater plugin to verify release tags and verify installer hashes.
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Apply native window events setup (e.g. close intercepts)
            setup::init_window_events(app)?;
            
            // Build the system tray menu
            setup::create_tray(app.handle())?;
            
            // Resolve build environment parameters and compile target URLs
            let env = std::env::var("APP_ENV").unwrap_or_else(|_| "production".to_string());
            let target_url = match env.as_str() {
                "development" => "http://localhost:3000".to_string(),
                "staging" => "https://staging-admin.workpulsehrms.com".to_string(),
                _ => "https://admin.workpulsehrms.com".to_string(),
            };
            
            log::info!("WorkPulse HRMS starting in {} environment. Target: {}", env, target_url);
            
            // Navigate the main window to the resolved environment endpoint
            if let Some(main_window) = app.get_webview_window("main") {
                main_window.navigate(tauri::Url::parse(&target_url).map_err(|e| {
                    let err = format!("Failed to parse target URL: {}", e);
                    log::error!("{}", err);
                    tauri::Error::TargetClosed // Standard fallback error variant
                })?)?;
            }
            
            Ok(())
        })
        // Register native bridge IPC command endpoints
        .invoke_handler(tauri::generate_handler![
            commands::close_splashscreen,
            commands::get_app_env,
            commands::trigger_notification,
            commands::download_file,
            commands::print_document
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
