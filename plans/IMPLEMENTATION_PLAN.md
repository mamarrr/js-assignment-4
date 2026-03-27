# Implementation Plan

## 1) Project scope and objectives

- Build a Vue 3 + TypeScript SPA task manager against `https://taltech.akaver.com/`.
- In-scope backend areas only:
  - Auth: `Account/Login`, `Account/Register`, `Account/RefreshToken`
  - Domain: `TodoTasks`, `TodoPriorities`, `TodoCategories`
- Security is the top priority: robust JWT + refresh token lifecycle.

## 2) Planning assumptions and constraints

- Frontend-only in this phase; backend is treated as an immutable contract.
- API version must be configurable through environment variables.
- Security behavior must be deterministic and centralized.
- No per-component token handling.

## 3) Technical baseline and architecture boundaries

- Use Vue 3 + TypeScript with Pinia and Vue Router.
- Keep business logic out of view components.
- Use a single API client/service layer for HTTP calls.
- Do not duplicate auth/session state across stores.

### Target project structure

- `src/core`: API client, interceptors, token storage helpers, shared error mapper.
- `src/modules/auth`: auth store, auth service, auth types, auth views.
- `src/modules/tasks`: task store, task service, task types, task UI components.
- `src/modules/priorities`: priority store/service/types/UI.
- `src/modules/categories`: category store/service/types/UI.
- `src/router`: route records and route guards only.
- `src/shared`: reusable UI, validators, formatters, constants.

Rule: views compose stores/services; business rules remain in stores/services.

## 4) Environment and API configuration

- Keep API URL and API version in environment variables.
- Do not hardcode environment-specific URLs in components.
- Keep security-sensitive behavior centralized in auth/API modules.

## 5) API contract mapping policy

- Maintain one typed endpoint map for all used endpoints.
- For each endpoint define request DTO, response DTO, and UI mapper.
- Never bind raw API response objects directly in templates.
- Normalize dates and nullable fields in mappers.

## 6) Security architecture (mandatory)

- Use JWT access token + refresh token flow.
- Store tokens in localStorage for this phase.
- Keep token key names as centralized constants.
- Attach `Authorization: Bearer <accessToken>` in a centralized request interceptor.
- Add centralized 401 handling in response interceptor:
  - Attempt refresh exactly once.
  - Retry original request once after successful refresh.
  - If refresh fails, clear session and redirect to Login.
- Prevent parallel refresh race conditions with single-flight refresh + queued request replay.
- Protect private routes (Dashboard + todo management) with route guards.
- Redirect authenticated users away from guest-only pages (Login/Register).

## 7) Authentication/session lifecycle scenarios (must implement)

### App bootstrap

- If tokens exist, restore session state and optionally fetch user context.
- If access token is expired but refresh token exists, execute refresh flow once before failing.

### Request flow

- Attach bearer token in centralized interceptor.

### 401 flow

- Acquire single-flight refresh lock.
- Queue parallel failed requests while refresh is running.
- Replay queued requests after refresh success.
- On refresh failure, clear session, reject queued requests, redirect to Login.

### Refresh token rotation

- Replace both access token and refresh token atomically on refresh success.
- Treat refresh response without a new refresh token as refresh failure.

### Logout flow

- Clear all auth-related localStorage keys.
- Reset auth and feature stores.
- Navigate to Login.

### Multi-tab consistency

- Listen to storage events and force logout in other tabs when session is cleared.

## 8) State management boundaries

- Auth store: session state, login/register/logout/refresh actions.
- TodoTasks store: CRUD + complete/archive operations.
- TodoPriorities store: CRUD operations.
- TodoCategories store: CRUD operations.

## 9) UI/UX behavior and feedback policy

- Energetic, responsive, easy-to-use SPA.
- Navigation: Register, Login, Dashboard; Logout visible when authenticated.
- Dashboard layout:
  - Task cards in main area (task info + edit/delete actions).
  - Priority/category management cards on the right with dropdown CRUD UX.
- Every mutating action must show visible success/failure feedback.
- Show backend validation messages in user-friendly form.
- Standardize loading, empty, and error states across pages/cards.
- Disable submit actions during pending requests to prevent duplicates.
- Unauthorized state must trigger consistent logout + redirect behavior.

## 10) Validation and error handling matrix

### Validation

- Define field-level validation for login/register/task/category/priority forms.
- Show inline validation before submit; backend validation after submit.
- Use a consistent toast/alert pattern for operation feedback.

### Error mapping

- 400: show validation/business message.
- 401: trigger centralized unauthorized handling policy.
- 403: show forbidden message and keep session.
- 404: show not-found state.
- 409: show conflict guidance.
- 5xx/network: show retry-friendly generic error.
- Log technical details to console only in development mode.

## 11) Delivery phases and acceptance criteria

### Phase 1: Foundation

- Scaffold app, router, pinia, env config, API client skeleton.

### Phase 2: Security core

- Implement login/register/logout, token storage, interceptor, refresh single-flight flow.

### Phase 3: Domain CRUD

- Complete TodoTasks flows first, then TodoPriorities and TodoCategories CRUD.

### Phase 4: UX hardening

- Unify feedback patterns, loading/empty/error states, and form validation polish.

### Phase 5: Verification

- Run lint, type-check, and production build; complete release checklist.

## 12) Definition of done

- Register, Login, RefreshToken, Logout flows work end-to-end.
- Session restore on page reload works from stored tokens.
- Protected routes are inaccessible without valid auth.
- TodoTasks, TodoPriorities, TodoCategories CRUD is implemented and wired to backend.
- Acceptance criteria for all phases are met.
- Unauthorized/token-expiry scenarios are reproducibly verified.
- No business logic remains in view components.
- Configurable API URL/version is confirmed through env variables.
- Lint, type-check, and production build succeed.

## 13) Open questions tracker

- Confirm exact backend DTO field expectations and enum values from `backend-api.json`.
- Confirm final token payload fields required by UI.
- Confirm refresh-token rotation is enforced and treated as mandatory token replacement.
