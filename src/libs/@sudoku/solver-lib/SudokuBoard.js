// src/sudoku-solver-lib/SudokuBoard.js

const SIZE = 9;
const BOX_SIZE = 3;

/**
 * @typedef {{row: number, col: number, value: number, candidates: Set<number>}} CellInfo
 */

export class SudokuBoard {
    /** @type {number[][]} */
    grid;
    /** @type {Set<number>[][]} */
    candidates;

    /**
     * @param {number[][]} [initialGrid]
     */
    constructor(initialGrid) {
        this.grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        this.candidates = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null).map(() => new Set()));
        this._initializeCandidatesAndGrid(initialGrid);
    }

    _initializeCandidatesAndGrid(initialGrid) {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                this.candidates[r][c] = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            }
        }
        if (initialGrid) {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    const value = initialGrid[r][c];
                    if (value >= 1 && value <= 9) {
                        this.setCellValue(r, c, value, true); // isInitialization = true
                    }
                }
            }
        }
    }

    /**
     * @param {number} row
     * @param {number} col
     * @param {number} value
     * @param {boolean} [isInitialization=false]
     * @returns {import('./Step').Effect[]}
     */
    setCellValue(row, col, value, isInitialization = false) {
        if (this.grid[row][col] === value && !isInitialization) return []; // No change needed

        const effects = [];
        const previousValue = this.grid[row][col];
        const previousCandidates = new Set(this.candidates[row][col]);

        this.grid[row][col] = value;
        this.candidates[row][col].clear();
        effects.push({ type: 'setCellValue', row, col, value, previousValue, previousCandidates });

        const peers = this._getPeers(row, col);
        for (const peer of peers) {
            if (this.removeCandidate(peer.row, peer.col, value)) {
                effects.push({ type: 'removeCandidate', row: peer.row, col: peer.col, candidate: value });
            }
        }
        return effects;
    }
    
    /**
     * @private
     */
    // 返回指定单元格（row, col）在数独棋盘上的所有“同行、同列、同宫格”的其它单元格坐标（即“同行同列同宫格的所有格子，去掉自己”）
    _getPeers(row, col) {
        const peers = new Set(); // Use Set to avoid duplicates
        // Row
        for (let c = 0; c < SIZE; c++) if (c !== col) peers.add(`${row}-${c}`);
        // Column
        for (let r = 0; r < SIZE; r++) if (r !== row) peers.add(`${r}-${col}`);
        // Box
        const boxStartRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
        const boxStartCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
        for (let r = boxStartRow; r < boxStartRow + BOX_SIZE; r++) {
            for (let c = boxStartCol; c < boxStartCol + BOX_SIZE; c++) {
                if (r !== row || c !== col) peers.add(`${r}-${c}`);
            }
        }
        return Array.from(peers).map(p => ({ row: parseInt(p.split('-')[0]), col: parseInt(p.split('-')[1]) }));
    }


    /**
     * @param {number} row
     * @param {number} col
     * @param {number} candidate
     * @returns {boolean}
     */
    removeCandidate(row, col, candidate) {
        if (this.grid[row][col] === 0 && this.candidates[row][col].has(candidate)) {
            this.candidates[row][col].delete(candidate);
            return true;
        }
        return false;
    }

    /**
     * @param {number} row
     * @param {number} col
     * @param {number[]} candidatesToRemove
     * @returns {import('./Step').Effect[]}
     */
    removeCandidates(row, col, candidatesToRemove) {
        const effects = [];
        if (this.grid[row][col] === 0) {
            const actuallyRemoved = [];
            for (const cand of candidatesToRemove) {
                if (this.candidates[row][col].has(cand)) {
                    this.candidates[row][col].delete(cand);
                    actuallyRemoved.push(cand);
                }
            }
            if (actuallyRemoved.length > 0) {
                 effects.push({ type: 'removeCandidates', row, col, candidates: actuallyRemoved });
            }
        }
        return effects;
    }

    /**
     * Clears candidates for a cell if it is empty (value is 0).
     * @param {number} row
     * @param {number} col
     * @return {void}
     */
    clearCandidates(row, col) {
        if (this.grid[row][col] === 0) {
            this.candidates[row][col].clear();
        }
    }

    /** @returns {Set<number>} */
    getCandidates(row, col) {
        return new Set(this.candidates[row][col]);
    }

    /** @returns {number} */
    getCellValue(row, col) {
        return this.grid[row][col];
    }

    /** @returns {{row: number, col: number}[]} */
    getEmptyCells() {
        const emptyCells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ row: r, col: c });
                }
            }
        }
        return emptyCells;
    }

    /**
     * @param {number} rowIndex
     * @returns {CellInfo[]}
     */
    // 获取指定行的所有单元格信息
    getRowCells(rowIndex) {
        const cells = [];
        for (let c = 0; c < SIZE; c++) {
            cells.push({ row: rowIndex, col: c, value: this.grid[rowIndex][c], candidates: this.getCandidates(rowIndex, c) });
        }
        return cells;
    }

    /**
     * @param {number} colIndex
     * @returns {CellInfo[]}
     */
    // 获取指定列的所有单元格信息
    getColCells(colIndex) {
        const cells = [];
        for (let r = 0; r < SIZE; r++) {
            cells.push({ row: r, col: colIndex, value: this.grid[r][colIndex], candidates: this.getCandidates(r, colIndex) });
        }
        return cells;
    }

    /**
     * @param {number} boxRow (0-2)
     * @param {number} boxCol (0-2)
     * @returns {CellInfo[]}
     */
    // 获取指定宫格的所有单元格信息
    getBoxCells(boxRow, boxCol) {
        const cells = [];
        const startRow = boxRow * BOX_SIZE;
        const startCol = boxCol * BOX_SIZE;
        for (let r = startRow; r < startRow + BOX_SIZE; r++) {
            for (let c = startCol; c < startCol + BOX_SIZE; c++) {
                cells.push({ row: r, col: c, value: this.grid[r][c], candidates: this.getCandidates(r, c) });
            }
        }
        return cells;
    }
    
    /**
     * @param {number} row
     * @param {number} col
     * @returns {CellInfo[]}
     */
    getBoxCellsByCell(row, col) {
        return this.getBoxCells(Math.floor(row / BOX_SIZE), Math.floor(col / BOX_SIZE));
    }

    isSolved() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (this.grid[r][c] === 0) return false;
            }
        }
        return true; // Basic check, could add validation for correctness
    }

    getGrid() {
        return this.grid;
    }

    clone() {
        const newBoard = new SudokuBoard();
        newBoard.grid = this.grid.map(rowArray => [...rowArray]);
        newBoard.candidates = this.candidates.map(rowArray => rowArray.map(candSet => new Set(candSet)));
        return newBoard;
    }

    toString() {
        return this.grid.map(row => row.join(' ')).join('\n').replace(/0/g, '.');
    }
}