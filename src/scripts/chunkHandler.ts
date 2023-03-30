import { readFile } from 'fs';
import { getChunksInOneGo, getChunksUsingStream } from './chunkReader'
import { saveChunks } from './chunkSaver'

class ReadSettings {
    public readUsingStream: boolean;
    public parseParameters: boolean;

    constructor(readUsingStream: boolean, parseParameters: boolean) {
        this.readUsingStream = readUsingStream;
        this.parseParameters = parseParameters;
    }
}

export default {
    ReadSettings, readChunks
}

export {
    ReadSettings, readChunks
}



let fileName: string = 'C:\\Users\\CompleX\\Documents\\JavaScript\\PNG Chunk Reader\\test\\wings 00000 with params.png'

var _fileName: string;
var _settings: ReadSettings;
var _image: Uint8Array;
var _chunks: Object;



readChunks(fileName, new ReadSettings(false, false), (chunks) => {
    //debugChunks(chunks)
    saveChunks(chunks, fileName, _image);
})



function readChunks(fileName: string, settings: ReadSettings, onCompleted: (chunks: Object) => void) {
    _fileName = fileName;
    _settings = settings;

    if (settings.readUsingStream) {
        readChunksUsingStream(fileName, settings, onCompleted)
    }
    else {
        readChunksInOneGo(fileName, settings, onCompleted)
    }
}

// function restoreChunks(onCompleted: (chunks: Object) => void) {
//     if (_settings.readUsingStream) {
//         readChunksUsingStream(_fileName, _settings, onCompleted);
//     }
//     else {
//         if (_image == null) {
//             readChunksInOneGo(_fileName, _settings, onCompleted);
//         }
//         else {
//             getChunksInOneGo(_image, _settings.parseParameters, (chunks) => {
//                 _chunks = chunks;
    
//                 if (onCompleted != null) {
//                     onCompleted(chunks);
//                 }
//             })
//         }
//     }
// }



function readChunksUsingStream(fileName: string, settings: ReadSettings, onCompleted: (chunks: Object) => void) {
    getChunksUsingStream(fileName, settings.parseParameters, (chunks) => {
        _chunks = chunks;

        if (onCompleted != null) {
            onCompleted(chunks);
        }
    })
}

function readChunksInOneGo(fileName: string, settings: ReadSettings, onCompleted: (chunks: Object) => void) {
    readFile(fileName, (err, bytes: Uint8Array) => {
        if (err) {
            if (onCompleted != null) {
                onCompleted({ message: 'Error: ' + err.message });
            }
            return;
        }
        _image = bytes;

        getChunksInOneGo(bytes, settings.parseParameters, (chunks) => {
            _chunks = chunks;

            if (onCompleted != null) {
                onCompleted(chunks);
            }
        })
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
