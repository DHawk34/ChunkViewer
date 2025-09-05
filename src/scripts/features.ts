import axios from "axios"
import { dialog, tauri } from "@tauri-apps/api"
import chunkHandler, { ChunkData } from "./chunks/chunkHandler"
import { SaveOptions } from "./chunks/chunkSaver"
import { Logger } from "./hooks/useLoggerHook"
import { settingsManager } from "./settings/settings"
import { ChunkArray } from "./hooks/useChunkArray"

export function exportAllChunks(chunkArray: ChunkData[], logger: Logger) {
    if (chunkArray.length === 0) return

    chunkHandler.exportChunks(chunkArray)
        .then(() => logger.log('All chunks are exported'))
        .catch(e => logger.logError(e))
}

export function saveImage(chunkArray: ChunkData[], logger: Logger) {
    const chunkType = settingsManager.getCache('chunkType')
    const allowUnsafeChunkNames = settingsManager.getCache('allowUnsafeChunkNames')
    const saveOptions: SaveOptions = { chunkType, allowUnsafeChunkNames }

    chunkHandler.saveImageWithNewChunks(chunkArray, saveOptions)
        .then(() => logger.log('Image saved'))
        .catch(e => logger.logError(e))
}

export function exportParams(chunks: ChunkData[], logger: Logger) {
    chunks = chunks.filter(x => x.name === 'parameters' || x.name === 'extras' || x.name === 'postprocessing')
    if (chunks.length === 0) return

    chunkHandler.exportParameters(chunks)
        .then(() => logger.log('Parameters are exported'))
        .catch(e => logger.logError(e))
}


export function replaceChunksWithFileDialog(chunkArray: ChunkArray, logger: Logger) {
    dialog.open({
        multiple: false,
        filters: [{
            name: 'png image',
            extensions: ['png']
        }]
    }).then(fileName => {
        if (typeof (fileName) === 'string') {
            const url = tauri.convertFileSrc(fileName)

            axios.get(url, { responseType: 'arraybuffer' }).then(response => {
                replaceChunks(new Uint8Array(response.data), chunkArray, logger)
            })
        }
    }).catch(e => logger.logError(e))
}

export function replaceChunks(data: Uint8Array, chunkArray: ChunkArray, logger: Logger) {
    chunkHandler.readChunks(data, false)
        .then(({ chunks, message }) => {
            if (message && message !== '')
                logger.log(message)
      
            chunkArray.reset(chunks)
        })
        .catch(e => logger.logError(e?.message ?? e))
}