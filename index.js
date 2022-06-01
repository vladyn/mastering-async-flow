const WorkerPool = require('./worker_pool')
const path = require('path')
const os = require('os')
const koa = require('koa')

const pool = new WorkerPool(os.cpus().length, path.resolve(__dirname, 'worker.js'))
console.log('Kernels: ', os.cpus().length)


const app = new koa()

app.use( async context => {
    const { value } = context.query
    context.body = await new Promise((resolve, reject) => {
        pool.runTask({ value }, (error, result) => {
            console.log('inside pool task', error, result)
            if (error) {
                return reject(error)
            }

            return resolve(result)
        })
    });
    context.status = 200;
})

app.listen({ port: 3000})
