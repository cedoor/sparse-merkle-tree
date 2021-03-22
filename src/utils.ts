export function getLastIndexOfNonZeroSidenode(sidenodes: bigint[]): number {
    for (let i = sidenodes.length - 1; i >= 0; i--) {
        if (sidenodes[i] !== 0n) {
            return i
        }
    }

    return -1
}

export function keyToPath(key: bigint): number[] {
    return key.toString(2).padStart(256, "0").split("").reverse().map(Number)
}
