import test from 'node:test';
import assert from 'node:assert/strict';
import { runSimulation } from '../src/core/runSimulation.js';
import { A } from './manual-cases.js';

test('typed options entry retains FCFS hand result', () => {
  assert.deepEqual(runSimulation(A, {algorithm:'FCFS'}).averages,
    {turnaround:10.5,waiting:6.75,response:6.75});
});
test('typed RR options use the requested quantum', () => {
  assert.deepEqual(runSimulation(A, {algorithm:'RR',quantum:1}).averages,
    {turnaround:8.5,waiting:4.75,response:.75});
});
test('untyped callers cannot silently omit RR quantum from the new API', () => {
  assert.throws(()=>runSimulation(A,{algorithm:'RR'}),/quantum/i);
});
