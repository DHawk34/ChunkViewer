import axios from "axios"
import { dialog, tauri } from "@tauri-apps/api"
import chunkHandler, { ChunkData } from "./chunks/chunkHandler"
import { SaveOptions } from "./chunks/chunkSaver"
import { Logger } from "./hooks/useLoggerHook"
import { settingsManager } from "./settings/settings"

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

export function exportParams(chunkArray: ChunkData[], logger: Logger) {
    const chunks = chunkArray.filter(x => x.name === 'parameters' || x.name === 'extras' || x.name === 'postprocessing')
    if (chunks.length === 0) return

    chunkHandler.exportParameters(chunks)
        .then(() => logger.log('Parameters are exported'))
        .catch(e => logger.logError(e))
}

export function replaceChunks(setChunkArray: React.Dispatch<React.SetStateAction<ChunkData[]>>, logger: Logger) {
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
                chunkHandler.readChunks((new Uint8Array(response.data)), false)
                    .then(({ chunks, message }) => {
                        if (message && message !== '')
                            logger.log(message)

                        setChunkArray(chunks)
                    })
                    .catch(e => logger.logError(e?.message ?? e))
            })
        }
    }).catch(e => logger.logError(e))
}
