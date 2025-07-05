<script>
	export let hideModal;
</script>

<div class="text-center">
	<h1 class="text-2xl font-semibold mb-6 leading-none text-red-600">填写的数字部分有误</h1>
	<div class="p-4 text-lg rounded bg-red-100 bg-opacity-80 border-l-8 border-red-400 border-opacity-75 mb-6">
		请关闭窗口后检查标红的数字！
	</div>
	<button class="btn btn-primary w-full mt-2" on:click={hideModal}>关闭</button>
</div> 