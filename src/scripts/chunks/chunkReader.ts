import { isPng, bytes2UInt32BigEndian } from './binary.utils'
import { ChunkData } from './chunkHandler';
import { getCrc } from './crcCoder';

const textDecoder = new TextDecoder('utf-8')

interface ReadChunkData extends ChunkData {
    crcIsBad: boolean
}

export type ChunkReadResult = {
    chunks: ReadChunkData[]
    error: boolean
    message: string
}

export interface ChunkReadResultExtended extends ChunkReadResult {
    startIndex: number
    endIndex: number
}



/**
 * Reads png chunks that are located after IHDR chunk and before first IDAT chunk.
 */
export function readInfoChunks(bytes: Uint8Array): ChunkReadResultExtended {
    const result: ChunkReadResultExtended = {
        chunks: [],
        error: false,
        message: '',
        startIndex: -1,
        endIndex: -1,
    }

    let requiredLength: number = 16

    if (bytes.length < requiredLength) {
        result.message = 'Файл слишком маленький, нечего обрабатывать!'
        result.error = true
        return result
    }

    // PNG check (8 first bytes)
    if (!isPng(bytes)) {
        result.message = 'Это не пнг! Не могу обработать.'
        result.error = true
        return result
    }

    let pos: number = 8
    let length: number = 0
    let blockName: string = ''

    // IHDR length
    length = bytes2UInt32BigEndian(bytes, pos)
    pos += 4

    // check if it's really IHDR
    blockName = bytes2String(bytes, pos, 4)
    pos += 4

    if (blockName !== 'IHDR') {
        result.message = 'Не найден чанк IHDR, хотя файл был признан пнгшкой!'
        result.error = true
        return result
    }

    pos += length + 4           // +4 -- CRC (окончание чанка)
    requiredLength = pos + 8    // Чтобы хватило на чтение длины чанка и его имени
    result.startIndex = pos



    while (bytes.length > requiredLength) {
        // Длина чанка
        length = bytes2UInt32BigEndian(bytes, pos)
        pos += 4
        requiredLength += length

        // Имя чанка
        blockName = bytes2String(bytes, pos, 4)
        pos += 4

        if (blockName === 'IDAT') { // Кончились все хедеры
            result.endIndex = pos - 8
            return result
        }

        if (bytes.length < requiredLength) {
            break
        }

        if (blockName === 'tEXt' || blockName === 'iTXt' || blockName === 'zTXt') {
            if (!processTxtChunk())
                return result
        }
        else {
            result.chunks.push({ name: blockName, value: bytes2String(bytes, pos, length), crcIsBad: checkCrcIsBad() })
        }

        pos += length + 4           // +4 -- CRC (окончание чанка)
        requiredLength = pos + 8    // Чтобы хватило на чтение длины чанка и его имени
    }

    result.message = 'Картинка поломана, чанк IDAT не найден или находится не на своем месте!'
    result.error = true
    return result



    function processTxtChunk(): boolean {
        const chunkType = blockName

        // Имя блока указано после (на конце \0)
        const endNameIndex = getFieldEnd(bytes, pos)
        if (endNameIndex === -1) {
            result.message += 'Не найден нулевой байт после имени чанка!'
            result.error = true
            return false
        }
        blockName = bytes2String(bytes, pos, endNameIndex - pos)

        const crcIsBad = checkCrcIsBad()

        length -= blockName.length + 1
        pos += blockName.length + 1

        result.chunks.push({ name: blockName, value: decompressChunk(chunkType), crcIsBad: crcIsBad })
        return true
    }

    function checkCrcIsBad(): boolean {
        // -4 and +4 is for chunkType code (4 bytes)
        const calculatedCrc = getCrc(bytes, pos - 4, length + 4)
        const providedCrc = bytes2UInt32BigEndian(bytes, pos + length)

        return calculatedCrc !== providedCrc
    }

    function decompressChunk(chunkType: string): string {
        let isCompressed = false

        if (chunkType === "iTXt") {
            isCompressed = (bytes[pos] === 1)

            // skip bool isCompressed & compression type
            pos += 2
            length -= 2

            const language = bytes2String(bytes, pos, getFieldEnd(bytes, pos) - pos)
            pos += language.length + 1
            length -= language.length + 1

            const translated = bytes2String(bytes, pos, getFieldEnd(bytes, pos) - pos)
            pos += translated.length + 1
            length -= translated.length + 1

            result.message += `Чанк iTXt (${isCompressed ? 'compressed' : 'uncompressed'}${language == '' ? '' : ', language: ' + language}${translated == '' ? '' : ', translated: ' + translated}) | `
            
            if (isCompressed) {
                // TODO: decompress image
                result.message += 'Закодированный чанк iTXt. Эта картинка нужна для тестов! | '
            }
        }
        else if (chunkType === 'zTXt') { // data is 100% compressed
            isCompressed = true

            // skip compression type
            pos++
            length--

            // TODO: decompress image
            result.message += 'Чанк zTXt (compressed). Эта картинка нужна для тестов! | '
        }



        // Сами данные
        const data = bytes2String(bytes, pos, length)

        if (isCompressed) {
            result.message += 'Это картинка нужна для тестов \"Как раскодировать данные\"!'
            return data

            // try {
            //     parameters = pako.inflate(parameters, { to: 'string' });
            // }
            // catch (error) {
            //     result.message = 'Не удалось раскодировать данные в блоке zTXt!'
            //     return result;
            // }
        }

        return data
    }
}



function bytes2String(bytes: Uint8Array, offset: number = 0, length: number = bytes.length): string {
    return textDecoder.decode(bytes.slice(offset, offset + length))
}

function getFieldEnd(array: Uint8Array, startIndex: number): number {
    for (let i = startIndex, len = array.length; i < len; i++) {
        if (!array[i]) return i
    }
    return -1
}
