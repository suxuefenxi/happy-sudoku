<script>
	import { fade, fly } from 'svelte/transition';
	import { modal, modalData } from '@sudoku/stores/modal';
	import { MODAL_NONE } from '@sudoku/constants';
	import { onMount } from 'svelte';

	let timeoutId;

	function hideError() {
		modal.hide();
	}

	// 监听模态框状态，当显示错误时自动隐藏
	$: if ($modal === 'errormodal') {
		// 清除之前的定时器
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		// 5秒后自动隐藏
		timeoutId = setTimeout(() => {
			modal.hide();
		}, 5000);
	}

	onMount(() => {
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});
</script>

{#if $modal === 'errormodal'}
	<div 
		class="error-toast"
		transition:fly={{ x: 300, duration: 300 }}
	>
		<div class="error-content">
			<div class="error-header">
				<h3 class="error-title">填写错误</h3>
				<button 
					class="close-btn" 
					on:click={hideError}
					aria-label="关闭"
				>
					×
				</button>
			</div>
			<div class="error-message">
				<p class="error-text">
					请检查标红的数字，确保填写正确！
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.error-toast {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 50;
		max-width: 20rem;
	}

	.error-content {
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		border-left: 4px solid #f56565;
		padding: 1rem;
	}

	.error-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.close-btn {
		color: #cbd5e0;
		font-size: 1.25rem;
		font-weight: bold;
		line-height: 1;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		transition: all 0.2s;
	}

	.close-btn:hover {
		color: #718096;
		background-color: #f7fafc;
	}

	.error-message {
		font-size: 0.875rem;
		color: #4a5568;
	}

	.error-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #e53e3e;
	}

	.error-text {
		font-size: 0.875rem;
		color: #4a5568;
	}

	/* 响应式设计 */
	@media (max-width: 640px) {
		.error-toast {
			top: 0.5rem;
			right: 0.5rem;
			left: 0.5rem;
			max-width: none;
		}
	}
</style> 