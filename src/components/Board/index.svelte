<script>
	import { BOX_SIZE } from '@sudoku/constants';
	import { gamePaused } from '@sudoku/stores/game';
	import { grid, userGrid, invalidCells, solution } from '@sudoku/stores/grid';
	import { settings } from '@sudoku/stores/settings';
	import { cursor } from '@sudoku/stores/cursor';
	import { candidates } from '@sudoku/stores/candidates';
	import { userInputs } from '@sudoku/stores/userInputs';

	import Cell from './Cell.svelte';

	function isSelected(cursorStore, x, y) {
		if (cursorStore.x === null || cursorStore.y === null) return false;
		return cursorStore.x === x && cursorStore.y === y;
	}

	function isSameArea(cursorStore, x, y) {
		if (cursorStore.x === null || cursorStore.y === null) return false;
		if (cursorStore.x === x || cursorStore.y === y) return true;

		const cursorBoxX = Math.floor(cursorStore.x / BOX_SIZE);
		const cursorBoxY = Math.floor(cursorStore.y / BOX_SIZE);
		const cellBoxX = Math.floor(x / BOX_SIZE);
		const cellBoxY = Math.floor(y / BOX_SIZE);
		return (cursorBoxX === cellBoxX && cursorBoxY === cellBoxY);
	}

	function getValueAtCursor(gridStore, cursorStore) {
		if (cursorStore.x === null || cursorStore.y === null) return null;

		return gridStore[cursorStore.y][cursorStore.x];
	}

	function isUserInput(userInputsStore, x, y) {
		return userInputsStore.has(`${x},${y}`);
	}

	function isWrongAnswer(solutionStore, userGridStore, x, y) {
		if (!solutionStore) return false;
		const userValue = userGridStore[y][x];
		const correctValue = solutionStore.getCellValue(y, x);
		return userValue !== 0 && userValue !== correctValue;
	}


</script>

<div class="board-padding relative z-10">
	<div class="max-w-xl relative">
		<div class="w-full" style="padding-top: 100%"></div>
	</div>
	<div class="board-padding absolute inset-0 flex justify-center">

		<div class="bg-white shadow-2xl rounded-xl overflow-hidden w-full h-full max-w-xl grid" class:bg-gray-200={$gamePaused}>

			{#each $userGrid as row, y}
				{#each row as value, x}
					<Cell {value}
					      cellY={y + 1}
					      cellX={x + 1}
					      candidates={$candidates[x + ',' + y]}
					      disabled={$gamePaused}
					      selected={isSelected($cursor, x, y)}
					      userNumber={$grid[y][x] === 0 && value !== 0 && isUserInput($userInputs, x, y)}
					      hintNumber={$grid[y][x] === 0 && value !== 0 && !isUserInput($userInputs, x, y)}
					      sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
					      sameNumber={$settings.highlightSame && value && !isSelected($cursor, x, y) && getValueAtCursor($userGrid, $cursor) === value}
					      conflictingNumber={isWrongAnswer($solution, $userGrid, x, y)}
					      />
				{/each}
			{/each}

		</div>

	</div>
</div>

<style>
	.board-padding {
		@apply px-4 pb-4;
	}
</style>