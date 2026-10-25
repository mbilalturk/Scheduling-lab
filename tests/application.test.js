import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, simulationReducer as reduce } from '../src/application/simulationState.js';

const run = state => reduce(state,{type:'run'});
const edit = (state,key,field,value) => reduce(state,{type:'edit',key,field,value});

test('form strings become validated domain numbers only when running', () => {
  const state = run(createInitialState());
  assert.equal(state.outcome.status,'success');
  assert.deepEqual(state.outcome.result.averages,{turnaround:10.5,waiting:6.75,response:6.75});
  assert.equal(typeof state.outcome.result.metrics[0].arrival,'number');
  assert.equal(typeof state.rows[0].arrival,'string');
});
for (const action of [
  {type:'edit',key:0,field:'burst',value:'9'}, {type:'add'}, {type:'remove',key:0},
  {type:'load',workload:'B'}, {type:'algorithm',algorithm:'SJF'}, {type:'quantum',value:'4'},
]) {
  test(`${action.type} keeps the previous run but marks the draft as changed`, () => {
    const old = run(createInitialState());
    const next = reduce(old,action);
    assert.equal(next.outcome.status,'draft');
    assert.ok(!('result' in next.outcome));
    assert.equal(next.outcome.previousRun.result,old.outcome.result);
    assert.deepEqual(next.outcome.previousRun.options,{algorithm:'FCFS'});
    assert.equal(next.outcome.previousRun.workload,'A');
    assert.ok(next.revision > old.revision);
  });
}
test('blank arrival is rejected rather than silently converted to zero', () => {
  const state = run(edit(createInitialState(),0,'arrival',''));
  assert.equal(state.outcome.status,'error');
  assert.match(state.outcome.message,/arrival/i);
});

test('multiple edits retain the same original snapshot and its run revision', () => {
  const old=run(createInitialState());
  let next=edit(old,0,'burst','9');
  next=reduce(next,{type:'algorithm',algorithm:'RR'});
  next=reduce(next,{type:'quantum',value:'4'});
  assert.equal(next.outcome.previousRun.result,old.outcome.result);
  assert.equal(next.outcome.previousRun.revision,old.outcome.revision);
  assert.deepEqual(next.outcome.previousRun.result.averages,{turnaround:10.5,waiting:6.75,response:6.75});
});

test('a failed rerun preserves the last successful run and the validation error', () => {
  const old=run(createInitialState());
  const next=run(edit(old,0,'burst',''));
  assert.equal(next.outcome.status,'error');
  assert.match(next.outcome.message,/burst/i);
  assert.equal(next.outcome.previousRun.result,old.outcome.result);
});

test('successful rerun replaces snapshot context and data together', () => {
  const old=run(createInitialState());
  const loaded=reduce(old,{type:'load',workload:'B'});
  const next=run(reduce(loaded,{type:'algorithm',algorithm:'SJF'}));
  assert.equal(next.outcome.status,'success');
  assert.equal(next.outcome.workload,'B');
  assert.deepEqual(next.outcome.options,{algorithm:'SJF'});
  assert.deepEqual(next.outcome.result.averages,{turnaround:2.25,waiting:.5,response:.5});
  assert.ok(next.outcome.revision>old.outcome.revision);
});

test('error before any successful run does not invent a previous result', () => {
  const state=run(edit(createInitialState(),0,'burst',''));
  assert.equal(state.outcome.status,'error');
  assert.equal(state.outcome.previousRun,null);
});
test('duplicate IDs cause a user-visible error without changing row identity', () => {
  const state = edit(createInitialState(),1,'id',' P1 ');
  assert.equal(state.rows[1].key,1);
  const result = run(state);
  assert.equal(result.outcome.status,'error');
  assert.match(result.outcome.message,/unique/i);
});
test('editing after a delete targets the stable row key, not array position', () => {
  let state = reduce(createInitialState(),{type:'remove',key:0});
  state = edit(state,1,'burst','7');
  assert.equal(state.rows[0].id,'P2');
  assert.equal(state.rows[0].burst,'7');
  assert.equal(state.rows[1].burst,'2');
});
test('new rows receive an unused process ID and never reuse a live row key', () => {
  const state = reduce(createInitialState(),{type:'add'});
  assert.equal(state.rows.length,5);
  assert.equal(state.rows[4].id,'P5');
  assert.equal(new Set(state.rows.map(r=>r.key)).size,5);
});
test('loading B and selecting RR uses q=1 hand-calculated result', () => {
  let state = reduce(createInitialState(),{type:'load',workload:'B'});
  state = reduce(state,{type:'algorithm',algorithm:'RR'});
  state = reduce(state,{type:'quantum',value:'1'});
  const result = run(state);
  assert.deepEqual(result.outcome.result.averages,{turnaround:2.5,waiting:.75,response:.25});
  assert.deepEqual(result.outcome.options,{algorithm:'RR',quantum:1});
});
test('blank quantum is rejected for RR but does not affect FCFS', () => {
  let state = reduce(createInitialState(),{type:'quantum',value:''});
  assert.equal(run(state).outcome.status,'success');
  state = reduce(state,{type:'algorithm',algorithm:'RR'});
  assert.match(run(state).outcome.message,/quantum/i);
});
test('deleting every process produces an explained validation error', () => {
  let state=createInitialState();
  for(const row of state.rows) state=reduce(state,{type:'remove',key:row.key});
  assert.match(run(state).outcome.message,/at least one/i);
});
test('reducer does not mutate frozen state or its rows', () => {
  const original=createInitialState();
  const state=Object.freeze({...original,rows:Object.freeze(original.rows.map(Object.freeze))});
  const next=edit(state,0,'id','Renamed');
  assert.equal(next.rows[0].id,'Renamed');
  assert.equal(state.rows[0].id,'P1');
});
