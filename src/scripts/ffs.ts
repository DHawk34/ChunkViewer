import { tauri } from "@tauri-apps/api";
import { DialogFilter, save } from '@tauri-apps/api/dialog';

export async function write(filename: string, data: Uint8Array): Promise<boolean> {
    var a = Array.from(data);

    console.time("save");
    let b: boolean = await tauri.invoke('write_file', { filename: filename })
    console.timeEnd("save");

    return b;
}

export async function showSaveFileDialog(initialPath: string = '~', title: string = 'Save File', filters: DialogFilter[] = []) {
    let filePath = await save({
        defaultPath: initialPath,
        title: title,
        filters: filters
    });

    return filePath;
}