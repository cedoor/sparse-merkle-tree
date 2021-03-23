import { getFirstMatchingElements, getIndexOfLastNonZeroElement, keyToPath } from "../src/utils"

describe("Utility functions", () => {
    describe("Convert SMT keys in 256-bit paths", () => {
        it("Should convert a key in an array of 256 bits", () => {
            const path = keyToPath(23n)

            expect(path.length).toEqual(256)
            expect(path.every((b) => b === 0 || b === 1)).toBeTruthy()
        })

        it("Should create a path in the correct order", () => {
            const path = keyToPath(23n)

            expect(path.slice(0, 5)).toEqual([1, 1, 1, 0, 1])
        })
    })

    describe("Get index of the last non-zero element", () => {
        it("Should return the correct index of the last non-zero element", () => {
            const index = getIndexOfLastNonZeroElement([0, 23, 3, 0, 3, 0, 3, 2, 0, 0])

            expect(index).toEqual(7)
        })

        it("Should return -1 if there are not non-zero elements", () => {
            const index = getIndexOfLastNonZeroElement([0, 0, 0, 0, 0, 0])

            expect(index).toEqual(-1)
        })
    })

    describe("Get first matching elements", () => {
        it("Should return the first matching elements of two arrays", () => {
            const array1 = [1, 4, 3, 8, 2, 9]
            const array2 = [1, 4, 2, 7, 2]

            const matchingArray = getFirstMatchingElements(array1, array2)

            expect(matchingArray).toEqual([1, 4])
        })

        it("Should return the smallest array if all its elements are the first elements of the other array", () => {
            const array1 = [1, 4, 3, 8, 2]
            const array2 = [1, 4, 3, 8, 2, 32, 23]

            const matchingArray = getFirstMatchingElements(array1, array2)

            expect(matchingArray).toEqual(array1)
        })
    })
})
