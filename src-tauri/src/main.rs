// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate fstream;
use std::env;
use std::io::{self, Read, Write};
use std::str;
use tauri::Manager;

#[tauri::command]
fn extend_scope(handle: tauri::AppHandle, path: std::path::PathBuf) {
    let asset_scope = handle.asset_protocol_scope();
    //let fs_scope = handle.fs_scope();

    // ideally you don't apply a path sent from the frontend or at least not without some validation
    asset_scope.allow_file(&path).ok();
}

#[tauri::command]
fn return_inp() -> std::string::String {
    let s = String::from_utf8(read_input().unwrap()).expect("Found invalid UTF-8");
    write_output("disconnect").unwrap();
    return s;
}

fn read_input() -> io::Result<Vec<u8>> {
    let mut instream = io::stdin();
    let mut length = [0; 4];
    instream.read(&mut length)?;
    let mut buffer = vec![0; u32::from_ne_bytes(length) as usize];
    instream.read_exact(&mut buffer)?;
    return Ok(buffer);
}

fn write_output(msg: &str) -> io::Result<()> {
    let mut outstream = io::stdout();
    let len = msg.len();
    if len > 1024 * 1024 {
        panic!("Message was too large, length: {}", len)
    }
    outstream.write(&len.to_ne_bytes())?;
    outstream.write_all(msg.as_bytes())?;
    outstream.flush()?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            extend_scope,
            return_inp
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
