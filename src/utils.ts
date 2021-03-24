export function keyToPath(key: string): number[] {
    return hexToBin(key).padStart(256, "0").split("").reverse().map(Number)
}

export function getIndexOfLastNonZeroElement(array: string[]): number {
    for (let i = array.length - 1; i >= 0; i--) {
        if (Number(`0x${array[i]}`) !== 0) {
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

export function checkHex(n: string): boolean {
    return /^[0-9A-Fa-f]{1,64}$/.test(n)
}

export function hexToBin(n: string): string {
    if (!checkHex(n)) {
        throw new Error(`Value ${n} is not a hexadecimal number`)
    }

    return Number(`0x${n}`).toString(2)
}

export function hexToDec(n: string): number {
    if (!checkHex(n)) {
        throw new Error(`Value ${n} is not a hexadecimal number`)
    }

    return Number(`0x${n}`)
}

export function decToHex(n: number): string {
    return n.toString(16)
}

export function bigIntToHex(n: BigInt): string {
    return n.toString(16)
}

export function hexToBigInt(n: string): BigInt {
    return BigInt(`0x${n}`)
}

export function hexToUint8Array(n: string): Uint8Array | null {
    const bytes = n.match(/.{1,2}/g)

    if (bytes) {
        return new Uint8Array(bytes.map((byte) => parseInt(byte, 16)))
    }

    return null
}
