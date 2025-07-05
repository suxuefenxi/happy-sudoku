import { get } from "svelte/store";
import {
  undoStack,
  redoStack,
  pushState,
  undo,
  redo,
  getCurrentState,
} from "@sudoku/stores/undoRedo";
import { userGrid } from "@sudoku/stores/grid";
import { candidates } from "@sudoku/stores/candidates";

// mock applyState
const applyState = jest.fn();

beforeEach(() => {
  // 重置所有 store
  undoStack.set([]);
  redoStack.set([]);
  userGrid.setGrid([
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  candidates.set({});
  applyState.mockClear();
});

test("pushState and undo/redo basic flow", () => {
  // 初始状态
  const state1 = getCurrentState();
  pushState(state1);

  // 修改 userGrid
  userGrid.set({ x: 0, y: 1 }, 2);
  const state2 = getCurrentState();
  pushState(state2);

  // 撤销
  undo(applyState);
  expect(applyState).toHaveBeenCalled();
  expect(get(undoStack).length).toBe(1);
  expect(get(redoStack).length).toBe(1);

  // 重做
  redo(applyState);
  expect(applyState).toHaveBeenCalledTimes(2);
  expect(get(undoStack).length).toBe(2);
  expect(get(redoStack).length).toBe(0);
});

test("applyHintsToState should return original state", () => {
  const state = getCurrentState();
  // 直接调用 applyHintsToState
  const { applyHintsToState } = require("@sudoku/stores/undoRedo");
  const newState = applyHintsToState(state, new Set());
  expect(newState.userGrid).toEqual(state.userGrid);
});

test("applyHintsToState should preserve candidates", () => {
  // 设置初始 userGrid 和 candidates
  userGrid.setGrid([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  candidates.set({
    "0,0": [1, 2, 3],
    "1,1": [4, 5, 6]
  });

  const state = getCurrentState();

  // 调用 applyHintsToState
  const { applyHintsToState } = require("@sudoku/stores/undoRedo");
  const newState = applyHintsToState(state, new Set());

  // 检查 userGrid 保持不变
  expect(newState.userGrid).toEqual(state.userGrid);
  // 检查 candidates 保持不变
  expect(newState.candidates).toEqual(state.candidates);
});

