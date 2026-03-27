# Filtering Implementation Plan

## Source and Alignment

This plan is derived from `plans/filtering/Requirements.md` and aligned with current project architecture boundaries:

- Vue 3 + TypeScript + Pinia + Vue Router
- Business logic outside view components
- Existing centralized auth and HTTP security flow remains unchanged

## Objectives

1. Add robust task filtering to dashboard tasks using a left sidebar experience.
2. Support all required filter dimensions from requirements, including text, category, priority, tags, completion, archive, and due-date conditions.
3. Keep filtering logic centralized in store/composable utilities, not in view templates.
4. Preserve current security boundaries and unauthorized handling behavior.
5. Deliver responsive and accessible behavior across desktop, tablet, and mobile.
6. Maintain near-instant interaction quality for normal dashboard dataset sizes.

## Architecture Approach

### Architectural stance

- **No auth/security rewiring**: filtering is client-side state derivation over already authorized task data.
- **Separation of concerns**:
  - Filtering state and derived selectors live in task-focused Pinia/composable layer.
  - Dashboard view composes layout regions.
  - Filter UI components only collect user intent and emit state changes.
- **Progressive extensibility**:
  - Keep filter criteria model reusable for future server-side query mapping.

### Likely project areas to touch in code mode

- Task state and selectors: `src/modules/tasks/stores/tasks.store.ts`
- Dashboard page composition: `src/modules/tasks/views/DashboardView.vue`
- Tasks panel consumption of filtered items: `src/modules/tasks/components/DashboardTasksPanel.vue`
- Dashboard data bootstrapping/persistence hook: `src/modules/tasks/composables/use-dashboard-bootstrap.ts`
- Optional shared utilities/composable target area under `src/modules/tasks/composables/` for pure filter logic

## Data Model and State Plan for Filters

Define a dedicated filter state shape in task domain state or dedicated tasks filtering composable.

### Filter state shape

- `globalText: string`
- `nameText: string`
- `descriptionText: string` future-ready if description field appears in model mapping
- `categoryIds: string[]`
- `includeNoCategory: boolean`
- `priorityIds: string[]`
- `includeNoPriority: boolean`
- `tags: string[]` plus optional `tagText` bridge until explicit tags model exists
- `completion: all | completed | notCompleted`
- `archive: all | active | archived`
- `dueDateFrom: string | null`
- `dueDateTo: string | null`

### Derived state selectors

- `hasActiveFilters`
- `activeFilterCount`
- `activeFilterChips`
- `filteredItems`
- `resultSummary` such as `Showing X of Y tasks`

### Persistence policy

- Minimum requirement: in-memory persistence while dashboard remains mounted.
- Recommended enhancement: optional localStorage-backed filter snapshot keyed by authenticated user id, restored on dashboard return.

## UI Composition Plan

### Layout structure

Rework dashboard into a 3-region grid:

1. Left: filter panel
2. Center: task cards panel
3. Right: existing priorities and categories mini-panels

### Componentization plan

Introduce focused filter UI building blocks in task module:

- `DashboardFiltersPanel` as container
- Smaller field groups for text, taxonomy, state, and date sections
- `ActiveFilterChips` row with per-chip remove
- `FilterResultSummary` near task list header

### Interaction details

- Text inputs: instant filtering with debounce.
- Selection toggles: immediate apply.
- Provide reset all and per-field clear actions.
- Include explicit empty-results helper with quick reset action.
- Show dependency microstates for category and priority source data:
  - loading
  - empty source
  - fetch failure fallback

## Responsive Behavior Plan

### Desktop at least 1024

- Persistent left sidebar visible by default.
- Sticky behavior for filter panel while task list scrolls.

### Tablet 768 to 1023

- Compact, collapsible left sidebar.
- Preserve active chip visibility and reset affordance without taking central space.

### Mobile below 768

- Replace persistent sidebar with filter drawer or bottom sheet triggered by a visible Filter button.
- Keep result summary and active filter indication visible in task area.
- Trap focus inside drawer while open and return focus to trigger on close.

## Filter Semantics and Algorithm

### Matching semantics

- Across different fields: AND semantics.
- Within multiselect field values: OR semantics.
- Empty filter state returns default dashboard list behavior.

### Evaluation order for efficiency

1. Archive and completion quick boolean checks
2. Category and priority set membership checks
3. Due date range checks
4. Tag checks
5. Debounced text checks global and dedicated fields

This ordering minimizes string operations by short-circuiting earlier on cheaper predicates.

### Date handling rules

- Normalize date comparisons at consistent timezone boundary.
- Treat invalid or missing dates defensively.
- Presets like Today, Next 7 days, Overdue map into the same date-range predicate pipeline.

### Model compatibility handling

Current task model includes `name`, `dueAt`, `completed`, `archived`, `categoryId`, `priorityId`, and no explicit `description` or `tags` field naming.

Plan behavior:

