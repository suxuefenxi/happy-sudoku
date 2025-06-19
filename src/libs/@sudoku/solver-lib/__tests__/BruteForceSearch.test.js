import { solveSudoku } from '../BruteForceSearch';
import { SudokuBoard } from '../../SudokuBoard';

describe('solveSudoku', () => {
  it('should solve a valid solvable Sudoku puzzle', () => {
    const initialGrid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
    const board = new SudokuBoard(initialGrid);
    const result = solveSudoku(board);

    expect(result).not.toBeNull();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        expect(result.isValid(row, col, result.getCellValue(row, col))).toBe(true);
      }
    }
  });

  it('should return null for an unsolvable puzzle', () => {
    const invalidGrid = [
      [5, 5, 0, 0, 7, 0, 0, 0, 0], // two 5s in row 0 make it invalid
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
    const board = new SudokuBoard(invalidGrid);
    const result = solveSudoku(board);
    expect(result).toBeNull();
  });
});
