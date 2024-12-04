import { spawn } from 'node:child_process'

const castArray = a => Array.isArray(a) ? a : [a]
export default function (databasePath) {
    const _ = oneCall(databasePath)
    return {
        oneCall: _,
        concurentCalls: concurentCalls(_),
        sequentialCalls: sequentialCalls(_),
    }
}
function oneCall (databasePath) {
    return function (commands) {
        let result = [], err = []
        const args = databasePath ? [databasePath] : []
        const cli = spawn('sqlite3', args)
        cli.stdin.write(['.mode json', ...castArray(commands), '.quit',''].join('\n'))
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
                        resolve(JSON.parse(data))
                    } catch(e) {
                        reject(new Error('JSON parse Error'))
                    }
                }
                
            })
        })
    }
}
function concurentCalls(oneCall) {
    return function (commandsArray) {
        return Promise.all(castArray(commandsArray).map(oneCall))
    }
}
function sequentialCalls(oneCall) {
    return async function (commandsArray) {
        const results = []
        for (const commands of castArray(commandsArray)) {
            results.push(await oneCall(commands))
        }
        return results
    }
}