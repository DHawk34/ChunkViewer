import axios from 'axios';
import { readChunksInOneGo } from './chunkReader'
import { exportChunk, exportChunks, exportParameters } from './chunkExporter'
import { ChunkTypes, SaveOptions, saveChunksToImageBytes } from './chunkSaver'
import { getSaveFileHandle, pngSaveFilePickerOptions, save } from '../save.utils';

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
var url: string;

export async function readChunks(imgUrl: string) {
    const response = await axios.get(imgUrl, { responseType: 'arraybuffer' })

    url = imgUrl
    image = new Uint8Array(response.data)

    const readResult = readChunksInOneGo(image)

    if (readResult.error)
        return Promise.reject(readResult)

    return readResult
}

export async function saveImageWithNewChunks(chunks: ChunkData[], saveOptions: SaveOptions): Promise<void> {
    const filePickerOptions = pngSaveFilePickerOptions('modified.png')
    const fileHandle = await getSaveFileHandle(filePickerOptions)

    if (!image || image.length == 0) {
        const response = await axios.get(url, { responseType: 'arraybuffer' })
        image = new Uint8Array(response.data)
    }

    const result = saveChunksToImageBytes(chunks, image, saveOptions)
    return result.succeeded
        ? save(result.imageBytes!, filePickerOptions, fileHandle)
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
