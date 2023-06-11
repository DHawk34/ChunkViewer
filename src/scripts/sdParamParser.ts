import { isDigit } from "./utils"

const NEGATIVE_PROMPT_TEXT = 'Negative prompt: '
const PARAM_NAMES = [
    'Steps: ',
    'Sampler: ',
    'CFG scale: ',
    'Seed: ',
    'Size: ',
]

export type Parameters = {
    [key: string]: string
}

export function parseParameters(parameters: string): Parameters {
    let result: Parameters = {}
    parameters = parameters.replaceAll('\n', '') // regex: replace(/\n/g, "")

    if (parameters.length === 0) {
        return result
    }

    // Get positive & negative prompt
    if (!retreivePosNegPrompt()) return result

    // Get other parameters
    const params = parameters.split(', ')

    for (let i = 0; i < params.length; i++) {
        let out = params[i].split(': ')
        let name = out[0]
        result[name] = out[1] //?? ''
    }

    return result



    // local functions
    function retreivePosNegPrompt(): boolean {
        let positive = ''
        let negative = ''

        const promptEndIndex = indexOfPromptEnd(parameters)
        if (promptEndIndex === -1) return false

        let posNeg = parameters.slice(0, promptEndIndex)
        parameters = parameters.slice(promptEndIndex)

        if (posNeg.includes(NEGATIVE_PROMPT_TEXT)) {
            let out = posNeg.split(NEGATIVE_PROMPT_TEXT)
            positive = out[0]
            negative = out[1] //?? ''
        }
        else {
            positive = posNeg
            negative = ''
        }

        result['positive'] = positive
        result['negative'] = negative

        return true
    }
}



/** Returns -1 if not found. */
function indexOfPromptEnd(parameters: string): number {
    let index: number

    for (let paramName of PARAM_NAMES) {
        index = indexOfParam(parameters, paramName)
        if (index !== -1) return index
    }

    return -1
}

/** Returns -1 if not found. */
function indexOfParam(parameters: string, paramName: string): number {
    const index = parameters.lastIndexOf(paramName)
    const paramNameEnd = index + paramName.length

    if (index !== -1 && parameters.length > paramNameEnd && isDigit(parameters[paramNameEnd + 1])) {
        return index
    }

    return -1
}
