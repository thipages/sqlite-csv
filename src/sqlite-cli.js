import { spawn } from 'node:child_process'

const castArray = a => Array.isArray(a) ? a : [a]
export default function (databasePath, asArray = false) {
    const _ = oneCall(databasePath, asArray)
    return {
        oneCall: _,
        sequentialCalls: sequentialCalls(_),
    }
}
function oneCall (databasePath, asArray = false) {
    return function (...commands) {
        //console.log('ONE CALL COMMANDS', commands)
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
                    const data = result.join('').trim() || '[]'
                    try {
                        const json = JSON.parse(data)
                        resolve(asArray ? jsonArrayTo2dArray(json) : json)
                    } catch(e) {
                        console.log('DATA', data)
                        reject(new Error('JSON parse Error'))
                    }
                }
                
            })
        })
    }
}
function sequentialCalls(oneCall) {
    return async function (...commands) {
        const results = []
        for (const command of commands) {
            if (Array.isArray(command)) {
                results.push(await oneCall(...command))
            } else {
                results.push(await oneCall(command))
            }            
        }
        return results
    }
}
function jsonArrayTo2dArray(jsonArray) {
    if (jsonArray[0] === undefined) return []
    let array=[Object.keys(jsonArray[0])]
    for (const json of jsonArray) {
        array.push(Object.values(json))
    }
    return array
}