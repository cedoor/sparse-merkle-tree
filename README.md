<p align="center">
    <h1 align="center">
        Sparse Merkle tree
        <sub>In progress</sub>
    </h1>
    <p align="center">Sparse Merkle tree implementation in TypeScript.</p>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@cedoor/smt" target="_blank">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@cedoor/smt?style=flat-square">
    </a>
    <a href="https://github.com/cedoor/sparse-merkle-tree/blob/master/LICENSE" target="_blank">
        <img alt="Github license" src="https://img.shields.io/github/license/cedoor/sparse-merkle-tree.svg?style=flat-square">
    </a>
    <a href="https://github.com/cedoor/sparse-merkle-tree/actions?query=workflow%3Atest" target="_blank">
        <img alt="GitHub Workflow test" src="https://img.shields.io/github/workflow/status/cedoor/sparse-merkle-tree/test?label=test&style=flat-square&logo=github">
    </a>
    <a href='https://coveralls.io/github/cedoor/sparse-merkle-tree?branch=main' target="_blank">
        <img alt="Coveralls" src="https://img.shields.io/coveralls/github/cedoor/sparse-merkle-tree/main?style=flat-square&logo=coveralls">
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/cedoor/network-flow-algorithms?style=flat-square&logo=typescript">
    <img alt="NPM bundle size" src="https://img.shields.io/bundlephobia/min/@cedoor/smt?style=flat-square">
</p>

## References

1. Rasmus Dahlberg, Tobias Pulls and Roel Peeters. *Efficient Sparse Merkle Trees: Caching Strategies and Secure (Non-)Membership Proofs*. Cryptology ePrint Archive: Report 2016/683, 2016. https://eprint.iacr.org/2016/683.
2. Faraz Haider. *Compact sparse merkle trees*. Cryptology ePrint Archive: Report 2018/955, 2018. https://eprint.iacr.org/2018/955.
3. Jordi Baylina and Marta Bellés. *Sparse Merkle Trees*. https://docs.iden3.io/publications/pdfs/Merkle-Tree.pdf.
4. Vitalik Buterin Fichter. *Optimizing sparse Merkle trees*. https://ethresear.ch/t/optimizing-sparse-merkle-trees/3751.

---

## Table of Contents

-   🛠 [Install](#install)
-   🕹 [Usage](#usage)
-   🔬 [Development](#development)
    -   [Rules](#scroll-rules)
        -   [Commits](https://github.com/cedoor/cedoor/tree/main/git#commits-rules)
        -   [Branches](https://github.com/cedoor/cedoor/tree/main/git#branch-rules)
-   🧾 [MIT License](https://github.com/cedoor/sparse-merkle-tree/blob/master/LICENSE)
-   ☎️ [Contacts](#contacts)
    -   [Developers](#developers)

## Install

### npm or yarn

You can install utils package with npm:

```bash
npm i @cedoor/smt --save
```

or with yarn:

```bash
yarn add @cedoor/smt
```

### CDN

You can also load it using a `script` tap using [unpkg](https://unpkg.com/):

```html
<script src="https://unpkg.com/@cedoor/smt/"></script>
```

or [JSDelivr](https://www.jsdelivr.com/):

```html
<script src="https://cdn.jsdelivr.net/npm/@cedoor/smt/"></script>
```

## Usage

```typescript
import { SMT } from "@cedoor/smt"
import { poseidon } from "circomlib"

function hash(...values: bigint[]) {
    return poseidon(values)
}

const tree = new SMT(hash)

console.log(tree.root) // 0n

tree.add(2n, 10n)
tree.add(4n, 3n)
tree.add(5n, 7n)

console.log(tree.root) // 5137374885430375729214487766088114111148149461453301548120767853134034722842n
{
        entry: [ 6n, undefined ],
        matchingEntry: [ 2n, 10n, true ],
        sidenodes: [
          8260015537657879578719447560255924901314166820152114369890800384322230220665n,
          18913408186443965331523640610196519845260984945962861132244194469219759309914n
        ],
        root: 5137374885430375729214487766088114111148149461453301548120767853134034722842n,
        existence: false
      }
const { value, sidenodes } = tree.get(4n)

console.log(value) // 3n
console.log(sidenodes) 
/*[
    8260015537657879578719447560255924901314166820152114369890800384322230220665n,
    5425677653063334718369405482428677484996329809930801119387142625676133786812n
]*/

const membershipProof = tree.createProof(5n)

console.log(membershipProof)
/*{
    entry: [5n, 7n],
    sidenodes: [
        15327728699193584933541192058597044258439932792728427746424913008102980962481n
    ],
    root: 5137374885430375729214487766088114111148149461453301548120767853134034722842n,
    existence: true
}*/

console.log(tree.verifyProof(membershipProof)) // true

const nonMembershipProof = tree.createProof(6n)

console.log(nonMembershipProof)
/*{
    entry: [6n, undefined],
    matchingEntry: [2n, 10n, true],
    sidenodes: [
        8260015537657879578719447560255924901314166820152114369890800384322230220665n,
        18913408186443965331523640610196519845260984945962861132244194469219759309914n
    ],
    root: 5137374885430375729214487766088114111148149461453301548120767853134034722842n,
    existence: false
}*/

console.log(tree.verifyProof(nonMembershipProof)) // true
```

## Contacts

### Developers

-   e-mail : me@cedoor.dev
-   github : [@cedoor](https://github.com/cedoor)
-   website : https://cedoor.dev
