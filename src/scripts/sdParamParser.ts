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
    const result: Parameters = {}
    parameters = parameters.replaceAll('\n', '') // regex: replace(/\n/g, "")

    if (parameters.length === 0) {
        return result
    }

    // Get positive & negative prompt
    retreivePosNegPrompt()
    
    //const params = parameters.split(', ')
    const params = mySplit(parameters, ', ')

    for (let i = 0; i < params.length; i++) {
        const index = params[i].indexOf(': ')
        const name = params[i].substring(0, index).trim()
        const value = params[i].substring(index + 2).replaceAll('"', '')

        result[name] = value
    }

    return result



    // local functions
    function retreivePosNegPrompt() {
        let positive = ''
        let negative = ''

        const promptEndIndex = indexOfPromptEnd(parameters)
        if (promptEndIndex === -1) return

        const posNeg = parameters.slice(0, promptEndIndex)
        parameters = parameters.slice(promptEndIndex)

        if (posNeg.includes(NEGATIVE_PROMPT_TEXT)) {
            const index = posNeg.indexOf(NEGATIVE_PROMPT_TEXT)
            positive = posNeg.substring(0, index)
            negative = posNeg.substring(index + NEGATIVE_PROMPT_TEXT.length)
        }
        else {
            positive = posNeg
            negative = ''
        }

        result['Positive prompt'] = positive
        result['Negative prompt'] = negative
    }
}



function mySplit(text: string, separator: string): string[] {
    const result: string[] = []
    const separatorLength = separator.length
    const checkLength = text.length - separatorLength

    let blockStarted: boolean = false
    let startIndex = 0

    for (let i = 0; i < checkLength; i++) {
        if (text[i] === '"') {
            blockStarted = !blockStarted
            continue
        }
        if (blockStarted) continue

        if (isSeparator(i)) {
            result.push(text.substring(startIndex, i))
            startIndex = i + separatorLength
        }
    }

    const last = text.substring(startIndex)
    if (last && last !== '') {
        result.push(last)
    }

    return result



    function isSeparator(i: number): boolean {
        for (let j = 0; j < separatorLength; j++) {
            if (text[i + j] !== separator[j])
                return false
        }

        return true
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
