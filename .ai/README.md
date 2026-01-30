# AI Context Management System

## Purpose
The `.ai/` directory serves as the brain/memory for this project's development. It maintains context across different AI sessions, ensuring continuity, preserving architectural decisions, and tracking progress without needing to re-explain the project history every time.

## File Structure & Usage

*   **`context.md`**: The source of truth. Read this first. Contains the current state, active tasks, and architectural guidelines. Update this at the start and end of every session.
*   **`todo.md`**: The backlog and task tracker. Organized by priority.
*   **`decisions.md`**: An Architecture Decision Record (ADR) log. Records *why* technical choices were made.
*   **`sessions/`**: Directory for archiving detailed logs of past sessions (optional/as needed).
*   **`USAGE_GUIDE.md`**: Detailed instructions on how to use this system effectively with AI assistants.

## Workflow

### 1. Session Start
*   **User/AI**: Read `.ai/context.md` to load the current state into the context window.
*   **Action**: "Please read `.ai/context.md` and `.ai/todo.md` to understand the current project status."
*   **Update**: If `Current Focus` in `context.md` is outdated, update it before starting work.

### 2. During Work
*   **Consult**: Check `.ai/decisions.md` before making major architectural changes.
*   **Update**: Tick off items in `.ai/todo.md` as they are completed.
*   **Log**: If a significant decision is made (e.g., "We will use Library X instead of Y"), record it in `.ai/decisions.md`.

### 3. Session End
*   **Update Context**: Update `.ai/context.md` -> `Recent Changes` with a summary of what was achieved.
*   **Update Focus**: Update `.ai/context.md` -> `Current Focus` for the *next* session.
*   **Clean Up**: Ensure `.ai/todo.md` accurately reflects pending tasks.

## Best Practices
*   **Keep `context.md` lean**: It should fit easily into an AI's context window. Move old history to `sessions/`.
*   **Be explicit**: When recording decisions, explain the *why*.
*   **Atomic Updates**: Update the `.ai` files as part of your code commits so context travels with the code.

## Quick Commands (Aliases)
*   *Load Context*: `cat .ai/context.md .ai/todo.md`
