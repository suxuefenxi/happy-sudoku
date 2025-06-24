import { getCurrentState, pushState, undoStack, redoStack } from "./stores/undoRedo";
import { get, writable } from "svelte/store";
import { userGrid } from "./stores/grid";
import { candidates } from "./stores/candidates";

export const backtrackStack = writable([]); // 存储回溯状态栈

// 创建分支（用户点击候选数字时调用）
export function createBranch(x, y, value) {
  // 获取当前完整状态（包括userGrid和candidates）
  const currentState = getCurrentState();

  // 保存到回溯栈
  backtrackStack.update((stack) => [...stack, currentState]);

  // 更新userGrid（设置选中候选值为当前格子值）
  userGrid.set({ x, y }, value);

  // 更新candidates（移除当前格子的候选数字）
  const currentCandidates = get(candidates);
  const newCandidates = { ...currentCandidates };
  delete newCandidates[`${x},${y}`];
  candidates.set(newCandidates); // 使用set方法更新整个candidates状态

  // 清空撤销/重做栈（避免状态混乱）
  undoStack.set([]);
  redoStack.set([]);
}

// 回溯到上一个分支状态
export function backtrace() {
  backtrackStack.update((stack) => {
    if (stack.length === 0) return stack; // 栈空时忽略

    const lastState = stack[stack.length - 1];
    // 恢复userGrid和candidates
    userGrid.setGrid(lastState.userGrid);
    candidates.set(lastState.candidates); // 使用set方法

    return stack.slice(0, -1); // 弹出栈顶
  });
}
