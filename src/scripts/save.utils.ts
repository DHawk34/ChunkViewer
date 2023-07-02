export async function save(data: Blob | string | Uint8Array, options: SaveFilePickerOptions) {
    const blob = data instanceof Blob
        ? data
        : new Blob([data]);

    if ('showSaveFilePicker' in window) {
        const fileHandle: FileSystemFileHandle = await getSaveFileHandle(options);
        return writeFile(blob, fileHandle);
    }

    return download(blob, options.suggestedName ?? 'new file');
}

async function getSaveFileHandle(options: SaveFilePickerOptions) {
    const fileHandle: FileSystemFileHandle = await showSaveFilePicker(options);

    if (!fileHandle) {
        return Promise.reject('Cannot access filesystem');
    }
    return fileHandle;
}

async function writeFile(blob: Blob, fileHandle: FileSystemFileHandle) {
    const writer: FileSystemWritableFileStream = await fileHandle.createWritable();
    await writer.write(blob);
    await writer.close();
}

async function download(blob: Blob, filename: string) {
    const a: HTMLAnchorElement = document.createElement('a');
    const url: string = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
    return Promise.resolve();
}

export const txtSaveFilePickerOptions = (suggestedName: string): SaveFilePickerOptions => {
    return {
        suggestedName,
        types: [
            {
                description: 'txt file',
                accept: {
                    'text/plain': ['.txt']
                }
            }
        ]
    }
}

export const pngSaveFilePickerOptions = (suggestedName: string): SaveFilePickerOptions => {
    return {
        suggestedName,
        types: [
            {
                description: 'png file',
                accept: {
                    'image/png': ['.png']
                }
            }
        ]
    }
}
