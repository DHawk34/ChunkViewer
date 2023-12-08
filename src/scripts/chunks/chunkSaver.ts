import { isPng, concatUInt8Arrays, bytes2UInt32BigEndian, uint32BigEndianToBytes, getSubArrayIndex, IHDR_BYTES, IDAT_BYTES } from './binary.utils'
import { ChunkData } from './chunkHandler';
import { readInfoChunks } from './chunkReader';
import { getCrc } from "./crcCoder";

export const maxChunkNameSize: number = 79
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

export type SaveResult = {
    succeeded: boolean
    imageBytes?: Uint8Array
    errorMessage?: string
}



export function saveChunksToImageBytes(chunks: ChunkData[], imageBytes: Uint8Array, options: SaveOptions): SaveResult {
    if (!isPng(imageBytes)) {
        return {
            succeeded: false,
            errorMessage: 'Меня заставляют сохранять чанки не в пнг!'
        }
    }

    const readResult = readInfoChunks(imageBytes)
    if (readResult.error) {
        return {
            succeeded: false,
            errorMessage: 'Не могу записать чанки в эту картинку. ' + readResult.message
        }
    }

    const startIndex = readResult.startIndex
    const endIndex = readResult.endIndex



    // Разделяем картинку на 3 части: header, chunks, data. Старые чанки вырезаем
    const imageHeader = imageBytes.slice(0, startIndex)
    const imageChunks = chunks2Bytes(chunks, options)
    const imageData = imageBytes.slice(endIndex)

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
        if (chunks[i].name.length < 1) {
            chunks[i].name = '?'
        }
        else if (chunks[i].name.length > maxChunkNameSize) {
            chunks[i].name = chunks[i].name.substring(0, maxChunkNameSize)
        }

        if (!chunkNameIsUnsafe(chunks[i].name)) {
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

export function chunkNameIsUnsafe(chunkName: string): boolean {
    return chunkName.length === 4
}
