export function swap<T>(arr: T[], index1: number, index2: number) {
    let temp: T = arr[index1]
    arr[index1] = arr[index2]
    arr[index2] = temp
}