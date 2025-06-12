// src/sudoku-solver-lib/Step.js

/**
 * @typedef {{
 *   type: 'setCellValue',
 *   row: number,
 *   col: number,
 *   value: number,
 *   previousValue?: number, 
 *   previousCandidates?: Set<number>
 * } | {
 *   type: 'removeCandidate', // Single candidate from one cell
 *   row: number,
 *   col: number,
 *   candidate: number
 * } | {
 *   type: 'removeCandidates', // Multiple candidates from one cell
 *   row: number,
 *   col: number,
 *   candidates: number[] // The candidates that were actually removed
 * } | {
 *   type: 'highlightCells', 
 *   cells: Array<{row: number, col: number}>,
 *   color?: string 
 * } | {
 *   type: 'highlightCandidates', 
 *   cells: Array<{row: number, col: number, candidates: number[]}>,
 *   color?: string
 * }} Effect
 */

/**
 * Represents a logical step taken by a strategy.
 * A single step can involve multiple atomic effects on the board.
 */
export class Step {
    /**
     * @param {string} strategyName - The name of the strategy that produced this step.
     * @param {string} description - A human-readable description of the step.
     * @param {Effect[]} effects - An array of atomic changes or highlights.
     */
    constructor(strategyName, description, effects) {
        /** @type {string} */
        this.strategyName = strategyName;
        /** @type {string} */
        this.description = description;
        /** @type {Effect[]} */
        this.effects = effects;
    }
}