import { updateClassComponent, updateFragmentComponent, updateFunctionComponent, updateHostComponent, updateHostTextComponent } from "./ReactFiberReconciler";
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags";
import { scheduleCallback } from "./scheduler";
import { Placement, Update, updateNode } from "./utils";

//当前正在工作中的fiber
let wip = null;
let wipRoot = null;

//初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
    wip = fiber
    wipRoot = fiber
    scheduleCallback(workLoop)
}

function performUnitOfWork() {
    const { tag } = wip

    switch (tag) {
        case HostComponent:
            updateHostComponent(wip)
            break;
        case FunctionComponent:
            updateFunctionComponent(wip)
            break;
        case ClassComponent:
            updateClassComponent(wip)
            break;
        case Fragment:
            updateFragmentComponent(wip)
            break;
        case HostText:
            updateHostTextComponent(wip)
            break;
        default:
            break;
    }

    if (wip.child) {
        wip = wip.child
        return
    }

    let next = wip

    while (next) {
        if (next.sibling) {
            wip = next.sibling
            return
        }
        next = next.return
    }
    wip = null

}

function workLoop() {
    while (wip) {
        performUnitOfWork()
    }
    if (!wip && wipRoot) {
        commitRoot()
    }
}

requestIdleCallback(workLoop)

function commitRoot() {
    commitWorker(wipRoot)
    wipRoot = null
}

function commitWorker(wip) {
    if (!wip) {
        return
    }
    const parentNode = getParentNode(wip.return)
    const { flags, stateNode } = wip;
    if (flags & Placement && stateNode) {
        const before = getHostSibling(wip.sibling)
        insertOrAppendPlacementNode(stateNode, before, parentNode)
    }

    if (flags & Update && stateNode) {
        //更新属性
        updateNode(stateNode, wip.alternate.props, wip.props)
    }

    if (wip.deletions) {
        //删除wip的字节点
        commitDeletions(wip.deletions, stateNode || parentNode)
    }

    if (wip.tag === FunctionComponent) {
        invokeHooks(wip)
    }
    commitWorker(wip.child)

    commitWorker(wip.sibling)

}

function getParentNode(wip) {
    let tem = wip;
    while (tem) {
        if (tem.stateNode) {
            return tem.stateNode
        }
        tem = tem.return
    }
}

function commitDeletions(deletion, parentNode) {
    for (let i = 0; i < deletion.length; i++) {
        parentNode.removeChild(getStateNode(deletion[i]))
    }
}

//不是每个fiber都有dom节点
function getStateNode(fiber) {
    let tem = fiber

    while (!tem.stateNode) {
        tem = tem.child
    }
    return tem.stateNode
}

function getHostSibling(sibling) {
    while (sibling) {
        if (sibling.stateNode && !sibling.flags & Placement) {
            return sibling.stateNode
        }
        sibling = sibling.sibling
    }
    return null
}

function insertOrAppendPlacementNode(stateNode, before, parentNode) {
    if (before) {
        parentNode.insertBefore(stateNode)
    } else {
        parentNode.appendChild(stateNode)
    }
}

function invokeHooks(wip) {
    const { updateQueueOfEffect, updateQueueOfLayout } = wip

    //dom变更后同步执行
    for (let i = 0; i < updateQueueOfLayout.length; i++) {
        const effect = updateQueueOfLayout[i];
        effect.create()
    }

    for (let i = 0; i < updateQueueOfEffect.length; i++) {
        const effect = updateQueueOfEffect[i];
        scheduleCallback(() => {
            effect.create()
        })
    }
}