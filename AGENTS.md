## Project

**VUE3 app task manager app**
Write an VUE3 frontend app, against https://taltech.akaver.com/ backend, ToDo entities. Implement JWT and refresh token based security. Use router and pinia.

App will be deployed later with docker onto a VPS

Main point here to is implement decent project base implementation with full-blown security. Later you can reuse most of it in your personal project.

## Todo entity explanation

The application is for task management, there are Todo's, Categories and Priorities. Users can see their tasks, add new tasks, edit tasks, delete tasks. Users can mark their task as complete, put a due date, also they can archive tasks to hide them. Also they have their own categories and priorities, which they can create, edit, delete in the same way. But the main point of the app is the task management, not category or priority management.

## Backend entities

The backend entities which api we need and for what we are building the app are TodoTasks, TodoPriorities, TodoCategories. All other backend entities are not for this application.

## Authentication, Authorization

User registers to the backend from the frontend using the Login, Register, RefreshToken API calls to the backend.

## Priority

Priority of this project is to implement end to end security. Security using JWT and refresh token is of highest priority and should be thought about and discussed deeply, how to do it.

## UI and UX

The UI should be energetic, responsive and easy to use. This is a single page application. The WebApp should have proper navigation between Register, Login and Dashboard. Also when user is logged in there is the Logout button. The main dashboard has in the middle Cards, each task has a Card. The card includes the information about the task, edit button and delete button. On the right of the main dashboard there are small "Cards" for priority and category management. There is no list of Priorities and Categories directly on the main dashboard, but the user can open a dropdown menu of either priority or category, where the user can perform CRUD operations on those entities. The UI should be responsive in a way, that when an user does an action, then the application gives a energetic and beautiful response that the action has been done or when there is an error then show an error and say what the user has to do differently.

## Technical baseline

- Use Vue 3 + TypeScript with Pinia and Vue Router.
- Keep business logic out of view components.
- Use a single API client/service layer for all HTTP calls.

## API contract and scope

- Backend base URL: https://taltech.akaver.com/
- Use API versioned paths `/api/v{version}/...` and keep version configurable.
- In-scope auth endpoints: `Account/Login`, `Account/Register`, `Account/RefreshToken`.
- In-scope domain entities for this app only: `TodoTasks`, `TodoPriorities`, `TodoCategories`.
- Out-of-scope backend entities should not be implemented in the frontend.

## Security architecture (mandatory)

- Use JWT access token + refresh token flow.
- For this project phase, store tokens in localStorage.
- Keep token key names centralized as constants.
- Add request interceptor/middleware to attach `Authorization: Bearer <accessToken>`.
- Add response interceptor/middleware for `401` handling:
  - Attempt refresh token exactly once.
  - Retry original request once after successful refresh.
  - If refresh fails, clear session and redirect to Login.
- Prevent parallel refresh race conditions (single-flight refresh process + request queue/replay).
- Protect private routes (Dashboard, Todo management) with route guards.
- Redirect authenticated users away from guest-only pages (Login/Register).

## State management boundaries

- Auth store: session state, login/register/logout/refresh actions.
- TodoTasks store: task CRUD, complete/archive operations.
- TodoPriorities store: CRUD operations.
- TodoCategories store: CRUD operations.
- Do not duplicate auth/session state across multiple stores.

## UI/UX feedback and error policy

- Every mutating action must show visible success or failure feedback.
- Show backend validation messages in user-friendly form.
- Standardize loading, empty, and error states for pages and cards.
- Unauthorized state should always produce consistent logout + redirect behavior.

## Environment and configuration

- Keep API URL and API version in environment variables.
- Do not hardcode environment-specific URLs in components.
- Keep security-sensitive behavior centralized in auth/API modules.

## Implementation plan

Implementation-plan content was moved to `plans/IMPLEMENTATION_PLAN.md`.



