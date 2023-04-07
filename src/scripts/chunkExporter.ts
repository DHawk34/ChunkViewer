import { saveText } from "./save.utils";

export default {
    exportChunk, exportChunks
}

export {
    exportChunk, exportChunks
}



async function exportChunk(chunk: { name: string, value: string | Object }): Promise<string | undefined> {
    let content: string = '========= ' + chunk.name + ' =========\n';
    content += chunkValueToReadableString(chunk.value) + '\n';

    return new Promise((resolve) => {
        saveText(content, chunk.name + '.txt')
            .then(() => resolve(undefined))
            .catch((error) => resolve(error))
    })
}

async function exportChunks(chunks: { name: string, value: string | Object }[]): Promise<string | undefined> {
    let content: string = '';

    for (let i = 0; i < chunks.length; i++) {
        content += '========= ' + chunks[i].name + ' =========\n';
        content += chunkValueToReadableString(chunks[i].value) + '\n\n';
    }

    return new Promise((resolve) => {
        saveText(content, 'chunks.txt')
            .then(() => resolve(undefined))
            .catch((error) => resolve(error))
    })
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