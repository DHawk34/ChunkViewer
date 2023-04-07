import axios from 'axios';
import chunkReader from './chunkReader'
import { exportChunk, exportChunks } from './chunkExporter'
import chunkSaver from './chunkSaver'
import { savePng } from './save.utils';

class ReadSettings {
    public readUsingStream: boolean;
    public parseParameters: boolean;

    constructor(readUsingStream: boolean, parseParameters: boolean) {
        this.readUsingStream = readUsingStream;
        this.parseParameters = parseParameters;
    }
}

export default {
    ReadSettings, readChunks, exportChunk, exportChunks, saveImageWithNewChunks
}

export {
    ReadSettings, exportChunk, exportChunks
}



var _settings: ReadSettings;
var image: Uint8Array;
var url: string;



export async function readChunks(imgUrl: string, settings: ReadSettings) {
    _settings = settings;
    url = imgUrl;
    let chunks;

    if (settings.readUsingStream) {
        chunks = await readChunksUsingStream(imgUrl, settings);
    }
    else {
        chunks = await readChunksInOneGo(imgUrl, settings);
    }

    let keys = Object.keys(chunks);
    let values = Object.values(chunks);

    let result: { name: string, value: string | Object }[] = [];
    let message: string = '';

    for (let i = 0; i < keys.length; i++) {
        if (keys[i] == 'message') {
            message = values[i];
        }
        else {
            result.push({ name: keys[i], value: values[i] });
        }
    }

    return {
        chunks: result,
        message
    };
}

async function readChunksInOneGo(imgUrl: string, settings: ReadSettings) {
    let result: Object = {
        message: 'Неожиданная ошибка при чтении картинки (такого быть не должно)!'
    };

    await axios.get(imgUrl, { responseType: 'arraybuffer' })
        .then((response) => {
            image = new Uint8Array(response.data);
            result = chunkReader.getChunksInOneGo(image, settings.parseParameters);
        })
        .catch((error) => {
            result = {
                message: error.message,
            }
        })

    return result;
}

// TODO: Стримы не работают
async function readChunksUsingStream(imgUrl: string, settings: ReadSettings) {
    let result: Object = {
        message: 'Неожиданная ошибка при чтении картинки (такого быть не должно)!'
    };

    await axios.get(imgUrl, { responseType: 'stream', maxRedirects: 0 })
        .then(async (response) => {
            let stream = response.data;
            if (typeof (stream) === 'string') {
                result = {
                    message: 'Не удалось получить стрим'
                }
                return
            }

            result = await chunkReader.getChunksUsingStream(stream, settings.parseParameters);
            stream.destroy();
        })
        .catch((error) => {
            result = {
                message: error.message,
            };
        })

    return result;
}

export async function saveImageWithNewChunks(chunks: { name: string, value: string | Object }[]): Promise<void> {
    if (_settings.readUsingStream || image == null || image.length == 0) {

        return new Promise((resolve, reject) => {
            axios.get(url, { responseType: 'arraybuffer' })
                .then((response) => {
                    image = new Uint8Array(response.data);

                    let result = chunkSaver.saveChunksToImageBytes(chunks, image);
                    if (result.succeeded) {
                        savePng(result.imageBytes!, 'modified.png')
                            .then(resolve)
                            .catch(reject)
                    }
                    else {
                        reject(result.errorMessage);
                    }
                })
                .catch((error) => {
                    return reject(error);
                })
        })
    }
    else return new Promise((resolve, reject) => {
        let result = chunkSaver.saveChunksToImageBytes(chunks, image);
        if (result.succeeded) {
            savePng(result.imageBytes!, 'modified.png')
                .then(resolve)
                .catch(reject)
        }
        else {
            reject(result.errorMessage);
        }
    })
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
