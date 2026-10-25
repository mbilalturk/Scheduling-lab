import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GanttChart } from '../src/ui/components/GanttChart.js';
import { simulate } from '../src/core/simulate.js';

test('a long RR chart has one interval in the Tab sequence, not one per slice', () => {
  const result = simulate([{id:'P',arrival:0,burst:1000}],'RR',1);
  const markup = renderToStaticMarkup(createElement(GanttChart,{result,options:{algorithm:'RR',quantum:1}}));
  // Inspect rendered accessibility attributes, not source text or a mocked component.
  const intervalGroups = [...markup.matchAll(/<g\b[^>]*class="chart-block"[^>]*>/g)].map(match=>match[0]);
  assert.equal(intervalGroups.length,1000);
  assert.equal(intervalGroups.filter(group=>group.includes('tabindex="0"')).length,1);
  assert.equal(intervalGroups.filter(group=>group.includes('tabindex="-1"')).length,999);
});

test('React renders the exact SVG interval tooltip as text', () => {
  const result = simulate([{id:'P',arrival:0,burst:1}],'FCFS');
  const markup = renderToStaticMarkup(createElement(GanttChart,{result,options:{algorithm:'FCFS'}}));
  assert.match(markup, /<title>P · \[0, 1\) · 1 units<\/title>/);
});
