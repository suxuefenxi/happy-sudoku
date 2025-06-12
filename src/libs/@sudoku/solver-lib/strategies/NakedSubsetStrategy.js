// src/sudoku-solver-lib/strategies/NakedSubsetStrategy.js
import { Strategy } from "../Strategy.js";
import { Step } from "../Step.js";

export class NakedSubsetStrategy extends Strategy {
  /** @type {number} */
  subsetSize;

  /**
   * @param {string} name
   * @param {number} size
   */
  constructor(name, size) {
    super(name);
    if (this.constructor === NakedSubsetStrategy) {
      throw new Error(
        "Abstract class 'NakedSubsetStrategy' cannot be instantiated directly."
      );
    }
    this.subsetSize = size;
  }

  /**
   * @param {import('../SudokuBoard.js').SudokuBoard} board
   * @returns {{ modified: boolean, steps: import('../Step.js').Step[] }}
   */
  apply(board) {
    let modifiedTotal = false;
    const allSteps = [];

    const units = [];
    for (let i = 0; i < 9; i++) {
      units.push({ cells: board.getRowCells(i), name: `row ${i + 1}` });
      units.push({ cells: board.getColCells(i), name: `column ${i + 1}` });
      units.push({
        cells: board.getBoxCells(Math.floor(i / 3), i % 3),
        name: `box ${i + 1}`,
      });
    }

    for (const unit of units) {
      if (
        this._findNakedSubsetsInUnit(board, unit.cells, allSteps, unit.name)
      ) {
        modifiedTotal = true;
      }
    }
    return { modified: modifiedTotal, steps: allSteps };
  }

  /**
   * @protected
   * @param {import('../SudokuBoard.js').SudokuBoard} board
   * @param {import('../SudokuBoard.js').CellInfo[]} unitCells
   * @param {import('../Step.js').Step[]} allSteps
   * @param {string} unitName
   * @returns {boolean}
   */
  _findNakedSubsetsInUnit(board, unitCells, allSteps, unitName) {
    let unitModified = false;
    // Filter for cells that could form part of a naked subset of the required size
    const candidateCells = unitCells.filter(
      (cell) =>
        cell.value === 0 &&
        cell.candidates.size >= 2 &&
        cell.candidates.size <= this.subsetSize
    );

    if (candidateCells.length < this.subsetSize) return false;

    const combinations = this._getCombinations(candidateCells, this.subsetSize);

    for (const cellCombination of combinations) {
      const combinedCandidates = new Set();
      cellCombination.forEach((cell) =>
        cell.candidates.forEach((cand) => combinedCandidates.add(cand))
      );

      if (combinedCandidates.size === this.subsetSize) {
        const subsetCandidates = Array.from(combinedCandidates);
        let currentStepModified = false;
        const effects = [];

        const cellCoords = cellCombination
          .map((c) => `(${c.row + 1},${c.col + 1})`)
          .join(", ");

        for (const otherCell of unitCells) {
          if (
            otherCell.value === 0 &&
            !cellCombination.some(
              (c) => c.row === otherCell.row && c.col === otherCell.col
            )
          ) {
            const candsToRemoveFromOtherCell = subsetCandidates.filter((cand) =>
              otherCell.candidates.has(cand)
            );

            if (candsToRemoveFromOtherCell.length > 0) {
              const removalEffects = board.removeCandidates(
                otherCell.row,
                otherCell.col,
                candsToRemoveFromOtherCell
              );
              effects.push(...removalEffects);
              if (removalEffects.length > 0) currentStepModified = true;
            }
          }
        }

        if (currentStepModified) {
          const description = `${this.strategyName} [${subsetCandidates.join(
            ","
          )}] in ${unitName} at cells ${cellCoords}. Removed these candidates from other cells in ${unitName}.`;
          effects.unshift({
            // Add highlight effects to the beginning
            type: "highlightCells",
            cells: cellCombination.map((c) => ({ row: c.row, col: c.col })),
          });
          effects.unshift({
            type: "highlightCandidates",
            cells: cellCombination.map((c) => ({
              row: c.row,
              col: c.col,
              candidates: [...c.candidates],
            })), // Highlight original candidates of the subset cells
          });
          // console.log(effects);
          allSteps.push(new Step(this.strategyName, description, effects));
          unitModified = true;
        }
      }
    }
    return unitModified;
  }

  /** @private */
  /**
   * Generates all combinations of size k from the given array.
   * @param {import('../SudokuBoard.js').CellInfo[]} arr - The array to generate combinations from.
   * @param {number} k - The size of each combination.
   * @returns {import('../SudokuBoard.js').CellInfo[][]} - An array of combinations.
   */
  // 生成数组 arr 中所有大小为 k 的组合
  _getCombinations(arr, k) {
    const result = [];
    function generate(startIndex, currentCombination) {
      if (currentCombination.length === k) {
        result.push([...currentCombination]);
        return;
      }
      if (startIndex === arr.length) return;
      // Include current element
      currentCombination.push(arr[startIndex]);
      generate(startIndex + 1, currentCombination);
      // Exclude current element
      currentCombination.pop();
      generate(startIndex + 1, currentCombination);
    }
    generate(0, []);
    return result;
  }
}
