import { isObject } from "@/scripts/utils"
import CheckpointLoaderSimpleParser from "./BlockParsers/CheckpointLoaderSimpleParser"
import VAELoaderParser from "./BlockParsers/VaeLoaderParser"
import CLIPTextEncodeParser from "./BlockParsers/CLIPTextEncodeParser"
import CLIPSetLastLayerParser from "./BlockParsers/CLIPSetLastLayerParser"
import ConditioningCombineParser from "./BlockParsers/ConditioningCombineParser"
import DefaultParser from "./BlockParsers/DefaultParser"
import UpscaleModelLoaderParser from "./BlockParsers/UpscaleModelLoaderParser"
import ImageUpscaleWithModelParser from "./BlockParsers/ImageUpscaleWithModelParser"
import UnknownBlockParser from "./BlockParsers/UnknownBlockParser"

const defaultParser = new DefaultParser()

const parserDictionary: { [key: string]: IBlockParser } = {
    CheckpointLoaderSimple: new CheckpointLoaderSimpleParser(),
    VAELoader: new VAELoaderParser(),
    CLIPSetLastLayer: new CLIPSetLastLayerParser(),
    CLIPTextEncode: new CLIPTextEncodeParser(),
    ConditioningCombine: new ConditioningCombineParser(),
    UpscaleModelLoader: new UpscaleModelLoaderParser(),
    ImageUpscaleWithModel: new ImageUpscaleWithModelParser(),
    EmptyLatentImage: defaultParser,
    VAEDecode: defaultParser,
    PreviewImage: defaultParser,
    KSampler: defaultParser,
    VAEEncode: defaultParser,
    ImageScale: defaultParser,
    UnknownBlockParser: new UnknownBlockParser(),
}

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
        return block
    })

    // findUsedBlocks(json, usedBlocks)
    simplifyBlocksStart(blocks)

    blocks.forEach(block => {
        replaceBlockIDsWithReferences(json, block.value)
    })

    const targetBlocks = blocks.filter(x => x.name === 'PreviewImage' || x.name === 'SaveImage')

    targetBlocks.forEach(block => {
        block.value = structuredClone(block.value)
        parseTree({ 1: block.value })
    });

    // console.log(targetBlocks)

    return targetBlocks
}

function parseTree(block: BlockValue) {
    const keys = Object.keys(block)

    keys.forEach(key => {
        const value = block[key]

        if (isObject(value)) {
            parseTree(value)

            if (!value.hasOwnProperty('class_type'))
                return

            let parsed = false

            Object.keys(parserDictionary).forEach(classType => {
                if (value.class_type === classType) {
                    parserDictionary[classType].parseBlock(block, key)
                    parsed = true
                }
            })


            if (!parsed) {
                parserDictionary.UnknownBlockParser.parseBlock(block, key)
                parsed = true
            }

        }
    })
}

function simplifyBlocksStart(blocks: ComfyBlock[]) {

    blocks.forEach(block => {
        const keys = Object.keys(block.value)

        if (keys.length > 0) {
            const key = keys[0]
            const value = block.value[key] as BlockValue

            if (isObject(value)) {
                Object.entries(value).forEach(([vKey, vValue]) => {
                    block.value[vKey] = vValue
                })

                delete block.value[key]
            }
        }
    })
}

function replaceBlockIDsWithReferences(json: any, block: BlockValue) {
    const keys = Object.keys(block)

    keys.forEach(key => {
        const value = block[key]

        if (isObject(value)) {
            replaceBlockIDsWithReferences(json, value)
        }

        if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {

            const anotherBlockID = value[0]
            const anotherBlock = json[anotherBlockID]

            block[key] = anotherBlock
        }
    })
}

// function findUsedBlocks(block: BlockValue, usedBlocks: Set<string>) {
//     const keys = Object.keys(block)

//     keys.forEach(key => {
//         const value = block[key]

//         if (isObject(value)) {
//             findUsedBlocks(value, usedBlocks)
//         }

//         if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {
//             const anotherBlockID = value[0]
//             usedBlocks.add(anotherBlockID)
//         }
//     })
// }


// function simplifyBlockStart(block: BlockValue) {
//     const keys = Object.keys(block)

//     if (keys.length === 1) {
//         const key = keys[0]
//         const value = block[key] as BlockValue

//         if (isObject(value)) {
//             Object.entries(value).forEach(([vKey, vValue]) => {
//                 block[vKey] = vValue
//             })

//             delete block[key]
//         }
//     }
// }

// function simplifyPropertyTree(block: BlockValue) {
//     const keys = Object.keys(block)

//     keys.forEach(key => {
//         const value = block[key]

//         if (!isObject(value))
//             return

//         simplifyPropertyTree(value)
//         const childKeys = Object.keys(value)

//         childKeys.forEach(cKey => {
//             const childKey = cKey
//             const childValue = value[childKey]
//             const propName = `${key}/${childKey}`

//             block[propName] = childValue
//         })

//         delete block[key]
//     })
// }