import { test } from "../src"

describe("Index", () => {
    // beforeAll(() => {
    // target = document.createElement("div")

    // document.body.appendChild(target)
    // })

    describe("Create a map", () => {
        it("Should create a simple map", () => {
            const result = test()

            expect(result).toEqual("Hello world")
        })
    })
})
