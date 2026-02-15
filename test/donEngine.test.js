const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createDonRuntime,
  detectIntent,
  extractAmount,
  extractTarget,
  runDonCommand,
} = require('../src/donEngine');

test('extractTarget removes leading action words', () => {
  assert.equal(extractTarget('open project alpha board'), 'project alpha board');
});

test('detectIntent prioritizes strongest keyword match', () => {
  assert.equal(detectIntent('please automate this workflow and trigger it nightly'), 'automate');
});

test('extractAmount returns numeric amount', () => {
  assert.equal(extractAmount('spend $42.50 on software'), 42.5);
});

test('runDonCommand spend under budget is low risk', () => {
  const runtime = createDonRuntime();
  const response = runDonCommand('Spend 80 on software', runtime);

  assert.equal(response.intent, 'spend');
  assert.equal(response.riskLevel, 'low');
  assert.match(response.summary, /Remaining software budget is \$220/);
});

test('runDonCommand spend over budget is high risk', () => {
  const runtime = createDonRuntime();
  const response = runDonCommand('Spend 900 on ops', runtime);

  assert.equal(response.intent, 'spend');
  assert.equal(response.riskLevel, 'high');
  assert.match(response.summary, /exceeds ops budget/);
});

test('runtime keeps memory across manage and assess commands', () => {
  const runtime = createDonRuntime();
  runDonCommand('Manage launch prep for demo day', runtime);
  runDonCommand('Automate launch prep status checks', runtime);
  const response = runDonCommand('Assess launch prep risk', runtime);

  assert.equal(response.intent, 'assess');
  assert.equal(response.stateSnapshot.tasks, 3);
  assert.equal(response.stateSnapshot.automations, 1);
});
