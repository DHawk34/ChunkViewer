import { getSaveFileHandle, txtSaveFilePickerOptions, save } from "../save.utils";

export default {
    exportChunk, exportChunks
}



export async function exportChunk(chunk: { name: string, value: string | Object }) {
    const filePickerOptions = txtSaveFilePickerOptions(chunk.name + '.txt');
    const fileHandle = await getSaveFileHandle(filePickerOptions);
    const content = getChunkContent(chunk);

    return save(content, filePickerOptions, fileHandle);
}

export async function exportChunks(chunks: { name: string, value: string | Object }[]) {
    if (chunks.length == 0) {
        return;
    }

    const filePickerOptions = txtSaveFilePickerOptions('chunks.txt');
    const fileHandle = await getSaveFileHandle(filePickerOptions);
    const content = getChunksContent(chunks);

    return save(content, filePickerOptions, fileHandle);
}

function getChunksContent(chunks: { name: string, value: string | Object }[]) {
    let content: string = '';
    for (let i = 0; i < chunks.length; i++) {
        content += getChunkContent(chunks[i]) + '\0';
    }
    return content;
}

function getChunkContent(chunk: { name: string, value: string | Object }) {
    console.log(chunk.name)
    return '========= ' + chunk.name + ' =========\n'
        + chunkValueToReadableString(chunk.value) + '\n';
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
