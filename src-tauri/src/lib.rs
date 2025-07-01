use tauri::Emitter;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn start_monitoring(app: tauri::AppHandle) {
    println!("start_monitoring");
    use tauri_plugin_shell::process::CommandEvent;
    use tauri_plugin_shell::ShellExt;

    let sidecar_command = app.shell().sidecar("heart-rate").unwrap();
    let (mut rx, mut _child) = sidecar_command.spawn().expect("Failed to spawn heart-rate");

    tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line_bytes) = event {
                let line = String::from_utf8_lossy(&line_bytes);
                app
                    .emit("heart-rate", line.trim())
                    .expect("failed to emit event");
            }
        }
    });

    // std::thread::spawn(move ||  {
    //     use std::io::{BufRead, BufReader};
    //     use std::process::{Command, Stdio};

    //     let mut child = Command::new("c:/Users/ace/.ei/heart-rate")
    //         .stdout(Stdio::piped())
    //         .spawn()
    //         .expect("Failed to start the executable");

    //     let stdout = child.stdout.take().expect("Failed to capture stdout");
    //     let reader = BufReader::new(stdout);

    //     for line in reader.lines() {
    //         match line {
    //             Ok(line) => {
    //                 println!("Received: {}", line);
    //                 let _ = app_handle.emit("heart-rate", line);
    //             }
    //             Err(e) => eprintln!("Error reading line: {}", e),
    //         }
    //     }

    //     let status = child.wait().expect("Failed to wait on child process");
    //     println!("Child process exited with: {}", status);
    // });

    // std::thread::spawn(|| async move {
    //     let Ok(monitor) = heart_rate::detect_monitor().await else {
    //         println!("monitor not found");
    //         return;
    //     };

    //     let mut receiver = monitor.start_monitoring().await;
    //     while let Some(hr) = receiver.recv().await {
    //         let _ = app_handle.emit("heart-rate", hr);
    //     }
    // });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_blec::init())
        .setup(|app| {
            start_monitoring(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, start_monitoring])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
