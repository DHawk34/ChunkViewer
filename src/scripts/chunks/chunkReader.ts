import { isPng, bytes2UInt32BigEndian } from './binary.utils'
import { ChunkData } from './chunkHandler';
import { getCrc } from './crcCoder';

const textDecoder = new TextDecoder('utf-8')

export type ChunkReadResult = {
    chunks: ChunkData[]
    crcIsBad: boolean[]
    error: boolean
    message: string
}



export function readChunksInOneGo(bytes: Uint8Array): ChunkReadResult {
    let result: ChunkReadResult = {
        chunks: [],
        crcIsBad: [],
        error: false,
        message: ''
    };

    let requiredLength: number = 16;

    if (bytes.length < requiredLength) {
        result.message = 'Файл слишком маленький, нечего обрабатывать!';
        result.error = true;
        return result;
    }

    let pos: number = 8;
    let length: number = 0;
    let blockName: string = '';



    // PNG check
    if (!isPng(bytes)) {
        result.message = 'Это не пнг! Не могу обработать.';
        result.error = true;
        return result;
    }

    while (bytes.length > requiredLength) {
        // Размер чанка с параметрами
        length = bytes2UInt32BigEndian(bytes, pos);
        requiredLength += length;
        pos += 4;

        // Проверяем наличие чанка с параметрами (tEXt)
        blockName = bytes2String(bytes, pos, 4);
        pos += 4;

        if (blockName == 'IDAT') { // Кончились все хедеры
            return result;
        }

        if (bytes.length < requiredLength) {
            break;
        }

        if (blockName == 'tEXt' || blockName == 'iTXt' || blockName == 'zTXt') {
            if (processTxtChunk() != undefined)
                return result;
        }
        else if (blockName != 'IHDR') {
            result.chunks.push({ name: blockName, value: bytes2String(bytes, pos, length) });
            addCrcCheckToResult()
        }

        pos += length + 4; // +4 -- CRC (окончание чанка)
        requiredLength = pos + 8; // Чтобы хватило на чтение длины чанка и его имени
    }

    result.message = 'Картинка поломана, чанк IDAT не найден или находится не на своем месте!';
    result.error = true;
    return result;

    function processTxtChunk(): any | undefined {
        let chunkType = blockName;

        // Имя блока указано после (на конце \0)
        let endNameIndex = getFieldEnd(bytes, pos);
        if (endNameIndex == -1) {
            result.message += 'Не найден нулевой байт после имени чанка!';
            result.error = true;
            return result;
        }
        blockName = bytes2String(bytes, pos, endNameIndex - pos);

        addCrcCheckToResult()

        length -= blockName.length + 1;
        pos += blockName.length + 1;

        result.chunks.push({ name: blockName, value: decompressChunk(chunkType) });
    }

    function addCrcCheckToResult() {
        // -4 and +4 is for chunkType code (4 bytes)
        const calculatedCrc = getCrc(bytes, pos - 4, length + 4)
        const providedCrc = bytes2UInt32BigEndian(bytes, pos + length)

        result.crcIsBad.push(calculatedCrc !== providedCrc)
    }

    function decompressChunk(chunkType: string): string {
        let isCompressed = false;

        if (chunkType == "iTXt") {
            isCompressed = (bytes[pos] === 1);

            // skip bool isCompressed & compression type
            pos += 2;
            length -= 2;

            let language = bytes2String(bytes, pos, getFieldEnd(bytes, pos) - pos);
            pos += language.length + 1;
            length -= language.length + 1;

            let translated = bytes2String(bytes, pos, getFieldEnd(bytes, pos) - pos);
            pos += translated.length + 1;
            length -= translated.length + 1;

            result.message += `Чанк iTXt (${isCompressed ? 'compressed' : 'uncompressed'}${language == '' ? '' : ', language: ' + language}${translated == '' ? '' : ', translated: ' + translated}) | `;

            if (isCompressed) {
                result.message += 'Закодированный чанк iTXt. Эта картинка нужна для тестов! | ';
            }
        }
        else if (chunkType == 'zTXt') { // data is 100% compressed
            isCompressed = true;

            // skip compression type
            pos++;
            length--;

            result.message += 'Чанк zTXt (compressed). Эта картинка нужна для тестов! | ';
        }



        // Сами данные
        let data = bytes2String(bytes, pos, length);

        if (isCompressed) {
            result.message += 'Это картинка нужна для тестов \"Как раскодировать данные\"!';
            return data;

            // try {
            //     parameters = pako.inflate(parameters, { to: 'string' });
            // }
            // catch (error) {
            //     result.message = 'Не удалось раскодировать данные в блоке zTXt!'
            //     return result;
            // }
        }

        return data;
    }
}



function bytes2String(bytes: Uint8Array, offset: number = 0, length: number = bytes.length): string {
    return textDecoder.decode(bytes.slice(offset, offset + length));
}

function getFieldEnd(array: Uint8Array, startIndex: number): number {
    for (let i = startIndex, len = array.length; i < len; i++) {
        if (!array[i]) return i;
    }
    return -1;
}
