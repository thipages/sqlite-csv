import { spawn } from 'node:child_process'
const EMPTY_JSON = '""'
const EMPTY_STRING = ''
const ran = ('' + Math.random()).replace('.', '')
const querySeparation = {
    query: `SELECT '${ran}' as _;`,
    result: `[{"_":"${ran}"}]`,
    regexp: /^\s*(SELECT|WITH)/i
}
export default function (databasePath, asArray = false) {
    return {
        runCommands: runCommands(databasePath, asArray)
    }
}
function oneCall (databasePath, asArray) {
    return function (commands) {        
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
            // Handle process errors
            cli.on('error', (err) => {
                reject(new Error(`Failed to start sqlite3 process: ${err.message}`))
            })
            cli.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`sqlite3 process exited with code ${code}: ${err.join('')}`))
                } else if (err.length !== 0) {
                    reject(new Error(err.join('')))
                } else {
                    const data = result.join('').trim() || EMPTY_JSON
                    const resultsArray = data.split(querySeparation.result).filter( v=> v.trim() !== '')
                    try {
                        const results = resultsArray.map (
                            v => {
                                const json = JSON.parse(v)
                                return asArray ? jsonArrayTo2dArray(json): json
                            }
                        )
                        resolve(results.length === 1 ? results[0] : results)
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
        return oneCall(databasePath, asArray)(
            parseCommands(commands)
        )
    }
}
function jsonArrayTo2dArray(jsonArray) {
    if (jsonArray[0] === undefined) return EMPTY_STRING
    const array=[Object.keys(jsonArray[0])]
    for (const json of jsonArray) {
        array.push(Object.values(json))
    }
    return array
}
function parseCommands(commands) {
    const { regexp, query } = querySeparation
    const parsed = []
    for (const command of commands) {
        if (regexp.test(command)) {
            parsed.push(command, query)
        } else {
            parsed.push(command)
        }
    }
    return parsed
}