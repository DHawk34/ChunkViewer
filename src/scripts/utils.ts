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

export function isUrl(input: string): boolean {
    let url;

    try {
        url = new URL(input);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}
