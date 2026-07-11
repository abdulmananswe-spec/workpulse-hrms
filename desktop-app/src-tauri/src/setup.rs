use tauri::{App, Manager, WindowEvent};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};

/// Configures window closing intercepts to ensure the app closes to the tray rather than terminating.
pub fn init_window_events(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(main_window) = app.get_webview_window("main") {
        let main_window_clone = main_window.clone();
        
        main_window.on_window_event(move |event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Intercept the close and hide the window
                api.prevent_close();
                log::info!("Close button clicked. Intercepted and minimized window to system tray.");
                let _ = main_window_clone.hide();
            }
        });
    }
    
    // Splashscreen recovery logic: if remote load fails, auto-reboot to offline loader
    if let Some(splashscreen) = app.get_webview_window("splashscreen") {
        let splash_clone = splashscreen.clone();
        let app_handle = app.handle().clone();
        
        // Spawn a local fallback thread to check if the main webview fails to load
        tauri::async_runtime::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_secs(8)).await;
            if let Some(main_window) = app_handle.get_webview_window("main") {
                match main_window.is_visible() {
                    Ok(false) => {
                        log::warn!("Main window failed to show within 8 seconds. Loading offline recovery...");
                        let env = std::env::var("APP_ENV").unwrap_or_else(|_| "production".to_string());
                        let target_url = match env.as_str() {
                            "development" => "http://localhost:3000".to_string(),
                            "staging" => "https://staging-admin.workpulsehrms.com".to_string(),
                            _ => "https://admin.workpulsehrms.com".to_string(),
                        };
                        let offline_url = format!("offline.html?target={}", urlencoding::encode(&target_url));
                        let _ = main_window.navigate(tauri::Url::parse(&format!("tauri://localhost/{}", offline_url)).unwrap());
                        let _ = splash_clone.close();
                        let _ = main_window.show();
                    }
                    _ => {}
                }
            }
        });
    }
    
    Ok(())
}

/// Creates a custom Windows System Tray icon, binding action items and left-click toggles.
pub fn create_tray(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItem::with_id(app, "show", "Show WorkPulse HRMS", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "Minimize to Tray", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let logs = MenuItem::with_id(app, "logs", "Open Diagnostic Logs", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Application", true, None::<&str>)?;
    
    let menu = Menu::with_items(app, &[&show, &hide, &separator, &logs, &quit])?;
    
    let app_icon = app.default_window_icon().cloned().ok_or("Failed to load default window icon")?;
    
    let _tray = TrayIconBuilder::new()
        .icon(app_icon)
        .menu(&menu)
        .on_menu_event(|app_handle, event| {
            match event.id.as_ref() {
                "show" => {
                    log::info!("System Tray: Show clicked.");
                    if let Some(main) = app_handle.get_webview_window("main") {
                        let _ = main.show();
                        let _ = main.set_focus();
                    }
                }
                "hide" => {
                    log::info!("System Tray: Hide clicked.");
                    if let Some(main) = app_handle.get_webview_window("main") {
                        let _ = main.hide();
                    }
                }
                "logs" => {
                    log::info!("System Tray: Open Logs clicked.");
                    // Resolve logs directory
                    let log_dir = app_handle.path().app_log_dir().unwrap_or_default();
                    let log_file = log_dir.join("app.log");
                    
                    if log_file.exists() {
                        #[cfg(target_os = "windows")]
                        {
                            let _ = std::process::Command::new("explorer")
                                .arg("/select,")
                                .arg(&log_file)
                                .spawn();
                        }
                    } else {
                        log::error!("Diagnostics log file does not exist at path: {:?}", log_file);
                    }
                }
                "quit" => {
                    log::info!("System Tray: Quit clicked. Exiting...");
                    app_handle.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            } = event
            {
                log::info!("System Tray: Left-clicked icon. Toggling window visibility.");
                let app_handle = tray.app_handle();
                if let Some(main) = app_handle.get_webview_window("main") {
                    let is_visible = main.is_visible().unwrap_or(false);
                    if is_visible {
                        let _ = main.hide();
                    } else {
                        let _ = main.show();
                        let _ = main.set_focus();
                    }
                }
            }
        })
        .build(app)?;
        
    Ok(())
}
