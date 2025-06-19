// src/sudoku-solver-lib/strategies/__tests__/intersectionRemoval.test.js

import { SudokuBoard } from "@sudoku/solver-lib/SudokuBoard.js";
import {
  applyPointingReduction,
  applyBoxLineReduction,
} from "@sudoku/solver-lib/strategies/IntersectionRemoval.js";

describe('Intersection Removal Strategies', () => {

  test("Pointing Pair/Triple removes candidates from same row outside box", () => {
    
    const board = new SudokuBoard([
      [0, 3, 2, 0, 0, 6, 1, 0, 0],   // A
      [4, 1, 0, 0, 0, 0, 0, 0, 0],   // B
      [0, 0, 0, 9, 0, 1, 0, 0, 0],   // C
      [5, 0, 0, 0, 9, 0, 0, 0, 4],   // D
      [0, 6, 0, 0, 0, 0, 0, 7, 1],   // E
      [3, 0, 0, 0, 2, 0, 0, 0, 5],   // F
      [0, 0, 0, 5, 0, 8, 0, 0, 0],   // G
      [0, 0, 0, 0, 0, 0, 5, 1, 9],   // H
      [0, 5, 7, 0, 0, 9, 8, 6, 0],   // J
    ]);
    const effects = applyPointingReduction(board);
    const removed = effects.filter(
      e => e.type === 'removeCandidates' && e.row === 1 && e.candidates.includes(2)
    );

    const removedCols = removed.map(e => e.col);
    expect(removedCols).toEqual([6, 7, 8]);
  });


  test('Box-Line Reduction removes candidate from box outside the line', () => {
    const board = new SudokuBoard([
      [0, 1, 6, 0, 0, 7, 8, 0, 3],   // A
      [0, 9, 0, 8, 0, 0, 0, 0, 0],   // B
      [8, 7, 0, 0, 0, 1, 0, 6, 0],   // C
      [0, 4, 8, 0, 0, 0, 3, 0, 0],   // D
      [6, 5, 0, 0, 0, 9, 0, 8, 2],   // E
      [0, 3, 9, 0, 0, 0, 6, 5, 0],   // F
      [0, 6, 0, 9, 0, 0, 0, 2, 0],   // G
      [0, 8, 0, 0, 0, 2, 9, 3, 6],   // H
      [9, 2, 4, 6, 0, 0, 5, 1, 0],   // J
    ]);

    const effects = applyBoxLineReduction(board);
    const removed1 = effects.filter(
      e => e.type === 'removeCandidates' && e.row === 1 && e.candidates.includes(4)
    );
    const removed2 = effects.filter(
      e => e.type === 'removeCandidates' && e.row === 2 && e.candidates.includes(4)
    );

    const removedCols1 = removed1.map(e => e.col);
    const removedCols2 = removed2.map(e => e.col);
    expect(removedCols1).toEqual([6, 8]);
    expect(removedCols2).toEqual([6, 8]);
  });


});
