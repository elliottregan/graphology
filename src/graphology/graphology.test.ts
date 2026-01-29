/**
 * Graphology Unit Test (Bun)
 * ==========================
 *
 * Running the unit tests using Bun's native test runner.
 */
import {describe, it} from 'bun:test';
import specs from './tests/index.js';
import util from 'util';
import Graph from './src/endpoint.esm.js';

// NOTE: this was breaking for node before v6
if (util.inspect.defaultOptions) util.inspect.defaultOptions.depth = null;

/**
 * Recursively converts Mocha exports-style tests to Bun's describe/it format.
 */
function runTests(obj, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'function') {
      // It's a test function
      it(key, value);
    } else if (typeof value === 'object' && value !== null) {
      // It's a nested describe block
      describe(key, () => {
        runTests(value, `${prefix}${key} > `);
      });
    }
  }
}

// Get the test specs
const testSpecs = specs(Graph, Graph);

// Run all tests
describe('Graphology', () => {
  runTests(testSpecs);
});
