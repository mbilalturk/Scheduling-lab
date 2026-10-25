import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../src/core/simulate.js';
import { validateInput } from '../src/core/validation.js';
import { A } from './manual-cases.js';

const algorithms = ['FCFS', 'SJF', 'SRTF', 'RR'];
const p = (id, arrival, burst) => ({ id, arrival, burst });
const timeline = result => result.timeline.map(s => [s.id, s.start, s.end]);

for (const algorithm of algorithms) {
  test(`${algorithm}: initial and middle idle gaps do not count as process waiting`, () => {
    const result = simulate([p('P1',3,2),p('P2',8,1)], algorithm, 2);
    assert.deepEqual(timeline(result), [[null,0,3],['P1',3,5],[null,5,8],['P2',8,9]]);
    assert.deepEqual(result.averages, { turnaround: 1.5, waiting: 0, response: 0 });
  });
  test(`${algorithm}: simultaneous ties use input position, not process ID`, () => {
    const result = simulate([p('P2',0,2),p('P1',0,2),p('P3',0,1)], algorithm, 2);
    const shortest = algorithm === 'SJF' || algorithm === 'SRTF';
    assert.deepEqual(timeline(result), shortest
      ? [['P3',0,1],['P2',1,3],['P1',3,5]] : [['P2',0,2],['P1',2,4],['P3',4,5]]);
    assert.deepEqual(result.metrics.map(r => [r.id,r.turnaround,r.waiting,r.response]), shortest
      ? [['P2',3,1,1],['P1',5,3,3],['P3',1,0,0]] : [['P2',2,0,0],['P1',4,2,2],['P3',5,4,4]]);
  });
  test(`${algorithm}: never mutates input or leaks state between runs`, () => {
    const input = Object.freeze(A.map(row => Object.freeze({ ...row })));
    const first = simulate(input, algorithm, 2);
    assert.deepEqual(simulate(input, algorithm, 2), first);
    assert.deepEqual(input, A);
  });
}

test('SRTF: preempt on shorter remaining time, keep current on equality, preserve first start', () => {
  const result = simulate([p('P1',0,5),p('P2',1,2),p('P3',2,1)], 'SRTF');
  assert.deepEqual(timeline(result), [['P1',0,1],['P2',1,3],['P3',3,4],['P1',4,8]]);
  assert.deepEqual(result.metrics.map(r => [r.firstStart,r.completion,r.turnaround,r.waiting,r.response]),
    [[0,8,8,3,0],[1,3,2,0,0],[3,4,2,1,1]]);
});

test('SJF: earlier arrival breaks equal bursts before input order', () => {
  assert.deepEqual(timeline(simulate([p('late',2,2),p('early',1,2),p('runner',0,4)], 'SJF')),
    [['runner',0,4],['early',4,6],['late',6,8]]);
});

test('RR: sorted arrival order, including exact boundary, precedes requeued process', () => {
  assert.deepEqual(timeline(simulate([p('runner',0,3),p('boundary',2,1),p('middle',1,1)], 'RR',2)),
    [['runner',0,2],['middle',2,3],['boundary',3,4],['runner',4,5]]);
});

test('SRTF: large idle gaps and bursts require only event-sized intervals', () => {
  assert.deepEqual(timeline(simulate([p('P',1_000_000_000,1_000_000_000)], 'SRTF')),
    [[null,0,1_000_000_000],['P',1_000_000_000,2_000_000_000]]);
});

const invalid = [
  ['empty workload', [], 'FCFS',2,/at least one/i],
  ['non-array workload', null,'FCFS',2,/list/i],
  ['invalid process', [null],'FCFS',2,/process/i],
  ['blank ID', [p(' ',0,1)],'FCFS',2,/ID/i],
  ['duplicate trimmed ID', [p('P',0,1),p(' P ',1,1)],'FCFS',2,/unique/i],
  ['negative arrival', [p('P',-1,1)],'FCFS',2,/arrival/i],
  ['fractional arrival', [p('P',.5,1)],'FCFS',2,/arrival/i],
  ['blank numeric arrival', [p('P','',1)],'FCFS',2,/arrival/i],
  ['NaN burst', [p('P',0,NaN)],'FCFS',2,/burst/i],
  ['zero burst', [p('P',0,0)],'FCFS',2,/burst/i],
  ['negative burst', [p('P',0,-1)],'FCFS',2,/burst/i],
  ['fractional burst', [p('P',0,1.5)],'FCFS',2,/burst/i],
  ['infinite burst', [p('P',0,Infinity)],'FCFS',2,/burst/i],
  ['zero quantum', [p('P',0,1)],'RR',0,/quantum/i],
  ['fractional quantum', [p('P',0,1)],'RR',.5,/quantum/i],
  ['unknown algorithm', [p('P',0,1)],'constructor',2,/algorithm/i],
  ['unsafe time horizon', [p('P',Number.MAX_SAFE_INTEGER,1)],'FCFS',2,/range/i],
  ['excessive RR slices', [p('P',0,10001)],'RR',1,/10,000/i],
  ['too many processes', Array.from({length:101},(_,i)=>p(`P${i}`,0,1)),'FCFS',2,/100 processes/i],
];
for (const [name,input,algorithm,q,message] of invalid) {
  test(`validation rejects ${name} with an explanation`, () => {
    assert.throws(() => validateInput(input,algorithm,q), message);
  });
}

// A deterministic variety of inputs checks independent conservation properties,
// not a second implementation of the scheduling algorithm.
for (const algorithm of algorithms) {
  test(`${algorithm}: conservation, arrival, single CPU and no unnecessary idle across 80 workloads`, () => {
    let seed = 513;
    const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
    for (let sample = 0; sample < 80; sample++) {
      const input = Array.from({length:1+random(8)},(_,i)=>p(`P${i}`,random(15),1+random(8)));
      const q = 1+random(4);
      const result = simulate(input,algorithm,q);
      const consumed = new Map(input.map(row=>[row.id,0]));
      let end = 0;
      for (const s of result.timeline) {
        assert.equal(s.start,end);
        assert.ok(s.end>s.start);
        if (s.id === null) {
          assert.ok(!input.some(row=>row.arrival<s.end && consumed.get(row.id)<row.burst));
        } else {
          const row = input.find(row=>row.id===s.id);
          assert.ok(row.arrival<=s.start);
          consumed.set(s.id,consumed.get(s.id)+s.end-s.start);
          assert.ok(consumed.get(s.id)<=row.burst);
          if (algorithm==='RR') assert.ok(s.end-s.start<=q);
        }
        end=s.end;
      }
      for (const row of input) assert.equal(consumed.get(row.id),row.burst);
      for (const row of result.metrics) assert.ok(row.waiting>=0 && row.response>=0);
    }
  });
}
