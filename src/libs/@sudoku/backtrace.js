import { getCurrentState, pushState, applyHintsToState, undoStack, redoStack } from "./stores/undoRedo"; 
import { get, writable } from "svelte/store";
import { userGrid } from "./stores/grid"; // 引入 userGrid store
import { candidates } from "./stores/candidates";
import { hintedCells } from "./stores/hintedCells";

export const backtrackStack = writable([]); // 用于存储回溯栈
export let count = 0; // 用于计数

export function createBranch(x, y, value) {
    const currentCandidates = get(candidates);
    const currentUserGrid = get(userGrid);
    const currentState = getCurrentState();
    backtrackStack.update((stack) => [...stack, currentState]);
    console.log(currentState);
    userGrid.set({ x: x, y: y }, value);
    console.log(currentCandidates);
    console.log(currentCandidates[`${x},${y}`]);
    delete currentCandidates[`${x},${y}`];
    console.log(getCurrentState());
    undoStack.set([]); // 清空撤销栈
    redoStack.set([]); // 清空重做栈
    count++;
}

export function backtrace() {
    
}