// src/sudoku-solver-lib/strategies/ShowPossibleStrategy.js
import { Strategy } from '../Strategy.js';
import { Step } from '../Step.js';

export class ShowPossibleStrategy extends Strategy {
    constructor() {
        super('ShowPossible');
    }

    /**
     * 显示指定单元格的所有可能候选值
     * @param {import('../SudokuBoard').SudokuBoard} board
     * @param {number} targetRow - 目标行索引
     * @param {number} targetCol - 目标列索引
     * @returns {{ modified: boolean, steps: import('../Step').Step[] }}
     */
    apply(board, targetRow = null, targetCol = null) {
        const allSteps = [];
        let modified = false;

        // 如果没有指定目标单元格，找到候选值最少的空格子
        if (targetRow === null || targetCol === null) {
            let minCandidates = 10;
            let minCell = null;
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board.getCellValue(row, col) === 0) {
                        const candidates = board.getCandidates(row, col);
                        if (candidates.size > 0 && candidates.size < minCandidates) {
                            minCandidates = candidates.size;
                            minCell = { row, col };
                        }
                    }
                }
            }
            
            if (minCell) {
                targetRow = minCell.row;
                targetCol = minCell.col;
            } else {
                return { modified: false, steps: allSteps };
            }
        }

        // 检查目标单元格是否为空
        if (board.getCellValue(targetRow, targetCol) !== 0) {
            return { modified: false, steps: allSteps };
        }

        // 获取目标单元格的候选值
        const candidates = board.getCandidates(targetRow, targetCol);
        
        if (candidates.size > 0) {
            // 创建高亮效果，显示候选值
            const effects = [{
                type: 'highlightCells',
                cells: [{ row: targetRow, col: targetCol }],
                color: '#ffeb3b' // 黄色高亮
            }, {
                type: 'highlightCandidates',
                cells: [{
                    row: targetRow,
                    col: targetCol,
                    candidates: Array.from(candidates)
                }],
                color: '#2196f3' // 蓝色高亮候选值
            }];

            const candidateList = Array.from(candidates).sort((a, b) => a - b).join(', ');
            const description = `Show Possible: Cell (${targetRow + 1},${targetCol + 1}) can contain: ${candidateList}`;
            
            allSteps.push(new Step(this.strategyName, description, effects));
            modified = true;
        }

        return { modified, steps: allSteps };
    }

    /**
     * 显示指定单元格的所有可能候选值（静态方法，方便直接调用）
     * @param {import('../SudokuBoard').SudokuBoard} board
     * @param {number} row
     * @param {number} col
     * @returns {{ modified: boolean, steps: import('../Step').Step[] }}
     */
    static showPossibleForCell(board, row, col) {
        const strategy = new ShowPossibleStrategy();
        return strategy.apply(board, row, col);
    }
} 