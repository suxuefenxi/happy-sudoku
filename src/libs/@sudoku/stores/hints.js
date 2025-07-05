import { writable } from 'svelte/store';

const usedHintsStore = writable(0);
const lastHintStrategy = writable('');

function createHints() {
	const hints = writable(Infinity);

	return {
		subscribe: hints.subscribe,

		useHint() {
			// 无限次使用提示，只记录使用次数
			usedHintsStore.update($usedHints => $usedHints + 1);
		},

		reset() {
			usedHintsStore.set(0);
		}
	};
}

export const hints = createHints();
export const usedHints = usedHintsStore;
export { lastHintStrategy };