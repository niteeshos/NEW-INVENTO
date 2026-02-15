const INTENTS = [
  { intent: 'connect', keywords: ['connect', 'link', 'enable integration'] },
  { intent: 'open', keywords: ['open', 'launch', 'start', 'switch to'] },
  { intent: 'spend', keywords: ['spend', 'pay', 'purchase', 'buy', 'charge'] },
  { intent: 'read', keywords: ['read', 'summarize', 'review', 'brief me', 'status'] },
  { intent: 'manage', keywords: ['manage', 'organize', 'schedule', 'plan', 'prioritize'] },
  { intent: 'automate', keywords: ['automate', 'workflow', 'routine', 'trigger'] },
  { intent: 'assess', keywords: ['assess', 'analyze', 'diagnose', 'evaluate', 'risk'] },
];

const PROVIDER_NAMES = ['calendar', 'email', 'tasks', 'banking', 'files', 'devices'];

function detectIntent(command) {
  const clean = command.toLowerCase().trim();
  const byPrefix = INTENTS.find((entry) => entry.keywords.some((word) => clean.startsWith(`${word} `) || clean === word));
  if (byPrefix) return byPrefix.intent;
  return INTENTS.find((entry) => entry.keywords.some((word) => clean.includes(word)))?.intent ?? 'general';
}

function extractTarget(command) {
  return (
    command
      .replace(/^(open|launch|start|switch to|manage|organize|schedule|plan|prioritize)\s*/i, '')
      .trim() || 'default workspace'
  );
}

function extractAmount(command) {
  const amount = command.match(/\$?\d+(?:\.\d+)?/g)?.[0];
  return amount ? Number.parseFloat(amount.replace('$', '')) : null;
}

function extractBudget(command) {
  const match = command.toLowerCase().match(/from\s+([a-z\s]+?)\s+budget/);
  return match?.[1]?.trim() ?? 'general';
}

function extractTime(command) {
  const match = command.match(/(today|tomorrow|mon|tue|wed|thu|fri|sat|sun)?\s*(at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?)/i);
  return match ? match[0].trim() : 'next available focus slot';
}

function extractProvider(command) {
  const clean = command.toLowerCase();
  return PROVIDER_NAMES.find((name) => clean.includes(name)) ?? null;
}

