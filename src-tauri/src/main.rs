// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri::Manager;

#[tauri::command]
fn extend_scope(handle: tauri::AppHandle, path: std::path::PathBuf) {
    let asset_scope = handle.asset_protocol_scope();
    //let fs_scope = handle.fs_scope();

    // ideally you don't apply a path sent from the frontend or at least not without some validation
    asset_scope.allow_file(&path).ok();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![extend_scope])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
