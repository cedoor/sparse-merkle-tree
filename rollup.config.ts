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
            file: pkg.main,
            name,
            format: "umd",
            banner
        },
        {
            file: pkg.unpkg,
            name,
            format: "umd",
            plugins: [terser({ output: { preamble: banner } })]
        },
        { file: pkg.module, format: "es", banner }
    ],
    watch: {
        include: "src/**"
    },
    plugins: [typescript({ useTsconfigDeclarationDir: true })]
}
