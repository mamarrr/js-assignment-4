# Structure Refactor Proposal

## Current Structure Verdict

The current structure is a **good base** for a Vue 3 + TypeScript application and already shows solid modular intent.

## What is Good

- Clear domain separation under [`src/modules`](src/modules) for auth, tasks, priorities, and categories.
- Cross-cutting technical concerns are centralized under [`src/core`](src/core), especially API and auth/token handling.
- Routing concerns are isolated in [`src/router`](src/router), with dedicated guard logic.
- Reusable shared concerns are grouped in [`src/shared`](src/shared), reducing direct duplication.

## What is Bad / Risky

- [`src/modules/tasks/views/DashboardView.vue`](src/modules/tasks/views/DashboardView.vue) is oversized and combines orchestration, form logic, and UI rendering. This increases coupling and makes changes risky.
- Global stores in [`src/stores`](src/stores) are useful, but boundaries are blurred because feature reset logic in [`src/stores/reset.ts`](src/stores/reset.ts) directly depends on module stores.
- Module internals are not fully standardized. Some modules have rich `types` breakdown (`dto`, `mapper`, `model`), but folder contracts are not fully consistent across modules.
- [`src/views`](src/views) and [`src/components`](src/components) exist but are effectively unused, which may create uncertainty about where new files belong.

## High-Impact Improvements

1. **Split dashboard by responsibility**
   - Decompose [`src/modules/tasks/views/DashboardView.vue`](src/modules/tasks/views/DashboardView.vue) into:
     - `views` for route-level shell
     - `components` for task list/card/forms and taxonomy panels
     - `composables` for task form/taxonomy orchestration and validation wiring

2. **Standardize feature folder contract**
   - For each module in [`src/modules`](src/modules), use a predictable layout:
     - `views/`
     - `components/`
     - `composables/`
     - `services/`
     - `stores/`
     - `types/`
     - `index.ts` public exports

3. **Clarify global vs feature state boundaries**
   - Keep truly global concerns (for example feedback UI) in [`src/stores`](src/stores).
   - Move feature orchestration helpers like reset coordination toward a dedicated app layer (for example `src/app/session`) to avoid unclear ownership.

4. **Introduce lightweight import boundaries**
   - Enforce that modules do not import private internals of other modules directly.
   - Prefer imports through module public entry points (`index.ts`) where possible.

5. **Reduce folder ambiguity**
   - Either start actively using [`src/views`](src/views) and [`src/components`](src/components) with explicit rules, or remove/repurpose them to avoid mixed architecture styles.

## Proposed Target Direction (High-Level)

```text
src/
  app/
    providers/
    session/
  core/
    api/
    auth/
    config/
  modules/
    auth/
      views/
      components/
      composables/
      services/
      stores/
      types/
      index.ts
    tasks/
      views/
      components/
      composables/
      services/
      stores/
      types/
      index.ts
    priorities/
      views/
      components/
      composables/
      services/
      stores/
      types/
      index.ts
    categories/
      views/
      components/
      composables/
      services/
      stores/
      types/
      index.ts
  router/
  shared/
    ui/
    utils/
    validation/
```

## Conclusion

The structure is **not bad**; it is already above average for an early-stage app. The main weakness is concentration of too much responsibility in a few large files and slightly unclear ownership boundaries. Addressing these will make the codebase much easier to scale and maintain while preserving your current architecture direction.
