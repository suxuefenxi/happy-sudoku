<script>
	import { candidates } from '@sudoku/stores/candidates';
	import { userGrid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { hints, lastHintStrategy } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/stores/game';
	import { modal } from '@sudoku/stores/modal';
  
	import { undoMove, redoMove } from "@sudoku/game";
	import { undoStack, redoStack } from "@sudoku/stores/undoRedo";
	import {backtrackStack, backtrace} from '@sudoku/backtrace.js';
  
	import { grid } from '@sudoku/stores/grid';
	import { get } from 'svelte/store';
	import { manualInvalidCells, solution } from '@sudoku/stores/grid';

	import { SudokuBoard } from '@sudoku/solver-lib/SudokuBoard.js';
	import { solveSudoku as bruteForceSolve } from '@sudoku/solver-lib/strategies/BruteForceSearch.js';

	let canUndo = false;
	let canRedo = false;
  
	// 订阅撤销和重做栈的变化
	$: canUndo = $undoStack.length > 0;
	$: canRedo = $redoStack.length > 0;
	$: backtraceAvailable = $backtrackStack.length > 0;
	$: backtraceCount = $backtrackStack.length;
  
	function handleHint() {
        const initialGrid = get(grid);
		//console.log('initialGrid:', initialGrid);
        const usergrid = get(userGrid);
		//console.log('usergrid:', usergrid);
        
        // 使用存储的解答来验证用户输入
        const $solution = get(solution);
        let allCorrect = true;
        let errorCells = [];

        if ($solution) {
            for (let y = 0; y < usergrid.length; y++) {
                for (let x = 0; x < usergrid[y].length; x++) {
                    if (usergrid[y][x] !== 0 && usergrid[y][x] !== $solution.getCellValue(y, x)) {
                        allCorrect = false;
                        errorCells.push(x + ',' + y);
                    }
                }
            }
        } else {
            // 如果没有存储的解答，回退到暴力搜索
            const board = new SudokuBoard(usergrid);
            const solution = bruteForceSolve(board);
            if (solution) {
                for (let y = 0; y < usergrid.length; y++) {
                    for (let x = 0; x < usergrid[y].length; x++) {
                        if (usergrid[y][x] !== 0 && usergrid[y][x] !== solution.getCellValue(y, x)) {
                            allCorrect = false;
                            errorCells.push(x + ',' + y);
                        }
                    }
                }
            } else {
                // 如果无法求解，说明用户输入有错误
                allCorrect = false;
            }
        }

        if (!allCorrect) {
            manualInvalidCells.set(errorCells); // 手动标红
			modal.show('errormodal');
            lastHintStrategy.clear();
            return;
        } else {
			manualInvalidCells.set([]); // 清空手动错误
            			// 提示 - 不需要指定位置，让系统自动选择最佳位置
			const result = userGrid.applyHint();
			console.log('applyHint result:', result);
			if (result) {
				if (result.type === 'hint' && result.chain) {
					lastHintStrategy.set(result.chain);
				} else if (result.type === 'stored') {
					lastHintStrategy.set('存储解答');
				} else if (result.type === 'brute') {
					lastHintStrategy.set('暴力搜索');
				} else if (result.type === 'fallback') {
					lastHintStrategy.set('回退解答');
				} else {
					lastHintStrategy.clear();
				}
				console.log('lastHintStrategy set to:', $lastHintStrategy);
				// 高亮提示的格子
				cursor.set(result.x, result.y);
			} else {
				lastHintStrategy.clear();
				console.log('lastHintStrategy cleared');
			}
        }
    }

    function handleShowPossible() {
        const usergrid = get(userGrid);
        let allCorrect = true;
        let errorCells = [];

        // 检查是否有错误
        for (let y = 0; y < usergrid.length; y++) {
            for (let x = 0; x < usergrid[y].length; x++) {
                if (usergrid[y][x] !== 0) {
                    // 检查行冲突
                    for (let col = 0; col < 9; col++) {
                        if (col !== x && usergrid[y][col] === usergrid[y][x]) {
                            allCorrect = false;
                            errorCells.push(x + ',' + y);
                            break;
                        }
                    }
                    if (!allCorrect) break;
                    
                    // 检查列冲突
                    for (let row = 0; row < 9; row++) {
                        if (row !== y && usergrid[row][x] === usergrid[y][x]) {
                            allCorrect = false;
                            errorCells.push(x + ',' + y);
                            break;
                        }
                    }
                    if (!allCorrect) break;
                    
                    // 检查宫格冲突
                    const boxRow = Math.floor(y / 3) * 3;
                    const boxCol = Math.floor(x / 3) * 3;
                    for (let row = boxRow; row < boxRow + 3; row++) {
                        for (let col = boxCol; col < boxCol + 3; col++) {
                            if ((row !== y || col !== x) && usergrid[row][col] === usergrid[y][x]) {
                                allCorrect = false;
                                errorCells.push(x + ',' + y);
                                break;
                            }
                        }
                        if (!allCorrect) break;
                    }
                    if (!allCorrect) break;
                }
            }
            if (!allCorrect) break;
        }

        if (!allCorrect) {
            manualInvalidCells.set(errorCells);
            modal.show('errormodal');
            return;
        } else {
            manualInvalidCells.set([]);
            
            // 显示候选值
            console.log('Cursor position:', $cursor);
            const result = userGrid.showPossible({ x: $cursor.x, y: $cursor.y });
            if (result) {
                // 直接设置候选值到 store，在格子上显示
                candidates.set({ [`${result.x},${result.y}`]: result.candidates });
            } else {
                alert('无法获取候选值');
            }
        }
    }

  </script>
  
  <div class="action-buttons space-x-3">
	<!-- 新增回溯按钮 -->
	<button
		class="btn btn-round btn-badge"
		disabled={!backtraceAvailable || $gamePaused}
		on:click={backtrace}
		title="Backtrace"
	>
		<!-- 使用类似第二张图片的图标（这里用返回箭头图标） -->
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
		</svg>
		
		<!-- 显示回溯次数（类似第二张图片的样式） -->
		<span class="badge" class:badge-primary={backtraceAvailable}>
		{backtraceCount}
		</span>
	</button>

	<!-- Undo 按钮 -->
	<button
	  class="btn btn-round"
	  disabled={!canUndo || $gamePaused}
	  title="Undo"
	  on:click={undoMove}
	>
	  <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
	  </svg>
	</button>
  
	<!-- Redo 按钮 -->
	<button
	  class="btn btn-round"
	  disabled={!canRedo || $gamePaused}
	  title="Redo"
	  on:click={redoMove}
	>
	  <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
	  </svg>
	</button>
  
	<!-- Hints 按钮 -->
	<button
	  class="btn btn-round"
	  disabled={$keyboardDisabled}
	  on:click={handleHint}
	  title="Hints (Unlimited)"
	>
	  <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
	  </svg>
	</button>

	<!-- Show Possible 按钮 -->
	<button
	  class="btn btn-round"
	  disabled={$keyboardDisabled || $cursor.x === null || $cursor.y === null || $userGrid[$cursor.y][$cursor.x] !== 0}
	  on:click={handleShowPossible}
	  title="Show Possible Candidates"
	>
	  <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
	  </svg>
	</button>
  
	<!-- Notes 按钮 -->
	<button
	  class="btn btn-round btn-badge"
	  on:click={notes.toggle}
	  title="Notes ({$notes ? 'ON' : 'OFF'})"
	>
	  <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
	  </svg>
  
	  <span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
	</button>
  </div>
  
  {#if $lastHintStrategy}
    <div class="hint-strategy-banner">
      本次提示策略：{$lastHintStrategy}
    </div>
  {/if}
  
  <style>
	.action-buttons {
	  @apply flex flex-wrap justify-evenly self-end;
	}
  
	.btn-badge {
	  @apply relative;
	}
  
	.badge {
	  min-height: 20px;
	  min-width:  20px;
	  @apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}
  
	.badge-primary {
	  @apply bg-primary;
	}

	.hint-strategy-banner {
	  @apply mt-4 mb-2 px-4 py-2 rounded-lg shadow text-center text-lg font-bold text-primary;
	  background-color: rgba(59, 130, 246, 0.1);
	  letter-spacing: 0.05em;
	}
  </style>