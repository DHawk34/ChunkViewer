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
    retreivePosNegPrompt()

    // Get other parameters
    const params = parameters.split(', ')

    for (let i = 0; i < params.length; i++) {
        let out = params[i].split(': ')
        let name = out[0].trim()
        result[name] = out[1]
    }

    return result



    // local functions
    function retreivePosNegPrompt() {
        let positive = ''
        let negative = ''

        const promptEndIndex = indexOfPromptEnd(parameters)
        if (promptEndIndex === -1) return

        let posNeg = parameters.slice(0, promptEndIndex)
        parameters = parameters.slice(promptEndIndex)

        if (posNeg.includes(NEGATIVE_PROMPT_TEXT)) {
            let out = posNeg.split(NEGATIVE_PROMPT_TEXT)
            positive = out[0]
            negative = out[1]
        }
        else {
            positive = posNeg
            negative = ''
        }

        result['Positive prompt'] = positive
        result['Negative prompt'] = negative
    }
}



/** Returns -1 if not found. */
function indexOfPromptEnd(parameters: string): number {
    let index: number

    for (let paramName of PARAM_NAMES) {
        index = parameters.lastIndexOf(paramName)

        if (index !== -1)
            return index
    }

    return -1
}
