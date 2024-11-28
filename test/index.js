import { importCsv, sqliteCli } from "../src/index.js"
import expected from './expected.js'
import fs from 'node:fs'
import test from 'node:test';
import assert from 'node:assert/strict';
const path = './test/test.db'
if (fs.existsSync(path)) {
    fs.unlinkSync(path)
}
test('stats after csv import', async () => {
    const observed = await importCsv(
        path,
        './test/test.csv'
    )
    assert.deepStrictEqual(observed, expected)
})
