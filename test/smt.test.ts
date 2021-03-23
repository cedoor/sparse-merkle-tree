import { SMT } from "../src"
import { poseidon, smt as CircomlibSMT } from "circomlib"

describe("Sparse Merkle tree", () => {
    let hash: (...values: bigint[]) => bigint
    let keys: bigint[]

    beforeAll(() => {
        hash = (...values: bigint[]) => poseidon(values)
        keys = [10n, 3n, 43n, 32n, 9n, 23n]
    })

    describe("Create new trees", () => {
        it("Should create an empty sparse Merkle tree", () => {
            const tree = new SMT(hash)

            expect(tree.root).toEqual(0n)
            expect(tree.nodes.size).toEqual(0)
        })
    })

    describe("Add new entries (key/value) in the tree", () => {
        it("Should add a new entry", () => {
            const tree = new SMT(hash)
            const oldRoot = tree.root

            tree.add(2n, 10n)

            expect(tree.nodes.size).toEqual(1)
            expect(tree.root).not.toEqual(oldRoot)
        })

        it("Should not add a new entry with an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2n, 10n)
            const fun = () => tree.add(2n, 10n)

            expect(fun).toThrow()
        })

        it("Should add 6 new entries and create the correct root hash", () => {
            const tree = new SMT(hash)

            for (const key of keys) {
                tree.add(key, key * 10n)
            }

            expect(tree.root.toString().slice(0, 5)).toEqual("78213")
        })
    })

    describe("Get values from the tree", () => {
        it("Should get a value from the tree using an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2n, 10n)
            const { value } = tree.get(2n)

            expect(value).toEqual(10n)
        })
    })

    describe("Update values in the tree", () => {
        it("Should update a value of an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2n, 10n)
            tree.update(2n, 5n)

            expect(tree.nodes.size).toEqual(1)
            expect(tree.root.toString().slice(0, 5)).toEqual("87016")
        })

        it("Should not update a value with a non-existing key", () => {
            const tree = new SMT(hash)

            const fun = () => tree.update(1n, 5n)

            expect(fun).toThrow()
        })
    })

    describe("Delete entries from the tree", () => {
        it("Should delete an entry with an existing key", () => {
            const tree = new SMT(hash)

            tree.add(2n, 10n)
            tree.delete(2n)

            expect(tree.nodes.size).toEqual(0)
            expect(tree.root).toEqual(0n)
        })

        it("Should delete 3 entries and create the correct root hash", () => {
            const tree = new SMT(hash)

            for (const key of keys) {
                tree.add(key, key * 10n)
            }

            tree.delete(keys[1])
            tree.delete(keys[3])
            tree.delete(keys[4])

            expect(tree.root.toString().slice(0, 5)).toEqual("17944")
        })

        it("Should not delete an entry with a non-existing key", () => {
            const tree = new SMT(hash)

            const fun = () => tree.delete(1n)

            expect(fun).toThrow()
        })
    })

    describe("Create Merkle proofs and verify them", () => {
        it("Should create some Merkle proofs and verify them", () => {
            const tree = new SMT(hash)

            for (const key of keys) {
                tree.add(key, key * 10n)
            }

            for (let i = 0; i < 100; i++) {
                const randomKey = BigInt(Math.floor(Math.random() * 100))
                const proof = tree.createProof(randomKey)

                expect(tree.verifyProof(proof)).toBeTruthy()
            }
        })

        it("Should not verify a wrong Merkle proof", () => {
            const tree = new SMT(hash)

            for (const key of keys) {
                tree.add(key, key * 10n)
            }

            const proof = tree.createProof(25n)
            proof.matchingEntry = [33n, 3n]

            expect(tree.verifyProof(proof)).toBeFalsy()
        })
    })

    // describe("Performance", () => {
    // const randomEntries: [bigint, bigint][] = []

    // beforeAll(() => {
    // for (let i = 0n; i < 300n; i++) {
    // randomEntries.push([i, i * 10n])
    // }
    // })

    // it("SMT", () => {
    // const tree = new SMT(hash)

    // for (const randomEntry of randomEntries) {
    // tree.add(...randomEntry)
    // }
    // })

    // it("Circomlib SMT", async () => {
    // const circomlibSmt = await CircomlibSMT.newMemEmptyTrie()

    // for (const randomEntry of randomEntries) {
    // await circomlibSmt.insert(...randomEntry)
    // }
    // })
    // })
})
