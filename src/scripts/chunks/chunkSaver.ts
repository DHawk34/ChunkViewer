import { isPng, concatUInt8Arrays, bytes2UInt32BigEndian, uint32BigEndianToBytes, getSubArrayIndex, IHDR_BYTES, IDAT_BYTES } from './binary.utils'
import { getCrc } from "./crcCoder";

const textEncoder = new TextEncoder()

export const ChunkTypes = {
    tEXt : 'tEXt',
    iTXt : 'iTXt',
    zTXt : 'zTXt',
}

export default {
    saveChunksToImageBytes
}



export function saveChunksToImageBytes(chunks_obj: { name: string, value: string | Object }[], imageBytes: Uint8Array, chunkType: Object)
    : { succeeded: boolean, imageBytes?: Uint8Array, errorMessage?: string } {

    if (!isPng(imageBytes)) {
        return {
            succeeded: false,
            errorMessage: 'Меня заставляют сохранять чанки не в пнг!'
        }
    }

    let IHDR_length_index = getSubArrayIndex(imageBytes, IHDR_BYTES) - 4;
    if (IHDR_length_index < 0) {
        return {
            succeeded: false,
            errorMessage: 'Не найден чанк IHDR, хотя файл был признан пнгшкой!'
        };
    }

    let IHDR_length = bytes2UInt32BigEndian(imageBytes, IHDR_length_index);
    let offset = IHDR_length_index + 8 + IHDR_length + 4; // startIndex
    let endIndex = getSubArrayIndex(imageBytes, IDAT_BYTES) - 4;

    if (endIndex < 0) {
        return {
            succeeded: false,
            errorMessage: 'Не найден чанк IDAT, хотя файл был признан пнгшкой и был найден чанк IHDR!'
        };
    }

    let chunks = getChunksArray(chunks_obj);

    // Разделяем картинку на 3 части: header, chunks, data. Старые чанки вырезаем
    let imageHeader = imageBytes.slice(0, offset);
    let imageChunks = chunks2Bytes(chunks, imageBytes, offset, chunkType);
    let imageData = imageBytes.slice(endIndex);

    imageBytes = concatUInt8Arrays(concatUInt8Arrays(imageHeader, imageChunks), imageData);

    return {
        succeeded: true,
        imageBytes
    };
}

function chunks2Bytes(chunks: { name: string, value: string }[], imageBytes: Uint8Array, offset: number, chunkType: Object) {
    let imageChunks = new Uint8Array();

    for (let i = 0; i < chunks.length; i++) {
        let chunkNameIsComplex = false;

        if (chunks[i].name.length != 4) {
            switch (chunkType) {
                case ChunkTypes.iTXt:
                    console.log('iTXt') // TODO: compress
                    break;

                case ChunkTypes.zTXt:
                    console.log('zTXt') // TODO: compress
                    break;

                default:
                    break;
            }
            chunkNameIsComplex = true;
        }

        let chunkName = textEncoder.encode(chunkNameIsComplex ? chunkType + chunks[i].name : chunks[i].name);
        let chunkData = textEncoder.encode(chunks[i].value);
        let length = chunkName.length + chunkData.length - 4 + Number(chunkNameIsComplex);

        // Записываем байтики чанка (без crc)
        imageChunks = concatUInt8Arrays(imageChunks, uint32BigEndianToBytes(length));
        imageChunks = concatUInt8Arrays(imageChunks, chunkName);
        if (chunkNameIsComplex) imageChunks = concatUInt8Arrays(imageChunks, new Uint8Array([0])); // add \0 after blockName
        imageChunks = concatUInt8Arrays(imageChunks, chunkData);
        offset += 4;

        let crc = getCrc(imageBytes.slice(offset, offset + 4 + length), 4 + length);
        imageChunks = concatUInt8Arrays(imageChunks, uint32BigEndianToBytes(crc));
        offset += 4 + length + 4;
    }

    return imageChunks;
}



function getChunksArray(chunks: { name: string, value: string | Object }[]): { name: string, value: string }[] {
    for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].value instanceof Object) {
            chunks[i].value = chunkObjToString(chunks[i].value);
        }
    }

    return chunks as { name: string, value: string }[];
}

function chunkObjToString(chunk: Object | string): string {
    let str: string = '';

    var keys = Object.keys(chunk);
    var values = Object.values(chunk);

    for (let i = 0; i < keys.length; i++) {
        str += (values[i] instanceof Object)
            ? keys[i] + ': ' + chunkObjToString(values[i])
            : `${keys[i]}: ${values[i]}, `;
    }

    return str.slice(0, -2); // remove ', '
}
