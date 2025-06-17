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
import { hintedCells } from "@sudoku/stores/hintedCells";

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
  hintedCells.set(new Set());
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

test("applyHintsToState should apply hints", () => {
  // 假设有一个提示
  hintedCells.set(new Set([{ x: 0, y: 0, value: 9 }]));
  const state = getCurrentState();
  // 直接调用 applyHintsToState
  const { applyHintsToState } = require("@sudoku/stores/undoRedo");
  const newState = applyHintsToState(state, get(hintedCells));
  expect(newState.userGrid[0][0]).toBe(9);
});

test("applyHintsToState should clear candidates when applying hints", () => {
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

  // 设置提示
  hintedCells.set(new Set([{ x: 0, y: 0, value: 9 }]));
  const state = getCurrentState();

  // 调用 applyHintsToState
  const { applyHintsToState } = require("@sudoku/stores/undoRedo");
  const newState = applyHintsToState(state, get(hintedCells));

  // 检查 userGrid 被填入提示
  expect(newState.userGrid[0][0]).toBe(9);
  // 检查 candidates 被清空
  expect(!newState.candidates.hasOwnProperty("0,0"));
  // 其它 candidates 不受影响
  expect(newState.candidates["1,1"]).toEqual([4, 5, 6]);
});

