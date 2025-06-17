import { BOX_SIZE, SUDOKU_SIZE } from "@sudoku/constants.js";
import { decodeSencode, encodeSudoku } from "@sudoku/sencode";
import { generateSudoku, solveSudoku } from "@sudoku/sudoku";
import { derived, writable } from "svelte/store";
import { hints } from "@sudoku/stores/hints.js";
import {redoStack} from "@sudoku/stores/undoRedo.js";

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

  grid.subscribe(($grid) => {
    let newGrid = [];

    for (let y = 0; y < SUDOKU_SIZE; y++) {
      newGrid[y] = [];
      for (let x = 0; x < SUDOKU_SIZE; x++) {
        newGrid[y][x] = $grid[y][x];
      }
    }

    userGrid.set(newGrid);
  });

  return {
    subscribe: userGrid.subscribe,
    setGrid: userGrid.set, // 暴露 setGrid 方法
    set: (pos, value) => {
      // 设置单个单元格的值
      userGrid.update(($userGrid) => {
        $userGrid[pos.y][pos.x] = value;
        return $userGrid;
      });
    },

    applyHint: (pos) => {
      hints.useHint();
      let result;
      userGrid.update(($userGrid) => {
        const solvedSudoku = solveSudoku($userGrid);
        $userGrid[pos.y][pos.x] = solvedSudoku[pos.y][pos.x];
        result = {x: pos.x, y: pos.y, value: $userGrid[pos.y][pos.x]};
        return $userGrid;
      });
      redoStack.set([]); // 清空重做栈
      return result;
    },
  };
}

export const userGrid = createUserGrid();

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