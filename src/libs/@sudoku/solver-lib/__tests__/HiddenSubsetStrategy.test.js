import { HiddenPairStrategy } from "@sudoku/solver-lib/strategies/HiddenPairStrategy.js";
import { HiddenTripleStrategy } from "@sudoku/solver-lib/strategies/HiddenTripleStrategy.js";
import { HiddenQuadStrategy } from "@sudoku/solver-lib/strategies/HiddenQuadStrategy.js";
import { SudokuBoard } from "@sudoku/solver-lib/SudokuBoard.js";

describe("HiddenSubsetStrategy", () => {
  test("HiddenPairStrategy should find and apply hidden pairs", () => {
    let board = new SudokuBoard([
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [9, 0, 4, 6, 0, 7, 0, 0, 0],
      [0, 7, 6, 8, 0, 4, 1, 0, 0],
      [3, 0, 9, 7, 0, 1, 0, 8, 0],
      [7, 0, 8, 0, 0, 0, 3, 0, 1],
      [0, 5, 1, 3, 0, 8, 7, 0, 2],
      [0, 0, 7, 5, 0, 2, 6, 1, 0],
      [0, 0, 5, 4, 0, 3, 2, 0, 8],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);

    const strategy = new HiddenPairStrategy();
    console.log(board.getCandidates(0, 8));
    console.log(board.getCandidates(0, 7));
    const result = strategy.apply(board);

    //console.log(result);
    console.log(board.getCandidates(0, 8));
    console.log(board.getCandidates(0, 7));
    expect(result.modified).toBe(true);
    expect(Array.from(board.getCandidates(0, 8))).toEqual([6, 7]); // 将 Set 转换为数组后进行比较
    expect(Array.from(board.getCandidates(0, 7))).toEqual([6, 7]); // 将 Set 转换为数组后进行比较
  });

  test("HiddenTripleStrategy should find and apply hidden triples", () => {
    let board = new SudokuBoard([
      [0, 0, 0, 0, 0, 1, 0, 3, 0],
      [2, 3, 1, 0, 9, 0, 0, 0, 0],
      [0, 6, 5, 0, 0, 3, 1, 0, 0],
      [6, 7, 8, 9, 2, 4, 3, 0, 0],
      [1, 0, 3, 0, 5, 0, 0, 0, 6],
      [0, 0, 0, 1, 3, 6, 7, 0, 0],
      [0, 0, 9, 3, 6, 0, 5, 7, 0],
      [0, 0, 6, 0, 1, 9, 8, 4, 3],
      [3, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);

    const strategy = new HiddenTripleStrategy();
    const result = strategy.apply(board);

    console.log(result);
    expect(result.modified).toBe(true);
    expect(Array.from(board.getCandidates(0, 3))).toEqual([2, 5, 6]);
    expect(Array.from(board.getCandidates(0, 6))).toEqual([2, 6]);
    expect(Array.from(board.getCandidates(0, 8))).toEqual([2, 5]);
    expect(Array.from(board.getCandidates(0, 2))).toEqual([4, 7]);
    expect(Array.from(board.getCandidates(5, 2))).toEqual([2, 4]);
    expect(Array.from(board.getCandidates(8, 2))).toEqual([2, 4, 7]);
    expect(Array.from(board.getCandidates(7, 0))).toEqual([5, 7]);
    expect(Array.from(board.getCandidates(7, 1))).toEqual([2, 5]);
    expect(Array.from(board.getCandidates(7, 3))).toEqual([2, 5, 7]);
  });

});