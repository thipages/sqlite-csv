import {describe} from 'node:test'
import ref from './test-cli-ref.js'
import { dbPath, deleteDbFile, MODE_ARRAY } from './misc.js'
import { after } from 'node:test'

describe('array mode', () => {
    const path = dbPath()
    after(() => deleteDbFile(path))
    const _ = ref(path, MODE_ARRAY)
    for (const key of Object.keys(_)) {
        _[key]()
    }
})

