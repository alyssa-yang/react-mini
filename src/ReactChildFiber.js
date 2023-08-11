import createFiber from "./ReactFiber"
import { Placement, Update, isArray, isStringOrNumber } from "./utils"

export function deleteChild(returnFiber, childToDelete) {
    const deletions = returnFiber.deletions
    if (deletions) {
        returnFiber.deletions.push(childToDelete)
    } else {
        returnFiber.deletions = [childToDelete]
    }
}


function deleteRemainingChildren(returnFiber, currentFirstChild) {
    let childToDelete = currentFirstChild
    while (childToDelete) {
        deleteChild(returnFiber, childToDelete)
        childToDelete = childToDelete.sibling
    }
}

//更新时，检查节点是否移动
function placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects) {
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) {
        //父节点初次渲染，只是记录下标
        return lastPlacedIndex
    }

    //父节点更新
    //子节点不知道
    const current = newFiber.alternate
    if (current) {
        //子节点是更新
        const oldIndex = current.index
        if (oldIndex < lastPlacedIndex) {
            //节点需要发生移动
            newFiber.flags |= Placement
            return lastPlacedIndex
        } else {
            return oldIndex
        }
    } else {
        //子节点是初次渲染
        newFiber.flags |= Placement
        return lastPlacedIndex
    }

}
//协调（diff）
export function reconcileChildren(returnFiber, children) {
    if (isStringOrNumber(children)) {
        return
    }
    const newChildren = isArray(children) ? children : [children]

    //oldFiber的头结点
    let oldFiber = returnFiber.alternate?.child;
    //下一个oldFiber | 暂时缓存下一个oldFiber
    let nextOldFiber = null
    //用于判断是初次渲染还是更新，针对returnFiber
    let shouldTrackSideEffects = returnFiber.alternate
    let previousNewFiber = null
    let newIndex = 0

    //上一次dom节点插入的最远位置
    let lastPlacedIndex = 0

    // *1从左边往右边遍历，比较新老节点，如果节点可以复用，继续往右，否则就停止
    for (; oldFiber && newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if (newChild == null) {
            continue
        }
        const newFiber = createFiber(newChild, returnFiber)

        if (oldFiber.index > newIndex) {
            nextOldFiber = oldFiber
            oldFiber = null
        } else {
            nextOldFiber = oldFiber.sibling
        }

        const same = sameNode(newChild, oldFiber)
        if (!same) {
            //不能复用
            if (oldFiber === null) {
                oldFiber = nextOldFiber
            }
            break;
        }
        Object.assign(newFiber, {
            stateNode: oldFiber.stateNode,
            alternate: oldFiber,
            flags: Update
        })
        //节点更新
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects)

        if (previousNewFiber === null) {
            returnFiber.child = newFiber
        } else {
            previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
        oldFiber = nextOldFiber
    }
    // *2新节点没了，老节点还有
    //如果新节点遍历完了，但是老节点还有，老节点要被删除
    if (newIndex === newChildren.length) {
        deleteRemainingChildren(returnFiber, oldFiber)
        return
    }

    // *3初次渲染
    //老节点没了，新节点还有
    if (!oldFiber) {
        for (; newIndex < newChildren.length; newIndex++) {
            const newChild = newChildren[newIndex];
            if (newChild == null) {
                continue
            }
            const newFiber = createFiber(newChild, returnFiber)

            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects)


            if (previousNewFiber === null) {
                //head node
                returnFiber.child = newFiber
            } else {
                previousNewFiber.sibling = newFiber
            }
            previousNewFiber = newFiber
        }
    }

    // *4 新老节点都还有
    // **4.1把剩下的old构建哈希表
    const existingChildren = mapRemainingChildren(oldFiber)

    // **4.2遍历新节点，通过新节点的key去哈希表中查找节点，找到就复用节点，并且删除哈希表中对应的节点
    for (; oldFiber && newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if (newChild == null) {
            continue
        }
        const newFiber = createFiber(newChild, returnFiber)

        const matchedFiber = existingChildren.get(newFiber.key || newFiber.index)

        if (!matchedFiber) {
            //节点复用
            Object.assign(newFiber, {
                stateNode: matchedFiber.stateNode,
                alternate: matchedFiber,
                flags: Update
            })

            existingChildren.delete(newFiber.key || newFiber.index)
        }

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex, shouldTrackSideEffects)

        if (previousNewFiber === null) {
            //head node
            returnFiber.child = newFiber
        } else {
            previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
    }
    // *5 old哈希表中还有值，遍历哈希表删除所有old
    if (shouldTrackSideEffects) {
        //链表结构
        existingChildren.forEach(child => deleteChild(returnFiber, child))
    }
}

//节点复用：同一层级、key值相同、类型相同
export function sameNode(a, b) {
    return a && b && a.type === b.type && a.key === b.key
}

function mapRemainingChildren(currentFirstChild) {
    const existingChildren = new Map()

    let existingChild = currentFirstChild
    while (existingChild) {
        //key||index:fiber
        existingChildren.set(existingChild.key || existingChild.index, existingChild)
        existingChild = existingChild.sibling
    }
    return existingChildren
}