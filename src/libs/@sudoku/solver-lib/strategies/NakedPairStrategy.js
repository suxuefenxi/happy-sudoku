// src/sudoku-solver-lib/strategies/NakedPairStrategy.js
import { NakedSubsetStrategy } from './NakedSubsetStrategy.js';

export class NakedPairStrategy extends NakedSubsetStrategy {
    constructor() {
        super('NakedPair', 2);
    }
}