#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_python_backend,
            check_python_backend_status,
            get_app_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn start_python_backend() -> Result<String, String> {
    // Check if Python backend is already running
    match check_python_backend_status().await {
        Ok(status) => {
            if status.contains("running") {
                return Ok("Python backend is already running".to_string());
            }
        }
        Err(_) => {}
    }

    // Start the Python backend
    let backend_path = std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .join("..")
        .join("py-backend")
        .join("main.py");

    println!("Starting Python backend at: {:?}", backend_path);

    match std::process::Command::new("python3")
        .arg(&backend_path)
        .spawn()
    {
        Ok(child) => {
            println!("Python backend started with PID: {}", child.id());
            Ok(format!("Python backend started successfully (PID: {})", child.id()))
        }
        Err(e) => {
            println!("Failed to start Python backend: {}", e);
            Err(format!("Failed to start Python backend: {}", e))
        }
    }
}

#[tauri::command]
async fn check_python_backend_status() -> Result<String, String> {
    // Simple check - in a real implementation, you'd check if the FastAPI server is responding
    // For now, we'll just check if the Python process is running
    let output = Command::new("pgrep")
        .args(&["-f", "python3.*main.py"])
        .output();

    match output {
        Ok(output) if output.stdout.is_empty() => {
            Err("Python backend is not running".to_string())
        }
        Ok(_) => {
            Ok("Python backend is running".to_string())
        }
        Err(e) => {
            Err(format!("Error checking backend status: {}", e))
        }
    }
}

#[tauri::command]
fn get_app_version() -> Result<String, String> {
    Ok("1.0.0".to_string())
}