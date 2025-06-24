<script>
	import { CANDIDATE_COORDS } from '@sudoku/constants';
    import {createBranch, backtrace} from '@sudoku/backtrace.js';

	export let candidates = []; // 候选值数组
    export let x; // 单元格的 X 坐标
    export let y; // 单元格的 Y 坐标

    // 处理候选值点击事件
    function handleCandidateClick(candidate) {
    if (candidates.includes(candidate)) {
      createBranch(x, y, candidate); // 传递点击的候选值
    } else {
      console.log(`数字 ${candidate} 不是候选值`);
    }
  }
</script>

<div class="candidate-grid">
	{#each CANDIDATE_COORDS as [row, col], index}
		<div class="candidate row-start-{row} col-start-{col}"
		     class:invisible={!candidates.includes(index + 1)}
		     class:visible={candidates.includes(index + 1)}
             on:click={() => handleCandidateClick(index + 1)}>
            {index + 1}
		</div>
	{/each}
</div>

<style>
    .candidate-grid {
        @apply grid h-full w-full p-1;
    }

    .candidate {
        @apply h-full w-full row-end-auto col-end-auto leading-full;

    }
</style>