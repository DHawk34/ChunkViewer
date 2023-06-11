import { getSaveFileHandle, txtSaveFilePickerOptions, save } from "../save.utils";
import { Parameters, parseParameters } from "../sdParamParser";
import { ChunkData } from "./chunkHandler";

export default {
    exportChunk, exportChunks, exportParameters
}



export async function exportChunk(chunk: ChunkData) {
    const filePickerOptions = txtSaveFilePickerOptions(chunk.name + '.txt')
    const fileHandle = await getSaveFileHandle(filePickerOptions)
    const content = chunkValueToReadableString(chunk.value)

    return save(content, filePickerOptions, fileHandle)
}

export async function exportChunks(chunks: ChunkData[]) {
    if (chunks.length === 0) return

    const filePickerOptions = txtSaveFilePickerOptions('chunks.txt')
    const fileHandle = await getSaveFileHandle(filePickerOptions)
    const content = getChunksContent(chunks)

    return save(content, filePickerOptions, fileHandle)
}

export async function exportParameters(chunks: ChunkData[]): Promise<void> {
    const params = chunks.map(chunk =>
        parseParameters(chunk.value)
    )

    let chunkValue = ''

    for (let param of params) {
        chunkValue += chunkValueToReadableString(param) + '\n'
    }

    return exportChunk({
        name: 'parameters',
        value: chunkValue
    })
}



function getChunksContent(chunks: ChunkData[]) {
    let content: string = ''
    for (let i = 0; i < chunks.length; i++) {
        content += '========= ' + chunks[i].name + ' =========\n'
            + chunkValueToReadableString(chunks[i].value) + '\n' // + '\0'
    }
    return content
}

function chunkValueToReadableString(chunkValue: string | Parameters): string {
    if (chunkValue instanceof Object) {
        const keys = Object.keys(chunkValue)
        const values = Object.values(chunkValue)
        let result: string = '\n'

        for (let i = 0; i < keys.length; i++) {
            result += keys[i] + ': ' + chunkValueToReadableString(values[i]) + '\n'
        }
        return result
    }
    return chunkValue
}
