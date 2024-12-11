import {describe} from 'node:test'
import ref from './test-cli-ref.js'
import { MODE_JSON, dbPath, deleteDbFile } from './misc.js'
import { after } from 'node:test'
describe('json mode', () => {
    const path = dbPath()
    after(() => deleteDbFile(path))
    const _ = ref(path, MODE_JSON)
    for (const key of Object.keys(_)) {
        _[key]()
    }
})