## Post-Mortem Report

**Avatar Battle Arena — Log-Pipeline & Type-Safety Meltdown**
*(scope: 2025-07 refactor saga)*

---

### 1 · What went wrong?  **(Root-Cause Analysis)**

| Layer                  | Symptom                                                                                   | Deep Cause                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Log schema**         | `[LOG PIPELINE] Non-dialogue fighter entry … { actor:'Aang', type:'mechanics' }` warnings | Legacy convenience calls (`logMechanics`, `logStory`, etc.) had an **optional `actor` param**. Devs routinely passed the fighter name for *every* log. No compile-time guard. |
| **Type safety**        | Linter storm after `NonEmptyString` landed                                                | The branded type was **declared in multiple modules** and imported inconsistently. TS considered two identical brands as *different* types.                                   |
| **Runtime contract**   | `Error: Empty string violates NonEmptyString contract`                                    | New runtime guard (`ensureNonEmpty`) surfaced dozens of silent “`''`” placeholders previously accepted by the UI.                                                             |
| **Tests / CI noise**   | Jest globals undefined; vitest green                                                      | We’d silently migrated to **Vitest** but kept Jest-style tests & ESLint config; overrides never set `env: jest`.                                                              |
| **Developer friction** | Huge patch-loops & broken prod build                                                      | Fixing one layer (e.g., removing `actor`) unveiled the next (empty narrative, missing turn, brand mismatch)… a classic **ice-berg of latent tech-debt**.                      |

---

### 2 · Why did it matter?  **(Impact & Risk)**

* **Player experience** – Non-dialogue logs rendered as blank grey boxes; story flow broke.
* **Analytics integrity** – Monitoring skipped malformed entries, so damage/turn & escalation stats were wrong.
* **System reliability** – Infinite stalemate loops went undetected because escalation logs were dropped.
* **Team velocity** – Every new PR tripped flaky lint/tests; “quick fixes” added more `// @ts-ignore`.
* **Brand risk** – Planned July demo would have shown empty logs and crashes on stage.

---

### 3 · How did we fix it?  **(Step-by-Step)**

| Phase                      | Key Actions                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. Containment**         | *Codemod sweep* removed `actor` from every non-dialogue log creator across 180 files.                                                      |
| **B. Contract Definition** | Introduced **discriminated union**: <br>`DialogueLog {type:'dialogue'; actor:FighterName}` vs `NonDialogueLog {actor?:never}`.             |
| **C. Type Hardening**      | Unified `NonEmptyString` in `types/index.ts`; `ensureNonEmpty` returns the branded type.                                                   |
| **D. Runtime Guards**      | Added assertions: each log **must** carry `turn` & `NonEmptyString` fields.                                                                |
| **E. Pipeline Tests**      | `battle-log-pipeline.test.ts` simulates a full battle and expects: <br>`0` non-dialogue logs with fighter actor **and** `0` empty strings. |
| **F. ESLint/TSConfig**     | Flat-config overrides: <br>`env: { vitest: true }` for `*.test.ts(x)`; <br>vite-native globals, jest removed.                              |
| **G. Final Clean-up**      | Removed residual empty-string fallbacks, added placeholder `'—'`, explicit `turn:0` in opening logs.                                       |
| **H. Green Build**         | Lint `--max-warnings=0` + `vitest run` now pass on CI.                                                                                     |

---

### 4 · What did we gain?  **(Outcomes)**

1. **100 % log-pipeline integrity**
   *Compile-time*: impossible to compile malformed logs.
   *Runtime*: assertion fires immediately in dev if someone circumvents the types.
2. **Accurate analytics** — Escalation/stalemate detection no longer silently fails.
3. **Cleaner UI** — No grey unknown tiles; dialogue bubbles only appear for actual speech.
4. **Faster dev feedback** — A single failing test pinpoints the exact field/turn that broke.
5. **Reduced reviewer load** — The linter blocks offenders before they hit PR review.

---

### 5 · How to avoid a sequel  **(Proactive Measures)**

| Guard-Rail                    | Implementation                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Contract first**         | Any new log field/type change **must ship with** a red-green test & ESLint rule. ADR-template updated to include “*compile-time guarantees*” section. |
| **2. Single-source branding** | All branded utility types live only in `types/index.ts`. `eslint-plugin-import` rule `no-internal-redeclare` now enforced.                            |
| **3. CI “canary” battle**     | GitHub Action runs a 1k-turn AI vs AI simulation; pipeline assertions break the build on first malformed entry.                                       |
| **4. Runner clarity**         | Project is now **Vitest-only**. Jest deps removed; ESLint override locks to `vitest`.                                                                 |
| **5. Codemod starter kit**    | `/codemods/` folder + docs: how to script repo-wide refactors safely.                                                                                 |
| **6. Pre-commit hook**        | `lint-staged` runs `npm run lint -- --max-warnings=0` & `vitest --run` on touched files. No more “green on my machine” incidents.                     |
| **7. Knowledge base**         | This report added to `/docs/troubleshooting-playbook.md` under “Log Pipeline Errors”.                                                                 |

---

### 6 · TL;DR for future devs

> **Never** pass a fighter `actor` to non-dialogue logs, **never** pass a plain `string` where a `NonEmptyString` is required, and **never** create a log without a `turn`.
> The compiler, linter and CI canary will catch you, but following the contract will save you (and the next dev) hours.

**Mission accomplished — let’s keep it that way.**
