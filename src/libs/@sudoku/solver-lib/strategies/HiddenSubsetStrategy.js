// src/sudoku-solver-lib/strategies/HiddenSubsetStrategy.js
import { Strategy } from "../Strategy.js";
import { Step } from "../Step.js";

export class HiddenSubsetStrategy extends Strategy {
  /** @type {number} */
  subsetSize;

  constructor(name, size) {
    super(name);
    if (this.constructor === HiddenSubsetStrategy) {
      throw new Error(
        "Abstract class 'HiddenSubsetStrategy' cannot be instantiated directly."
      );
    }
    this.subsetSize = size;
  }

  /**
   * @param {import('../SudokuBoard').SudokuBoard} board
   * @returns {{modified: boolean, steps: import('../Step').Step[]}}
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
        this._findHiddenSubsetsInUnit(board, unit.cells, allSteps, unit.name)
      ) {
        modifiedTotal = true;
      }
    }
    return { modified: modifiedTotal, steps: allSteps };
  }

  /**
   * @protected
   * @param {import('../SudokuBoard').SudokuBoard} board
   * @param {import('../SudokuBoard').CellInfo[]} unitCells
   * @param {import('../Step').Step[]} allSteps
   * @param {string} unitName
   * @returns {boolean}
   */
  _findHiddenSubsetsInUnit(board, unitCells, allSteps, unitName) {
    // 获取单元中所有空单元格
    const emptyCells = unitCells.filter((cell) => cell.value === 0);

    let nums = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const cell of unitCells) {
      if (cell.value !== 0) {
        nums.delete(cell.value);
      }
    }

    // 获取所有候选数字组合
    const candidateCombinations = this._getCandidateCombinations(
      nums,
      this.subsetSize
    );

    if (candidateCombinations.length === 0) {
      return false; // 没有足够的候选数字组合
    }

    let modified = false;

    for (const combination of candidateCombinations) {
      // 找到包含当前候选组合的单元格
      let cellSet = new Set();
      for (const num of combination) {
        for (const cell of emptyCells) {
          if (cell.candidates.has(num)) {
            cellSet.add(cell);
          }
        }
      }

      if (cellSet.size === this.subsetSize) {
        for (const cell of cellSet) {
          board.candidates[cell.row][cell.col] = new Set(
            Array.from(cell.candidates).filter((num) =>
              combination.includes(num)
            )
          );
        }
        modified = true;

        // 记录步骤
        let effect = {
          type: "removeCandidates",
          cells: Array.from(cellSet).map((cell) => ({
            row: cell.row,
            col: cell.col,
            candidates: Array.from(cell.candidates),
          })),
        };
        allSteps.push(
          new Step(
            `Hidden Subset (${this.subsetSize}) in ${unitName}`,
            `Found hidden subset ${combination.join(", ")} in ${unitName}.`,
            effect
          )
        );
      }
    }

    return modified;
  }

  // Helper for combinations of numbers (1-9)
  _getCandidateCombinations(nums, k) {
    const candidates = nums;
    if (candidates.length < k) return [];

    function combine(arr, k) {
      if (k === 0) return [[]];
      if (arr.length === 0) return [];

      const [first, ...rest] = arr;
      const withFirst = combine(rest, k - 1).map((comb) => [first, ...comb]);
      const withoutFirst = combine(rest, k);

      return [...withFirst, ...withoutFirst];
    }

    return combine(candidates, k);
  }
}
