<script>
	import { fly } from 'svelte/transition';
	import { lastHintStrategy } from '@sudoku/stores/hints';
	import { onMount } from 'svelte';

	let timeoutId;

	function hideToast() {
		lastHintStrategy.set('');
	}

	// 监听提示策略状态，当显示时自动隐藏
	$: if ($lastHintStrategy) {
		// 清除之前的定时器
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		// 10秒后自动隐藏
		timeoutId = setTimeout(() => {
			lastHintStrategy.set('');
		}, 10000);
	}

	onMount(() => {
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});
</script>

{#if $lastHintStrategy}
	<div 
		class="hint-toast"
		transition:fly={{ x: 300, duration: 300 }}
	>
		<div class="hint-content">
			<div class="hint-header">
				<h3 class="hint-title">提示策略</h3>
				<button 
					class="close-btn" 
					on:click={hideToast}
					aria-label="关闭"
				>
					×
				</button>
			</div>
			<div class="hint-body">
				{#if Array.isArray($lastHintStrategy)}
					<div class="strategy-chain">
						<div class="chain-label">策略链</div>
						<div class="chain-container">
							{#each $lastHintStrategy as strategy, index}
								<div class="strategy-item">
									<span class="strategy-name">{strategy}</span>
								</div>
								{#if index < $lastHintStrategy.length - 1}
									<div class="arrow"></div>
								{/if}
							{/each}
						</div>
					</div>
				{:else if $lastHintStrategy.includes(',')}
					<div class="strategy-chain">
						<div class="chain-label">策略链</div>
						<div class="chain-container">
							{#each $lastHintStrategy.split(',') as strategy, index}
								<div class="strategy-item">
									<span class="strategy-name">{strategy.trim()}</span>
								</div>
								{#if index < $lastHintStrategy.split(',').length - 1}
									<div class="arrow"></div>
								{/if}
							{/each}
						</div>
					</div>
				{:else}
					<div class="single-strategy">
						<span class="strategy-name">{$lastHintStrategy}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.hint-toast {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 40;
		max-width: 28rem;
		min-width: 22rem;
		max-height: 28rem; /* 与board宽度一致的最大高度 */
	}

	.hint-content {
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		border-left: 4px solid #2979fa;
		padding: 1rem;
	}

	.hint-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.hint-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #2979fa;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		letter-spacing: 0.025em;
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

	.hint-body {
		font-size: 0.875rem;
		color: #4a5568;
		line-height: 1.5;
		word-break: break-word;
		white-space: normal;
		max-height: 28rem; /* 为内容留出空间，避免超出最大高度 */
		overflow-y: auto;
	}

	.strategy-chain {
		margin-top: 0.75rem;
	}

	.chain-label {
		font-weight: 700;
		color: #2979fa;
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		letter-spacing: 0.025em;
		text-transform: uppercase;
	}

	.chain-container {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.strategy-item {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
		line-height: 1.3;
		transition: all 0.2s ease;
	}

	.strategy-item:hover {
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.strategy-name {
		color: #374151;
		font-weight: 600;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		letter-spacing: 0.025em;
		flex: 1;
		font-size: 0.8rem;
	}

	.arrow {
		width: 16px;
		height: 16px;
		margin: 0.375rem auto;
		position: relative;
		animation: pulse 2s infinite;
	}

	.arrow::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0;
		height: 0;
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-top: 8px solid #2979fa;
		opacity: 0.8;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.8; }
		50% { opacity: 1; }
	}

	.single-strategy {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border-radius: 0.375rem;
		border: 1px solid #e2e8f0;
		transition: all 0.2s ease;
	}

	.single-strategy:hover {
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.single-strategy .strategy-name {
		font-size: 0.8rem;
		color: #374151;
		font-weight: 600;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		letter-spacing: 0.025em;
	}

	/* 响应式设计 */
	@media (max-width: 640px) {
		.hint-toast {
			top: 0.5rem;
			right: 0.5rem;
			left: 0.5rem;
			max-width: none;
			min-width: auto;
		}
		
		.hint-content {
			padding: 0.75rem;
		}
		
		.hint-body {
			font-size: 0.75rem;
			max-height: 8rem;
		}
		
		.strategy-item {
			font-size: 0.75rem;
			padding: 0.25rem 0;
		}
		
		.strategy-number {
			min-width: 1.5rem;
			margin-right: 0.5rem;
		}
	}
</style> 