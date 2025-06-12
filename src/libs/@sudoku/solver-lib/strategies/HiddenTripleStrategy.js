// src/sudoku-solver-lib/strategies/HiddenTripleStrategy.js
import { HiddenSubsetStrategy } from "./HiddenSubsetStrategy.js";

export class HiddenTripleStrategy extends HiddenSubsetStrategy {
  constructor() {
    super("HiddenTriple", 3);
  }
}
