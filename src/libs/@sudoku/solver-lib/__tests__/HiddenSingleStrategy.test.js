import { HiddenSingleStrategy } from "@sudoku/solver-lib/strategies/HiddenSingleStrategy.js";
import { SudokuBoard } from "@sudoku/solver-lib/SudokuBoard.js";
import { eliminateCandidates } from "@sudoku/solver-lib/strategies/eliminateCandidates.js";
import solve from "@mattflow/sudoku-solver";

describe("HiddenSingleStrategy", () => {
  let board;

  beforeEach(() => {
    // 初始化数独棋盘，使用网站 https://www.sudokuwiki.org/Getting_Started 的例子
    board = new SudokuBoard([
      [2, 0, 0, 0, 7, 0, 0, 3, 8],
      [0, 0, 0, 0, 0, 6, 0, 7, 0],
      [3, 0, 0, 0, 4, 0, 6, 0, 0],
      [0, 0, 8, 0, 2, 0, 7, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 6],
      [0, 0, 7, 0, 3, 0, 4, 0, 0],
      [0, 0, 4, 0, 8, 0, 0, 0, 9],
      [0, 6, 0, 4, 0, 0, 0, 0, 0],
      [9, 1, 0, 0, 6, 0, 0, 0, 0],
    ]);
  });

  test("HiddenSingleStrategy should find and apply hidden singles", () => {
    const strategy = new HiddenSingleStrategy();
    eliminateCandidates(board);

    const result = strategy.apply(board);
    // console.log(result);
    // console.log(result.steps.length);

    expect(result.modified).toBe(true);

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
});
