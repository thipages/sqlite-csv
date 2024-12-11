import { sqliteCli } from "../src/index.js"
import test, {describe, after, before} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, deleteDbFile, MODE_ARRAY, MODE_JSON} from './misc.js'
const EMPTY_STRING = ''
// DEV: using before (() => deleteDbFile(path)) and removing deletDBfile in each test throw error

export default (path, mode) => ({
    noCommand : () => test('no command', async () => {
        deleteDbFile(path)
        const { runCommands } = sqliteCli(path, mode === MODE_ARRAY)
        const observed = await runCommands()
        // for both modes
        assert.deepStrictEqual(
            observed, EMPTY_STRING
        )
    }),
    oneCommandNoQuery : () => test('one command, no query', async () => {
        deleteDbFile(path)
        const { runCommands } = sqliteCli(path, mode === MODE_ARRAY)
        const observed = await runCommands(
            [
                '.separator ,',
                `.import ${csvPath('test1.csv')} main`,
            ]
        )
        if (mode === MODE_JSON) {
            assert.deepStrictEqual(
                observed, EMPTY_STRING
            )
        } else {
            assert.deepStrictEqual(
                observed, []
            )
        }
    }),
    oneCommandTrailingQuery : () => test('one command with trailing query', async () => {
        deleteDbFile(path)
        const { runCommands } = sqliteCli(path, mode === MODE_ARRAY)
        const observed = await runCommands(
            [
            '.separator ,',
            `.import ${csvPath('test1.csv')} main`,
            `select col1, col2 from main;`
            ]
        )
        if (mode === MODE_JSON) {
            assert.deepStrictEqual(
                observed, [ { col1: '10', col2: '10' }, { col1: '20', col2: '' } ]
            )
        } else {
            assert.deepStrictEqual(
                observed, [
                    ['col1', 'col2'],
                    ['10', '10'],
                    ['20', '']
                ]
            )
        }
    }),
    oneStringQueryCommand : () => test('one string query command', async () => {
        deleteDbFile(path)
        const { runCommands } = sqliteCli(path, mode === MODE_ARRAY)
        // DB creation
        await runCommands(
            [
                '.separator ,',
                `.import ${csvPath('test1.csv')} main`,
            ]
        )
        // One string command
        const observed = await runCommands(`select col1, col2 from main;`)
        if (mode === MODE_JSON) {
            assert.deepStrictEqual(
                observed,
                [ { col1: '10', col2: '10' }, { col1: '20', col2: '' } ]
            )
        } else {
            assert.deepStrictEqual(
                observed, [
                    ['col1', 'col2'],
                    ['10', '10'],
                    ['20', '']
                ]
            )
        }

    }),
    oneUpdateCommandTrailingQuery : () => test('one command UPDATE + with trailing query', async () => {
        deleteDbFile(path)
        const { runCommands } = sqliteCli(path, mode === MODE_ARRAY)
        await runCommands(
            [
            '.separator ,',
            `.import ${csvPath('test1.csv')} main`
            ]
        )
        const observed = await runCommands(
            [
            'UPDATE main SET col1 = 1;',
            `select col1 from main;`
            ]
        )
        if (mode === MODE_JSON) {
            assert.deepStrictEqual(
                observed, [ { col1: '1' }, { col1: '1'} ]
            )
        } else {
            assert.deepStrictEqual(
                observed, [ [ 'col1' ], [ '1' ], [ '1' ] ]
            )
        }
    }),
    oneInsertCommandTrailingQuery : () => test('one command INSERT + with trailing query', async () => {
        deleteDbFile(path)
        const { runCommands } = sqliteCli(path, mode === MODE_ARRAY)
        await runCommands(
            [
            '.separator ,',
            `.import ${csvPath('test1.csv')} main`
            ]
        )
        const observed = await runCommands(
            [
            'INSERT INTO main (col1) VALUES (1);',
            `select col1 from main;`
            ]
        )
        if (mode === MODE_JSON) {
            assert.deepStrictEqual(
                observed, [ { col1: '10' }, { col1: '20'}, { col1: '1'} ]
            )
        } else {
            assert.deepStrictEqual(
                observed, [ [ 'col1' ], [ '10' ], [ '20' ], [ '1' ] ]
            )
        }
    }),
    oneInsertCommandGetLastInsertRowid : () => test.skip('one command INSERT, get last_insert_rowid', async () => {
        deleteDbFile(path)
        const { runCommands } = sqliteCli(path, mode === MODE_ARRAY)
        await runCommands(
            [
            '.separator ,',
            `.import ${csvPath('test1.csv')} main`
            ]
        )
        const observed = await runCommands(
            'INSERT INTO main (col1) VALUES (1);',
            'SELECT last_insert_rowid() id;'
        )
        if (mode === MODE_JSON) {
            assert.deepStrictEqual(
                observed, []
            )
        } else {
            assert.deepStrictEqual(
                observed, []
            )
        }

    }) 
})
