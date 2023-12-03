const POSITIVE_PROMT_TEXT = 'Positive prompt'
const STEPS_TEXT = 'Steps: '
const SAMPLER_TEXT = 'Sampler: '

export type Param = {
    key: string
    value: string
}

export function parseParameters(parameters: string, parseValueInQuotation?: boolean): Param[] {
    const result: Param[] = []

    if (parameters.length === 0) {
        return result
    }

    let blockStartIndex = 0
    let blockName = ''

    for (let i = 0; i < parameters.length; i++) {
        const info = findNextBlock(parameters, i)
        const blockEndIndex: number = info ? info.prevBlockEndIndex : parameters.length

        if (blockEndIndex !== -1) { // if it's not the first iteration
            const inQuotations = isValueInQuotationsMarks(parameters, blockStartIndex, blockEndIndex)
            const value = inQuotations
                ? parameters.substring(blockStartIndex + 1, blockEndIndex - 1) // trim quotation marks
                : parameters.substring(blockStartIndex, blockEndIndex)

            result.push({ key: blockName, value: parseValueInQuotation && inQuotations ? parseValue(value, ', ') : value })
        }

        // if we didn't find next block --> end function
        if (!info) break

        blockName = info.blockName
        blockStartIndex = info.blockStartIndex
        i = blockStartIndex - 1
    }

    if (result.length > 0 && result[0].key === '' && parameters.includes(STEPS_TEXT) && parameters.includes(SAMPLER_TEXT)) {
        result[0].key = POSITIVE_PROMT_TEXT
    }

    return result
}

function findNextBlock(text: string, startIndex: number): { prevBlockEndIndex: number, blockName: string, blockStartIndex: number } | undefined {
    const delimIndex = indexOf_butIgnoreTextInQuotationMarks(text, ': ', startIndex)
    if (delimIndex === -1) {
        return undefined
    }

    const prevBlockEndIndex = Math.max(text.lastIndexOf(', ', delimIndex - 1), text.lastIndexOf('\n', delimIndex - 1))
    const blockNameIndex = prevBlockEndIndex === -1
        ? 0
        : (text[prevBlockEndIndex] === ',') ? (prevBlockEndIndex + 2) : (prevBlockEndIndex + 1)

    const blockName = text.substring(blockNameIndex, delimIndex)
    const blockStartIndex = delimIndex + 2

    return { prevBlockEndIndex, blockName, blockStartIndex }
}

/**
 * @param start inclusive
 * @param end exclusive
 * */
function isValueInQuotationsMarks(value: string, start: number = 0, end: number = value.length): boolean {
    return value[start] === '"' && value[end - 1] === '"'
}

function indexOf_butIgnoreTextInQuotationMarks(text: string, searchString: string, startIndex: number = 0): number {
    let blockStarted: boolean = false

    for (let i = startIndex; i < text.length; i++) {
        if (text[i] === '"') {
            blockStarted = !blockStarted
            continue
        }
        if (blockStarted) continue

        if (text.startsWith(searchString, i)) {
            return i
        }
    }

    return -1
}

function parseValue(value: string, separator: string): string {
    const lengthMinusOne = value.length - 1
    const separatorLength = separator.length
    let bracketsStarted: boolean = false

    for (let i = 0; i < lengthMinusOne; i++) {
        if (value[i] === '(') {
            bracketsStarted = true
            continue
        }
        if (value[i] === ')') {
            bracketsStarted = false
            continue
        }
        if (bracketsStarted) continue

        if (value.startsWith(separator, i)) {
            value = value.substring(0, i + 1) + '\n' + value.substring(i + separatorLength)
        }
    }

    return value
}
