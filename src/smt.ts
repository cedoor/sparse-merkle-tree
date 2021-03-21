export default class SMT {
    root: bigint
    nodes: Map<bigint, any[]>
    hash: (...values: bigint[]) => bigint

    constructor(hash: (...values: bigint[]) => bigint) {
        this.root = 0n
        this.nodes = new Map()
        this.hash = hash
    }

    get(key: bigint): any {
        const path = this.keyToPath(key)
        const sidenodes: bigint[] = []

        let node = this.root

        for (let i = 0; node !== 0n; i++) {
            const childNodes = this.nodes.get(node) as bigint[]
            const direction = path[i]

            if (childNodes[2]) {
                if (childNodes[0] !== key) {
                    return { node, sidenodes }
                }

                return { value: childNodes[1], sidenodes }
            }

            sidenodes.push(childNodes[Number(!direction)])
            node = childNodes[direction]
        }

        return { node, sidenodes }
    }

    add(key: bigint, value: bigint) {
        const { node, sidenodes } = this.get(key)

        if (node === undefined) {
            throw new Error(`Key "${key}" already exists`)
        }

        const path = this.keyToPath(key)

        if (node === 0n && sidenodes.length > 0) {
            this.deleteOldNodes(sidenodes.length - 1, node, path, sidenodes)
        } else {
            const i = this.getLastIndexOfNonZero(sidenodes)

            this.deleteOldNodes(i, node, path, sidenodes)
        }

        if (node !== 0n) {
            const childNodes = this.nodes.get(node) as bigint[]
            const oldPath = this.keyToPath(childNodes[0])

            for (let i = sidenodes.length; oldPath[i] === path[i]; i++) {
                sidenodes.push(0n)
            }

            sidenodes.push(node)
        }

        const newNode = this.hash(key, value, 1n)
        this.nodes.set(newNode, [key, value, true])

        this.root = this.insertNewNodes(newNode, path, sidenodes)
    }

    private insertNewNodes(node: bigint, path: number[], sidenodes: bigint[]): bigint {
        for (let i = sidenodes.length - 1; i >= 0; i--) {
            const childNodes = path[i] ? [sidenodes[i], node] : [node, sidenodes[i]]
            node = this.hash(...childNodes)

            this.nodes.set(node, childNodes)
        }

        return node
    }

    private deleteOldNodes(i: number, node: bigint, path: number[], sidenodes: bigint[]) {
        for (; i >= 0; i--) {
            const childNodes = path[i] ? [sidenodes[i], node] : [node, sidenodes[i]]
            node = this.hash(...childNodes)

            this.nodes.delete(node)
        }
    }

    private getLastIndexOfNonZero(sidenodes: bigint[]): number {
        for (let i = sidenodes.length - 1; i >= 0; i--) {
            if (sidenodes[i] !== 0n) {
                return i
            }
        }

        return -1
    }

    private keyToPath(key: bigint): number[] {
        return key.toString(2).padStart(256, "0").split("").reverse().map(Number)
    }
}
