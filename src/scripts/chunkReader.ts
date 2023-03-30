//import { createReadStream } from 'fs'
import { isPng, bytes2UInt32BigEndian } from './utils'
const textDecoder = new TextDecoder('utf-8');

export default {
    getChunksInOneGo, //getChunksUsingStream
}

export {
    getChunksInOneGo, //getChunksUsingStream
}



function getChunksInOneGo(bytes: Uint8Array, parseParams: boolean): Object {
    let result: any = new Object();
    let requiredLength: number = 16;

    if (bytes.length < requiredLength) {
        result.message = 'Файл слишком маленький, нечего обрабатывать!';
        return result;
    }

    let pos: number = 8;
    let length: number = 0;
    let blockName: string = '';
    let other: string = '';
    let parametersAreNotFound: boolean = true;



    // PNG check
    if (!isPng(bytes)) {
        result.message = 'Это не пнг! Не могу обработать.';
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

        if (blockName == "IDAT") { // Кончились все хедеры
            if (parametersAreNotFound) {
                result.message = "В этой картинке нет параметров генерации!";
            }

            if (other != "") {
                result.Other = other;
            }
            return result;
        }

        if (bytes.length < requiredLength) {
            result.message = 'Данные кончились раньше, чем был найден чанк IDAT!';
            return result;
        }

        if (blockName == "tEXt" || blockName == "iTXt" || blockName == "zTXt") {
            let chunkType = blockName;

            // Имя блока указано после (на конце \0)
            let endNameIndex = getFieldEnd(bytes, pos);
            if (endNameIndex == -1) {
                result.message = "Ошибка поиска параметров, возможно картинка битая!";
                return result;
            }
            blockName = bytes2String(bytes, pos, endNameIndex - pos);

            length -= blockName.length + 1;
            pos += blockName.length + 1;

            if (blockName == 'parameters') {
                parametersAreNotFound = false;
                result[blockName] = processParameters(chunkType);
            }
            else {
                result[blockName] = bytes2String(bytes, pos, length);
            }
        }
        else if (blockName != "IHDR") {
            result[blockName] = bytes2String(bytes, pos, length);
        }

        pos += length + 4; // +4 -- CRC (окончание чанка)
        requiredLength = pos + 8; // Чтобы хватило на чтение длины чанка и его имени
    }

    console.log('func END')
    result.message = 'Данные кончились раньше, чем был найден чанк IDAT!';
    return result;

    function processParameters(chunkType: string) {
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

            other += `Чанк iTXt (${isCompressed ? 'compressed' : 'uncompressed'}${language == '' ? '' : ', language: ' + language}${translated == '' ? '' : ', translated: ' + translated})\n`;

            if (isCompressed) {
                result.warning = "Закодированный чанк iTXt. Эта картинка нужна для тестов!";
            }
        }
        else if (chunkType == "zTXt") { // data is 100% compressed
            isCompressed = true;

            // skip compression type
            pos++;
            length--;

            other += "Чанк zTXt (compressed)\n";
            result.warning = "Чанк zTXt. Эта картинка нужна для тестов!";
        }



        // Сами параметры
        let parameters = bytes2String(bytes, pos, length);

        if (isCompressed) {
            result.message = "Это картинка нужна для тестов \"Как раскодировать данные\"!";
            return parameters;

            // try {
            //     parameters = pako.inflate(parameters, { to: 'string' });
            // }
            // catch (error) {
            //     result.message = "Не удалось раскодировать данные в блоке zTXt!"
            //     return result;
            // }
        }

        return parseParams ? parseParameters(parameters) : parameters;
    }
}



// function getChunksUsingStream(fileName: string, parseParams: boolean, onCompleted: (chunks: Object) => void) {
//     let result: any = new Object();

//     const stream = createReadStream(fileName);
//     let bytes = new Uint8Array();
//     let chunkNumber: number = 0;
//     let other: string = '';
//     let length: number = 0;
//     let blockName: string = '';
//     let pos: number = 0;
//     let requiredLength: number = 16;
//     let parametersAreNotFound: boolean = true;
//     let skipLengthNameRead: boolean = false;

//     stream.on('error', (err: { message: string; }) => {
//         result.message = 'Error: ' + err.message;
//         stream.destroy();
//         onCompleted(result);
//         return;
//     })

//     stream.on('end', () => {
//         result.message = 'Файл слишком маленький или в нем не найден чанк IDAT!';
//         stream.destroy();
//         onCompleted(result);
//         return;
//     })

//     stream.on('data', (chunk: Uint8Array) => {
//         chunkNumber++
//         bytes = concatUInt8Arrays(bytes, chunk);

//         if (bytes.length < requiredLength) {
//             return;
//         }

//         // PNG check
//         if (chunkNumber == 1) {
//             if (!isPng(bytes)) {
//                 result.message = 'Это не пнг! Не могу обработать.';
//                 stream.destroy();
//                 onCompleted(result);
//                 return;
//             }
//             pos += 8;
//         }

//         while (bytes.length >= requiredLength) {
//             if (!skipLengthNameRead) {
//                 // Размер чанка с параметрами
//                 length = bytes2UInt32BigEndian(bytes, pos);
//                 requiredLength += length;
//                 pos += 4;

//                 // Проверяем наличие чанка с параметрами (tEXt)
//                 blockName = bytes2String(bytes, pos, 4);
//                 pos += 4;

