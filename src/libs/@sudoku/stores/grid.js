import { BOX_SIZE, SUDOKU_SIZE } from "@sudoku/constants.js";
import { decodeSencode, encodeSudoku } from "@sudoku/sencode";
import { generateSudoku } from "@sudoku/sudoku";
import { derived, writable, get } from "svelte/store";
import { hints } from "@sudoku/stores/hints.js";
import {redoStack} from "@sudoku/stores/undoRedo.js";
import { getHintOrBruteForce, showPossible } from "@sudoku/solver-lib/strategies/getHint.js";
import { SudokuBoard } from "@sudoku/solver-lib/SudokuBoard.js";
import { solveSudoku as bruteForceSolve } from "@sudoku/solver-lib/strategies/BruteForceSearch.js";
import { addUserInput } from "@sudoku/stores/userInputs.js";
import { candidates } from "@sudoku/stores/candidates.js";
import { hintedCells } from "@sudoku/stores/hintedCells.js";


function createGrid() {
  const grid = writable([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  return {
    subscribe: grid.subscribe,
    set: grid.set, // 暴露 set 方法
    generate(difficulty) {
      grid.set(generateSudoku(difficulty));
    },

    decodeSencode(sencode) {
      grid.set(decodeSencode(sencode));
    },

    get(gridStore, x, y) {
      return gridStore[y][x];
    },

    getSencode(gridStore) {
      return encodeSudoku(gridStore);
    },
  };
}

export const grid = createGrid();

function createUserGrid() {
  const userGrid = writable([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  // 存储完整的解答
  const solution = writable(null);

  grid.subscribe(($grid) => {
    let newGrid = [];

    for (let y = 0; y < SUDOKU_SIZE; y++) {
      newGrid[y] = [];
      for (let x = 0; x < SUDOKU_SIZE; x++) {
        newGrid[y][x] = $grid[y][x];
      }
    }

    userGrid.set(newGrid);
    
    // 计算并存储解答
    const board = new SudokuBoard($grid);
    const solvedBoard = bruteForceSolve(board);
    if (solvedBoard) {
      solution.set(solvedBoard);
      console.log('Solution calculated and stored');
    } else {
      solution.set(null);
      console.error('Failed to calculate solution');
    }
  });

  return {
    subscribe: userGrid.subscribe,
    setGrid: userGrid.set, // 暴露 setGrid 方法
    solution: solution, // 导出 solution store
    set: (pos, value) => {
      // 设置单个单元格的值
      userGrid.update(($userGrid) => {
        $userGrid[pos.y][pos.x] = value;
        return $userGrid;
      });
      // 记录用户输入
      if (value !== 0) {
        addUserInput(pos.x, pos.y);
      }
    },

    // 直接设置值而不记录用户输入（用于提示等）
    setValue: (pos, value) => {
      userGrid.update(($userGrid) => {
        $userGrid[pos.y][pos.x] = value;
        return $userGrid;
      });
    },

    applyHint: (pos = null) => {
      hints.useHint();
      let result;
      
      userGrid.update(($userGrid) => {
        // 创建 SudokuBoard 实例
        const board = new SudokuBoard($userGrid);
        
        // 使用智能提示策略
        const hintResult = getHintOrBruteForce(board);
        const curHint = { x: hintResult.col, y: hintResult.row, value: hintResult.value };
        hintedCells.update((set) => {
          set.add(curHint);
          return set;
        });

        
        if (hintResult) {
          if (hintResult.type === 'hint') {
            // 使用逻辑策略找到的提示
            result = {x: hintResult.col, y: hintResult.row, value: hintResult.value, type: 'hint', chain: hintResult.chain};
          } else if (hintResult.type === 'brute') {
            // 使用暴力搜索找到的提示
            result = {x: hintResult.col, y: hintResult.row, value: hintResult.value, type: 'brute'};
          }
        } else {
          // 如果智能提示失败，使用存储的解答
          const $solution = get(solution);
          if ($solution) {
            // 如果没有指定位置，找到第一个空格子
            let targetRow = pos ? pos.y : 0;
            let targetCol = pos ? pos.x : 0;
            
            if (!pos) {
              // 找到第一个空格子
              for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                  if ($userGrid[row][col] === 0) {
                    targetRow = row;
                    targetCol = col;
                    break;
                  }
                }
                if (targetRow !== 0 || targetCol !== 0) break;
              }
            }
            
            const value = $solution.getCellValue(targetRow, targetCol);
            result = {x: targetCol, y: targetRow, value: value, type: 'stored'};
          } else {
            // 如果没有存储的解答，回退到原来的暴力搜索方法
            const boardForFallback = new SudokuBoard($userGrid);
            const solvedBoard = bruteForceSolve(boardForFallback);
            if (solvedBoard) {
              // 如果没有指定位置，找到第一个空格子
              let targetRow = pos ? pos.y : 0;
              let targetCol = pos ? pos.x : 0;
              
              if (!pos) {
                // 找到第一个空格子
                for (let row = 0; row < 9; row++) {
                  for (let col = 0; col < 9; col++) {
                    if ($userGrid[row][col] === 0) {
                      targetRow = row;
                      targetCol = col;
                      break;
                    }
                  }
                  if (targetRow !== 0 || targetCol !== 0) break;
                }
              }
              
              result = {x: targetCol, y: targetRow, value: solvedBoard.getCellValue(targetRow, targetCol), type: 'fallback'};
            } else {
              console.error('无法求解数独');
              result = null;
            }
          }
        }
        
        return $userGrid;
      });
      
      // 如果有结果，设置值（不记录用户输入）
      if (result) {
        userGrid.update(($userGrid) => {
          $userGrid[result.y][result.x] = result.value;
          return $userGrid;
        });
        
        // 清除所有显示的候选值，避免与提示冲突
        candidates.set({});
      }
      
      redoStack.set([]); // 清空重做栈
      return result;
    },

    // 新增：显示候选值的方法
    showPossible: (pos) => {
      let result;
      
      userGrid.update(($userGrid) => {
        console.log('showPossible called with pos:', pos);
        const board = new SudokuBoard($userGrid);
        const possibleResult = showPossible(board, pos.y, pos.x);
        console.log('showPossible result:', possibleResult);
        
        if (possibleResult) {
          result = {
            x: possibleResult.col,
            y: possibleResult.row,
            candidates: possibleResult.candidates,
            description: possibleResult.description,
            type: 'showPossible'
  };
        } else {
          // 如果策略失败，使用存储的解答
          const $solution = get(solution);
          if ($solution) {
            const value = $solution.getCellValue(pos.y, pos.x);
            if (value !== 0) {
              result = {
                x: pos.x,
                y: pos.y,
                candidates: [value],
                description: `Cell (${pos.y + 1},${pos.x + 1}) can only contain: ${value}`,
                type: 'showPossible'
              };
            }
          }
        }
        
        return $userGrid;
      });
      
      return result;
    },
  };
}

const userGridInstance = createUserGrid();
export const userGrid = userGridInstance;
export const solution = userGridInstance.solution;

export const manualInvalidCells = writable([]); // 新增手动标红逻辑
// 自动移除用户已修改的手动标红，防止用户修改后仍然保留错误标记
userGrid.subscribe($userGrid => {
    manualInvalidCells.update(cells =>
        cells.filter(xy => {
            const [x, y] = xy.split(',').map(Number);
            // 只保留当前格子还是错误（即非0），否则移除
            return $userGrid[y][x] !== 0;
        })
    );
});


//这里是检查输入的数字是否有效，主要是检查行、列和小九宫格
export const invalidCells = derived(
    [userGrid, manualInvalidCells],
    ([$userGrid, $manualInvalidCells]) => {
        // 合并自动冲突和手动错误
        const _invalidCells = [];

        const addInvalid = (x, y) => {
            const xy = x + ',' + y;
            if (!_invalidCells.includes(xy)) _invalidCells.push(xy);
        };
		for (let y = 0; y < SUDOKU_SIZE; y++) {
            for (let x = 0; x < SUDOKU_SIZE; x++) {
                const value = $userGrid[y][x];
                if (value) {
                    for (let i = 0; i < SUDOKU_SIZE; i++) {
                        if (i !== x && $userGrid[y][i] === value) addInvalid(x, y);
                        if (i !== y && $userGrid[i][x] === value) addInvalid(x, i);
                    }
                    const startY = Math.floor(y / BOX_SIZE) * BOX_SIZE;
                    const endY = startY + BOX_SIZE;
                    const startX = Math.floor(x / BOX_SIZE) * BOX_SIZE;
                    const endX = startX + BOX_SIZE;
                    for (let row = startY; row < endY; row++) {
                        for (let col = startX; col < endX; col++) {
                            if (row !== y && col !== x && $userGrid[row][col] === value) {
                                addInvalid(col, row);
                            }
                        }
                    }
                }
			}
        }

        // 合并手动错误
        for (const xy of $manualInvalidCells) {
            if (!_invalidCells.includes(xy)) _invalidCells.push(xy);
        }

        return _invalidCells;
    },
    []
);