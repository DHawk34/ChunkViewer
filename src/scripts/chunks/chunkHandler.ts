import axios from 'axios';
import { readChunksInOneGo, ChunkReadResult } from './chunkReader'
import { exportChunk, exportChunks } from './chunkExporter'
import chunkSaver, { ChunkTypes } from './chunkSaver'
import { getSaveFileHandle, pngSaveFilePickerOptions, save } from '../save.utils';

class ReadSettings {
    public readUsingStream: boolean;
    public rememberLastOpenedImage: boolean;

    constructor(readUsingStream: boolean, rememberLastOpenedImage: boolean) {
        this.readUsingStream = readUsingStream;
        this.rememberLastOpenedImage = rememberLastOpenedImage;
    }
}

export default {
    ReadSettings, readChunks, exportChunk, exportChunks, saveImageWithNewChunks, ChunkTypes
}

export {
    ReadSettings, exportChunk, exportChunks, ChunkTypes
}



var _settings: ReadSettings;
var image: Uint8Array;
var url: string;

// TODO: добавить коллбэк, если чтене будет успешным?

export async function readChunks(imgUrl: string, settings: ReadSettings) {
    _settings = settings;
    let chunks = await getChunksInOneGo(imgUrl);

    if (settings.rememberLastOpenedImage)
        url = imgUrl;

    return chunks;
}

async function getChunksInOneGo(imgUrl: string): Promise<ChunkReadResult> {
    let result: ChunkReadResult = {
        chunks: [],
        message: 'Неожиданная ошибка при чтении картинки (такого быть не должно)!',
        error: true
    };

    await axios.get(imgUrl, { responseType: 'arraybuffer' })
        .then((response) => {
            let img = new Uint8Array(response.data);
            if (_settings.rememberLastOpenedImage)
                image = img;

            result = readChunksInOneGo(img);
        })
        .catch((e) => {
            result = {
                chunks: [],
                message: 'Не удалось прочитать картинку!',
                error: true
            }
            console.log(e)
        })

    return result;
}



export async function saveImageWithNewChunks(chunks: { name: string, value: string | Object }[], chunkType: Object): Promise<void> {
    const filePickerOptions = pngSaveFilePickerOptions('modified.png');
    const fileHandle = await getSaveFileHandle(filePickerOptions);

    if (_settings.readUsingStream || image == null || image.length == 0) {
        let response = await axios.get(url, { responseType: 'arraybuffer' });
        image = new Uint8Array(response.data);
    }

    let result = chunkSaver.saveChunksToImageBytes(chunks, image, chunkType);
    return result.succeeded
        ? save(result.imageBytes!, filePickerOptions, fileHandle)
        : Promise.reject(result.errorMessage);
}



function debugChunks(chunks: Object) {
    let keys = Object.keys(chunks);
    let values = Object.values(chunks);

    for (let i = 0; i < keys.length; i++) {
        if (values[i] instanceof Object) {
            console.log(keys[i] + ':');
            debugChunks(values[i]);
        }
        else {
            console.log(keys[i] + ': ' + values[i]);
        }
    }
}
