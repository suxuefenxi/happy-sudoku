// src/sudoku-solver-lib/strategies/NakedTripleStrategy.js
import { NakedSubsetStrategy } from './NakedSubsetStrategy.js';

export class NakedTripleStrategy extends NakedSubsetStrategy {
    constructor() {
        super('NakedTriple', 3);
    }
}