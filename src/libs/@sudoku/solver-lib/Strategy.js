// src/sudoku-solver-lib/Strategy.js

/**
 * @typedef {import('./SudokuBoard').SudokuBoard} SudokuBoard
 * @typedef {import('./Step').Step} Step
 */

export class Strategy {
    /** @type {string} */
    strategyName;

    /**
     * @param {string} name
     */
    constructor(name) {
        if (this.constructor === Strategy) {
            throw new Error("Abstract class 'Strategy' cannot be instantiated directly.");
        }
        this.strategyName = name;
    }

    /**
     * @param {SudokuBoard} board
     * @returns {{ modified: boolean, steps: Step[] }}
     */
    apply(board) {
        throw new Error(`Method 'apply()' must be implemented by subclass ${this.constructor.name}.`);
    }
}