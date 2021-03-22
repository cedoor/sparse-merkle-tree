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
            this.deleteOldNodes(node, path, sidenodes)
        } else {
            const i = this.getLastIndexOfNonZero(sidenodes)

            this.deleteOldNodes(node, path, sidenodes, i)
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

    update(key: bigint, newValue: bigint) {
        const { value, sidenodes } = this.get(key)

        if (value === undefined) {
            throw new Error(`Key "${key}" does not exist`)
        }

        const path = this.keyToPath(key)

        const node = this.hash(key, value, 1n)
        this.nodes.delete(node)

        this.deleteOldNodes(node, path, sidenodes)

        const newNode = this.hash(key, newValue, 1n)
        this.nodes.set(newNode, [key, newValue, true])

        this.root = this.insertNewNodes(newNode, path, sidenodes)
    }

    delete(key: bigint) {
        const { value, sidenodes } = this.get(key)

        if (value === undefined) {
            throw new Error(`Key "${key}" does not exist`)
        }

        const path = this.keyToPath(key)

        const node = this.hash(key, value, 1n)
        this.nodes.delete(node)

        this.root = 0n

        if (sidenodes.length > 0) {
            this.deleteOldNodes(node, path, sidenodes)

            const childNodes = this.nodes.get(sidenodes[sidenodes.length - 1]) as bigint[]

            if (!childNodes[2]) {
                this.root = this.insertNewNodes(0n, path, sidenodes)
            } else {
                const a = sidenodes.pop()
                const i = this.getLastIndexOfNonZero(sidenodes)

                this.root = this.insertNewNodes(a, path, sidenodes, i)
            }
        }
    }

    private insertNewNodes(node: bigint, path: number[], sidenodes: bigint[], i = sidenodes.length - 1): bigint {
        for (; i >= 0; i--) {
            const childNodes = path[i] ? [sidenodes[i], node] : [node, sidenodes[i]]
            node = this.hash(...childNodes)

            this.nodes.set(node, childNodes)
        }

        return node
    }

    private deleteOldNodes(node: bigint, path: number[], sidenodes: bigint[], i = sidenodes.length - 1) {
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
