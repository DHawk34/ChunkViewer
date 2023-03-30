import { tauri } from '@tauri-apps/api';
import axios from 'axios';
import chunkReader from './chunkReader'
import chunkSaver from './chunkSaver'

class ReadSettings {
    public parseParameters: boolean;

    constructor(parseParameters: boolean) {
        this.parseParameters = parseParameters;
    }
}

export default {
    ReadSettings, readChunks
}

export {
    ReadSettings, readChunks
}



var _fileName: string;
var _settings: ReadSettings;
var image: Uint8Array;
var chunks: Object;



async function readChunks(fileName: string, settings: ReadSettings) {
    _fileName = fileName;
    _settings = settings;

    chunks = await readChunksInOneGo(fileName, settings);
    
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



async function readChunksInOneGo(fileName: string, settings: ReadSettings) {
    let url = tauri.convertFileSrc(fileName);
    let result: Object = {
        message: 'Unexpected error!'
    };

    await axios.get(url, { responseType: 'arraybuffer' })
        .then((response) => {
            image = new Uint8Array(response.data);
            result = chunkReader.getChunksInOneGo(image, settings.parseParameters);
        })
        .catch((error) => {
            result = {
                message: error.message,
            };
        });

    return result;
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