- Implement filters only against available mapped practical task-facing fields immediately.
- Keep placeholder-safe state for missing optional fields so UI can hide or disable unsupported controls without breaking architecture.
- Document future mapping path for task-facing fields if API model expands.

## Performance Strategy

1. Debounce text criteria updates.
2. Keep pure predicate builder and memoized computed selectors in store or composable layer.
3. Avoid recreating heavy lookup structures on every render by precomputing maps and sets.
4. Keep task card list rendering fed by one derived filtered array.
5. Preserve stable keys and avoid unnecessary reactive churn in panel components.
6. Define threshold for optional server-side filtering migration when dataset grows.

## Accessibility Plan

1. Ensure all controls have explicit labels and meaningful group legends.
2. Maintain keyboard-first operation for every filter control and clear action.
3. Use aria-expanded and aria-controls on collapsible groups.
4. Expose result count region via polite live region updates.
5. Ensure color contrast and visible focus indicators across normal, active, and error states.
6. On mobile drawer open, move focus to first interactive control; on close, restore focus to trigger.

## Testing Strategy

### Unit tests

- Predicate utility tests for each filter field.
- Combined AND and OR semantics coverage.
- Date edge cases timezone and null values.
- Active chips generation and clear behavior.

### Store or composable tests

- Filter state mutations.
- Derived selectors counts and summaries.
- Persistence and restoration behavior if localStorage mode is enabled.

### Component tests

- Left panel renders expected groups.
- Reset all and per-field clear interactions.
- Mobile drawer focus and keyboard behavior.
- Empty, loading, and error UI states for dependent sources.

### End-to-end smoke

- Authenticated user reaches dashboard, applies multiple filters, sees predictable results.
- Refresh or navigation return preserves session-scoped filters.
- Unauthorized behavior still follows centralized logout and redirect flow.

## Rollout Steps

### Phase 1: Domain and state foundation

- Introduce filter criteria type and defaults.
- Add actions for set, clear field, reset all.
- Add derived selectors filtered list, chips, summary.

### Phase 2: Filter algorithm and utilities

- Implement predicate builder and field match helpers.
- Add debounce handling strategy for text fields.
- Add date preset mapping helpers.

### Phase 3: Dashboard UI integration

- Add left sidebar panel and field groups.
- Wire center tasks panel to derived filtered list.
- Add summary and empty-results guidance.

### Phase 4: Responsive and accessibility hardening

- Desktop sticky layout.
- Tablet collapse mechanics.
- Mobile drawer focus management and keyboard behavior.

### Phase 5: Validation and stabilization

- Execute unit, component, and smoke checks.
- Verify acceptance criteria and architecture boundaries.
- Document any non-blocking deferred enhancements.

## Risks and Mitigations

1. **Risk**: Filter UI grows too complex and leaks business logic into components.  
   **Mitigation**: Keep predicate creation and filtering in composable or store selectors only.

2. **Risk**: Current task model lacks some requirement fields such as tags and description.  
   **Mitigation**: Implement capability-aware controls and clearly gate unavailable filters behind model availability.

3. **Risk**: Performance degradation with many tasks and frequent text input updates.  
   **Mitigation**: Debounce text input, short-circuit predicate order, avoid repeated expensive transforms.

4. **Risk**: Responsive layout conflicts with existing right-side mini-panels.  
   **Mitigation**: Introduce explicit grid areas and breakpoint-specific composition tests.

5. **Risk**: Accessibility regressions in collapsible groups and mobile drawer.  
   **Mitigation**: Add keyboard and focus acceptance checks in component tests.

## Definition of Done

Filtering implementation is done when all below are true:

1. Left-side filtering UI is available on dashboard and adapts by breakpoint as specified.
2. Required filters work with defined AND and OR semantics.
3. Users can clear individual filters and reset all filters.
4. Active filter chips and result summary are visible and accurate.
5. Empty, loading, and error states are clearly communicated.
6. Filtering logic resides outside view templates in store or composable utilities.
7. No changes break centralized auth security behavior.
8. Tests cover core predicate logic, integration behavior, and accessibility-critical interactions.
9. Acceptance criteria from requirements document are satisfied.

## Task Breakdown Checklist for Code Mode

- [ ] Add task filtering criteria types and default state in task domain.
- [ ] Implement pure filter predicate utilities and date preset helpers.
- [ ] Add derived selectors for filtered tasks, chips, counts, and summary.
- [ ] Build dashboard left filter panel components and field groups.
- [ ] Integrate panel into dashboard 3-column layout with right mini-panels preserved.
- [ ] Wire tasks list rendering to filtered selector output.
- [ ] Add reset all and per-field clear flows.
- [ ] Implement responsive behavior desktop sidebar, tablet collapse, mobile drawer.
- [ ] Implement accessibility behaviors labels, keyboard flow, aria updates, focus management.
- [ ] Add unit, component, and smoke end-to-end tests for filtering behavior.
- [ ] Validate all acceptance criteria from requirements and close rollout notes.
