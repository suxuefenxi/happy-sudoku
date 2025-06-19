import { NakedPairStrategy } from '@sudoku/solver-lib/strategies/NakedPairStrategy.js';
import { NakedTripleStrategy } from "@sudoku/solver-lib/strategies/NakedTripleStrategy.js";
import { NakedQuadStrategy } from "@sudoku/solver-lib/strategies/NakedQuadStrategy.js";
import { SudokuBoard } from "@sudoku/solver-lib/SudokuBoard.js";
import { HiddenSingleStrategy } from '@sudoku/solver-lib/strategies/HiddenSingleStrategy.js';
import solve from "@mattflow/sudoku-solver";

describe('NakedSubsetStrategy', () => {

  test('NakedPairStrategy should find and apply naked pairs', () => {
    let board = new SudokuBoard([
      [4, 0, 0, 0, 0, 0, 9, 3, 8],
      [0, 3, 2, 0, 9, 4, 1, 0, 0],
      [0, 9, 5, 3, 0, 0, 2, 4, 0],
      [3, 7, 0, 6, 0, 9, 0, 0, 4],
      [5, 2, 9, 0, 0, 1, 6, 7, 3],
      [6, 0, 4, 7, 0, 3, 0, 9, 0],
      [9, 5, 7, 0, 0, 8, 3, 0, 0],
      [0, 0, 3, 9, 0, 0, 4, 0, 0],
      [2, 4, 0, 0, 3, 0, 7, 0, 9],
    ]);

    const strategy = new NakedPairStrategy();
    console.log(board.getCandidates(2, 8));
    console.log(board.getCandidates(2, 5));
    const result = strategy.apply(board);
    console.log(board.getCandidates(2, 8));
    console.log(board.getCandidates(2, 5));
    // console.log(result);
    // console.log(result.steps.effects);

    expect(result.modified).toBe(true);
    expect(Array.from(board.getCandidates(0, 3))).toEqual([2, 5]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(0, 4))).toEqual([2, 5, 7]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(0, 5))).toEqual([2, 5, 7]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(2, 0))).toEqual([8]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(2, 4))).toEqual([1, 8]); // 将 Set 转换为数组后进行比较

    // 与 lastRemainingCell 结合测试
    const strategy2 = new HiddenSingleStrategy();
    const result2 = strategy2.apply(board);
    console.log(result2.modified);
    const strategyResult = board.getGrid();
    const solution = solve(strategyResult.flat().join(""), {
      outputArray: true,
      hintCheck: false,
    });

    console.log(solution[17]);
    console.log(strategyResult[1][8]);

    // 比较 HiddenSingleStrategy 的结果与回溯算法的结果是否冲突
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (strategyResult[i][j] !== 0) {
          expect(strategyResult[i][j]).toBe(solution[i * 9 + j]);
        }
      }
    }

  });

  test('NakedTripleStrategy should find and apply naked triples', () => {
    let board = new SudokuBoard([
      [0, 7, 0, 4, 0, 8, 0, 2, 9],
      [0, 0, 2, 0, 0, 0, 0, 0, 4],
      [8, 5, 4, 0, 2, 0, 0, 0, 7],
      [0, 0, 8, 3, 7, 4, 2, 0, 0],
      [0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 2, 6, 1, 7, 0, 0],
      [0, 0, 0, 0, 9, 3, 6, 1, 2],
      [2, 0, 0, 0, 0, 0, 4, 0, 3],
      [1, 3, 0, 6, 4, 2, 0, 7, 0],
    ]);

    const strategy = new NakedTripleStrategy();
    console.log(board.getCandidates(4, 6));
    console.log(board.getCandidates(4, 2));
    const result = strategy.apply(board);
    console.log(board.getCandidates(4, 6));
    console.log(board.getCandidates(4, 2));
    console.log(result);
    // console.log(result.steps.effects);

    expect(result.modified).toBe(true);
    expect(Array.from(board.getCandidates(4, 0))).toEqual([4, 6, 7]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(4, 2))).toEqual([1, 6, 7]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(4, 6))).toEqual([1, 3]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(4, 7))).toEqual([3, 4, 6]); // 将 Set 转换为数组后进行比较
  });

  test('NakedQuadStrategy should find and apply naked quads', () => {
    let board = new SudokuBoard([
      [0, 0, 0, 0, 3, 0, 0, 8, 6],
      [0, 0, 0, 0, 2, 0, 0, 4, 0],
      [0, 9, 0, 0, 7, 8, 5, 2, 0],
      [3, 7, 1, 8, 5, 6, 2, 9, 4],
      [9, 0, 0, 1, 4, 2, 3, 7, 5],
      [4, 0, 0, 3, 9, 7, 6, 1, 8],
      [2, 0, 0, 7, 0, 3, 8, 5, 9],
      [0, 3, 9, 2, 0, 5, 4, 6, 7],
      [7, 0, 0, 9, 0, 4, 1, 3, 2],
    ]);

    const strategy = new NakedQuadStrategy();
    console.log(board.getCandidates(0, 0));
    console.log(board.getCandidates(0, 1));
    const result = strategy.apply(board);
    console.log(board.getCandidates(0, 0));
    console.log(board.getCandidates(0, 1));
    console.log(result);
    // console.log(result.steps.effects);

    expect(result.modified).toBe(true);
    expect(Array.from(board.getCandidates(0, 1))).toEqual([2, 4]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(0, 2))).toEqual([2, 4, 7]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(1, 2))).toEqual([3, 7]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(2, 2))).toEqual([3, 4]); // 将 Set 转换为数组后进行比较
  });
});