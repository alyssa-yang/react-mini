import { Placement, isStr, isFn, isUndefined } from "./utils";
import { HostComponent, FunctionComponent, ClassComponent, HostText, Fragment } from './ReactWorkTags'

export default function createFiber(vnode, returnFiber) {
    const fiber = {
        type: vnode.type,
        key: vnode.key,
        props: vnode.props,
        stateNode: null, // 原生标签时候指dom节点，类组件时候指的是实例
        child: null, // 第一个子fiber
        sibling: null, // 下一个兄弟fiber
        return: returnFiber, // 父fiber
        // 标记节点是什么类型的
        flags: Placement,
        // 老节点
        alternate: null,//order fiber
        deletions: null, // 要删除子节点 null或者[]
        index: null, //当前层级下的下标，从0开始
        memorizedState: null, //函数组件存的是hook0，类组件自身的状态值
    };

    const { type } = vnode
    if (isStr(type)) {
        fiber.tag = HostComponent;
    } else if (isFn(type)) {
        fiber.tag = type.prototype.isReactComponent ? ClassComponent : FunctionComponent;
    } else if (isUndefined(type)) {
        fiber.tag = HostText
        fiber.props = { children: vnode }
    } else {
        fiber.tag = Fragment
    }
    return fiber;
}