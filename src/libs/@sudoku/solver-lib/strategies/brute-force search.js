import { SudokuBoard } from "../SudokuBoard.js";

/**
 * 解决数独并返回解出的答案
 * @param {SudokuBoard} board - 数独板对象
 * @returns {SudokuBoard | null} 解出的数独板，若无解则返回null
 */
export function solveSudoku(originalBoard) {
  // 创建副本以避免修改原始board
  const board = originalBoard.clone();
  
  // 内部递归求解函数
  function solve(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board.getCellValue(row, col) === 0) {
          for (let num = 1; num <= 9; num++) {
            if (board.isValid(row, col, num)) {
              board.setCellValue(row, col, num);
              
              if (solve(board)) {
                return true;
              }
              
              board.setCellValue(row, col, 0);
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // 执行求解
  const isSolved = solve(board);
  
  // 返回解出的board或null
  return isSolved ? board : null;
}