import { ShowPossibleStrategy } from '../strategies/ShowPossibleStrategy.js';
import { showPossible, showPossibleForBestCell } from '../strategies/getHint.js';
import { SudokuBoard } from '../SudokuBoard.js';

describe('ShowPossibleStrategy', () => {
  it('should show possible candidates for a specific cell', () => {
    const grid = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 7, 0], // 最后一个格子为空
    ];
    const board = new SudokuBoard(grid);
    
    const result = showPossible(board, 8, 8);
    expect(result).not.toBeNull();
    expect(result.type).toBe('showPossible');
    expect(result.row).toBe(8);
    expect(result.col).toBe(8);
    expect(result.candidates).toEqual([8]); // 最后一个格子只能是8
    expect(result.description).toContain('Cell (9,9) can contain: 8');
  });

  it('should show possible candidates for the best cell when no specific cell is given', () => {
    const grid = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 7, 0], // 最后一个格子为空
    ];
    const board = new SudokuBoard(grid);
    
    const result = showPossibleForBestCell(board);
    expect(result).not.toBeNull();
    expect(result.type).toBe('showPossible');
    expect(result.row).toBe(8);
    expect(result.col).toBe(8);
    expect(result.candidates).toEqual([8]);
  });

  it('should return null for a filled cell', () => {
    const grid = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 7, 8],
    ];
    const board = new SudokuBoard(grid);
    
    const result = showPossible(board, 0, 0);
    expect(result).toBeNull();
  });

  it('should handle cells with multiple candidates', () => {
    const grid = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const board = new SudokuBoard(grid);
    
    const result = showPossible(board, 0, 0);
    expect(result).not.toBeNull();
    expect(result.type).toBe('showPossible');
    expect(result.row).toBe(0);
    expect(result.col).toBe(0);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.length).toBeLessThanOrEqual(9);
  });
}); 