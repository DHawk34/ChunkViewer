import axios from 'axios';
import { ChunkReadResult, readChunksInOneGo } from './chunkReader'
import { exportChunk, exportChunks, exportParameters } from './chunkExporter'
import { ChunkTypes, SaveOptions, saveChunksToImageBytes } from './chunkSaver'
import { pngSaveFilePickerOptions, save } from '../save.utils';

export type ChunkData = {
    name: string
    value: string
}

export default {
    readChunks, exportChunk, exportChunks, exportParameters, saveImageWithNewChunks, ChunkTypes
}

export {
    exportChunk, exportChunks, exportParameters, ChunkTypes
}



var image: Uint8Array;

export async function readChunks(imgUrl: string, rememberImageBytes?: boolean): Promise<ChunkReadResult> {
    const response = await axios.get(imgUrl, { responseType: 'arraybuffer' })

    const img = new Uint8Array(response.data)
    if (rememberImageBytes) image = img

    const readResult = readChunksInOneGo(img)

    if (readResult.error)
        return Promise.reject(readResult)

    return readResult
}

export async function saveImageWithNewChunks(chunks: ChunkData[], saveOptions: SaveOptions): Promise<void> {
    const filePickerOptions = pngSaveFilePickerOptions('modified.png')

    if (!image || image.length === 0) {
        return Promise.reject('В памяти нет картинки. Некуда сохранять!')
    }

    const result = saveChunksToImageBytes(chunks, image, saveOptions)
    return result.succeeded
        ? save(result.imageBytes!, filePickerOptions)
        : Promise.reject(result.errorMessage)
}



// function debugChunks(chunks: Object) {
//     let keys = Object.keys(chunks);
//     let values = Object.values(chunks);

//     for (let i = 0; i < keys.length; i++) {
//         if (values[i] instanceof Object) {
//             console.log(keys[i] + ':');
//             debugChunks(values[i]);
//         }
//         else {
//             console.log(keys[i] + ': ' + values[i]);
//         }
//     }
// }
