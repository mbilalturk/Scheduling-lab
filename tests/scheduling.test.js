import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../src/core/simulate.js';
import { cases } from './manual-cases.js';

for (const c of cases) {
  test(`${c.name}: timeline matches the hand calculation`, () => {
    const result = simulate(c.input, c.algorithm, c.quantum);
    assert.deepEqual(result.timeline, c.timeline.map(([id, start, end]) => ({ id, start, end })));
  });
  test(`${c.name}: metrics match independent hand-calculated rows and averages`, () => {
    const result = simulate(c.input, c.algorithm, c.quantum);
    const expected = c.rows.map(([id, firstStart, completion, turnaround, waiting, response], i) =>
      ({ ...c.input[i], id, firstStart, completion, turnaround, waiting, response }));
    assert.deepEqual(result.metrics, expected);
    const [turnaround, waiting, response] = c.averages;
    assert.deepEqual(result.averages, { turnaround, waiting, response });
  });
}
