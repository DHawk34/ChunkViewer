export type ComfyBlock = {
    id: string,
    name: string,
    value: { [key: string]: any; }
}

export function parsePrompt(prompt: string): ComfyBlock[] {
    const result: ComfyBlock[] = []

    if (prompt.length === 0) {
        return result
    }

    let jsonObj = JSON.parse(prompt)
    let myObj = structuredClone(jsonObj)

    console.log(jsonObj)

    let blocks = Object.keys(myObj).map(function (key) {
        let obj: ComfyBlock = { id: key, name: myObj[key].class_type, value: {} };
        delete myObj[key].class_type

        obj.value = myObj[key]
        return obj;
    });

    blocks.forEach(block => {
        mergeBlocks(myObj, block)
    });

    console.log(blocks)

    return result
}

function mergeBlocks(jsonObj: any, block: { [key: string]: any; }) {
    Object.entries(block).forEach(function ([key, value]) {

        //Распаковка inputs
        if (key === 'inputs') {
            Object.entries(value as { [key: string]: any; }).forEach(function ([Vkey, Vvalue]) {
                block[Vkey] = Vvalue
            })

            delete block[key]

            mergeBlocks(jsonObj, block)
            return
        }

        //Вставка блока вместо ссылки
        if (Array.isArray(value) && value.length === 2) {
            if (typeof value[0] === 'string' && typeof value[1] === 'number') {
                block[key] = jsonObj[value[0]]
                mergeBlocks(jsonObj, block[key])
            }
        }

        //Продолжение проверки
        if (typeof value === 'object') {
            let valueKeys = Object.keys(value)

            //Упрощение дерева
            if (valueKeys.length === 1 && typeof value[valueKeys[0]] !== 'object') {
                block[`${key}/${valueKeys[0]}`] = value[valueKeys[0]]
                delete block[key]
            }

            mergeBlocks(jsonObj, value)
        }

        // mergeBlocks(jsonObj, block)
    });
}
