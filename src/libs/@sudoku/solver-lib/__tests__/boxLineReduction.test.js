import { SudokuBoard } from '../SudokuBoard.js';
import { boxLineReduction } from '../strategies/boxLineReduction.js';

test('BoxLineReduction 在真实棋盘上能消除候选值', () => {
    const initialGrid = [
        [0, 1, 6, 0, 0, 7, 8, 0, 3],
        [0, 9, 0, 8, 0, 0, 0, 0, 0],
        [8, 7, 0, 0, 0, 1, 0, 6, 0],
        [0, 4, 8, 0, 0, 0, 3, 0, 0],
        [6, 5, 0, 0, 0, 9, 0, 8, 2],
        [0, 3, 9, 0, 0, 0, 6, 5, 0],
        [0, 6, 0, 9, 0, 0, 0, 2, 0],
        [0, 8, 0, 0, 0, 2, 9, 3, 6],
        [9, 2, 4, 6, 0, 0, 5, 1, 0],
    ];
    const board = new SudokuBoard(initialGrid);
    //先调用一次求候选值
    //board.eliminateCandidates();
    console.log('初始候选值');
    console.log(board.candidates); // 调用前
    board.candidates[0][0] = new Set([4, 5]); 
    board.candidates[1][0] = new Set([3, 4, 5]);
    
    
    // 记录 boxLineReduction 前的候选
    const cellsRemove2 = [
        { row: 1, col: 4 }, // B5
        { row: 2, col: 3 }, // C4
        { row: 2, col: 4 }, // C5
    ];
    const before2 = cellsRemove2.map(({ row, col }) => board.getCandidates(row, col));

    const cellsRemove4 = [
        { row: 1, col: 6 }, // B7
        { row: 1, col: 8 }, // B9
        { row: 2, col: 6 }, // C7
        { row: 2, col: 8 }, // C9
    ];
    const before4 = cellsRemove4.map(({ row, col }) => board.getCandidates(row, col));

    console.log('调用方法后');
    boxLineReduction(board);
    console.log(board.candidates); // 调用后

    // 验证 B5, C4, C5 的候选值 2 被消除
    cellsRemove2.forEach(({ row, col }, i) => {
        expect(before2[i]).toContain(2); // 应该原本有2
        expect(board.getCandidates(row, col)).not.toContain(2); // 应该被消除
    });

    // 验证 B7, B9, C7, C9 的候选值 4 被消除
    cellsRemove4.forEach(({ row, col }, i) => {
        expect(before4[i]).toContain(4); // 应该原本有4
        expect(board.getCandidates(row, col)).not.toContain(4); // 应该被消除
    });
});