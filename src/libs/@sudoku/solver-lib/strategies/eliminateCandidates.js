import { SudokuBoard } from "../SudokuBoard.js";

/**
 * 根据棋盘上的已填数字，更新所有单元格的候选值。
 * @param {SudokuBoard} board - 数独棋盘对象。
 */
export function eliminateCandidates(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board.getCellValue(row, col);

      // 如果单元格已填入数字，则更新同行、同列、同块的候选值
      if (value !== 0) {
        // 删除同行的候选值
        for (let c = 0; c < 9; c++) {
          if (c !== col) {
            board.removeCandidate(row, c, value);
          }
        }

        // 删除同列的候选值
        for (let r = 0; r < 9; r++) {
          if (r !== row) {
            board.removeCandidate(r, col, value);
          }
        }

        // 删除同块的候选值
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
          for (let c = startCol; c < startCol + 3; c++) {
            if (r !== row || c !== col) {
              board.removeCandidate(r, c, value);
            }
          }
        }
      }
    }
  }
}
