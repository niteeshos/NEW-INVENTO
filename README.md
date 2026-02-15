# DON — Extreme Utility Mobile Command System

DON is a React Native + Expo mobile assistant that behaves like an execution engine, not just a chat demo.

## What DON can do now

- **Open orchestration:** open/launch contexts and preload follow-up actions.
- **Spend operations:** parse spend commands, map categories, enforce budget guardrails, and flag overspend risk.
- **Read intelligence:** produce concise summaries with prioritized next steps from current in-memory state.
- **Manage planning:** build task plans with outcomes, deep-work blocks, and review checkpoints.
- **Automate routines:** register automations with triggers, retries, and escalation policy.
- **Assess risk:** evaluate workload, open loops, automations, and budget pressure.

## Runtime model

DON uses a persistent runtime in-app (`createDonRuntime`) so every command updates shared state:

- opened apps
- active tasks
- active automations
- spend ledger + budget tracking

This gives conversational continuity across commands.

## Run

```bash
npm install
npm run start
```

## Test

```bash
npm test
```

## Security note

This app executes **simulated operations** locally. For production autonomy, connect authenticated integrations (calendar, mail, payments, files, IoT) and keep explicit confirmation + permission controls.
