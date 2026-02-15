const test = require('node:test');
const assert = require('node:assert/strict');
const { createDonBrain, detectIntent, extractTarget } = require('../src/donEngine');

test('extractTarget returns workspace details', () => {
  assert.equal(extractTarget('open project alpha'), 'project alpha');
});

test('detectIntent recognizes connect command', () => {
  assert.equal(detectIntent('connect banking integration'), 'connect');
});

test('brain blocks high spend without explicit approval', () => {
  const brain = createDonBrain({ budget: { travel: { limit: 1000, spent: 0 } } });
  const response = brain.process('Spend 900 from travel budget');

  assert.equal(response.intent, 'spend');
  assert.match(response.summary, /Spend blocked by policy/);
  assert.equal(response.snapshot.spent, 0);
  assert.equal(response.execution.status, 'completed');
});

test('brain allows approved high spend and tracks execution count', () => {
  const brain = createDonBrain({ budget: { groceries: { limit: 100, spent: 0 } } });
  const response = brain.process('Spend 90 from groceries budget approve');

  assert.equal(response.intent, 'spend');
  assert.equal(response.riskLevel, 'high');
  assert.match(response.actions[0], /90\.00/);
  assert.equal(response.snapshot.executions, 1);
});

test('provider connect increases connected count', () => {
  const brain = createDonBrain();
  const before = brain.getSnapshot().connectedProviders;
  const response = brain.process('connect files');

  assert.equal(response.intent, 'connect');
  assert.equal(response.snapshot.connectedProviders, before + 1);
});

test('manage command creates task and execution id', () => {
  const brain = createDonBrain();
  const response = brain.process('Manage launch prep tomorrow at 8 am');

  assert.equal(response.intent, 'manage');
  assert.equal(response.snapshot.pendingTasks, 1);
  assert.match(response.execution.id, /^exec-/);
});
