import {
  undoStack,
  redoStack,
  pushState,
  undo,
  redo,
  getCurrentState
} from "@sudoku/stores/undoRedo.js";
import { makeMove} from "@sudoku/game.js";
import { userGrid } from "@sudoku/stores/grid.js";
import { candidates } from "@sudoku/stores/candidates.js";
import { get } from "svelte/store";

jest.mock("@sudoku/stores/grid", () => ({
  userGrid: {
    subscribe: jest.fn(),
    setGrid: jest.fn(),
  },
}));

jest.mock("@sudoku/stores/candidates", () => ({
  candidates: {
    subscribe: jest.fn(),
    set: jest.fn(),
    add: jest.fn(),
  },
}));

jest.mock("@sudoku/game.js", () => ({
  makeMove: jest.fn().mockImplementation(() => {
    const { getCurrentState, pushState } = require("@sudoku/stores/undoRedo.js");
    const state = getCurrentState();
    pushState(state);
    return { userGrid };
  }),
}));

jest.mock("@sudoku/stores/undoRedo", () => {
  const { writable } = require("svelte/store");
  const undoStack = writable([]); // 模拟 undoStack 为一个 Svelte 的 writable store
  const redoStack = writable([]); // 模拟 redoStack 为一个 Svelte 的 writable store
  return {
    undoStack, // 模拟导出的 undoStack
    redoStack, // 模拟导出的 redoStack
    pushState: jest.fn().mockImplementation((state) => {
      undoStack.update(stack => [...stack, state]);
      redoStack.set([]);
    }), // 模拟导出的 pushState 函数
    undo: jest.fn(), // 模拟导出的 undo 函数
    redo: jest.fn(), // 模拟导出的 redo 函数
    getCurrentState: jest.fn(), // 模拟导出的 getCurrentState 函数
  };
});

describe("Undo/Redo Functionality", () => {
  beforeEach(() => {
    // 清空 undo 和 redo 栈
    undoStack.set([]);
    redoStack.set([]);
    jest.clearAllMocks();
  });

  describe("pushState", () => {
    test("should add current state to undo stack and clear redo stack", () => {
      const mockState = { userGrid: [[0]], candidates: {} };
      pushState(mockState);

      expect(get(undoStack)).toHaveLength(1);
      expect(get(undoStack)[0]).toEqual(mockState);
      expect(get(redoStack)).toHaveLength(0);
    });
  });

  describe("makeMove", () => {
    test("should call pushState and update userGrid", () => {
      const mockState = { userGrid: [[0]], candidates: {} };
      getCurrentState.mockReturnValue(mockState);

      makeMove(0, 0, 5);

      expect(getCurrentState).toHaveBeenCalled();
      expect(get(undoStack)).toHaveLength(1);
      expect(get(undoStack)[0]).toEqual(mockState);
      expect(userGrid.update).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("undo", () => {
    test("should move the last state from undoStack to redoStack and apply it", () => {
      const initialState = { userGrid: [[0]], candidates: {} };
      const previousState = { userGrid: [[1]], candidates: {} };

      // 初始化 undoStack
      undoStack.set([previousState, initialState]);
      redoStack.set([]);

      const applyState = jest.fn();
      undo(applyState);

      expect(get(undoStack)).toHaveLength(1);
      expect(get(undoStack)[0]).toEqual(previousState);

      expect(get(redoStack)).toHaveLength(1);
      expect(get(redoStack)[0]).toEqual(initialState);

      expect(applyState).toHaveBeenCalledWith(initialState);
    });

    test("should not perform undo if undoStack is empty", () => {
      const applyState = jest.fn();
      undo(applyState);

      expect(get(undoStack)).toHaveLength(0);
      expect(get(redoStack)).toHaveLength(0);
      expect(applyState).not.toHaveBeenCalled();
    });
  });

  describe("redo", () => {
    test("should move the last state from redoStack to undoStack and apply it", () => {
      const initialState = { userGrid: [[0]], candidates: {} };
      const nextState = { userGrid: [[1]], candidates: {} };

      // 初始化 redoStack
      undoStack.set([initialState]);
      redoStack.set([nextState]);

      const applyState = jest.fn();
      redo(applyState);

      expect(get(redoStack)).toHaveLength(0);

      expect(get(undoStack)).toHaveLength(2);
      expect(get(undoStack)[1]).toEqual(nextState);

      expect(applyState).toHaveBeenCalledWith(nextState);
    });

    test("should not perform redo if redoStack is empty", () => {
      const applyState = jest.fn();
      redo(applyState);

      expect(get(undoStack)).toHaveLength(0);
      expect(get(redoStack)).toHaveLength(0);
      expect(applyState).not.toHaveBeenCalled();
    });
  });

  describe("Integration Tests", () => {
    test("should correctly handle a sequence of makeMove, undo, and redo", () => {
      const initialState = { userGrid: [[0]], candidates: {} };
      const state1 = { userGrid: [[1]], candidates: {} };
      const state2 = { userGrid: [[2]], candidates: {} };

      getCurrentState
        .mockReturnValueOnce(initialState)
        .mockReturnValueOnce(state1)
        .mockReturnValueOnce(state2);

      // 初始状态
      pushState(initialState);

      // 第一次操作
      makeMove(0, 0, 1);
      expect(get(undoStack)).toHaveLength(2);
      expect(get(redoStack)).toHaveLength(0);

      // 第二次操作
      makeMove(0, 0, 2);
      expect(get(undoStack)).toHaveLength(3);
      expect(get(redoStack)).toHaveLength(0);

      // 撤销一次
      const applyState = jest.fn();
      undo(applyState);
      expect(get(undoStack)).toHaveLength(2);
      expect(get(redoStack)).toHaveLength(1);
      expect(applyState).toHaveBeenCalledWith(state1);

      // 再次撤销
      undo(applyState);
      expect(get(undoStack)).toHaveLength(1);
      expect(get(redoStack)).toHaveLength(2);
      expect(applyState).toHaveBeenCalledWith(initialState);

      // 重做一次
      redo(applyState);
      expect(get(undoStack)).toHaveLength(2);
      expect(get(redoStack)).toHaveLength(1);
      expect(applyState).toHaveBeenCalledWith(state1);

      // 再次重做
      redo(applyState);
      expect(get(undoStack)).toHaveLength(3);
      expect(get(redoStack)).toHaveLength(0);
      expect(applyState).toHaveBeenCalledWith(state2);
    });
  });
});
