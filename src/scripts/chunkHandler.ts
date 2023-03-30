import { readBinaryFile } from '@tauri-apps/api/fs';
import chunkReader from './chunkReader'
import { saveChunks } from './chunkSaver'

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
    for (let i = 0; i < keys.length; i++) {
        result.push({ name: keys[i], value: values[i] });
    }

    return result;
}



async function readChunksInOneGo(fileName: string, settings: ReadSettings) {
    image = await readBinaryFile(fileName);
    return chunkReader.getChunksInOneGo(image, settings.parseParameters);
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
