import { sqliteCli } from "../src/index.js"
import test, {describe, after} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'

describe('sqlite-cli oneCall tests', () => {
    const path = dbPath()
    after(() => deleteDbFile(path))
    test('sequentialCalls tests, many queries', async () => {
        deleteDbFile(path)
        const { oneCall, sequentialCalls } = sqliteCli(path)
        await oneCall(
            '.separator ,',
            `.import ${csvPath('test1.csv')} main`
        )
        const observed = await sequentialCalls(
            `select col1 from main limit 1;`,
            `select col1 from main limit 1;`
        )
        assert.deepStrictEqual(
            observed, [
                [{col1:'10'}],
                [{col1:'10'}]
            ]
        )
    })
    test('sequentialCalls tests, one last query', async () => {
        deleteDbFile(path)
        const { sequentialCalls } = sqliteCli(path)
        const observed =await sequentialCalls(
                [
                    '.separator ,',
                    `.import ${csvPath('test1.csv')} main`,
                ],
                `select col1 from main limit 1;`
        )
        assert.deepStrictEqual(
            observed, [
                [],
                [{col1:'10'}]
            ]
        )
    })
})