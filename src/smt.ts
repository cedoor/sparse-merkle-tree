import { keyToPath, getLastIndexOfNonZeroSidenode } from "../src/utils"

export default class SMT {
    root: bigint
    nodes: Map<bigint, any[]>
    private hash: (...values: bigint[]) => bigint

    constructor(hash: (...values: bigint[]) => bigint) {
        this.root = 0n
        this.nodes = new Map()
        this.hash = hash
    }

    get(key: bigint): any {
        const path = keyToPath(key)
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

        const path = keyToPath(key)

        if (node === 0n && sidenodes.length > 0) {
            this.deleteOldNodes(node, path, sidenodes)
        } else {
            const i = getLastIndexOfNonZeroSidenode(sidenodes)

            this.deleteOldNodes(node, path, sidenodes, i)
        }

        if (node !== 0n) {
            const childNodes = this.nodes.get(node) as bigint[]
            const oldPath = keyToPath(childNodes[0])

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

        const path = keyToPath(key)

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

        const path = keyToPath(key)

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
                const i = getLastIndexOfNonZeroSidenode(sidenodes)

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
}
