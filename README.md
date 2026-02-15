# Don — Autonomous Mobile Command Center

Don is a React Native + Expo mobile app focused on practical autonomy, not a starter demo.

## Built-in capabilities

- **Stateful command brain:** context is preserved across commands.
- **Provider integration layer:** built-in connect flow for `calendar`, `email`, `tasks`, `banking`, `files`, and `devices`.
- **Policy-gated spending:** high-value spending requests require explicit approval keywords.
- **Operational dashboard:** live autonomy/risk/tasks/workflows/provider/audit metrics.
- **Audit logging:** key actions are recorded for compliance and traceability.
- **Voice feedback:** Don speaks execution summaries after each command.

## Supported command patterns

- `connect banking`
- `manage launch prep tomorrow at 8 am`
- `spend 60 from groceries budget`
- `spend 900 from travel budget approve`
- `automate morning routine`
- `assess risk now`

## Architecture

- `App.js` — mobile UI, dashboard, command input, response timeline.
- `src/donEngine.js` — stateful autonomous brain with intent routing, provider registry, policy engine, handlers, and snapshots.
- `test/donEngine.test.js` — behavior tests for intents, policy blocks, spending risk, queueing, and provider connect flow.

## Run locally

```bash
npm install
npm run start
```

## Run tests

```bash
npm test
```
