export function keyToPath(key: bigint): number[] {
    return key.toString(2).padStart(256, "0").split("").reverse().map(Number)
}

export function getIndexOfLastNonZeroElement(array: any[]): number {
    for (let i = array.length - 1; i >= 0; i--) {
        if (Number(array[i]) !== 0) {
            return i
        }
    }

    return -1
}

export function getFirstMatchingElements(array1: any[], array2: any[]): any[] {
    const minArray = array1.length < array2.length ? array1 : array2

    for (let i = 0; i < minArray.length; i++) {
        if (array1[i] !== array2[i]) {
            return minArray.slice(0, i)
        }
    }

    return minArray.slice()
}
