import { getHintOrBruteForce } from '../strategies/getHint.js';
import { SudokuBoard } from '../SudokuBoard.js';

describe('getHintOrBruteForce', () => {
  it('should return a hint and chain when logic strategies are sufficient', () => {
    // 这个例子可以用HiddenSingle直接推出
    const grid = [
      [0, 0, 0, 9, 4, 0, 1, 7, 0],
      [0, 0, 0, 3, 7, 1, 0, 2, 9],
      [0, 7, 0, 2, 0, 8, 0, 3, 4],
      [4, 0, 0, 5, 0, 7, 2, 0, 3],
      [0, 0, 7, 8, 0, 0, 4, 0, 1],
      [2, 0, 0, 6, 0, 4, 0, 0, 7],
      [1, 0, 4, 7, 0, 0, 0, 9, 6],
      [7, 5, 0, 4, 0, 0, 0, 0, 0],
      [8, 0, 6, 1, 0, 3, 0, 0, 0],
    ];
    const board = new SudokuBoard(grid);
    const result = getHintOrBruteForce(board);
    if (result.type === 'hint') {
        console.log('调用链:', result.chain);
      }
    expect(result.type).toBe('hint');
    console.log(result);
    console.log(board);
    expect(result.row).toBeGreaterThanOrEqual(0);
    expect(result.col).toBeGreaterThanOrEqual(0);
    expect(result.value).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(result.chain)).toBe(true);
    expect(result.chain.length).toBeGreaterThan(0);
  });

  it('should use brute force when logic strategies fail', () => {
    // 这个例子需要BruteForce才能给出答案（极端例子：全空）
    const grid = [
      [0, 0, 0, 9, 4, 0, 1, 7, 0],
      [0, 4, 0, 3, 7, 1, 0, 2, 9],
      [9, 7, 1, 2, 0, 8, 0, 3, 4],
      [4, 0, 0, 5, 0, 7, 2, 0, 3],
      [0, 0, 7, 8, 0, 0, 4, 0, 1],
      [2, 0, 0, 6, 0, 4, 9, 0, 7],
      [1, 0, 4, 7, 0, 0, 0, 9, 6],
      [7, 5, 0, 4, 0, 0, 0, 1, 0],
      [8, 0, 6, 1, 0, 3, 7, 4, 0],
    ];
    const board = new SudokuBoard(grid);
    const result = getHintOrBruteForce(board);
    expect(result.type).toBe('brute');
    expect(result.row).toBeGreaterThanOrEqual(0);
    expect(result.col).toBeGreaterThanOrEqual(0);
    expect(result.value).toBeGreaterThanOrEqual(1);
  });
}); 