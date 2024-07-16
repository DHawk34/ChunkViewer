export type ComfyBlock = {
    id: string,
    name: string,
    value: { [key: string]: any; }
}

export function parsePrompt(prompt: string): ComfyBlock[] {
    // console.log(['174', 1]?.constructor === Object)
    const usedBlocks = new Set<string>()
    if (prompt.length === 0) {
        return []
    }

    let jsonObj = JSON.parse(prompt)
    let myObj = structuredClone(jsonObj)

    console.log(jsonObj)

    const blocks = Object.keys(myObj).map(function (key) {
        let obj: ComfyBlock = { id: key, name: myObj[key].class_type, value: {} };
        delete myObj[key].class_type

        obj.value = myObj[key]
        return obj;
    });

    blocks.forEach(block => {
        mergeBlocks(myObj, block, usedBlocks)
    });

    const result = blocks.filter(x => !usedBlocks.has(x.id))

    console.log(myObj)
    console.log(result)

    return result
}

function mergeBlocks(jsonObj: any, block: { [key: string]: any; }, usedBlocks: Set<string>) {
    Object.entries(block).forEach(function ([key, value]) {

        //Распаковка inputs
        if (key === 'inputs') {
            Object.entries(value as { [key: string]: any; }).forEach(function ([Vkey, Vvalue]) {
                block[Vkey] = Vvalue
            })

            delete block[key]

            mergeBlocks(jsonObj, block, usedBlocks)
            return
        }

        //Вставка блока вместо ссылки
        if (Array.isArray(value) && value.length === 2) {
            if (typeof value[0] === 'string' && typeof value[1] === 'number') {
                usedBlocks.add(value[0])
                block[key] = jsonObj[value[0]]
                mergeBlocks(jsonObj, block[key], usedBlocks)
            }
        }

        //Продолжение проверки
        if (value?.constructor === Object) {
            let valueKeys = Object.keys(value)

            //Упрощение дерева
            if (valueKeys.length === 1 && value[valueKeys[0]]?.constructor !== Object) {
                block[`${key}/${valueKeys[0]}`] = value[valueKeys[0]]
                delete block[key]
            }

            mergeBlocks(jsonObj, value, usedBlocks)
        }

    });
}
