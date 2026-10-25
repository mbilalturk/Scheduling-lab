import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraceEntries, intervalGeometry } from '../src/ui/timelineModel.js';

test('trace preserves consecutive RR boundaries and computes remaining CPU across slices', () => {
  const entries=createTraceEntries({timeline:[{id:'P',start:0,end:2},{id:'P',start:2,end:4},{id:'P',start:4,end:5}],
    metrics:[{id:'P',burst:5}]});
  assert.deepEqual(entries.map(e=>[e.index,e.duration,e.remaining]),[[0,2,3],[1,2,1],[2,1,0]]);
});
test('idle intervals have no process remaining time and do not consume CPU burst', () => {
  const entries=createTraceEntries({timeline:[{id:null,start:0,end:3},{id:'P',start:3,end:5}],metrics:[{id:'P',burst:2}]});
  assert.deepEqual(entries.map(e=>e.remaining),[null,0]);
});
test('Gantt geometry is proportional to time, including idle', () => {
  assert.deepEqual(intervalGeometry({id:null,start:0,end:2},10,800),{x:0,width:160});
  assert.deepEqual(intervalGeometry({id:'P',start:2,end:7},10,800),{x:160,width:400});
});
