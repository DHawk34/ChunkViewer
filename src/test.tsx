import { listen } from '@tauri-apps/api/event'
listen('tauri://file-drop-hover', event => { console.log(event) })