//                 if (blockName == "IDAT") { // Кончились все хедеры
//                     if (parametersAreNotFound) {
//                         result.message = "В этой картинке нет параметров генерации!";
//                     }

//                     if (other != "") {
//                         result.Other = other;
//                     }

//                     stream.destroy();
//                     onCompleted(result);
//                     return;
//                 }

//                 if (bytes.length < requiredLength) {
//                     skipLengthNameRead = true;
//                     return;
//                 }
//             }
//             skipLengthNameRead = false;



//             if (blockName == "tEXt" || blockName == "iTXt" || blockName == "zTXt") {
//                 processTxtChunk();
//             }
//             else if (blockName != "IHDR") {
//                 result[blockName] = bytes2String(bytes, pos, length);
//             }

//             pos += length + 4; // +4 -- CRC (окончание чанка)
//             requiredLength = pos + 8; // Чтобы хватило на чтение длины чанка и его имени
//         }
//     })

//     function processTxtChunk() {
//         let chunkType = blockName;

//         // Имя блока указано после (на конце \0)
//         let endNameIndex = getFieldEnd(bytes, pos);
//         if (endNameIndex == -1) {
//             result.message = "Ошибка поиска параметров, возможно картинка битая!";
//             stream.destroy();
//             onCompleted(result);
//             return;
//         }

//         blockName = bytes2String(bytes, pos, endNameIndex - pos);

//         length -= blockName.length + 1;
//         pos += blockName.length + 1;

//         if (blockName == 'parameters') {
//             parametersAreNotFound = false;
//             result[blockName] = processParameters(chunkType);
//         }
//         else {
//             result[blockName] = bytes2String(bytes, pos, length);
//         }
//     }

//     function processParameters(chunkType: string) {
//         let isCompressed = false;

//         if (chunkType == "iTXt") {
//             isCompressed = (bytes[pos] === 1);

//             // skip bool isCompressed & compression type
//             pos += 2;
//             length -= 2;

//             let language = bytes2String(bytes, pos, getFieldEnd(bytes, pos) - pos);
//             pos += language.length + 1;
//             length -= language.length + 1;

//             let translated = bytes2String(bytes, pos, getFieldEnd(bytes, pos) - pos);
//             pos += translated.length + 1;
//             length -= translated.length + 1;

//             other += `Чанк iTXt (${isCompressed ? 'compressed' : 'uncompressed'}${language == '' ? '' : ', language: ' + language}${translated == '' ? '' : ', translated: ' + translated})\n`;

//             if (isCompressed) {
//                 result.warning = "Закодированный чанк iTXt. Эта картинка нужна для тестов!";
//             }
//         }
//         else if (chunkType == "zTXt") { // data is 100% compressed
//             isCompressed = true;

//             // skip compression type
//             pos++;
//             length--;

//             other += "Чанк zTXt (compressed)\n";
//             result.warning = "Чанк zTXt. Эта картинка нужна для тестов!";
//         }



//         // Сами параметры
//         let parameters = bytes2String(bytes, pos, length);

//         if (isCompressed) {
//             result.message = "Это картинка нужна для тестов \"Как раскодировать данные\"!";
//             stream.destroy();
//             onCompleted(result);
//             return;

//             // try {
//             //     parameters = pako.inflate(parameters, { to: 'string' });
//             // }
//             // catch (error) {
//             //     result.message = "Не удалось раскодировать данные в блоке zTXt!"
//             //     return result;
//             // }
//         }

//         return parseParams ? parseParameters(parameters) : parameters;
//     }
// }



function bytes2String(bytes: Uint8Array, index: number, length: number) {
    return textDecoder.decode(bytes.slice(index, index + length));
}

function concatUInt8Arrays(arr1: Uint8Array, arr2: Uint8Array) {
    let out = new Uint8Array(arr1.length + arr2.length);
    out.set(arr1);
    out.set(arr2, arr1.length);
    return out;
}

function getFieldEnd(array: Uint8Array, startIndex: number) {
    for (let i = startIndex, len = array.length; i < len; i++) {
        if (!array[i]) return i;
    }
    return -1;
}

function parseParameters(parameters: string) {
    const NEGATIVE_PROMPT_TEXT = "Negative prompt: ";
    const STEPS_TEXT = "Steps: ";

    let result: any = new Object();
    parameters = parameters.replace(/\n/g, ""); // replaceAll but with RegEx

    if (parameters.length == 0) {
        result.message = "Параметры внезапно пустые!";
        return;
    }

    // Get positive & negative prompt
    let positive = "";
    let negative = "";

    let out = parameters.split(STEPS_TEXT);
    let posNeg = out[0];
    parameters = out[1];

    if (posNeg.includes(NEGATIVE_PROMPT_TEXT)) {
        out = posNeg.split(NEGATIVE_PROMPT_TEXT);
        positive = out[0];
        negative = out[1];
    }
    else {
        positive = posNeg;
        negative = "";
    }

    result["positive"] = positive;
    result["negative"] = negative;

    // Get other parameters
    let params = parameters.split(", ");
    params[0] = STEPS_TEXT + String(params[0]); // Возвращаем на место "Steps: "

    for (let i = 0; i < params.length; i++) {
        let out = params[i].split(": ");
        let name = out[0];
        result[name] = out[1];
    }

    return result;
}
