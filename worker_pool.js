const { Worker } = require('worker_threads');
const { AsyncResource } = require('async_hooks')
const { EventEmitter } = require('events')

const taskInfo = Symbol('taskInfo')
const workerFeedEvent = Symbol('workerFeedEvent')

class WorkerPoolTask extends AsyncResource {
    constructor(callback) {
        super('WorkerPoolTask');
        this.callback = callback;
    }

    done(err, result) {
        this.runInAsyncScope(this.callback, null, err, result)
        this.emitDestroy();
    }
}

class WorkerPool extends EventEmitter {
    constructor(numsThreads, workerFile) {
        super();
        this.numsThreads = numsThreads
        this.workerFile = workerFile
        this.workers = []
        this.freeWorkers = []

        for (let i = 0; i < numsThreads; i++) {
            this.addWorker()
        }
    }

    addWorker() {
        const worker = new Worker(path.resolve(this.workerFile), {})
        worker.on('error', err => {
            if(worker[taskInfo]) {
                worker[taskInfo].done(err, null)
            } else {
                this.emit('error', err)
            }

            this.workers.splice(this.workers.indexOf(worker), 1)
            this.addWorker()
        })

        worker.on('message', (result) => {
            worker[taskInfo].done(null, result)
            worker[taskInfo] = null
            this.freeWorkers.push(worker)
            this.emit(workerFeedEvent)
        })

        this.workers.push(worker)
        this.freeWorkers.push(worker)
        this.emit(workerFeedEvent)
    }

    runTask(task, callback) {
        if (this.freeWorkers.length === 0) {
            this.once(workerFeedEvent, () => this.runTask(task, callback))
            return;
        }

        const worker = this.freeWorkers.pop();
        worker[taskInfo] = new WorkerPoolTask(callback)
        worker.postMessage(task)
    }

    close() {
        this.workers.forEach(worker => worker.terminate())
    }
}
