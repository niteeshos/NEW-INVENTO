const test = require('node:test');
const assert = require('node:assert/strict');
const { createDonBrain, detectIntent, extractTarget, detectWakeWord } = require('../src/donEngine');

test('extractTarget returns workspace details', () => {
  assert.equal(extractTarget('open project alpha'), 'project alpha');
});

test('detectIntent recognizes connect command', () => {
  assert.equal(detectIntent('connect banking integration'), 'connect');
});

test('detectWakeWord identifies wake phrase', () => {
  assert.equal(detectWakeWord('Don manage launch tasks'), 'don');
});

test('voice command without wake word is ignored', () => {
  const brain = createDonBrain();
  const response = brain.processVoiceCommand('manage launch prep');

  assert.equal(response.accepted, false);
  assert.equal(response.results.length, 0);
});

test('voice command with wake word runs autonomous follow-up read', () => {
  const brain = createDonBrain();
  const response = brain.processVoiceCommand('Don automate morning routine');

  assert.equal(response.accepted, true);
  assert.equal(response.results[0].intent, 'automate');
  assert.equal(response.results[1].intent, 'read');
});

test('brain blocks high spend without explicit approval', () => {
  const brain = createDonBrain({ budget: { travel: { limit: 1000, spent: 0 } } });
  const response = brain.process('Spend 900 from travel budget');

  assert.equal(response.intent, 'spend');
  assert.match(response.summary, /Spend blocked by policy/);
  assert.equal(response.snapshot.spent, 0);
});

test('brain allows approved high spend and tracks execution count', () => {
  const brain = createDonBrain({ budget: { groceries: { limit: 100, spent: 0 } } });
  const response = brain.process('Spend 90 from groceries budget approve');

  assert.equal(response.intent, 'spend');
  assert.equal(response.riskLevel, 'high');
  assert.equal(response.snapshot.executions, 1);
});
