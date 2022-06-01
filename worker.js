const { threadId, parentPort } = require('worker_threads');

parentPort.on('message', task => {
    const { value } = task;
    console.log(`thread id is ${threadId}, `)
    parentPort.postMessage(`value: ${JSON.stringify({ value }) }, thread: ${threadId}`)
})
