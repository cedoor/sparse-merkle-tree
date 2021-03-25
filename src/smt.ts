import { decToHex, getFirstMatchingElements, getIndexOfLastNonZeroElement, keyToPath } from "../src/utils"

export default class SMT {
    private zeroValue: string
    private hash: (childNodes: ChildNodes) => string
    private nodes: Map<string, ChildNodes>

    root: string

    constructor(hash: (childNodes: ChildNodes) => string) {
        this.zeroValue = "0"
        this.hash = hash
        this.nodes = new Map()
        this.root = this.zeroValue
    }

    get(key: string | number): string | null {
        key = this.getHex(key)
        const { entry } = this.retrieveEntry(key)

        if (entry[1] === undefined) {
            return null
        }

        return entry[1]
    }

    add(key: string | number, value: string | number) {
        key = this.getHex(key)
        value = this.getHex(value)
        const { entry, matchingEntry, sidenodes } = this.retrieveEntry(key)

        if (entry[1] !== undefined) {
            throw new Error(`Key "${key}" already exists`)
        }

        const path = keyToPath(key)
        const node = matchingEntry ? this.hash(matchingEntry) : this.zeroValue

        if (sidenodes.length > 0) {
            if (node === this.zeroValue) {
                this.deleteOldNodes(node, path, sidenodes)
            } else {
                const i = getIndexOfLastNonZeroElement(sidenodes)

                this.deleteOldNodes(node, path, sidenodes, i)
            }
        }

        if (node !== this.zeroValue) {
            const childNodes = this.nodes.get(node) as string[]
            const oldPath = keyToPath(childNodes[0])

            for (let i = sidenodes.length; oldPath[i] === path[i]; i++) {
                sidenodes.push(this.zeroValue)
            }

            sidenodes.push(node)
        }

        const newNode = this.hash([key, value, true])
        this.nodes.set(newNode, [key, value, true])

        this.root = this.insertNewNodes(newNode, path, sidenodes)
    }

    update(key: string | number, value: string | number) {
        key = this.getHex(key)
        value = this.getHex(value)
        const { entry, sidenodes } = this.retrieveEntry(key)

        if (entry[1] === undefined) {
            throw new Error(`Key "${key}" does not exist`)
        }

        const path = keyToPath(key)

        const node = this.hash(entry)
        this.nodes.delete(node)

        this.deleteOldNodes(node, path, sidenodes)

        const newNode = this.hash([key, value, true])
        this.nodes.set(newNode, [key, value, true])

        this.root = this.insertNewNodes(newNode, path, sidenodes)
    }

    delete(key: string | number) {
        key = this.getHex(key)
        const { entry, sidenodes } = this.retrieveEntry(key)

        if (entry[1] === undefined) {
            throw new Error(`Key "${key}" does not exist`)
        }

        const path = keyToPath(key)

        const node = this.hash(entry)
        this.nodes.delete(node)

        this.root = this.zeroValue

        if (sidenodes.length > 0) {
            this.deleteOldNodes(node, path, sidenodes)

            const childNodes = this.nodes.get(sidenodes[sidenodes.length - 1]) as string[]

            if (!childNodes[2]) {
                this.root = this.insertNewNodes(this.zeroValue, path, sidenodes)
            } else {
                const firstSidenode = sidenodes.pop() as string
                const i = getIndexOfLastNonZeroElement(sidenodes)

                this.root = this.insertNewNodes(firstSidenode, path, sidenodes, i)
            }
        }
    }

    createProof(key: string | number): Proof {
        key = this.getHex(key)
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
            const node = proof.entry[1] !== undefined ? this.hash(proof.entry) : this.zeroValue
            const root = this.calculateRoot(node, path, proof.sidenodes)

            return root === proof.root
        } else {
            const matchingPath = keyToPath(proof.matchingEntry[0])
            const node = this.hash(proof.matchingEntry)
            const root = this.calculateRoot(node, matchingPath, proof.sidenodes)

            if (root === proof.root) {
                const path = keyToPath(proof.entry[0])
                const firstMatchingBits = getFirstMatchingElements(path, matchingPath)

                return proof.sidenodes.length <= firstMatchingBits.length
            }

            return false
        }
    }

    private retrieveEntry(key: string): EntryResponse {
        const path = keyToPath(key)
        const sidenodes: string[] = []

        for (let i = 0, node = this.root; node !== this.zeroValue; i++) {
            const childNodes = this.nodes.get(node) as ChildNodes
            const direction = path[i]

            if (childNodes[2]) {
                if (childNodes[0] === key) {
                    return { entry: childNodes, sidenodes }
                }

                return { entry: [key], matchingEntry: childNodes, sidenodes }
            }

            sidenodes.push(childNodes[Number(!direction)] as string)
            node = childNodes[direction] as string
        }

        return { entry: [key], sidenodes }
    }

    private calculateRoot(node: string, path: number[], sidenodes: string[]): string {
        for (let i = sidenodes.length - 1; i >= 0; i--) {
            const childNodes: ChildNodes = path[i] ? [sidenodes[i], node] : [node, sidenodes[i]]
            node = this.hash(childNodes)
        }

        return node
    }

    private insertNewNodes(node: string, path: number[], sidenodes: string[], i = sidenodes.length - 1): string {
        for (; i >= 0; i--) {
            const childNodes: ChildNodes = path[i] ? [sidenodes[i], node] : [node, sidenodes[i]]
            node = this.hash(childNodes)

            this.nodes.set(node, childNodes)
        }

        return node
    }

    private deleteOldNodes(node: string, path: number[], sidenodes: string[], i = sidenodes.length - 1) {
        for (; i >= 0; i--) {
            const childNodes: ChildNodes = path[i] ? [sidenodes[i], node] : [node, sidenodes[i]]
            node = this.hash(childNodes)

            this.nodes.delete(node)
        }
    }

    private getHex(value: string | number): string {
        return typeof value === "number" ? decToHex(value) : value
    }
}

export type ChildNodes = [string, string?, boolean?]

export interface EntryResponse {
    entry: ChildNodes
    matchingEntry?: ChildNodes
    sidenodes: string[]
}

export interface Proof extends EntryResponse {
    root: string
    membership: boolean
}
