import { spawn } from 'node:child_process'
const EMPTY_JSON = '""'
const EMPTY_STRING = ''
export default function (databasePath, asArray = false) {
    return {
        runCommands: runCommands(databasePath, asArray)
    }
}
/*function oneCall (databasePath, asArray) {
    return function (...commands) {
        return _oneCall (databasePath, asArray)(...commands)
    }
}*/
function oneCall (databasePath, asArray) {
    return function (...commands) {
        let result = [], err = []
        const args = databasePath ? [databasePath] : []
        const cli = spawn('sqlite3', args)
        cli.stdin.write(['.mode json', ...commands, '.quit',''].join('\n'))
        cli.stdin.end()
        return new Promise((resolve, reject) => {
            cli.stdout.on('data', (data) => {
                result.push(data.toString())
            })
            cli.stderr.on('data', (data) => { 
                err.push(data.toString())           
            })
            cli.on('close', (code) => {
                if (code !== 0) {
                    const e = new Error('Error ' + err.join(''))
                    e.code = code
                    reject(e)
                } else if (err.length !== 0) {
                    reject(new Error(err.join('')))
                } else {
                    const data = result.join('').trim() || EMPTY_JSON
                    try {
                        const json = JSON.parse(data)
                        resolve(asArray ? jsonArrayTo2dArray(json): json)
                    } catch(e) {
                        reject(new Error('JSON parse Error'))
                    }
                }
                
            })
        })
    }
}
function runCommands(databasePath, asArray) {
    return async function (...commands) {
        const results = []
        const len = commands.length
        const oneQuery = len === 1
        if (len === 0) return EMPTY_STRING
        for (const command of commands) {
            if (Array.isArray(command)) {
                results.push(await oneCall(databasePath, asArray)(...command))                
            } else {
                results.push(await oneCall(databasePath, asArray)([command]))
            }            
        }
        return oneQuery ? results[0] : results
    }
}
function jsonArrayTo2dArray(jsonArray) {
    if (jsonArray[0] === undefined) return []
    const array=[Object.keys(jsonArray[0])]
    for (const json of jsonArray) {
        array.push(Object.values(json))
    }
    return array
}