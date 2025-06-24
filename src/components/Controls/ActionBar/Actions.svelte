<script>
	import { candidates } from '@sudoku/stores/candidates';
	import { userGrid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { hints } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/stores/game';
  
	import { undoMove, redoMove } from "@sudoku/game";
	import { undoStack, redoStack } from "@sudoku/stores/undoRedo";
	import {backtrackStack, backtrace} from '@sudoku/backtrace.js';
  
	import { solveSudoku } from '@sudoku/sudoku';
	import { grid } from '@sudoku/stores/grid';
	import { get } from 'svelte/store';
	import { manualInvalidCells } from '@sudoku/stores/grid';
	import { hintedCells } from '@sudoku/stores/hintedCells';

	let canUndo = false;
	let canRedo = false;
  
	// 订阅撤销和重做栈的变化
	$: canUndo = $undoStack.length > 0;
	$: canRedo = $redoStack.length > 0;
	$: backtraceAvailable = $backtrackStack.length > 0;
	$: backtraceCount = $backtrackStack.length;
	$: hintsAvailable = $hints > 0;
  
	function handleHint() {
        const initialGrid = get(grid);
		//console.log('initialGrid:', initialGrid);
        const usergrid = get(userGrid);
		//console.log('usergrid:', usergrid);
        const solution = solveSudoku(initialGrid);
		//console.log('solution:', solution);
        let allCorrect = true;
        let errorCells = [];

        for (let y = 0; y < usergrid.length; y++) {
            for (let x = 0; x < usergrid[y].length; x++) {
                if (usergrid[y][x] !== 0 && solution && usergrid[y][x] !== solution[y][x]) {
                    allCorrect = false;
                    errorCells.push(x + ',' + y);
                }
            }
        }

        if (!allCorrect) {
            manualInvalidCells.set(errorCells); // 手动标红
			alert('填写的数字部分有误，请关闭窗口后检查标红的数字！');
            return;
        } else {
			manualInvalidCells.set([]); // 清空手动错误
            if (hintsAvailable) {	
				if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
					candidates.clear($cursor);
				}
				// 提示
				const result = userGrid.applyHint($cursor);
				hintedCells.update(set => {
				set.add(result);
				return set;
				});
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
	  class="btn btn-round btn-badge"
	  disabled={$keyboardDisabled || !hintsAvailable || $userGrid[$cursor.y][$cursor.x] !== 0}
	  on:click={handleHint}
	  title="Hints ({$hints})"
	>
	  <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
	  </svg>
  
	  {#if $settings.hintsLimited}
		<span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
	  {/if}
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
  </style>