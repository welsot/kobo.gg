// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn upload_file(url: String, data: Vec<u8>, content_type: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let result = client
        .put(&url)
        .header("Content-Type", content_type)
        .body(data)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if result.status().is_success() {
        Ok(())
    } else {
        Err(format!("Upload failed with status: {}", result.status()))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, upload_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
