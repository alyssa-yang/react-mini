import createFiber from "./ReactFiber";
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

function ReactDOMReact(internalRoot) {
    this._internalRoot = internalRoot
}
//children是jsx版的vnode
ReactDOMReact.prototype.render = function (children) {
    const root = this._internalRoot
    updateContainer(children, root);
}

function updateContainer(element, container) {
    const { containerInfo } = container
    const fiber = createFiber(element, {
        type: containerInfo.nodeName.toLocaleLowerCase(),
        stateNode: containerInfo
    })
    scheduleUpdateOnFiber(fiber)
}

function createRoot(container) {
    const root = {
        containerInfo: container
    }

    return new ReactDOMReact(root)

}

export default { createRoot }