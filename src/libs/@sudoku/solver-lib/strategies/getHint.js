import { findSingleCandidate } from './findSingleCandidate.js';
import { NakedPairStrategy } from './NakedPairStrategy.js';
import { NakedTripleStrategy } from './NakedTripleStrategy.js';
import { NakedQuadStrategy } from './NakedQuadStrategy.js';
import { HiddenSingleStrategy } from './HiddenSingleStrategy.js';
import { HiddenPairStrategy } from './HiddenPairStrategy.js';
import { HiddenTripleStrategy } from './HiddenTripleStrategy.js';
import { HiddenQuadStrategy } from './HiddenQuadStrategy.js';
import { applyPointingReduction } from './IntersectionRemoval.js';
import { boxLineReduction } from './boxLineReduction.js';
import { solveSudoku } from './BruteForceSearch.js';
import { ShowPossibleStrategy } from './ShowPossibleStrategy.js';

const STRATEGY_NAMES = [
  'ShowPossible',
  'HiddenSingle',
  'NakedPair',
  'HiddenPair',
  'NakedTriple',
  'NakedQuad',
  'HiddenTriple',
  'HiddenQuad',
  'IntersectionRemoval',
  'BoxLineReduction',
];

const STRATEGY_FUNCS = [
  b => new ShowPossibleStrategy().apply(b),
  b => new HiddenSingleStrategy().apply(b),
  b => new NakedPairStrategy().apply(b),
  b => new HiddenPairStrategy().apply(b),
  b => new NakedTripleStrategy().apply(b),
  b => new NakedQuadStrategy().apply(b),
  b => new HiddenTripleStrategy().apply(b),
  b => new HiddenQuadStrategy().apply(b),
  applyPointingReduction,
  boxLineReduction,
];

/**
 * 返回调用链和提示信息
 * @param {SudokuBoard} board
 * @returns {null | { row: number, col: number, value: number, chain: string[] }}
 */
export function getHint(board) {
  const chain = [];
  for (let i = 0; i < STRATEGY_FUNCS.length; ++i) {
    const boardCopy = board.clone();
    STRATEGY_FUNCS[i](boardCopy);
    chain.push(STRATEGY_NAMES[i]);
    const { steps } = findSingleCandidate(boardCopy);
    if (steps.length > 0) {
      const { row, col, value } = steps[0];
      return { row, col, value, chain };
    }
  }
  return null;
}

/**
 * 如果getHint返回null，则用BruteForce给出候选值最少格子的答案，否则返回调用链和提示。
 * @param {SudokuBoard} board
 * @returns {{ type: 'hint', row: number, col: number, value: number, chain: string[] } | { type: 'brute', row: number, col: number, value: number }}
 */
export function getHintOrBruteForce(board) {
  const hint = getHint(board);
  if (hint) {
    // 验证逻辑策略的结果是否正确
    const solution = solveSudoku(board);
    if (solution) {
      const expectedValue = solution.getCellValue(hint.row, hint.col);
      if (expectedValue === hint.value) {
        return { type: 'hint', row: hint.row, col: hint.col, value: hint.value, chain: hint.chain };
      } else {
        console.warn('逻辑策略结果错误，使用暴力搜索验证');
        // 如果逻辑策略结果错误，使用暴力搜索
        return getBruteForceHint(board);
      }
    }
    // 如果无法求解，回退到暴力搜索
    return getBruteForceHint(board);
  }
  // getHint返回null，使用BruteForce
  return getBruteForceHint(board);
}

/**
 * 获取暴力搜索的提示
 * @param {SudokuBoard} board
 * @returns {{ type: 'brute', row: number, col: number, value: number } | null}
 */
function getBruteForceHint(board) {
  const solution = solveSudoku(board);
  if (!solution) return null;
  // 找到候选值最少的空格子
  let minCandidates = 10;
  let minCell = null;
  for (let row = 0; row < 9; ++row) {
    for (let col = 0; col < 9; ++col) {
      if (board.getCellValue(row, col) === 0) {
        const cands = board.getCandidates(row, col);
        if (cands.size < minCandidates) {
          minCandidates = cands.size;
          minCell = { row, col };
        }
      }
    }
  }
  if (minCell) {
    const value = solution.getCellValue(minCell.row, minCell.col);
    return { type: 'brute', row: minCell.row, col: minCell.col, value };
  }
  return null;
}

/**
 * 显示指定单元格的所有可能候选值
 * @param {SudokuBoard} board
 * @param {number} row - 目标行索引
 * @param {number} col - 目标列索引
 * @returns {{ type: 'showPossible', row: number, col: number, candidates: number[], description: string } | null}
 */
export function showPossible(board, row, col) {
  const strategy = new ShowPossibleStrategy();
  const result = strategy.apply(board, row, col);
  
  if (result.modified && result.steps.length > 0) {
    const step = result.steps[0];
    const candidates = step.effects.find(effect => effect.type === 'highlightCandidates')?.cells[0]?.candidates || [];
    return {
      type: 'showPossible',
      row,
      col,
      candidates,
      description: step.description
    };
  }
  
  return null;
}

/**
 * 显示候选值最少的空格子的所有可能候选值
 * @param {SudokuBoard} board
 * @returns {{ type: 'showPossible', row: number, col: number, candidates: number[], description: string } | null}
 */
export function showPossibleForBestCell(board) {
  const strategy = new ShowPossibleStrategy();
  const result = strategy.apply(board);
  
  if (result.modified && result.steps.length > 0) {
    const step = result.steps[0];
    const highlightEffect = step.effects.find(effect => effect.type === 'highlightCells');
    const candidateEffect = step.effects.find(effect => effect.type === 'highlightCandidates');
    
    if (highlightEffect && candidateEffect) {
      const row = highlightEffect.cells[0].row;
      const col = highlightEffect.cells[0].col;
      const candidates = candidateEffect.cells[0].candidates;
      
      return {
        type: 'showPossible',
        row,
        col,
        candidates,
        description: step.description
      };
    }
  }
  
  return null;
} 