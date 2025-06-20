// ...existing code...
export function boxLineReduction(board) {
    // 行方向
    for (let row = 0; row < 9; row++) {
        for (let num = 1; num <= 9; num++) {
            // 找出该行中所有包含 num 的候选格
            const cells = [];
            for (let col = 0; col < 9; col++) {
                if (board.getCellValue(row, col) === 0 && board.candidates[row][col].has(num)) {
                    cells.push({ row, col });
                }
            }
            if (cells.length >= 2 && cells.length <= 3) {
                // 检查这些格子是否都在同一个宫
                const boxIndex = (cell) => Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3);
                const firstBox = boxIndex(cells[0]);
                if (cells.every(cell => boxIndex(cell) === firstBox)) {
                    // 在该宫的其他行中消除 num
                    const boxRow = Math.floor(firstBox / 3);
                    const boxCol = firstBox % 3;
                    const boxCells = board.getBoxCells(boxRow, boxCol);
                    for (const cell of boxCells) {
                        if (cell.row !== row && cell.value === 0 && cell.candidates.has(num)) {
                            board.removeCandidate(cell.row, cell.col, num);
                        }
                    }
                }
            }
        }
    }

    // 列方向
    for (let col = 0; col < 9; col++) {
        for (let num = 1; num <= 9; num++) {
            // 找出该列中所有包含 num 的候选格
            const cells = [];
            for (let row = 0; row < 9; row++) {
                if (board.getCellValue(row, col) === 0 && board.candidates[row][col].has(num)) {
                    cells.push({ row, col });
                }
            }
            if (cells.length >= 2 && cells.length <= 3) {
                // 检查这些格子是否都在同一个宫
                const boxIndex = (cell) => Math.floor(cell.row / 3) * 3 + Math.floor(cell.col / 3);
                const firstBox = boxIndex(cells[0]);
                if (cells.every(cell => boxIndex(cell) === firstBox)) {
                    // 在该宫的其他列中消除 num
                    const boxRow = Math.floor(firstBox / 3);
                    const boxCol = firstBox % 3;
                    const boxCells = board.getBoxCells(boxRow, boxCol);
                    for (const cell of boxCells) {
                        if (cell.col !== col && cell.value === 0 && cell.candidates.has(num)) {
                            board.removeCandidate(cell.row, cell.col, num);
                        }
                    }
                }
            }
        }
    }
    // 不再返回 effects
}
