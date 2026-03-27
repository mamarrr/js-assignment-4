# Filtering Requirements – Dashboard Left Sidebar

## 1) Purpose

Define functional and UX requirements for task filtering on the main dashboard so users can quickly find tasks using practical task-facing fields while keeping the interface energetic, beautiful, and responsive.

## 2) Scope

Filtering applies to **TodoTasks** shown in the dashboard task cards area.

In scope:

- Free text filtering
- Property-based filtering for practical task-facing fields
- Left-side filter panel in dashboard layout
- Responsive behavior for desktop/tablet/mobile
- Accessible and performant interaction model

Out of scope:

- Backend entity changes
- Replacing current task CRUD flows
- Non-task entity list filtering outside dashboard context

## 3) Dashboard Placement and Layout

- Filtering UI is placed on the **left side** of the main dashboard.
- Center area remains focused on task cards.
- Right side remains for priority/category management mini-panels as already defined.
- Left filter panel must be:
  - Sticky or easily reachable while scrolling task cards.
  - Visually separated as a card/panel with clear hierarchy.
  - Collapsible on smaller viewports.

## 4) Filterable Properties

User must be able to filter by practical task-facing properties. Minimum required filters:

1. **Free text (global search)**
   - Matches across task text fields (at least title/name, description, and tags).
   - Case-insensitive.
   - Supports partial matching.

2. **Name/Title**
   - Dedicated text filter for task title/name.

3. **Description**
   - Dedicated text filter for description.

4. **Category**
   - Single-select or multi-select from user categories.
   - Includes “No category” option if task category can be empty.

5. **Priority**
   - Single-select or multi-select from user priorities.
   - Includes “No priority” option if task priority can be empty.

6. **Tag(s)**
   - Match by one or more tags.
   - Supports contains-style text input and/or selectable known tags.

7. **Completion state**
   - `All | Completed | Not completed`

8. **Archive state**
   - `All | Active (not archived) | Archived`

9. **Due date**
   - Optional date-range filter (`from` / `to`).
   - Supports quick presets (Today, Next 7 days, Overdue) if available.

## 5) Filter Semantics

- Filters combine using **AND** logic across different fields.
- Multi-select values within one field use **OR** logic by default.
- Empty filter state shows full task list (subject to existing dashboard defaults).
- Filtering updates results quickly without full page reload.
- Changing filters resets pagination/view slices consistently (if pagination exists).

## 6) Interaction Requirements

- Provide a clear **Apply/instant filtering** behavior (preferred: instant with debounce for text input).
- Provide **Reset all filters** action.
- Provide per-field clear action where relevant.
- Show active filter chips/tokens with remove action.
- Show result summary, e.g., `Showing 8 of 42 tasks`.
- Persist filter state during dashboard session/navigation return (minimum in-memory; optional localStorage persistence).

## 7) UI/UX Requirements

- Visual style must match app’s energetic design language.
- Panel sections are grouped with clear labels and spacing.
- Inputs include loading/empty/error microstates when dependencies (categories/priorities) are not available.
- Feedback must be immediate and understandable:
  - Empty results state with friendly guidance and quick reset action.
  - Error state if filter-related data loading fails.
- Animations/transitions should be subtle and performant.

## 8) Responsive Requirements

- **Desktop (≥1024px):** persistent left sidebar.
- **Tablet (768–1023px):** compact/collapsible sidebar.
- **Mobile (<768px):** filter drawer/sheet opened from a visible Filter button; retains usability without crowding task cards.
- Touch targets follow accessibility-friendly sizing.

## 9) Accessibility Requirements

- Keyboard operable controls and logical tab order.
- Proper labels for all filter fields.
- ARIA support for collapsible groups and dynamic result count updates.
- Sufficient color contrast in all states.
- Focus management for mobile drawer open/close.

## 10) Performance Requirements

- Text inputs use debounce to avoid excessive recomputation.
- Filtering should feel near-instant for normal dashboard-sized datasets.
- Avoid unnecessary re-renders in task list/cards.

## 11) Technical/Architecture Requirements

- Keep filtering business logic out of Vue view templates/components.
- Implement filtering logic in store/composable selectors and reusable utilities.
- Reuse centralized API/service layer if server-side filtering is introduced later.
- Keep implementation compatible with existing Vue 3 + TypeScript + Pinia + Router architecture.

## 12) Security and Data Handling

- Filtering must not bypass auth/session constraints.
- Unauthorized state behavior remains consistent: session clear + redirect logic controlled by centralized auth/API handling.
- No sensitive data should be exposed in UI debug traces or errors.

## 13) Acceptance Criteria

1. User can open dashboard and filter tasks from a left-side filter panel.
2. User can filter by free text, name/title, description, category, priority, tag, completion state, archive state, and due date.
3. Multiple filters can be active simultaneously with predictable AND semantics.
4. User can clear individual filters and reset all filters.
5. UI remains beautiful, responsive, and usable on desktop/tablet/mobile.
6. Empty, loading, and error states are clearly communicated.
7. Filtering interactions are accessible by keyboard and screen-reader friendly.
8. Filtering implementation follows project architecture boundaries (logic outside views).

## 14) Future-Ready Notes (Non-blocking)

- Add server-side query mapping for large datasets.
- Save user-specific filter presets.
- Add advanced boolean filter builder for power users.
