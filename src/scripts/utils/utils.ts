import { DropResult } from "react-beautiful-dnd"

export function swap<T>(arr: T[], index1: number, index2: number) {
    const [oneElement] = arr.splice(index1, 1)
    arr.splice(index2, 0, oneElement)
}

export function getTime(): string {
    return new Date().toLocaleTimeString()
}

export function getFileNameFromURL(inp: string) {
    return (inp.match(/^\w+:(\/+([^\/#?\s]+)){2,}(#|\?|$)/) || [])[2] || ''
}

export function getFileNameFromPath(filePath: string): string {
    return filePath.replace(/^.*(\\|\/|:)/, '')
}

export function removeExtFromFileName(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, "")
}

export function getFileNameFromUrlOrPath(input: string): string {
    return isUrl(input)
        ? getFileNameFromURL(input)
        : getFileNameFromPath(input)
}

export function capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function optimizeOrder(parameters: Dictionary<string>, ...order: string[]) {
    const sortedKeys = Object.keys(parameters).sort((a, b) => {
        if (order.includes(a) && order.includes(b)) {
            return order.indexOf(a) - order.indexOf(b)
        }
        else if (order.includes(a)) {
            return -1
        }
        else if (order.includes(b)) {
            return 1
        }
        else {
            return 0
        }
    })

    const sortedObject = sortedKeys.reduce((acc: Dictionary<string>, key) => {
        acc[key] = parameters[key]
        return acc
    }, {})

    return sortedObject
}

export function isUrl(input: string): boolean {
    try {
        const protocol = new URL(input).protocol
        return protocol === "http:" || protocol === "https:"
    } catch (_) {
        return false
    }
}

export function getDropEndFunc<T>(data: T[], setData: (data: T[]) => void) {
    return (result: DropResult) => {
        if (!result.destination)
            return

        if (result.source.index === result.destination.index)
            return

        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index
        const newArr = [...data]

        swap(newArr, sourceIndex, destinationIndex)
        setData(newArr)
    }
}

export function isObject(something: any) {
    return something?.constructor === Object
}

export type Dictionary<T extends string | number | symbol> = {
    [key in T]: any
}
