# Don — Stateful Execution-Grade Mobile Brain

Don is a React Native + Expo app designed as an execution-grade assistant with lock-screen voice UX, stateful operations, and policy-aware automation.

## What Don does now

- **Stateful command execution engine** with persistent memory for tasks, workflows, budgets, provider links, and audit events.
- **Execution pipeline tracking** where each command emits a structured execution record (`exec-*`) with deterministic step history.
- **Lock-screen voice mode UI** with wake-word style panel, animated voice orb, and hold-to-speak trigger behavior.
- **Integration registry** for `calendar`, `email`, `tasks`, `banking`, `files`, and `devices` using `connect <provider>` commands.
- **Policy-gated finance control** that blocks high-value spend without explicit approval phrase.
- **Operational telemetry dashboard** with autonomy, risk, tasks, flows, providers, and execution counters.

## Example commands

- `connect banking integration`
- `manage launch prep tomorrow at 8 am`
- `spend 900 from travel budget`
- `spend 900 from travel budget approve`
- `automate morning routine`
- `assess risk now`

## Architecture

- `App.js` — mobile UI, lock-screen voice interaction, animation, telemetry cards, command timeline.
- `src/donEngine.js` — stateful Don brain with intent routing, policy engine, provider registry, execution queue, and snapshots.
- `test/donEngine.test.js` — unit tests for intent parsing, policy behavior, provider linking, and execution tracking.

## Run locally

```bash
npm install
npm run start
```

## Run tests

```bash
npm test
```

## Notes

This implementation provides a lock-screen **experience** in-app. True OS-level lock-screen voice execution requires platform-native integration and permissions outside this Expo-only repo.
