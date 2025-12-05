# Project Context: Tek-Mag

## Overview
Tek-Mag is a full-stack web application designed for managing technical repairs and client services. It features a Django-based backend providing a REST API and a Next.js frontend for the user interface. The system includes authentication, role-based access, and search capabilities.

## Technology Stack

### Backend
*   **Framework**: Django 5.2.4
*   **API**: Django REST Framework (DRF)
*   **Database**: PostgreSQL 16
*   **Search**: Elasticsearch 8.17 (via `django-elasticsearch-dsl`)
*   **Authentication**:
    *   `dj-rest-auth` & `django-allauth`
    *   JWT (JSON Web Tokens) with Cookie support (`dj-rest-auth`, `simplejwt`)
    *   Social Auth (Google, Facebook)
*   **Task Queue**: Celery with Redis (implied by settings)
*   **Documentation**: OpenAPI 3.0 via `drf-spectacular`
*   **Containerization**: Docker & Docker Compose

### Frontend
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS 4
*   **UI Components**: Shadcn UI (Radix UI primitives)
*   **State Management**: Zustand, React Query (`@tanstack/react-query`)
*   **Forms**: React Hook Form + Zod validation

## Architecture

### Backend Structure (`/backend`)
The backend follows a modular Django app structure located in `backend/apps/`:
*   **`accounts`**: User management, authentication, and profiles.
*   **`tech`**: Likely handles technical inventory, devices, or technician management.
*   **`repairs`**: Core logic for managing repair tickets and workflows.

**Key Configurations**:
*   Settings managed via `django-environ`.
*   I18N enabled (French default).
*   CORS configured for frontend interaction.

### Frontend Structure (`/frontend`)
The frontend uses the Next.js App Router:
*   **`(auth)`**: Route group for authentication pages (login, register).
*   **`(dashboard)`**: Route group for the main application interface (protected routes).
*   **`components/`**: Reusable UI components.
*   **`lib/`, `utils/`**: Helper functions and utilities.
*   **`services/`**: API client and service layers.

## Development Environment
*   **Docker Compose**: Orchestrates `db` (Postgres), `backend` (Django), and `frontend` (Next.js).
*   **Makefile**: Provides shortcuts for common tasks:
    *   `make init-backend`: Sets up migrations and database.
    *   `make migrate`: Runs database migrations.
    *   `make createsuperuser`: Creates an admin user.
    *   `make load-clients-data`: Seeding command.

## Key Features (Inferred)
*   **User Authentication**: Secure login/signup with JWT and social providers.
*   **Repair Tracking**: Management of repair lifecycle.
*   **Search**: Full-text search capabilities using Elasticsearch.
*   **Client Management**: specialized data loading for clients.
