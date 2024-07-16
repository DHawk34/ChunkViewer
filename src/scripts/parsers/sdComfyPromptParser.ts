export type ComfyBlock = {
    id: string,
    name: string,
    value: { [key: string]: any; }
}

export function parsePrompt(prompt: string): ComfyBlock[] {
    if (prompt.length === 0) return []

    const usedBlocks = new Set<string>()

    try {
        var json = JSON.parse(prompt)
    } catch (error) {
        return []
    }

    // console.log(structuredClone(json))

    const blocks = Object.keys(json).map(function (key) {
        const block: ComfyBlock = { id: key, name: json[key].class_type, value: {} };
        delete json[key].class_type

        block.value = json[key]
        return block;
    })

    blocks.forEach(block => {
        mergeBlocks(json, block, usedBlocks)
    })

    const result = blocks.filter(x => !usedBlocks.has(x.id))

    // console.log(json)
    // console.log(result)

    return result
}

function mergeBlocks(jsonObj: any, block: { [key: string]: any; }, usedBlocks: Set<string>) {
    Object.entries(block).forEach(function ([key, value]) {

        // Распаковка inputs
        if (key === 'inputs') {
            Object.entries(value as { [key: string]: any; }).forEach(function ([Vkey, Vvalue]) {
                block[Vkey] = Vvalue
            })

            delete block[key]

            mergeBlocks(jsonObj, block, usedBlocks)
            return
        }

        // Вставка блока вместо ссылки
        if (Array.isArray(value) && value.length === 2) {
            if (typeof value[0] === 'string' && typeof value[1] === 'number') {
                usedBlocks.add(value[0])
                block[key] = jsonObj[value[0]]
                mergeBlocks(jsonObj, block[key], usedBlocks)
            }
        }

        // Продолжение проверки
        if (value?.constructor === Object) {
            let valueKeys = Object.keys(value)

            // Упрощение дерева
            if (valueKeys.length === 1 && value[valueKeys[0]]?.constructor !== Object) {
                block[`${key}/${valueKeys[0]}`] = value[valueKeys[0]]
                delete block[key]
            }

            mergeBlocks(jsonObj, value, usedBlocks)
        }
    })
}
