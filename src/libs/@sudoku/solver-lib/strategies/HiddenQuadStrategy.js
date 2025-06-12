// src/sudoku-solver-lib/strategies/HiddenTripleStrategy.js
import { HiddenSubsetStrategy } from "./HiddenSubsetStrategy.js";

export class HiddenQuadStrategy extends HiddenSubsetStrategy {
  constructor() {
    super("HiddenTriple", 4);
  }
}
