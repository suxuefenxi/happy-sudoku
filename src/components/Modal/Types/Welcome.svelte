<script>
	import { difficulty as difficultyStore } from '@sudoku/stores/difficulty';
	import { startNew, startCustom } from '@sudoku/game';
	import { encodeSudoku, validateSencode } from '@sudoku/sencode';
	import { DIFFICULTIES } from '@sudoku/constants';

	export let data = {};
	export let hideModal;

	let difficulty = $difficultyStore;
	let sencode = data.sencode || '';
	let wikiUrl = '';
	let validWikiSencode = '';
	let loadingWiki = false;

	$: enteredSencode = sencode.trim().length !== 0;
	$: enteredWikiUrl = wikiUrl.trim().startsWith('https://www.sudokuwiki.org/Daily_Sudoku');
	$: buttonDisabled =
		enteredSencode
			? !validateSencode(sencode)
			: (enteredWikiUrl
				? !validWikiSencode
				: !DIFFICULTIES.hasOwnProperty(difficulty));

	async function fetchWikiSencode(url) {
		loadingWiki = true;
		validWikiSencode = '';

		try {
			const res = await fetch(`http://localhost:3001/api/sudoku?url=${encodeURIComponent(url)}`);
			if (!res.ok) throw new Error('Failed to fetch');

			const json = await res.json();
			if (json && json.puzzle) {
				// puzzle 是81位字符串，转成二维数组
				const puzzleString = json.puzzle;
				if (puzzleString.length === 81) {
					const sudokuGrid = [];
					for (let i = 0; i < 9; i++) {
						const row = puzzleString.slice(i * 9, i * 9 + 9).split('').map(n => Number(n));
						sudokuGrid.push(row);
					}

					const sencode = encodeSudoku(sudokuGrid);

					if (validateSencode(sencode)) {
						validWikiSencode = sencode;
					} else {
						console.error('转换后的 sencode 无效');
					}
				} else {
					console.error('puzzle 长度不对');
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			loadingWiki = false;
		}
	}

	$: if (enteredWikiUrl) {
		fetchWikiSencode(wikiUrl);
	}

	function handleStart() {
		if (validateSencode(sencode)) {
			startCustom(sencode);
		} else if (validWikiSencode) {
			startCustom(validWikiSencode);
		} else {
			startNew(difficulty);
		}
		hideModal();
	}
</script>


<h1 class="text-3xl font-semibold mb-6 leading-none">Welcome!</h1>

{#if data.sencode}
	<div class="p-3 text-lg rounded bg-primary bg-opacity-25 border-l-8 border-primary border-opacity-75 mb-4">
		Someone shared a Sudoku puzzle with you!<br>Just click start if you want to play it
	</div>
{/if}

<label for="difficulty" class="text-lg mb-3">To start a game, choose a difficulty:</label>

<div class="inline-block relative mb-6">
	<select id="difficulty" class="btn btn-small w-full appearance-none leading-normal" bind:value={difficulty} disabled={enteredSencode}>
		{#each Object.entries(DIFFICULTIES) as [difficultyValue, difficultyLabel]}
			<option value={difficultyValue}>{difficultyLabel}</option>
		{/each}
	</select>

	<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
		<svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
		</svg>
	</div>
</div>

<label for="sencode" class="text-lg mb-3">Or, if you have a code for a custom Sudoku puzzle, enter it here:</label>

<input id="sencode" class="input font-mono mb-5" bind:value={sencode} type="text">

<!-- SudokuWiki 链接提示 -->
<a
	href="https://www.sudokuwiki.org/Daily_Sudoku"
	target="_blank"
	rel="noopener noreferrer"
	class="text-blue-600 underline text-lg mb-1 inline-block"
>
	https://www.sudokuwiki.org/Daily_Sudoku
</a>
<div class="text-sm text-gray-500 mb-2">
	支持直接粘贴该网址开头的链接，会自动提取数独编码
</div>
<input
	id="wikiurl"
	class="input font-mono mb-4"
	bind:value={wikiUrl}
	type="url"
	placeholder="粘贴 https://www.sudokuwiki.org/Daily_Sudoku/..."
>
{#if enteredWikiUrl}
	{#if loadingWiki}
		<p class="text-sm text-gray-500 mt-1">正在加载数独...</p>
	{:else if validWikiSencode}
		<p class="text-green-600 text-sm mt-1">已解析数独，可开始游戏！</p>
	{:else}
		<p class="text-red-600 text-sm mt-1">无法解析该页面上的数独。</p>
	{/if}
{/if}



<div class="flex justify-end">
	<button class="btn btn-small btn-primary" disabled={buttonDisabled} on:click={handleStart}>Start</button>
</div>
