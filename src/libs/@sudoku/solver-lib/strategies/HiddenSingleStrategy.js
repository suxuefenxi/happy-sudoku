// src/sudoku-solver-lib/strategies/HiddenSingleStrategy.js
import { Strategy } from '../Strategy.js';
import { Step } from '../Step.js';

export class HiddenSingleStrategy extends Strategy {
    constructor() {
        super('HiddenSingle');
    }

    /**
     * @param {import('../SudokuBoard').SudokuBoard} board
     * @returns {{ modified: boolean, steps: import('../Step').Step[] }}
     */
    apply(board) {
        const allSteps = [];
        let modified = false;

        const units = [];
        for (let i = 0; i < 9; i++) {
            units.push({ cells: board.getRowCells(i), name: `row ${i + 1}` });
            units.push({ cells: board.getColCells(i), name: `column ${i + 1}` });
            units.push({ cells: board.getBoxCells(Math.floor(i / 3), i % 3), name: `box ${i + 1}` });
        }
        
        for (const unit of units) {
            if (this._findHiddenSinglesInUnit(board, unit.cells, allSteps, unit.name)) {
                modified = true;
            }
        }
        
        return { modified, steps: allSteps };
    }

    /**
     * @private
     * @param {import('../SudokuBoard').SudokuBoard} board
     * @param {import('../SudokuBoard').CellInfo[]} unitCells
     * @param {import('../Step').Step[]} allSteps
     * @param {string} unitName
     * @returns {boolean}
     */
    _findHiddenSinglesInUnit(board, unitCells, allSteps, unitName) {
        let unitModified = false;
        for (let num = 1; num <= 9; num++) {
            const possibleCellsForNum = unitCells.filter(cell => cell.value === 0 && cell.candidates.has(num));

            if (possibleCellsForNum.length === 1) {
                const targetCell = possibleCellsForNum[0];
                // Check if cell is still empty (might have been filled by a previous hidden single in another unit during the same apply call)
                if (board.getCellValue(targetCell.row, targetCell.col) === 0) {
                    const effects = board.setCellValue(targetCell.row, targetCell.col, num);   // 这样会提示好几个值，考虑要不要只提示一个
                    const description = `Hidden Single: Cell (${targetCell.row + 1},${targetCell.col + 1}) is the only cell in ${unitName} that can be ${num}. Set to ${num}.`;
                    allSteps.push(new Step(this.strategyName, description, effects));
                    unitModified = true;
                }
            }
        }
        return unitModified;
    }
}