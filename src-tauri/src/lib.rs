use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Emitter;
use tauri::{AppHandle, Manager};

fn start_monitoring(app: tauri::AppHandle) {
    use tauri_plugin_shell::process::CommandEvent;
    use tauri_plugin_shell::ShellExt;

    let sidecar_command = app.shell().sidecar("heart-rate").unwrap();
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn heart-rate");

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let line = String::from_utf8_lossy(&line_bytes);
                app.emit("heart-rate", line.trim())
                    .expect("failed to emit event");
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            start_monitoring(app.handle().clone());

            let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;
            let _ = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(
                    |app: &AppHandle<tauri::Wry>, event| match event.id.as_ref() {
                        "quit" => {
                            // println!("quit menu item was clicked");
                            app.exit(0);
                        }
                        "show" => {
                            if let Some(app) = app.get_webview_window("main") {
                                app.show().expect("failed to show webview_window");
                            }
                        }
                        "hide" => {
                            if let Some(app) = app.get_webview_window("main") {
                                app.hide().expect("failed to hide webview_window");
                            }
                        }
                        _ => {
                            // println!("menu item {:?} not handled", event.id);
                        }
                    },
                )
                .build(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
