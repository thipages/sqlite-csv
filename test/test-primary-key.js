import { importCsv, sqliteCli } from "./../src/index.js"
import test, {describe, after} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'

describe('Test primary key', () => {
    const path = dbPath()
    after(() => deleteDbFile(path))
    test('Non existing default primary key insertion', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('test1.csv'),
            {
                csvTable: 'pk_test1',
                statsTable: 'pk_test1_stats'
            }
        )
        const { runCommands } = sqliteCli(path)
        const observed = await runCommands(
            'select id from pk_test1;'
        )
        assert.deepStrictEqual(observed,
            [{id:1}, {id: 2}]
        )
    }) 
    test('non existing custom primary key insertion', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('test1.csv'),
            {
                csvTable: 'pk_test1',
                statsTable: 'pk_test1_stats',
                primaryKey: 'pk'
            }
        )
        const { runCommands } = sqliteCli(path)
        const observed = await runCommands(
            'select pk from pk_test1;'
        )
        assert.deepStrictEqual(observed,
            [{pk:1}, {pk: 2}]
        )
    })
    test('existing default primary key assignement', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('test3.csv'),
            {
                csvTable: 'pk_test3',
                statsTable: 'pk_test3_stats',
            }
        )
        const { runCommands } = sqliteCli(path)
        const observed = await runCommands(
            'select id from pk_test3;'
        )
        assert.deepStrictEqual(observed,
            [{id:1}, {id: 2}]
        )
    })  
    test('existing NON VALID default primary key assignement', async () => {
        deleteDbFile(path)
        let err=''
        try {
            await importCsv(
                path,
                csvPath('test4.csv'),
                {
                    csvTable: 'pk_test4',
                    statsTable: 'pk_test4_stats'
                }
            )
        } catch (e) {
            err = e.message
        }
        assert.ok(
            err.includes('UNIQUE constraint failed')
        )
    })
})