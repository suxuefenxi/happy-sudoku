import { cursor } from './stores/cursor';
import { difficulty } from './stores/difficulty';
import { gamePaused } from './stores/game';
import { grid, userGrid } from './stores/grid';
import { timer } from './stores/timer';
import { hints } from './stores/hints';
import { pushState, undo, redo, getCurrentState } from './stores/undoRedo';
import { get } from "svelte/store"; // 引入 get 方法
import {candidates} from './stores/candidates';



/**
 * 应用游戏状态
 */
function applyState(state) {
  userGrid.setGrid(state.userGrid);
  candidates.set(state.candidates); // 恢复笔记状态
}

/**
 * Start new game with a generated sudoku
 *
 * @param {('veryeasy' | 'easy' | 'medium' | 'hard')} diff - Difficulty
 */
export function startNew(diff) {
  difficulty.set(diff);
  grid.generate(diff);
  cursor.reset();
  timer.reset();
  hints.reset();

  location.hash = '';
}

/**
 * Start new game with a custom sudoku
 *
 * @param {string} sencode - Sencode to decode
 */
export function startCustom(sencode) {
  difficulty.setCustom();
  grid.decodeSencode(sencode);
  cursor.reset();
  timer.reset();
  hints.reset();
}

/**
 * Pause the game
 */
export function pauseGame() {
  timer.stop();
  gamePaused.set(true);
}

/**
 * Resume (un-pause) the game
 */
export function resumeGame() {
  timer.start();
  gamePaused.set(false);
}

/**
 * 用户进行一次操作
 *
 * @param {number} x - 单元格的列索引
 * @param {number} y - 单元格的行索引
 * @param {number} value - 要填入的值
 */
export function makeMove(x, y, value) {
  // 保存当前状态到撤销栈，包括笔记信息
  pushState(getCurrentState());

  // 更新用户网格
  // userGrid.update((current) => {
  //   current[y][x] = value;
  //   console.log(`用户在 (${x}, ${y}) 填入了 ${value}`);
  //   return current;
  // });
}

/**
 * 撤销上一步操作
 */
export function undoMove() {
  undo(applyState);
}

/**
 * 重做上一步撤销的操作
 */
export function redoMove() {
  redo(applyState);
}

export default {
  startNew,
  startCustom,
  pause: pauseGame,
  resume: resumeGame,
  makeMove,
  undoMove,
  redoMove,
};