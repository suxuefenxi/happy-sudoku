import { settings } from '@sudoku/stores/settings';
import { writable } from 'svelte/store';

export const usedHints = writable(0);

function createHints() {
	let defaultHints = Infinity;

	const hints = writable(Infinity);

	settings.subscribe(($settings) => {
		if ($settings.hintsLimited) {
			defaultHints = $settings.hints;
			hints.update($hints => {
				if ($hints > $settings.hints) return $settings.hints;

				return $hints;
			})
		} else {
			defaultHints = Infinity;
			hints.set(Infinity);
		}
	});

	return {
		subscribe: hints.subscribe,

		useHint() {
			hints.update($hints => {
				if ($hints > 0) {
					usedHints.update($usedHints => $usedHints + 1);
					return $hints - 1;
				}

				return 0;
			});
		},

		reset() {
			hints.set(defaultHints);
			usedHints.set(0);
		}
	};
}

export const hints = createHints();