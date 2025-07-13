import { writable } from "svelte/store";

// 用对象来存储提示的单元格
export const hintedCells = writable(new Set());
