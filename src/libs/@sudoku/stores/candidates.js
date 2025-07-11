import { writable } from 'svelte/store';

function createCandidates() {
	const candidates = writable({});

	return {
		subscribe: candidates.subscribe,

		add(pos, candidate) {
			candidates.update($candidates => {
				if (!$candidates.hasOwnProperty(pos.x + ',' + pos.y)) {
					$candidates[pos.x + ',' + pos.y] = [candidate];
				} else if ($candidates[pos.x + ',' + pos.y].includes(candidate)) {
					delete $candidates[pos.x + ',' + pos.y][$candidates[pos.x + ',' + pos.y].indexOf(candidate)];
				} else {
					$candidates[pos.x + ',' + pos.y].push(candidate);
				}

				return $candidates;
			});
		},

		clear(pos) {
			candidates.update($candidates => {
				delete $candidates[pos.x + ',' + pos.y];
				return $candidates;
			});
		},

		set(newCandidates) { // 添加 set 方法
			candidates.set(newCandidates); // 直接设置整个笔记状态
		}
	};
}

export const candidates = createCandidates();