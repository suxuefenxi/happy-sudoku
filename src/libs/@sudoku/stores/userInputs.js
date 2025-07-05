import { writable, get } from 'svelte/store';

// 用 Set 来存储用户填写的数字位置
export const userInputs = writable(new Set());

// 添加用户输入位置的辅助函数
export function addUserInput(x, y) {
	console.log('Adding user input at:', x, y);
	userInputs.update(set => {
		set.add(`${x},${y}`);
		console.log('Updated userInputs set:', set);
		return set;
	});
}

// 清除所有用户输入位置
export function clearUserInputs() {
	userInputs.set(new Set());
}

// 检查指定位置是否是用户输入
export function isUserInput(x, y) {
	return get(userInputs).has(`${x},${y}`);
} 