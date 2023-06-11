export function swap<T>(arr: T[], index1: number, index2: number) {
    const [oneElement] = arr.splice(index1, 1)
    arr.splice(index2, 0, oneElement)
}

export function objectToArray<T>(object: Object) {
    let keys = Object.keys(object);
    let values = Object.values(object) as T[];

    return keys.map((key: string, index: number) => {
        return { key: key, value: values[index] }
    });
}