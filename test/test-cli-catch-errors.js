import { importCsv, sqliteCli } from "../src/index.js"
import test, {describe, after} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'

describe('Catching errors', () => {
    const path = dbPath()
    after(()=>deleteDbFile(path))
    test('catch sqlite import error (incomplete data in column)', async () => {
        deleteDbFile(path)
        let error=''
        try {
                await importCsv(
                path,
                csvPath('test2.csv'),
                {
                    csvTable: 'invalid',
                    statsTable: 'invalid_stats'
                }
            )
        } catch (err) {
            error = err.message
        }
        assert.ok(error.includes('expected 2 columns but found 1 - filling the rest with NULL'))
    })
    test('catch sqlite query error (missing traling semi-colon)', async () =>{
        deleteDbFile(path)
        let err = ''
        await importCsv(
            path,
            csvPath('test1.csv')
        )
        const {runCommands}  = sqliteCli(path)
        try {
            await runCommands(
                'select col1 from main'
            )
        } catch(e) {
            err = e.message
        }
        assert.ok(err.includes('Parse error near line 2'))
    })
})