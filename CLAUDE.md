# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A habit-tracking / social platform with three independent services in one repo:

- **`backend/`** — Django + DRF REST API (auth, goals/streaks, posts/follows). Source of truth, owns the database.
- **`analytics/`** — FastAPI read-only microservice (leaderboard endpoints) that queries the same database via SQLAlchemy, independent of Django.
- **`frontend/`** — React 18 + TypeScript + Vite SPA, talks to the Django API only (not to analytics).

These are developed and run independently; there is no shared build system tying them together.

## Commands

### Backend (Django, from `backend/`)

Dependencies are managed at the repo root via `uv` (see root `pyproject.toml`, Python 3.14 pinned in `.python-version`).

```bash
uv sync                                   # install/sync dependencies (run from repo root)
uv run python backend/manage.py runserver
uv run python backend/manage.py makemigrations <app>
uv run python backend/manage.py migrate
uv run python backend/manage.py createsuperuser
```

Requires `backend/.env` (see `backend/env.example`) with at least `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` — `settings.py` calls `.split(',')` on these directly with no defaults, so an unset var raises at import time, not a silent fallback.

### Tests (pytest, from repo root)

Test config lives in root `pyproject.toml` (`[tool.pytest.ini_options]`), not in `backend/`. `pythonpath` is set to `backend` and `backend/apps` so app imports (`from goals.models import ...`) work without a `backend/` prefix.

```bash
uv run pytest                                          # full suite; coverage report is on by default
uv run pytest backend/apps/goals/tests/test_track1_goals.py
uv run pytest backend/apps/goals/tests/test_track1_goals.py::TestClassName::test_name
uv run pytest -k "reactivate"                          # match by test name
```

Default `addopts` restricts coverage reporting to `--cov=users` — override with `uv run pytest --cov=goals ...` etc. when working in another app. Tests live under each app's `tests/` package (`goals`, `users`) with shared fixtures in `conftest.py` (`api_client`, `auth_client`, `user`, `another_auth_client`, `dummy_image`, ...). `posts` and `social` currently only have stub `tests.py` files.

### Analytics (FastAPI, from `analytics/`)

```bash
uv run uvicorn analytics.main:app --reload --port 8001
```

Reads `DB_NAME`/`DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT` env vars for Postgres; if `DB_NAME` is unset it falls back to the Django SQLite file at `../backend/db.sqlite3` (see `analytics/config.py`). This service is read-only — do not add write endpoints or migrations here.

### Frontend (from `frontend/`)

```bash
npm install
npm run dev        # vite dev server, host 0.0.0.0:5173, proxies /api to VITE_API_TARGET (default http://localhost:8000)
npm run build       # tsc typecheck + vite build
```

Also runnable via Docker: `docker compose up` in `frontend/` (see `frontend/docker-compose.yml`), which points `VITE_API_TARGET` at `http://backend:8000`. Requires `frontend/.env` (see `frontend/env.example`: `VITE_API_URL`).

## Architecture

### Backend app boundaries

- **`users`** — custom `AUTH_USER_MODEL` (`users.User`, extends `AbstractUser` with `avatar`/`bio`). Owns auth: register, JWT login/refresh/logout (blacklist), self profile (`/api/users/me/`), and public profile by username (`/api/users/<username>/`). `users.urls` is mounted at both `/api/auth/` and `/api/users/` in `config/urls.py`.
- **`goals`** — `Goal` and one-to-one `StreakState` models. `GoalsViewSet` (DRF `ModelViewSet`) enforces per-owner access via `IsGoalOwner` (object-level permission, safe methods open to all). Deleting a goal is a soft-delete: `perform_destroy` sets `is_active=False`, `archived_at`, and marks the streak `"broken"` rather than removing the row. A `reactivate` custom action (`PATCH /api/goals/<id>/reactivate`) restores an archived goal and resets its streak. `StreakRetrieveView` is a separate read-only viewset for streak data, wired to `/api/goals/<pk>/streak`.
- **`posts`** — currently holds the `Follow` model/serializer (follower/following `User` FKs, unique-together, self-follow rejected in `validate()`). `FollowView` is mid-implementation (`create()` is currently incomplete) — this is active work on `feature/feed-and-follow`. Despite the app name, no `Post` model exists yet.
- **`social`** — scaffolded but empty (`models.py`/`views.py` are stub Django boilerplate). Installed in `INSTALLED_APPS` but not wired into `config/urls.py`.

Only `goals` and `users` currently have URLs registered in `config/urls.py`; `posts`/`social` routes are not yet mounted.

### Cross-cutting backend conventions

- DRF global defaults (`config/settings.py`): JWT auth (`rest_framework_simplejwt`), `IsAuthenticated` by default, `DjangoFilterBackend` + `SearchFilter`, page-number pagination (page size 10).
- JWT: 2h access / 1 week refresh, blacklist app enabled for logout.
- Serializers validate cross-field business rules in `validate()` (e.g. goal `cadence`/`target_count` pairing, follow self-check) rather than at the model layer.
- State-changing side effects on goals (create/destroy/reactivate) run inside `transaction.atomic()` blocks because they touch both `Goal` and `StreakState` together.
- `celery` and `redis` are project dependencies but nothing is currently wired up (no `celery.py`/task modules) — treat as not-yet-implemented infrastructure, not a working queue.

### Analytics service

FastAPI app in `analytics/main.py`, routers under `analytics/routers/`, Pydantic schemas under `analytics/schemas/`. It is a separate process from Django with its own DB session handling (`analytics/database.py`, SQLAlchemy `get_db` dependency) — it does not import or reuse any Django models/serializers. `leaderboard.py` router is currently a placeholder returning hardcoded data, not a real query.

### Frontend structure

- `src/api/` — one `axios`-based client per backend resource (`authApi`, `userApi`, `goalsApi`), all routed through `axiosInstance.ts`.
- `axiosInstance.ts` implements silent JWT refresh: on a 401 (excluding the login/register/refresh endpoints themselves) it queues concurrent requests, refreshes the access token once via `/users/refresh/`, then replays them; on refresh failure it clears tokens and dispatches a `auth:unauthorized` `window` event.
- `AuthContext` (`src/context/AuthContext.tsx`) listens for `auth:unauthorized` to log the user out globally, and hydrates user state from `/users/me/` on mount if an access token exists in `localStorage`.
- `src/hooks/` wrap API calls with TanStack Query (`useGoalQueries.ts`, `useUserQueries.ts`).
- Routing (`App.tsx`): `/login`, `/signup`, `/u/:username` are public; `/me` and `/goals` are behind `ProtectedRoute`; unmatched paths redirect to `/me`.
- Feature areas are grouped under `src/components/<feature>/` (currently `goals/` and `layout/`).
