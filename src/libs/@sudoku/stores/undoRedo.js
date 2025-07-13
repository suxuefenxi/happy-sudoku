import { get, writable } from "svelte/store";
import { userGrid } from "./grid"; // 引入 userGrid store
import { candidates } from "./candidates"; // 引入 candidates store
import { hintedCells } from "./hintedCells";
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
  console.log("Applying hints to state:", snapShot, hintedSet);
  for (let y = 0; y < snapShot.userGrid.length; y++) {
    for (let x = 0; x < snapShot.userGrid[y].length; x++) {
      for (const cell of hintedSet) {
        //console.log(hintedSet[i].x, hintedSet[i].y, x, y);
        if (cell.y === y && cell.x === x) {
          //console.log(`Applying hint to cell (${x}, ${y}):`, cell.value);
          // 如果当前单元格在提示集合中，使用提示集合中的值
          snapShot.userGrid[y][x] = cell.value;
          const key = `${x},${y}`;
          if (snapShot.candidates.hasOwnProperty(key)) {
            delete snapShot.candidates[key];
          }
          break; // 找到匹配后跳出循环
        }
      }
    }
  }
  //console.log("After applying hints, the snapShot: ", snapShot);
  return snapShot; // 返回合并后的状态
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
    const hintedSet = get(hintedCells); // 获取当前的提示单元格集合
    const mergedState = applyHintsToState(snapShot, hintedSet); // 合并状态
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
    const hintedSet = get(hintedCells); // 获取当前的提示单元格集合
    const mergedState = applyHintsToState(snapShot, hintedSet); // 合并状态
    applyState(mergedState); // 应用重做的状态
    const newStack = stack.slice(0, -1); // 移除最后一个状态
    //console.log("After redo, the new stack: ", newStack);
    return newStack;
  });
}
