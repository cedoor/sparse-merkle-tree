import { terser } from "rollup-plugin-terser"
import typescript from "rollup-plugin-typescript2"

const pkg = require("./package.json")

const banner = `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright ${pkg.author.name} ${new Date().getFullYear()}
 * @license ${pkg.license}
 * @see [Github]{@link ${pkg.homepage}}
*/`

const [, name] = pkg.name.split("/")

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.browser,
            name,
            format: "iife",
            banner
        },
        {
            file: pkg.unpkg,
            name,
            format: "iife",
            plugins: [terser({ output: { preamble: banner } })]
        },
        { file: pkg.exports.require, format: "cjs", banner },
        { file: pkg.exports.import, format: "es", banner }
    ],
    plugins: [typescript({ useTsconfigDeclarationDir: true })]
}
