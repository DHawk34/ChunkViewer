import { isObject } from "../utils"

export type ComfyBlock = {
    id: string,
    name: string,
    value: BlockValue
}

type BlockValue = {
    [key: string]: any
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

    const blocks = Object.keys(json).map(key => {
        const block: ComfyBlock = {
            id: key,
            name: json[key].class_type,
            value: json[key]
        }
        delete json[key].class_type

        simplifyBlocks(block.value)
        simplifyPropertyTree(block.value)
        console.log(block)

        // mergeBlocks_2(json, block.value, usedBlocks)
        return block
    })

    // console.log(blocks)
    // console.log(usedBlocks)
    const result = blocks.filter(x => !usedBlocks.has(x.id) && Object.keys(x.value).length > 0)


    // console.log(json)
    // console.log(result)

    return result
}

// Замена единственного свойства блока на все свойства ребенка
function simplifyBlocks(block: BlockValue) {
    const keys = Object.keys(block)

    if (keys.length === 1) {
        const key = keys[0]
        const value = block[key] as BlockValue

        if (isObject(value)) {
            Object.entries(value).forEach(([vKey, vValue]) => {
                block[vKey] = vValue
            })

            delete block[key]
            simplifyBlocks(block)
        }
        return
    }


}

function simplifyPropertyTree(block: BlockValue) {
    const keys = Object.keys(block)

    keys.forEach(key => {
        const value = block[key]

        if (isObject(value)) {
            const childKeys = Object.keys(value)

            // Упрощение дерева
            if (childKeys.length === 1) {
                const childKey = childKeys[0]
                const childValue = value[childKey]
                const propName = `${key}/${childKey}`

                block[propName] = childValue
                delete block[key]

                simplifyPropertyTree(block)
            }
            else
                simplifyPropertyTree(value)
        }
    })
}

// function simplifyPropertyTree_2(block: BlockValue) {
//     const keys = Object.keys(block)

//     if (keys.length === 1) {
//         return true
//     }

//     keys.forEach(key => {
//         const value = block[key]

//         if (isObject(value)) {
//             const shouldMerge = simplifyPropertyTree_2(value)

//             if (shouldMerge) {
//                 const childKey = Object.keys(value)[0]
//                 const childValue = value[childKey]
//                 const propName = `${key}/${childKey}`

//                 block[propName] = childValue
//                 delete block[key]
//             }
//         }
//         else {
//             return keys.length === 1
//         }
//     })

//     return false
// }

function mergeBlocks_2(json: any, block: BlockValue, usedBlocks: Set<string>) {
    const keys = Object.keys(block)

    if (keys.length === 0) {
        return
    }

    // if (keys.length === 1) {
    //     const key = keys[0]
    //     const value = block[key] as BlockValue

    //     if (isObject(value)) {
    //         Object.entries(value).forEach(([vKey, vValue]) => {
    //             block[vKey] = vValue
    //         })

    //         delete block[key]
    //         mergeBlocks_2(json, block, usedBlocks)
    //     }
    //     return
    // }

    keys.forEach(key => {
        const value = block[key]

        // Замена всех ссылок на объекты блоков
        if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {
            const anotherBlockID = value[0]
            const anotherBlock = json[anotherBlockID]

            block[key] = anotherBlock

            if (anotherBlock) {
                usedBlocks.add(anotherBlockID)
                mergeBlocks_2(json, anotherBlock, usedBlocks)
            }
        }

        // Обработка свойств-объектов
        if (isObject(value)) {
            const valueKeys = Object.keys(value)

            // Упрощение дерева
            if (valueKeys.length === 1) {
                const childKey = valueKeys[0]
                const childValue = value[childKey]
                const propName = `${key}/${childKey}`

                block[propName] = childValue
                delete block[key]

                if (isObject(childValue)) {
                    mergeBlocks_2(json, childValue, usedBlocks)
                }
            }
            else {
                mergeBlocks_2(json, value, usedBlocks)
            }
        }
    })
}

function mergeBlocks(json: any, block: BlockValue, usedBlocks: Set<string>) {
    Object.entries(block).forEach(([key, value]) => {

        // Распаковка inputs
        if (key === 'inputs') {
            Object.entries(value as BlockValue).forEach(function ([Vkey, Vvalue]) {
                block[Vkey] = Vvalue
            })

            delete block[key]

            mergeBlocks(json, block, usedBlocks)
            return
        }

        // Вставка блока вместо ссылки
        if (Array.isArray(value) && value.length === 2) {
            if (typeof value[0] === 'string' && typeof value[1] === 'number') {
                usedBlocks.add(value[0])
                block[key] = json[value[0]]

                if (block[key]) {
                    mergeBlocks(json, block[key], usedBlocks)
                }
            }
        }

        // Продолжение проверки
        if (isObject(value)) {
            const valueKeys = Object.keys(value)

            // Упрощение дерева
            if (valueKeys.length === 1 && value[valueKeys[0]]?.constructor !== Object) {
                block[`${key}/${valueKeys[0]}`] = value[valueKeys[0]]
                delete block[key]
                if (isObject(value[valueKeys[0]])) {
                    mergeBlocks(json, value[valueKeys[0]], usedBlocks)
                }
            }
            else {
                mergeBlocks(json, value, usedBlocks)
            }
        }
    })
}
