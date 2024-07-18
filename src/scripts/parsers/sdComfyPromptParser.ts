import { isObject } from "@/scripts/utils"

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

    const blocks = Object.keys(json).map(key => {
        const block: ComfyBlock = {
            id: key,
            name: json[key].class_type,
            value: json[key]
        }
        delete json[key].class_type
        return block
    })

    for (const block of blocks) {
        simplifyBlockStart(block.value)
        replaceBlockIDsWithReferences(json, block.value, usedBlocks)
    }

    const finalBlocks = blocks.filter(x => !usedBlocks.has(x.id) && Object.keys(x.value).length > 0)

    for (const block of blocks) {
        simplifyPropertyTree(block.value)
        // simplifyBlockStart(block.value) // Это чинит некоторые тесты, а некоторые ломает. Надо делать функу рекурсивной (?)
    }

    // console.log(json)
    // console.log(finalBlocks)

    return finalBlocks
}

function simplifyBlockStart(block: BlockValue) {
    const keys = Object.keys(block)

    if (keys.length === 1) {
        const key = keys[0]
        const value = block[key] as BlockValue

        if (isObject(value)) {
            Object.entries(value).forEach(([vKey, vValue]) => {
                block[vKey] = vValue
            })

            delete block[key]
        }
    }
}

function simplifyPropertyTree(block: BlockValue) {
    const keys = Object.keys(block)

    keys.forEach(key => {
        const value = block[key]

        if (!isObject(value))
            return

        simplifyPropertyTree(value)
        const childKeys = Object.keys(value)

        if (childKeys.length === 1) {
            const childKey = childKeys[0]
            const childValue = value[childKey]
            const propName = `${key}/${childKey}`

            block[propName] = childValue
            delete block[key]
        }
    })
}

function replaceBlockIDsWithReferences(json: any, block: BlockValue, usedBlocks: Set<string>) {
    const keys = Object.keys(block)

    keys.forEach(key => {
        const value = block[key]

        // if (isObject(value)) {
        //     replaceBlockIDsWithReferences(json, value, usedBlocks)
        // }

        if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {

            const anotherBlockID = value[0]
            const anotherBlock = json[anotherBlockID]

            block[key] = anotherBlock

            if (anotherBlock) {
                usedBlocks.add(anotherBlockID)
            }
        }
    })
}
