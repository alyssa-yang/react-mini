import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { HookLayout, HookPassive, areHookInputsEqual } from './utils'

let currentlyRenderingFiber = null // 当前正在工作的fiber
let workInProgressHook = null //新的hook,还未渲染到页面上

//老hook
let currentHook = null;

export function renderWithHooks(wip) {
    currentlyRenderingFiber = wip
    currentlyRenderingFiber.memorizedState = null
    workInProgressHook = null

    //为了方便，useEffect和useLayoutEffect区分开，并且以数组管理
    //源码中是放在一起的，并且是个链表结构
    currentlyRenderingFiber.updateQueueOfEffect = [];
    currentlyRenderingFiber.updateQueueOfLayout = [];
}

function updateWorkInProgressHook() {
    let hook;

    //老的fiber
    const current = currentlyRenderingFiber.alternate
    if (current) {
        //组件更新
        currentlyRenderingFiber.memorizedState = current.memorizedState
        if (workInProgressHook) {
            //不是第一个hook
            workInProgressHook = hook = workInProgressHook.next;
            currentHook = current.next
        } else {
            //是第一个hook
            workInProgressHook = hook = currentlyRenderingFiber.memorizedState;
            currentHook = current.memorizedState
        }
    } else {
        //组件初次渲染
        currentHook = null
        hook = {
            memorizedState: null,//state
            next: null//下一个hook
        }
        if (workInProgressHook) {
            workInProgressHook = workInProgressHook.next = hook
        } else {
            //hook0
            workInProgressHook = currentlyRenderingFiber.memorizedState = hook
        }
    }
    return hook
}


export function useReducer(reducer, initialState) {
    const hook = updateWorkInProgressHook();

    if (!currentlyRenderingFiber.alternate) {
        //初次渲染
        hook.memorizedState = initialState
    }

    const dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, hook, reducer)
    return [hook.memorizedState, dispatch]
}

function dispatchReducerAction(fiber, hook, reducer, action) {
    hook.memorizedState = reducer ? reducer(hook.memorizedState, action) : action;
    fiber.alternate = { ...fiber }
    fiber.sibling = null
    scheduleUpdateOnFiber(fiber);
}


export function useState(initialState) {
    return useReducer(null, initialState)
}

function updateEffectImp(hookFlags, create, deps) {
    const hook = updateWorkInProgressHook()

    if (currentHook) {
        const preEffect = currentHook.memorizedState
        if (deps) {
            const preDeps = preEffect.deps
            if (areHookInputsEqual(deps, preDeps)) {
                return
            }
        }
    }
    const effect = { hookFlags, create, deps }

    hook.memorizedState = effect

    if (hook.hookFlags & HookPassive) {
        currentlyRenderingFiber.updateQueueOfEffect.push(effect)
    } else if (hook.hookFlags & HookLayout) {
        currentlyRenderingFiber.updateQueueOfLayout.push(effect)
    }
}


export function useEffect(create, deps) {
    return updateEffectImp(HookPassive, create, deps)
}

export function useLayoutEffect(create, deps) {
    return updateEffectImp(HookLayout, create, deps)
}
