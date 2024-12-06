import { sqliteCli } from "../src/index.js"
import test, {describe, after} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'

describe('sqlite-cli oneCall tests', () => {
    const path = dbPath()
    after(() => deleteDbFile(path))
    test('oneCall JSON query tests', async () => {
        deleteDbFile(path)
        const { oneCall } = sqliteCli(path)
        const observed = await oneCall(
            [
                '.separator ,',
                `.import ${csvPath('test1.csv')} main`,
                `select col1 from main limit 1;`
            ]
        )
        assert.deepStrictEqual(
            observed, [{col1:'10'}]
        )
    }) 
    test('oneCall 2d array query tests', async () => {
        deleteDbFile(path)
        const { oneCall } = sqliteCli(path, true)
        const observed = await oneCall(
            [
                '.separator ,',
                `.import ${csvPath('test1.csv')} main`,
                `select col1 from main limit 1;`
            ]
        )
        assert.deepStrictEqual(
            observed, [
                ['col1'],
                ['10']
            ]
        )
    }) 
})