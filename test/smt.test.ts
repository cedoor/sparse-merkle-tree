import { SMT, decToHex } from "../src"
import { ChildNodes } from "../src/smt"
import { sha256 } from "js-sha256"

describe("Sparse Merkle tree", () => {
    const hash = (childNodes: ChildNodes) => sha256(childNodes.join(""))
    const testKeys = [10, 3, 43, 32, 9, 23]

    describe("Create new trees", () => {
        it("Should create an empty sparse Merkle tree", () => {
            const tree = new SMT(hash)

            expect(tree.root).toEqual("0")
        })
    })

    describe("Add new entries (key/value) in the tree", () => {
        it("Should add a new entry as decimal", () => {
            const tree = new SMT(hash)
            const oldRoot = tree.root

            tree.add(2, 10)

            expect(tree.root).not.toEqual(oldRoot)
        })

        it("Should add a new entry as hexadecimal", () => {
            const tree = new SMT(hash)
            const oldRoot = tree.root

            tree.add("c", "e0")

            expect(tree.root).not.toEqual(oldRoot)
        })

        it("Should not add a new entry with an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2, 10)
            const fun = () => tree.add(2, 10)

            expect(fun).toThrow()
        })

        it("Should add 6 new entries and create the correct root hash", () => {
            const tree = new SMT(hash)

            for (const key of testKeys) {
                tree.add(key, key * 10)
            }

            expect(tree.root.slice(0, 5)).toEqual("6e4e4")
        })
    })

    describe("Get values from the tree", () => {
        it("Should get a value from the tree using an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2, 10)
            const value = tree.get(2)

            expect(value).toEqual("a")
        })

        it("Should not get a value from the tree using a non-existing key", () => {
            const tree = new SMT(hash)

            tree.add(2, 10)
            const value = tree.get(1)

            expect(value).toBeUndefined()
        })
    })

    describe("Update values in the tree", () => {
        it("Should update a value of an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2, 10)
            tree.update(2, 5)

            expect(tree.root.slice(0, 5)).toEqual("c75d3")
        })

        it("Should not update a value with a non-existing key", () => {
            const tree = new SMT(hash)

            const fun = () => tree.update(1, 5)

            expect(fun).toThrow()
        })
    })

    describe("Delete entries from the tree", () => {
        it("Should delete an entry with an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2, 10)
            tree.delete(2)

            expect(tree.root).toEqual("0")
        })

        it("Should delete 3 entries and create the correct root hash", () => {
            const tree = new SMT(hash)

            for (const key of testKeys) {
                tree.add(key, key * 10)
            }

            tree.delete(testKeys[1])
            tree.delete(testKeys[3])
            tree.delete(testKeys[4])

            expect(tree.root.slice(0, 5)).toEqual("237e9")
        })

        it("Should not delete an entry with a non-existing key", () => {
            const tree = new SMT(hash)

            const fun = () => tree.delete(1)

            expect(fun).toThrow()
        })
    })

    describe("Create Merkle proofs and verify them", () => {
        it("Should create some Merkle proofs and verify them", () => {
            const tree = new SMT(hash)

            for (const key of testKeys) {
                tree.add(key, key * 10)
            }

            for (let i = 0; i < 100; i++) {
                const randomKey = Math.floor(Math.random() * 100)
                const proof = tree.createProof(randomKey)

                expect(tree.verifyProof(proof)).toBeTruthy()
            }

            tree.add(18, 1)

            const proof = tree.createProof(6)
            expect(tree.verifyProof(proof)).toBeTruthy()
        })

        it("Should not verify a wrong Merkle proof", () => {
            const tree = new SMT(hash)

            for (const key of testKeys) {
                tree.add(key, key * 10)
            }

            const proof = tree.createProof(25)
            proof.matchingEntry = [decToHex(32), decToHex(10)]

            expect(tree.verifyProof(proof)).toBeFalsy()
        })
    })
})
