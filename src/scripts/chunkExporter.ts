import { writeTextFile } from '@tauri-apps/api/fs';

export default {
    exportChunk, exportChunks
}

export {
    exportChunk, exportChunks
}



async function exportChunk(chunk: { name: string, value: string | Object }, fileName: string) {
    let content: string = '========= ' + chunk.name + ' =========\n';
    content += chunkValueToReadableString(chunk.value) + '\n';

    try {
        await writeTextFile(fileName, content);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

async function exportChunks(chunks: { name: string, value: string | Object }[], fileName: string) {
    let content: string = '';

    for (let i = 0; i < chunks.length; i++) {
        content += '========= ' + chunks[i].name + ' =========\n';
        content += chunkValueToReadableString(chunks[i].value) + '\n\n';
    }

    try {
        await writeTextFile(fileName, content);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

function chunkValueToReadableString(chunkValue: string | Object): String {
    if (chunkValue instanceof Object) {
        let keys = Object.keys(chunkValue);
        let values = Object.values(chunkValue);
        let result: string = '\n';

        for (let i = 0; i < keys.length; i++) {
            result += keys[i] + ': ' + chunkValueToReadableString(values[i]);
        }
        return result;
    }
    return chunkValue;
}