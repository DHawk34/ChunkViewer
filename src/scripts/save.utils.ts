export const saveText = async (text: string, suggestedName: string) => {
    let blob = new Blob([text], { type: 'text/plain' });
    return save(blob, {
        suggestedName,
        types: [
            {
                description: 'txt file',
                accept: {
                    'text/plain': ['.txt']
                }
            }
        ]
    })
}

export const savePng = async (bytes: Uint8Array, suggestedName: string) => {
    let blob = new Blob([bytes], { type: 'image/png' });
    return save(blob, {
        suggestedName,
        types: [
            {
                description: 'png file',
                accept: {
                    'image/png': ['.png']
                }
            }
        ]
    })
}

export const save = async (blob: Blob, options: SaveFilePickerOptions) => {
    if ('showSaveFilePicker' in window) {
        return exportNativeFileSystem(blob, options);
    }

    return download(blob, options.suggestedName ?? 'new file.png');
};

const exportNativeFileSystem = async (blob: Blob, options: SaveFilePickerOptions) => {
    const fileHandle: FileSystemFileHandle = await showSaveFilePicker(options);

    if (!fileHandle) {
        throw new Error('Cannot access filesystem');
    }

    await writeFile(fileHandle, blob);
};

const writeFile = async (fileHandle: FileSystemFileHandle, blob: Blob ) => {
    const writer: FileSystemWritableFileStream = await fileHandle.createWritable();
    await writer.write(blob);
    await writer.close();
};

const download = (blob: Blob, filename: string) => {
    const a: HTMLAnchorElement = document.createElement('a');
    const url: string = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
    return Promise.resolve();
};
