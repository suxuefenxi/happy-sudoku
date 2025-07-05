import { SudokuBoard } from "../SudokuBoard.js";


/**
 * 找到候选者只有一个的单元格并返回。
 * @param {SudokuBoard} board - 数独棋盘对象。
 * @returns {Object} - 包含 modified 标志和步骤信息的对象。
 * @returns {boolean} result.modified - 标志是否有单元格被修改。
 * @returns {Array<{ row: number, col: number, value: number }>} result.steps - 包含已确定数字的单元格信息。
 */
export function findSingleCandidate(board) {
  let modified = false;
  const steps = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const candidates = board.getCandidates(row, col);

      if (candidates.size === 1) {
        const value = Array.from(candidates)[0];
        steps.push({ row, col, value });

        // 确定该单元格的值并更新候选值
        board.setCellValue(row, col, value);
        modified = true;
        break
      }
    }
    if (modified) {
      break;
    }
  } 

  return { modified, steps };
}
