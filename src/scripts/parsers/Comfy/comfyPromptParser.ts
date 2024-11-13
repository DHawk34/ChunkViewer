import { Dictionary, isObject, optimizeOrder } from "@/scripts/utils/utils"
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
    keysCount: number,
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
            value: json[key],
            keysCount: 0
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
    const cleanBlocks = targetBlocks.filter(block => Object.keys(block.value).length !== 0)

    for (let block of cleanBlocks) {
        block.value = deepOptimizeOrderAndCountKeys(block.value, block)
    }
    console.log(cleanBlocks)

    return cleanBlocks
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

function deepOptimizeOrderAndCountKeys(blockValue: Dictionary<string>, block: ComfyBlock) {
    const keys = Object.keys(blockValue)
    block.keysCount += keys.length
    
    keys.forEach(key => {
        let value = blockValue[key]

        if (isObject(value)) {
            blockValue[key] = deepOptimizeOrderAndCountKeys(value, block)
        }
    })

    return optimizeOrder(blockValue, 'positive', 'negative', 'seed', 'model', 'sampler_name', 'scheduler', 'steps', 'cfg', 'width', 'height', 'upscale_model', 'upscale_method', 'image_before_upscale')
}

function replaceBlockIDsWithReferences(json: any, blockValue: Dictionary<string>) {
    const keys = Object.keys(blockValue)

    keys.forEach(key => {
        const value = blockValue[key]

        if (isObject(value)) {
            replaceBlockIDsWithReferences(json, value)
        }

        if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {

            const anotherBlockID = value[0]
            const anotherBlockValue = json[anotherBlockID]

            blockValue[key] = anotherBlockValue
        }
    })
}


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