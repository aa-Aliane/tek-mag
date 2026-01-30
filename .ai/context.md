# Project Context

## Current Focus
*   **Status**: Initial Context Setup
*   **Goal**: Establishing the AI context management system.
*   **Next Steps**: 
    *   [ ] Verify .ai directory structure.
    *   [ ] Begin working on high-priority backlog items (Check `.ai/todo.md`).

## Project Overview
*   **Type**: Repair Shop Management System (SaaS/Internal Tool).
*   **Architecture**: Monorepo-style with separated Backend (Django) and Frontend (Next.js).
*   **Infrastructure**: Docker Compose, PostgreSQL.

### Tech Stack
*   **Backend**: 
    *   Django & Django REST Framework (DRF).
    *   Authentication: JWT (SimpleJWT).
    *   Apps: `accounts`, `repairs`, `tech`.
    *   Convention: SOLID principles. Models, serializers, and views are in **subdirectories**, not single files (e.g., `apps/accounts/models/user.py`, not `apps/accounts/models.py`).
*   **Frontend**: 
    *   Next.js 14+ (App Router).
    *   TypeScript, Tailwind CSS, shadcn/ui.
    *   State Management: Zustand.
    *   Path Aliases: `@/` pointing to `src/`.

## Recent Changes
| Date | Change Description | Files Modified | Next Steps |
|------|-------------------|----------------|------------|
| 2025-12-26 | Initialized AI Context System | `.ai/*` | Start using the system |

*(Keep only the last 5 sessions here. Archive older entries to `.ai/sessions/`)*

## Known Issues
### Backend
*   *None currently logged.*

### Frontend
*   *None currently logged.*

### Deployment/DevOps
*   *None currently logged.*

## TODO Summary
*   *See `.ai/todo.md` for the full list.*
*   **Critical**: N/A
*   **High**: N/A

## Quick Reference
*   **Backend Root**: `./backend`
*   **Frontend Root**: `./frontend`
*   **Run Dev**: `docker-compose up`
*   **Frontend Types**: `frontend/src/types/`
*   **Frontend Store**: `frontend/src/store/`
*   **Django Settings**: `backend/conf/settings.py`

## Notes for AI
### Backend (Django) Rules
1.  **Strict Separation**: Do not put all models in `models.py`. Use the `apps/<app_name>/models/` directory. Same for views and serializers.
2.  **Imports**: Use absolute imports (e.g., `from apps.accounts.models import User`).
3.  **Auth**: Respect JWT flow.

### Frontend (Next.js) Rules
1.  **Structure**: Pages in `src/app`. Components in `src/components`.
2.  **Components**: Use `src/components/ui` for generic UI (shadcn). Use `src/components/<feature>` for domain components.
3.  **State**: Prefer server components for data fetching. Use Zustand (`src/store`) for global client state.
4.  **Styling**: Tailwind utility classes.
