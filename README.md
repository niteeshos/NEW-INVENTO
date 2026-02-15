# Don — Fully Voice-Automated Execution Brain

Don is a React Native + Expo app built around a wake-word-first automation pipeline.

## Fully voice automated behavior

- Wake phrase support (`Don ...`) via a dedicated voice command pipeline.
- Wake-word validation and transcript parsing before command execution.
- Autonomous follow-up chaining:
  - voice `manage`/`automate` commands auto-run a `read status` follow-up.
  - risky voice `spend` commands auto-run an `assess risk` follow-up.
- Spoken responses for each executed step using `expo-speech`.
- Lock-screen-style voice panel with animated orb and voice-ready state.

## Stateful execution engine

- Persistent memory for tasks, workflows, budgets, providers, and audits.
- Policy gate for high-value spending (requires approval phrase).
- Execution tracking (`exec-*`) and operational telemetry snapshots.

## Example voice transcripts

- `Don manage launch prep tomorrow at 8 am`
- `Don automate my morning routine`
- `Don spend 900 from travel budget`
- `Don spend 900 from travel budget approve`
- `Don connect banking integration`

## Files

- `App.js` — voice-first UI with lock-screen panel and automated voice pipeline.
- `src/donEngine.js` — command brain, wake-word parser, policy logic, and execution state.
- `test/donEngine.test.js` — tests for wake-word behavior, autonomous follow-ups, and policy execution.

## Run

```bash
npm install
npm run start
npm test
```

## Note

This repository implements a complete **voice automation pipeline inside the app**. True OS-level background/lock-screen microphone capture still requires platform-native permissions/integration beyond this Expo-only baseline.
