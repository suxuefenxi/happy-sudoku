// src/sudoku-solver-lib/strategies/NakedQuadStrategy.js
import { NakedSubsetStrategy } from './NakedSubsetStrategy.js';

export class NakedQuadStrategy extends NakedSubsetStrategy {
    constructor() {
        super('NakedQuad', 4);
    }
}