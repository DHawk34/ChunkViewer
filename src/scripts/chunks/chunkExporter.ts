import { txtSaveFilePickerOptions, save } from "../save.utils";
import { Param, parseParameters } from "../sdParamParser";
import { varStore } from "../variableStore";
import { ChunkData } from "./chunkHandler";

export default {
    exportChunk, exportChunks, exportParameters
}

export async function exportChunk(chunk: ChunkData) {
    const filePickerOptions = txtSaveFilePickerOptions(`${varStore.openedImageName} ${chunk.name}.txt`)
    const content = chunk.value

    return save(content, filePickerOptions)
}

export async function exportChunks(chunks: ChunkData[]) {
    if (chunks.length === 0) return

    const filePickerOptions = txtSaveFilePickerOptions(`${varStore.openedImageName} chunks.txt`)
    const content = getChunksContent(chunks)

    return save(content, filePickerOptions)
}

export async function exportParameters(chunks: ChunkData[]): Promise<void> {
    // remove duplicate chunk values
    const chunkValues = new Set<string>()

    chunks = chunks.filter(chunk => {
        const size = chunkValues.size
        chunkValues.add(chunk.value)

        return chunkValues.size !== size
    })

    // parse all chunks
    const paramsList = chunks.map(chunk =>
        parseParameters(chunk.value)
    )

    // create a string
    let chunkValue = ''

    for (let params of paramsList) {
        const value = chunkValueToReadableString(params)

        if (value !== '')
            chunkValue += value + '\n\n'
    }

    return exportChunk({
        name: 'parameters',
        value: chunkValue.slice(0, -2)
    })
}



function getChunksContent(chunks: ChunkData[]) {
    let content: string = ''
    for (let i = 0; i < chunks.length; i++) {
        content += '========= ' + chunks[i].name + ' =========\n'
            + chunks[i].value + '\n\n'
    }

    return content.slice(0, -1)
}

function chunkValueToReadableString(chunkValue: Param[]): string {
    if (chunkValue instanceof Array) {
        let result: string = ''

        for (let i = 0; i < chunkValue.length; i++) {
            const key = chunkValue[i].key
            const value = chunkValue[i].value

            result += key + ': ' + value + '\n'
        }

        return result.slice(0, -1)
    }

    return chunkValue
}
