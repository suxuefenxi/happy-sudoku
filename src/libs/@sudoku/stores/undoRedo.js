import { get, writable } from "svelte/store";
import { userGrid } from "./grid"; // 引入 userGrid store
import { candidates } from "./candidates"; // 引入 candidates store
export const undoStack = writable([]); // 用于存储历史状态
export const redoStack = writable([]); // 用于存储重做状态

/**
 * 添加当前状态到撤销栈
 * @param {Object} currentState 当前状态
 */

/**
 * 获取当前游戏状态
 */
export function getCurrentState() {
  return {
    userGrid: JSON.parse(JSON.stringify(get(userGrid))), // 使用 get() 获取 userGrid 的值
    candidates: JSON.parse(JSON.stringify(get(candidates))), // 使用 get() 获取 candidates 的值
  };
}

export function pushState(currentState) {
  undoStack.update((stack) => {
    //console.log("befor pushState, the stack: ",stack);
    //console.log("Pushing state to undo stack:", currentState);
    const newStack = [...stack, currentState]; // 直接使用传入的 currentState
    //console.log("after pushState, the stack: ",newStack);
    return newStack;
  });
  redoStack.set([]); // 清空重做栈
}

export function applyHintsToState(snapShot, hintedSet) {
  // 由于已经移除了 hintedCells 功能，这个函数现在只是返回原始状态
  return snapShot;
}

/**
 * 撤销操作
 * @param {Function} applyState 回调函数，用于应用状态
 */
export function undo(applyState) {
  undoStack.update((stack) => {
    //console.log("befor undo, the stack: ",stack);
    if (stack.length === 0) {
      console.warn("Undo stack is empty, cannot undo.");
      return stack;
    }

    redoStack.update((redo) => {
      const currentState = getCurrentState();
      redo.push(currentState); // 将撤销的状态推入重做栈
      //console.log("After undo, the redo stack: ", redo);
      return redo;
    });

    let snapShot = JSON.parse(JSON.stringify(stack[stack.length - 1])); // 获取最后一个状态快照
    const mergedState = applyHintsToState(snapShot, new Set()); // 合并状态
    applyState(mergedState); // 应用撤销的状态
    const newStack = stack.slice(0, -1); // 移除最后一个状态
    //console.log("After undo, the new stack: ", newStack);
    return newStack;
  });
}

/**
 * 重做操作
 * @param {Function} applyState 回调函数，用于应用状态
 */
export function redo(applyState) {
  redoStack.update((stack) => {
    //console.log("befor redo, the stack: ", stack);
    if (stack.length === 0) {
      console.warn("Redo stack is empty, cannot redo.");
      return stack;
    }

    undoStack.update((undo) => {
      const currentState = getCurrentState();
      undo.push(currentState); // 将重做的状态推入撤销栈
      //console.log("After redo, the undo stack: ", undo);
      return undo;
    });

    let snapShot = JSON.parse(JSON.stringify(stack[stack.length - 1])); // 获取最后一个状态快照
    const mergedState = applyHintsToState(snapShot, new Set()); // 合并状态
    applyState(mergedState); // 应用重做的状态
    const newStack = stack.slice(0, -1); // 移除最后一个状态
    //console.log("After redo, the new stack: ", newStack);
    return newStack;
  });
}
