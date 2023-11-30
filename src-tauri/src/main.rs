// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

extern crate fstream;
use std::env;
use std::io::{self, Read, Write};
use std::str;
use tauri::Manager;
// use rfd::FileDialog;

// fn open() {
// let files = FileDialog::new()
//     .add_filter("text", &["txt", "rs"])
//     .add_filter("rust", &["rs", "toml"])
//     .set_directory("/")
//     .save_file();
// }
// #[derive(serde::Serialize, serde::Deserialize)]
// struct FilterSetting{
//     description: String,
//     ext: Vec<String>
// }

// #[tauri::command]
// fn open_save_file_dialog(initialDir: Option<&str>, windowTitle: Option<&str>, filters: Vec<FilterSetting>) -> Result<String, String> {
//     let file_dialog = FileDialog::new()
//     .set_location(initialDir.unwrap_or("~"))
//     .set_title(windowTitle.unwrap_or("Save File"));

//     for i in 0..filters.len() {
//         let a = file_dialog.clone();
//         let v: Vec<&str> = filters[i].ext.iter().map(AsRef::as_ref).collect();
//         a.add_filter(&filters[i].description, &v);
//     }

//     let file_result = file_dialog.show_save_single_file();

//     let mut result = match file_result {
//         Ok(file) => file,
//         Err(e) => return Err(e.to_string()),
//     };
//     match result {
//         Some(x) => return Ok(x.into_os_string().into_string().unwrap()),
//         None    => return Err("".to_string()),
//     }

//     // let ok = result.unwrap().expect("Pizdec");
//     // let mut file = fs::OpenOptions::new()
//     //     .create(true)
//     //     .write(true)
//     //     // either use the ? operator or unwrap since it returns a Result
//     //     .open(ok).expect("daun");

//     // file.write_all(&file_contents_base64);
// }

#[tauri::command]
fn write_file(filename: &str, data: Vec<u8>) -> Result<bool, String> {

    match fstream::write(filename, "Hello world!", true) {
        Some(b) => println!("Number of bytes written to the file: {}", b),

        None => println!("Couldn't open or write to the file!"),
    }
    // let file = fs::OpenOptions::new()
    //     .create(true)
    //     .write(true)
    //     .open(filename);

    // let mut file_result = match file {
    //     Ok(file) => file,
    //     Err(e) => return Err("RUST: ".to_owned() + &e.to_string().clone()),
    // };

    // let bytes = &data.values().cloned().collect::<Vec<u8>>();
    // let write = file_result.write_all(bytes);

    // match write {
    //     Ok(file) => file,
    //     Err(e) => return Err("RUST: ".to_owned() + &e.to_string().clone()),
    // };

    return Ok(true);
}

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
            greet,
            extend_scope,
            return_inp,
            write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
