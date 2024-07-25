import { Dictionary, isObject, optimizeOrder } from "@/scripts/utils"
import CheckpointLoaderSimpleParser from "./BlockParsers/CheckpointLoaderSimpleParser"
import VAELoaderParser from "./BlockParsers/VaeLoaderParser"
import CLIPTextEncodeParser from "./BlockParsers/CLIPTextEncodeParser"
import CLIPSetLastLayerParser from "./BlockParsers/CLIPSetLastLayerParser"
import ConditioningCombineParser from "./BlockParsers/ConditioningCombineParser"
import DefaultParser from "./BlockParsers/DefaultParser"
import UpscaleModelLoaderParser from "./BlockParsers/UpscaleModelLoaderParser"
import ImageUpscaleWithModelParser from "./BlockParsers/ImageUpscaleWithModelParser"
import UnknownBlockParser from "./BlockParsers/UnknownBlockParser"
import SaveImageParser from "./BlockParsers/SaveImageParser"

const defaultParser = new DefaultParser()

const parserDictionary: { [key: string]: IBlockParser } = {
    CheckpointLoaderSimple: new CheckpointLoaderSimpleParser(),
    VAELoader: new VAELoaderParser(),
    CLIPSetLastLayer: new CLIPSetLastLayerParser(),
    CLIPTextEncode: new CLIPTextEncodeParser(),
    ConditioningCombine: new ConditioningCombineParser(),
    UpscaleModelLoader: new UpscaleModelLoaderParser(),
    ImageUpscaleWithModel: new ImageUpscaleWithModelParser(),
    SaveImage: new SaveImageParser(),
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
    value: Dictionary<string>
}

export function parsePrompt(prompt: string): ComfyBlock[] {
    if (prompt.length === 0) return []

    // const usedBlocks = new Set<string>()

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
    blocks.forEach(block => {
        simplifyBlockStart(block)
        replaceBlockIDsWithReferences(json, block.value)

    })

    // blocks.forEach(block => {
    //     replaceBlockIDsWithReferences(json, block.value)
    // })

    const targetBlocks = blocks.filter(x => x.name === 'PreviewImage' || x.name === 'SaveImage')

    targetBlocks.forEach(block => {
        block.value = structuredClone(block.value)
        parseTree({ 1: block.value })
    });

    //delete empty blocks & optimize order
    targetBlocks.forEach(block => {
        if (Object.keys(block.value).length === 0) {
            const index = targetBlocks.indexOf(block, 0);
            if (index > -1) {
                targetBlocks.splice(index, 1);
            }
        }

        // deepOptimizeOrder(block.value)
        block.value = optimizeOrder(block.value, 'positive', 'negative', 'seed', 'model', 'sampler_name', 'scheduler', 'steps', 'cfg', 'width', 'height', 'upscale_model', 'upscale_method', 'image_before_upscale')
    })


    return targetBlocks
}

function deepOptimizeOrder(block: Dictionary<string>) {
    console.log(block)
    const keys = Object.keys(block)

    keys.forEach(key => {
        const value = block[key]

        if (isObject(value)) {
            deepOptimizeOrder(value)
        }
    })

    block = optimizeOrder(block, 'positive', 'negative', 'seed', 'model', 'sampler_name', 'scheduler', 'steps', 'cfg', 'width', 'height', 'upscale_model', 'upscale_method', 'image_before_upscale')
}

function parseTree(block: Dictionary<string>) {
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

function replaceBlockIDsWithReferences(json: any, block: Dictionary<string>) {
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


function simplifyBlockStart(block: Dictionary<string>) {
    const keys = Object.keys(block.value)

    if (keys.length > 0) {
        const key = keys[0]
        const value = block.value[key] as Dictionary<string>

        if (isObject(value)) {
            Object.entries(value).forEach(([vKey, vValue]) => {
                block.value[vKey] = vValue
            })

            delete block.value[key]
        }
    }
}

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