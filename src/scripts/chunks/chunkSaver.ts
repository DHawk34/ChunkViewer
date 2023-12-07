import { isPng, concatUInt8Arrays, bytes2UInt32BigEndian, uint32BigEndianToBytes, getSubArrayIndex, IHDR_BYTES, IDAT_BYTES } from './binary.utils'
import { ChunkData } from './chunkHandler';
import { getCrc } from "./crcCoder";

const textEncoder = new TextEncoder()

export enum ChunkTypes {
    tEXt = 'tEXt',
    iTXt = 'iTXt',
    zTXt = 'zTXt',
}

export type SaveOptions = {
    chunkType: ChunkTypes
    allowUnsafeChunkNames: boolean
}



export function saveChunksToImageBytes(chunks: ChunkData[], imageBytes: Uint8Array, options: SaveOptions)
    : { succeeded: boolean, imageBytes?: Uint8Array, errorMessage?: string } {

    if (!isPng(imageBytes)) {
        return {
            succeeded: false,
            errorMessage: 'Меня заставляют сохранять чанки не в пнг!'
        }
    }

    let IHDR_length_index = getSubArrayIndex(imageBytes, IHDR_BYTES) - 4
    if (IHDR_length_index < 0) {
        return {
            succeeded: false,
            errorMessage: 'Не найден чанк IHDR, хотя файл был признан пнгшкой!'
        }
    }

    let IHDR_length = bytes2UInt32BigEndian(imageBytes, IHDR_length_index)
    let offset = IHDR_length_index + 8 + IHDR_length + 4 // startIndex
    let endIndex = getSubArrayIndex(imageBytes, IDAT_BYTES) - 4

    if (endIndex < 0) {
        return {
            succeeded: false,
            errorMessage: 'Не найден чанк IDAT, хотя файл был признан пнгшкой и был найден чанк IHDR!'
        }
    }

    // Разделяем картинку на 3 части: header, chunks, data. Старые чанки вырезаем
    let imageHeader = imageBytes.slice(0, offset)
    let imageChunks = chunks2Bytes(chunks, options)
    let imageData = imageBytes.slice(endIndex)

    imageBytes = concatUInt8Arrays(imageHeader, imageChunks, imageData)

    return {
        succeeded: true,
        imageBytes
    }
}

function chunks2Bytes(chunks: ChunkData[], options: SaveOptions) {
    let imageChunks = new Uint8Array()
    let chunkNameIsComplex

    for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].name.length !== 4) {
            switch (options.chunkType) {
                case 'iTXt':
                    console.log('iTXt') // TODO: compress
                    break

                case 'zTXt':
                    console.log('zTXt') // TODO: compress
                    break

                default:
                    break
            }

            chunkNameIsComplex = true
        }
        else chunkNameIsComplex = !options.allowUnsafeChunkNames

        const chunkName = textEncoder.encode(chunkNameIsComplex ? options.chunkType + chunks[i].name + '\0' : chunks[i].name)
        const chunkData = textEncoder.encode(chunks[i].value)
        const length = (chunkName.length - 4) + chunkData.length // -4 == chunkType

        // Записываем байтики чанка (без crc)
        const lengthBytes = uint32BigEndianToBytes(length)
        const chunkDataBytes = concatUInt8Arrays(chunkName, chunkData)

        const crc = getCrc(chunkDataBytes)
        const crcBytes = uint32BigEndianToBytes(crc)

        const chunk = concatUInt8Arrays(lengthBytes, chunkDataBytes, crcBytes)
        imageChunks = concatUInt8Arrays(imageChunks, chunk)
    }

    return imageChunks
}
