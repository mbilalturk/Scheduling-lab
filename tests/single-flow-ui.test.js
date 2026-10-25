import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConfigurationForm } from '../src/ui/components/ConfigurationForm.js';
import { SimulationResults } from '../src/ui/components/SimulationResults.js';
import { createInitialState, simulationReducer as reduce } from '../src/application/simulationState.js';

const renderForm = state => renderToStaticMarkup(createElement(ConfigurationForm,{state,onAction:()=>{}}));
const renderResults = state => renderToStaticMarkup(createElement(SimulationResults,{outcome:state.outcome}));
const run = state => reduce(state,{type:'run'});

test('all simulation inputs and one primary submit live inside the same form', () => {
  const html=renderForm(createInitialState());
  const form=html.match(/<form\b[\s\S]*?<\/form>/)?.[0] ?? '';
  assert.match(form,/<legend[^>]*>Workload<\/legend>/);
  assert.match(form,/<legend[^>]*>Scheduling policy<\/legend>/);
  assert.equal((form.match(/type="radio"/g)||[]).length,4);
  assert.match(form,/CPU burst, row 1/);
  assert.equal((form.match(/type="submit"/g)||[]).length,1);
});
test('quantum appears only inside the selected RR policy group', () => {
  assert.doesNotMatch(renderForm(createInitialState()),/aria-label="Time quantum"/);
  const state=reduce(createInitialState(),{type:'algorithm',algorithm:'RR'});
  const html=renderForm(state);
  assert.match(html,/<fieldset[^>]*>[\s\S]*Scheduling policy[\s\S]*aria-label="Time quantum"[\s\S]*<\/fieldset>/);
});
test('stale output identifies its old workload and policy while the form describes the next run', () => {
  let state=run(createInitialState());
  state=reduce(state,{type:'load',workload:'B'});
  state=reduce(state,{type:'algorithm',algorithm:'RR'});
  const html=renderResults(state);
  assert.match(html,/Previous run/);
  assert.match(html,/Workload A/);
  assert.match(html,/FCFS/);
  assert.match(html,/Inputs changed/);
  assert.match(html,/data-testid="avg-waiting">6.75/);
  assert.match(renderForm(state),/Update results/);
  assert.match(renderForm(state),/Workload B/);
});
test('a successful rerun removes the stale notice and renders current metrics', () => {
  let state=run(createInitialState());
  state=reduce(state,{type:'algorithm',algorithm:'SJF'});
  const html=renderResults(run(state));
  assert.doesNotMatch(html,/Previous run|Inputs changed/);
  assert.match(html,/Up to date/);
  assert.match(html,/data-testid="avg-waiting">5.25/);
  assert.ok(html.indexOf('CPU timeline')<html.indexOf('avg-turnaround'));
});
test('validation error coexists only with clearly labeled previous-run output', () => {
  const state=run(reduce(run(createInitialState()),{type:'edit',key:0,field:'burst',value:''}));
  assert.match(renderForm(state),/role="alert"/);
  assert.match(renderResults(state),/Previous run/);
  assert.match(renderResults(state),/data-testid="avg-waiting">6.75/);
});
