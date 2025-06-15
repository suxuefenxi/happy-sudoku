import { SudokuBoard } from "../SudokuBoard.js";

/**
 * 指向对/三数组法（Pointing Pairs/Triples）
 * 如果一个宫格内某个候选数字只出现在一行或一列上，那么这个数字在这一行/列上该宫格外的位置可以被排除。
 * @param {SudokuBoard} board 
 * @returns {import('./Step').Effect[]}
 */
export function applyPointingReduction(board) {
    const effects = [];
    for (let num = 1; num <= 9; num++) {
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxCells = board.getBoxCells(boxRow, boxCol);
                const candidates = boxCells.filter(c => c.candidates.has(num));
                if (candidates.length < 2) continue;

                const sameRow = candidates.every(c => c.row === candidates[0].row);
                const sameCol = candidates.every(c => c.col === candidates[0].col);

                if (sameRow) {
                    const row = candidates[0].row;
                    board.getRowCells(row).forEach(cell => {
                        const inBox = Math.floor(cell.row / 3) === boxRow && Math.floor(cell.col / 3) === boxCol;
                        if (!inBox && cell.candidates.has(num)) {
                            effects.push(...board.removeCandidates(cell.row, cell.col, [num]));
                        }
                    });
                }

                if (sameCol) {
                    const col = candidates[0].col;
                    board.getColCells(col).forEach(cell => {
                        const inBox = Math.floor(cell.row / 3) === boxRow && Math.floor(cell.col / 3) === boxCol;
                        if (!inBox && cell.candidates.has(num)) {
                            effects.push(...board.removeCandidates(cell.row, cell.col, [num]));
                        }
                    });
                }
            }
        }
    }
    return effects;
}


/**
 * 宫格线消减法（Box Line Reduction / Claiming）
 * 如果一个数字在某行或某列内只出现在同一个宫格内的若干格子中，那么可以从该宫格中该行/列以外的其他格子排除这个候选数。
 * @param {SudokuBoard} board 
 * @returns {import('./Step').Effect[]}
 */
export function applyBoxLineReduction(board) {
    const effects = [];

    for (let num = 1; num <= 9; num++) {
        // 行方向
        for (let row = 0; row < 9; row++) {
            const rowCells = board.getRowCells(row).filter(c => c.candidates.has(num));
            if (rowCells.length < 2) continue;

            const sameBoxCol = rowCells.every(c => Math.floor(c.col / 3) === Math.floor(rowCells[0].col / 3));
            if (sameBoxCol) {
                const boxRow = Math.floor(row / 3);
                const boxCol = Math.floor(rowCells[0].col / 3);
                const boxCells = board.getBoxCells(boxRow, boxCol);
                for (const cell of boxCells) {
                    if (cell.row !== row && cell.candidates.has(num)) {
                        effects.push(...board.removeCandidates(cell.row, cell.col, [num]));
                    }
                }
            }
        }

        // 列方向
        for (let col = 0; col < 9; col++) {
            const colCells = board.getColCells(col).filter(c => c.candidates.has(num));
            if (colCells.length < 2) continue;

            const sameBoxRow = colCells.every(c => Math.floor(c.row / 3) === Math.floor(colCells[0].row / 3));
            if (sameBoxRow) {
                const boxRow = Math.floor(colCells[0].row / 3);
                const boxCol = Math.floor(col / 3);
                const boxCells = board.getBoxCells(boxRow, boxCol);
                for (const cell of boxCells) {
                    if (cell.col !== col && cell.candidates.has(num)) {
                        effects.push(...board.removeCandidates(cell.row, cell.col, [num]));
                    }
                }
            }
        }
    }
    return effects;
}
