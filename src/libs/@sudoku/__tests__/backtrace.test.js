import {
  backtrackStack,
  createBranch,
  backtrace,
} from "@sudoku/backtrace";
import { userGrid } from "@sudoku/stores/grid";
import { candidates } from "@sudoku/stores/candidates";
import { get } from "svelte/store";

// 初始化测试环境
beforeEach(() => {
  // 重置所有store状态
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
  candidates.set({});
  backtrackStack.set([]);
});

describe("分支回溯功能", () => {
  test("创建分支时应保存当前状态", () => {
    // 模拟用户输入
    userGrid.set({ x: 2, y: 3 }, 5);
    candidates.set({ "2,3": [1, 2, 3] });

    // 创建分支
    createBranch(2, 3, 5);

    // 验证栈中保存的状态
    const stack = get(backtrackStack);
    expect(stack.length).toBe(1);
    expect(stack[0].userGrid[3][2]).toBe(5);
    expect(stack[0].candidates["2,3"]).toEqual([1, 2, 3]);
  });

  test("回溯时应恢复之前的状态", () => {
    // 初始状态
    const initialState = {
      userGrid: get(userGrid),
      candidates: get(candidates),
    };

    // 修改状态并创建分支
    userGrid.set({ x: 1, y: 1 }, 7);
    candidates.set({ "1,1": [4, 5] });
    createBranch(1, 1, 7);

    // 再次修改状态
    userGrid.set({ x: 1, y: 1 }, 8);
    candidates.set({ "1,1": [] });

    // 执行回溯
    backtrace();

    // 验证状态恢复
    expect(get(userGrid)[1][1]).toBe(7);
    expect(get(candidates)["1,1"]).toEqual([4, 5]);
    expect(get(backtrackStack).length).toBe(0);
  });

  test("空栈时回溯应无副作用", () => {
    // 初始状态
    const initialUserGrid = get(userGrid);
    const initialCandidates = get(candidates);

    // 空栈时回溯
    backtrackStack.set([]);
    backtrace();

    // 验证状态未改变
    expect(get(userGrid)).toEqual(initialUserGrid);
    expect(get(candidates)).toEqual(initialCandidates);
  });
});
