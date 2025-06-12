// src/sudoku-solver-lib/strategies/HiddenPairStrategy.js
import { HiddenSubsetStrategy } from "./HiddenSubsetStrategy.js";

export class HiddenPairStrategy extends HiddenSubsetStrategy {
  constructor() {
    super("HiddenPair", 2);
  }
}
