use tauri::Emitter;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn start_monitoring(app_handle: tauri::AppHandle) {
    println!("start_monitoring");
    std::thread::spawn(|| async move {
        let Ok(monitor) = heart_rate::detect_monitor().await else {
            println!("monitor not found");
            return;
        };

        let mut receiver = monitor.start_monitoring().await;
        while let Some(hr) = receiver.recv().await {
            let _ = app_handle.emit("heart-rate", hr);
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            start_monitoring(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, start_monitoring])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