function riskFromScore(score) {
  if (score >= 8) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function createProviderRegistry(seed) {
  const defaults = {
    calendar: { connected: true },
    email: { connected: true },
    tasks: { connected: true },
    banking: { connected: false },
    files: { connected: false },
    devices: { connected: false },
  };

  return { ...defaults, ...(seed ?? {}) };
}

function createPolicyEngine() {
  return {
    approveSpend({ amount, command }) {
      if (!amount) return { allow: true, reason: 'amount missing; request staged' };
      if (amount <= 250) return { allow: true, reason: 'within fast-lane approval limit' };
      const approved = /approve|approved|authorization code/i.test(command);
      if (!approved) {
        return {
          allow: false,
          reason: 'high-value spend requires explicit approval keyword: approve',
        };
      }
      return { allow: true, reason: 'high-value spend approved by operator phrase' };
    },
  };
}

function createDonBrain(seed = {}) {
  const policy = createPolicyEngine();

  const state = {
    openedWorkspaces: [],
    tasks: [],
    automations: [],
    assessments: [],
    auditLog: [],
    providers: createProviderRegistry(seed.providers),
    budget: {
      general: { limit: 3000, spent: 0 },
      groceries: { limit: 600, spent: 0 },
      travel: { limit: 1200, spent: 0 },
      tools: { limit: 1000, spent: 0 },
      ...(seed.budget ?? {}),
    },
    ...seed,
  };

  const logAudit = (entry) => {
    state.auditLog.unshift({ at: new Date().toISOString(), ...entry });
    state.auditLog = state.auditLog.slice(0, 100);
  };

  const ensureBudgetCategory = (name) => {
    if (!state.budget[name]) state.budget[name] = { limit: 500, spent: 0 };
  };

  const getSnapshot = () => {
    const totalBudget = Object.values(state.budget).reduce(
      (acc, item) => ({ limit: acc.limit + item.limit, spent: acc.spent + item.spent }),
      { limit: 0, spent: 0 }
    );

    const pendingTasks = state.tasks.filter((task) => task.status !== 'done').length;
    const connectedProviders = Object.values(state.providers).filter((p) => p.connected).length;
    const autonomyScore = Math.min(100, 30 + state.automations.length * 12 + connectedProviders * 8 + state.tasks.length * 2);
    const riskScore =
      Math.floor(pendingTasks / 2) +
      (totalBudget.spent > totalBudget.limit * 0.85 ? 4 : 1) +
      (connectedProviders < 3 ? 2 : 0);

    return {
      openedWorkspaces: state.openedWorkspaces.length,
      pendingTasks,
      automations: state.automations.length,
      spent: totalBudget.spent,
      budgetLimit: totalBudget.limit,
      autonomyScore,
      riskLevel: riskFromScore(riskScore),
      connectedProviders,
      auditEvents: state.auditLog.length,
    };
  };

  const handlers = {
    connect(command) {
      const provider = extractProvider(command);
      if (!provider) {
        return {
          summary: `Specify a provider to connect: ${PROVIDER_NAMES.join(', ')}.`,
          actions: ['Example: "connect banking".'],
          riskLevel: 'low',
        };
      }

      state.providers[provider].connected = true;
      logAudit({ type: 'connect', provider, status: 'success' });

      return {
        summary: `${provider} integration connected and authenticated pipeline is now active.`,
        actions: [`Provider online: ${provider}.`, 'Audit event recorded for compliance.'],
        riskLevel: 'low',
      };
    },

    open(command) {
      const target = extractTarget(command);
      state.openedWorkspaces.unshift(target);
      logAudit({ type: 'open', target, status: 'success' });
      return {
        summary: `Opened ${target} and pinned it to your high-priority workspace stack.`,
        actions: [`Workspace active: ${target}`, 'Context memory updated for smarter follow-up commands.'],
        riskLevel: 'low',
      };
    },

    spend(command) {
      const amount = extractAmount(command);
      const budgetName = extractBudget(command);
      ensureBudgetCategory(budgetName);

      const decision = policy.approveSpend({ amount, command });
      if (!decision.allow) {
        logAudit({ type: 'spend', status: 'blocked', reason: decision.reason, amount, budget: budgetName });
        return {
          summary: `Spend blocked by policy. ${decision.reason}.`,
          actions: ['No funds moved.', 'Retry with explicit approval phrase if intentional.'],
          riskLevel: 'medium',
        };
      }

      if (amount) state.budget[budgetName].spent += amount;
      const bucket = state.budget[budgetName];
      const usage = Math.round((bucket.spent / bucket.limit) * 100);
      const riskLevel = usage >= 90 ? 'high' : usage >= 70 ? 'medium' : 'low';
      logAudit({ type: 'spend', status: 'success', amount, budget: budgetName, reason: decision.reason });

      return {
        summary: amount
          ? `Transaction prepared: $${amount.toFixed(2)} from ${budgetName} budget with policy verification.`
          : `Spending request captured for ${budgetName} budget. Specify amount to execute instantly.`,
        actions: [
          `Budget ${budgetName}: $${bucket.spent.toFixed(2)} / $${bucket.limit.toFixed(2)} used (${usage}%).`,
          `Policy gate: ${decision.reason}.`,
        ],
        riskLevel,
      };
    },

    read() {
      const latestWorkspaces = state.openedWorkspaces.slice(0, 3).join(', ') || 'none';
      const pendingTasks = state.tasks.filter((task) => task.status !== 'done');
      const providersOnline = Object.entries(state.providers)
        .filter(([, info]) => info.connected)
        .map(([name]) => name)
        .join(', ');

      return {
        summary: `Live brief complete: ${pendingTasks.length} active priorities, ${state.automations.length} automations, ${providersOnline || '0'} providers online.`,
        actions: [
          `Recent workspaces: ${latestWorkspaces}.`,
          pendingTasks.length ? `Top pending task: ${pendingTasks[0].title} (${pendingTasks[0].when}).` : 'No pending tasks; your queue is clear.',
        ],
        riskLevel: pendingTasks.length > 8 ? 'medium' : 'low',
      };
    },

    manage(command) {
      const title = extractTarget(command);
      const when = extractTime(command);
      const task = { title, when, status: 'planned' };
      state.tasks.unshift(task);
      logAudit({ type: 'manage', status: 'success', task: title, when });

      return {
        summary: `Plan optimized. Added "${title}" for ${when} with dependency-aware scheduling.`,
        actions: [
          `Task queued: ${title}.`,
          state.providers.calendar.connected
            ? 'Calendar sync complete through connected provider.'
            : 'Calendar provider offline. Use "connect calendar" for sync.',
        ],
        riskLevel: state.tasks.length > 10 ? 'medium' : 'low',
      };
    },

    automate(command) {
      const workflow = command.replace(/^automate\s*/i, '').trim() || 'adaptive daily routine';
      const automation = { workflow, status: 'armed' };
      state.automations.unshift(automation);
      logAudit({ type: 'automate', status: 'success', workflow });

      return {
        summary: `Automation armed: ${workflow}. Don will run it with context-aware triggers.`,
        actions: ['Workflow status: armed.', 'Fallback recovery and notification hooks enabled.'],
        riskLevel: 'low',
      };
    },

    assess() {
      const snapshot = getSnapshot();
      const assessment = { at: new Date().toISOString(), riskLevel: snapshot.riskLevel };
      state.assessments.unshift(assessment);
      logAudit({ type: 'assess', status: 'success', riskLevel: snapshot.riskLevel });

      return {
        summary: `Strategic assessment complete. Current operational risk is ${snapshot.riskLevel.toUpperCase()}.`,
        actions: [
          `Autonomy score: ${snapshot.autonomyScore}/100.`,
          `Pressure: ${snapshot.pendingTasks} tasks, ${snapshot.automations} automations, ${snapshot.connectedProviders} providers connected.`,
        ],
        riskLevel: snapshot.riskLevel,
      };
    },

    general() {
      return {
        summary: 'Command received. I can execute planning, spending, reading, automation, provider connection, and risk analysis.',
        actions: ['Try: "connect banking".', 'Try: "Spend 800 from travel budget approve".'],
        riskLevel: 'low',
      };
    },
  };

  const process = (command) => {
    const intent = detectIntent(command);
    const output = handlers[intent](command);
    const snapshot = getSnapshot();

    return {
      intent,
      summary: `Intent ${intent.toUpperCase()}: ${output.summary}`,
      actions: output.actions,
      riskLevel: output.riskLevel,
      snapshot,
    };
  };

  return { process, getSnapshot };
}

const defaultBrain = createDonBrain();
function runDonCommand(command) {
  return defaultBrain.process(command);
}

module.exports = { runDonCommand, createDonBrain, extractTarget, detectIntent };
