import { keyToPath, getIndexOfLastNonZeroElement, getFirstMatchingElements } from "../src/utils"

export default class SMT {
    root: bigint
    nodes: Map<bigint, any[]>
    private hash: (...values: bigint[]) => bigint

    constructor(hash: (...values: bigint[]) => bigint) {
        this.root = 0n
        this.nodes = new Map()
        this.hash = hash
    }

    get(key: bigint): bigint | null {
        const { entry } = this.retrieveEntry(key)

        return entry[1] !== undefined ? entry[1] : null
    }

    add(key: bigint, value: bigint) {
        const { entry, matchingEntry, sidenodes } = this.retrieveEntry(key)

        if (entry[1] !== undefined) {
            throw new Error(`Key "${key}" already exists`)
        }

        const path = keyToPath(key)
        const node = matchingEntry ? this.hash(...matchingEntry) : 0n

        if (sidenodes.length > 0) {
            if (node === 0n) {
                this.deleteOldNodes(node, path, sidenodes)
            } else {
                const i = getIndexOfLastNonZeroElement(sidenodes)

                this.deleteOldNodes(node, path, sidenodes, i)
            }
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
        const { entry, sidenodes } = this.retrieveEntry(key)

        if (entry[1] === undefined) {
            throw new Error(`Key "${key}" does not exist`)
        }

        const path = keyToPath(key)

        const node = this.hash(key, entry[1], 1n)
        this.nodes.delete(node)

        this.deleteOldNodes(node, path, sidenodes)

        const newNode = this.hash(key, newValue, 1n)
        this.nodes.set(newNode, [key, newValue, true])

        this.root = this.insertNewNodes(newNode, path, sidenodes)
    }

    delete(key: bigint) {
        const { entry, sidenodes } = this.retrieveEntry(key)

        if (entry[1] === undefined) {
            throw new Error(`Key "${key}" does not exist`)
        }

        const path = keyToPath(key)

        const node = this.hash(key, entry[1], 1n)
        this.nodes.delete(node)

        this.root = 0n

        if (sidenodes.length > 0) {
            this.deleteOldNodes(node, path, sidenodes)

            const childNodes = this.nodes.get(sidenodes[sidenodes.length - 1]) as bigint[]

            if (!childNodes[2]) {
                this.root = this.insertNewNodes(0n, path, sidenodes)
            } else {
                const firstSidenode = sidenodes.pop() as bigint
                const i = getIndexOfLastNonZeroElement(sidenodes)

                this.root = this.insertNewNodes(firstSidenode, path, sidenodes, i)
            }
        }
    }

    createProof(key: bigint): Proof {
        const { entry, matchingEntry, sidenodes } = this.retrieveEntry(key)

        return {
            entry,
            matchingEntry,
            sidenodes,
            root: this.root,
            membership: !!entry[1]
        }
    }

    verifyProof(proof: Proof): boolean {
        if (!proof.matchingEntry) {
            const path = keyToPath(proof.entry[0])
            const node = proof.entry[1] !== undefined ? this.hash(proof.entry[0], proof.entry[1], 1n) : 0n
            const root = this.calculateRoot(node, path, proof.sidenodes)

            return root === proof.root
        } else {
            const matchingPath = keyToPath(proof.matchingEntry[0])
            const node = this.hash(proof.matchingEntry[0], proof.matchingEntry[1], 1n)
            const root = this.calculateRoot(node, matchingPath, proof.sidenodes)

            if (root === proof.root) {
                const path = keyToPath(proof.entry[0])
                const firstMatchingBits = getFirstMatchingElements(path, matchingPath)

                return proof.sidenodes.length <= firstMatchingBits.length
            }

            return false
        }
    }

    private retrieveEntry(key: bigint): EntryResponse {
        const path = keyToPath(key)
        const sidenodes: bigint[] = []

        for (let i = 0, node = this.root; node !== 0n; i++) {
            const childNodes = this.nodes.get(node) as bigint[]
            const direction = path[i]

            if (childNodes[2]) {
                if (childNodes[0] === key) {
                    return { entry: childNodes, sidenodes }
                }

                return { entry: [key], matchingEntry: childNodes, sidenodes }
            }

            sidenodes.push(childNodes[Number(!direction)])
            node = childNodes[direction]
        }

        return { entry: [key], sidenodes }
    }

    private calculateRoot(node: bigint, path: number[], sidenodes: bigint[]): bigint {
        for (let i = sidenodes.length - 1; i >= 0; i--) {
            const childNodes = path[i] ? [sidenodes[i], node] : [node, sidenodes[i]]
            node = this.hash(...childNodes)
        }

        return node
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

export interface EntryResponse {
    entry: bigint[]
    matchingEntry?: bigint[]
    sidenodes: bigint[]
}

export interface Proof extends EntryResponse {
    root: bigint
    membership: boolean
}
