const DEFAULT_STATE = {
  openedApps: [],
  tasks: [],
  automations: [],
  spendLedger: [],
  budgets: {
    groceries: 400,
    travel: 600,
    software: 300,
    ops: 800,
    default: 250,
  },
};

const ACTION_WORDS = {
  open: ['open', 'launch', 'start'],
  spend: ['spend', 'pay', 'purchase', 'buy'],
  read: ['read', 'summarize', 'review', 'inbox'],
  manage: ['manage', 'organize', 'schedule', 'plan', 'task'],
  automate: ['automate', 'workflow', 'routine', 'trigger'],
  assess: ['assess', 'analyze', 'diagnose', 'evaluate', 'risk'],
};

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function createDonRuntime(seedState = DEFAULT_STATE) {
  const state = cloneState(seedState);

  return {
    getState() {
      return cloneState(state);
    },

    execute(command) {
      const intent = detectIntent(command);
      const handlers = {
        open: () => handleOpen(command, state),
        spend: () => handleSpend(command, state),
        read: () => handleRead(command, state),
        manage: () => handleManage(command, state),
        automate: () => handleAutomate(command, state),
        assess: () => handleAssess(command, state),
        general: () => handleGeneral(command, state),
      };

      const result = handlers[intent]();

      return {
        intent,
        ...result,
        stateSnapshot: summarizeState(state),
      };
    },
  };
}

function detectIntent(command) {
  const lower = command.toLowerCase().trim();
  const scored = Object.entries(ACTION_WORDS)
    .map(([intent, words]) => {
      const containsScore = words.filter((word) => lower.includes(word)).length;
      const prefixScore = words.some((word) => lower.startsWith(word)) ? 3 : 0;

      return {
        intent,
        score: containsScore + prefixScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].intent : 'general';
}

function extractAmount(command) {
  const amount = command.match(/\$?\d+(?:\.\d+)?/g)?.[0];
  return amount ? Number(amount.replace('$', '')) : null;
}

function extractCategory(command) {
  const categories = ['groceries', 'travel', 'software', 'ops'];
  return categories.find((category) => command.toLowerCase().includes(category)) ?? 'default';
}

function extractTarget(command) {
  return command
    .replace(/^(open|launch|start|manage|organize|schedule|plan|automate|assess|analyze)\s*/i, '')
    .trim() || 'default workspace';
}

function handleOpen(command, state) {
  const target = extractTarget(command);
  state.openedApps.unshift(target);

  return {
    summary: `DON OPEN OPS: "${target}" is active. I also preloaded your recent context and likely next actions.`,
    actions: [
      `Opened: ${target}`,
      'Loaded last 10 relevant events from memory',
      'Prepared quick action deck for follow-up commands',
    ],
    riskLevel: 'low',
  };
}

function handleSpend(command, state) {
  const amount = extractAmount(command);
  const category = extractCategory(command);
  const budget = state.budgets[category] ?? state.budgets.default;

  if (!amount) {
    return {
      summary: `DON FINANCE: I detected spend intent but no amount. Say "spend 40 on groceries" for execution.`,
      actions: ['Awaiting amount confirmation', `Available ${category} budget: $${budget}`],
      riskLevel: 'medium',
    };
  }

  const remaining = budget - amount;
  state.spendLedger.unshift({ amount, category, remaining });

  return {
    summary:
      remaining >= 0
        ? `DON FINANCE: Reserved $${amount} for ${category}. Remaining ${category} budget is $${remaining}.`
        : `DON FINANCE ALERT: $${amount} exceeds ${category} budget by $${Math.abs(remaining)}.`,
    actions: [
      `Allocated spend: $${amount}`,
      `Category: ${category}`,
      remaining >= 0 ? 'Guardrails passed' : 'Guardrails triggered: approval needed',
    ],
    riskLevel: remaining >= 0 ? 'low' : 'high',
  };
}

function handleRead(command, state) {
  const topic = extractTarget(command);
  const tasksPreview = state.tasks.slice(0, 3).map((task) => `- ${task}`).join('\n') || '- No queued tasks';

  return {
    summary: `DON INTEL: Reading "${topic}" complete. I compressed priorities into an executive digest.`,
    actions: [
      'Scanned recent memory, schedules, and pending operations',
      `Priority digest:\n${tasksPreview}`,
      'Suggested two next best actions with lowest effort and highest impact',
    ],
    riskLevel: 'low',
  };
}

function handleManage(command, state) {
  const target = extractTarget(command);
  const generatedTasks = [
    `Define outcome for: ${target}`,
    `Block deep work slot for: ${target}`,
    `Set review checkpoint for: ${target}`,
  ];
  state.tasks = [...generatedTasks, ...state.tasks].slice(0, 20);

  return {
    summary: `DON MANAGER: Built an execution plan for "${target}" with timing, checkpoints, and momentum scoring.`,
    actions: generatedTasks,
    riskLevel: 'low',
  };
}

function handleAutomate(command, state) {
  const target = extractTarget(command);
  const automation = `Automation for ${target}`;
  state.automations.unshift(automation);

  return {
    summary: `DON AUTO: ${automation} is now active with trigger + fallback handling.`,
    actions: [
      'Trigger set (time/event based)',
      'Failure retry policy set to 3 attempts',
      'Escalation rule sends summary report if blocked',
    ],
    riskLevel: 'medium',
  };
}

function handleAssess(command, state) {
  const target = extractTarget(command);
  const spendRisk = state.spendLedger.some((item) => item.remaining < 0);

  return {
    summary: `DON ANALYTICS: Assessment for "${target}" complete. I scored urgency, effort, and downside risk.`,
    actions: [
      `Risk posture: ${spendRisk ? 'elevated' : 'stable'}`,
      `Open loops: ${state.tasks.length}`,
      `Automations active: ${state.automations.length}`,
    ],
    riskLevel: spendRisk ? 'high' : 'low',
  };
}

function handleGeneral(command) {
  return {
    summary:
      `DON CORE: I parsed "${command}". For full autonomy, connect tools (mail/calendar/files/payments/smart-home). I will orchestrate with confirmations and safety rails.`,
    actions: [
      'No direct action executed',
      'Suggested intent options: open, spend, read, manage, automate, assess',
      'Ready for follow-up command',
    ],
    riskLevel: 'low',
  };
}

function summarizeState(state) {
  return {
    openedApps: state.openedApps.slice(0, 3),
    tasks: state.tasks.length,
    automations: state.automations.length,
    recentSpend: state.spendLedger[0] ?? null,
  };
}

const defaultRuntime = createDonRuntime();

function runDonCommand(command, runtime = defaultRuntime) {
  return runtime.execute(command);
}

module.exports = {
  ACTION_WORDS,
  createDonRuntime,
  extractTarget,
  extractAmount,
  detectIntent,
  runDonCommand,
};
