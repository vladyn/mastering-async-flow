const { Worker, isMainThread } = require('worker_threads');

function runService(workerData) {
    return new Promise((resolve, reject) => {
        if (isMainThread) {
            const worker = new Worker('./script.js', workerData)

            worker.on('error', reject)

            worker.on('exit', code => {
                if (code !== 0) {
                    reject(new Error( `Error ${code}`))
                }
            })

            worker.on('message', resolve)

        } else {
            console.log(workerData);
        }
    })
}

const run = async () => {
    const result = await runService({ workerData: 'Hello from the main thread' })
    console.log(result)
}

run().catch(error => console.log(error));

// runService(workerData)
//     .then(res => console.log(res))
//     .catch(err => console.log(err))
