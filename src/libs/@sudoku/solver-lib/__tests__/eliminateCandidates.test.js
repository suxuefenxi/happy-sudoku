import { SudokuBoard } from "@sudoku/solver-lib/SudokuBoard.js";
import { eliminateCandidates } from "@sudoku/solver-lib/strategies/eliminateCandidates.js";

describe("eliminateCandidates", () => {
  let board;

  beforeEach(() => {
    // 初始化一个数独棋盘
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

  test("should eliminate candidates based on filled values", () => {
    // 执行候选值消除
    eliminateCandidates(board);

    // 验证同行、同列、同块的候选值是否正确消除
    expect(board.getCandidates(0, 1)).not.toContain(2); // 同行消除
    expect(board.getCandidates(1, 0)).not.toContain(2); // 同列消除
    expect(board.getCandidates(1, 1)).not.toContain(2); // 同块消除

    expect(board.getCandidates(0, 4)).not.toContain(7); // 同行消除
    expect(board.getCandidates(4, 4)).not.toContain(7); // 同列消除
    expect(board.getCandidates(1, 4)).not.toContain(7); // 同块消除

    expect(board.getCandidates(7, 0)).not.toContain(6); // 同行消除
    expect(board.getCandidates(8, 0)).not.toContain(8); // 同列消除
    expect(board.getCandidates(4, 1)).not.toContain(8); // 同块消除

    console.log(board.getCandidates(0, 1));
    console.log(board.getCandidates(4, 4));
    console.log(board.getCandidates(7, 8));
  });
});
