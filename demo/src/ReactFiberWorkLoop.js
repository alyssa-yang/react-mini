import { updateClassComponent, updateFragmentComponent, updateFunctionComponent, updateHostComponent, updateHostTextComponent } from "./ReactFiberReconciler";
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags";
import { Placement } from "./utils";

//当前正在工作中的fiber
let wip = null;
let wipRoot = null;

//初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
    wip = fiber
    wipRoot = fiber
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

function workLoop(IdleDeadline) {
    while (wip && IdleDeadline.timeRemaining() > 0) {
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
        parentNode.appendChild(stateNode)
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