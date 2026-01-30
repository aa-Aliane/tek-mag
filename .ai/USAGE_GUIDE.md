# AI Context Usage Guide

This guide explains how to effectively use the `.ai/` directory to get the best results from your AI assistant.

## Quick Start (Copy-Paste Prompts)

### 🚀 Starting a New Session
**Prompt:**
> "I am starting a new work session. Please read `.ai/context.md` and `.ai/todo.md` to understand the current state of the project. Then, ask me what I want to work on today."

### 📝 updating Context (End of Session)
**Prompt:**
> "We are done for now. Please help me update `.ai/context.md`.
> 1. Move the current 'Recent Changes' to the session log (or archive).
> 2. Add today's changes to 'Recent Changes'.
> 3. Update 'Current Focus' for the next session based on what we finished.
> 4. Update `.ai/todo.md` marking completed tasks."

### 🏗 Making Architectural Decisions
**Prompt:**
> "I need to make a decision about [Topic]. Please review `.ai/decisions.md` to see our history, then propose options with pros/cons following the project's architectural guidelines."

## Workflow Checklist

1.  **Context Loading**: Always have the AI read `context.md` first.
2.  **Task Selection**: Pick a task from `todo.md`.
3.  **Implementation**: Work on the code, adhering to patterns in `context.md` (Notes for AI).
4.  **Documentation**: If you change how something works, ask the AI to update the relevant `context.md` section.
5.  **Logging**: Update `decisions.md` if a major choice is made.

## Tips for Maintaining Context

*   **Be Specific in `context.md`**: Don't just say "Fix bugs". Say "Fix race condition in OrderController".
*   **Keep it Updated**: If the AI is confused, it's usually because `context.md` is outdated.
*   **Use the `sessions/` folder**: If `context.md` gets too long (over 500 lines), move old "Recent Changes" to a file in `sessions/` to keep the main context lightweight.

## Troubleshooting

*   **"The AI forgot we changed X"**: You probably didn't update `context.md` at the end of the last session. Add it now.
*   **"The AI is writing code in the wrong style"**: Point it to the "Notes for AI" section in `context.md`.
