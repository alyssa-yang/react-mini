import { push, peek, pop } from './minHeap'

let taskQueue = []
let taskIdCounter = 1

export function scheduleCallback(callback) {
    const currentTime = getCurrentTime()

    const timeout = -1

    const expirationTime = currentTime - timeout;

    const newTask = {
        id: taskIdCounter++,
        callback,
        expirationTime,
        sortIndex: expirationTime
    }

    push(taskQueue, newTask)

    //请求调度
    requestHostCallback()
}

export function getCurrentTime() {
    return performance.now()
}

const channel = new MessageChannel()
const port = channel.port2

channel.port1.onmessage = function () {
    workLoop()
}

function requestHostCallback() {
    port.postMessage(null)
}

function workLoop() {
    let currentTask = peek(taskQueue)
    while (currentTask) {
        const callback = currentTask.callback
        currentTask.callback = null
        //执行任务
        callback()
        pop(taskQueue)
        //取下一个任务
        currentTask = peek(taskQueue)
    }
}

