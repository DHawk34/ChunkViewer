import { isPng, bytes2UInt32BigEndian } from './utils'
const textDecoder = new TextDecoder();

export default {
    saveChunks
}

export {
    saveChunks
}



function saveChunks(chunks_obj: Object, fileName: string, imageBytes: Uint8Array): boolean {
    if (!isPng(imageBytes)) {
        return false;
    }

    let imageText = textDecoder.decode(imageBytes);
    let IHDR_length_index = imageText.indexOf('IHDR') - 4;
    if (IHDR_length_index < 0) {
        return false;
    }

    let IHDR_length = bytes2UInt32BigEndian(imageBytes, IHDR_length_index);

    let startIndex = IHDR_length_index + 8 + IHDR_length + 4;
    let endIndex = imageText.indexOf('IDAT');

    if (endIndex < 0) {
        return false;
    }

    // Вырезаем старые чанки
    imageText = imageText.substring(0, startIndex) + imageText.substring(endIndex);
    let chunks = getChunksArray(chunks_obj);

    // debug chunks_arr
    for (let i = 0; i < chunks.length; i++) {
        console.log(chunks[i]);
    }

    for (let i = 0; i < chunks.length; i++) {
        let length: number = chunks[i].length;
        let crc = 'aaaa'; // TODO: need some magic here




    }



    

    return true;
}

// overload ?
// function saveChunks(chunks_obj: Object, fileName: string): boolean {

// }



function getChunksArray(chunks_obj: Object): String[] {
    let chunks: String[] = [];

    var keys = Object.keys(chunks_obj);
    var values = Object.values(chunks_obj);
    for (let i = 0; i < keys.length; i++) {
        chunks.push(chunkToString(values[i]));
    }

    return chunks;
}

function chunkToString(chunk: Object | String): String {
    if (chunk instanceof Object) {
        let str: String = '';

        var keys = Object.keys(chunk);
        var values = Object.values(chunk);

        for (let i = 0; i < keys.length; i++) {
            str += (values[i] instanceof Object)
                ? keys[i] + ': ' + chunkToString(values[i])
                : `${keys[i]}: ${values[i]}, `;
        }

        return str.slice(0, -2); // remove ', '
    }

    return chunk;
}