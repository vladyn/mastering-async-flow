const { workerData, parentPort } = require('worker_threads');

// parentPort.postMessage('Bliea')
parentPort.postMessage({ message: workerData})
