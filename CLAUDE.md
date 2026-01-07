## 1. Project Overview

**DemmitHub** is an AI-powered CLI tool for generating intelligent commit
messages and GitHub issues.

- **Stack**: Deno, TypeScript, React + Ink, Redux Toolkit, Vercel AI SDK.
- **Goal**: Provide an interactive TUI for Git/GitHub workflows using AI agents.

## 2. Quick Commands

Use these commands to operate the project.

```bash
# Development
deno run --allow-all src/main.ts [command]  # Run CLI
deno check src/main.ts                      # Type check (Required)
deno test                                   # Run all tests
deno fmt                                    # Format code
deno lint                                   # Lint code

# User-facing Commands (Examples)
demmithub init             # Initialize config
demmithub commit           # Generate commit message
demmithub issue            # Generate issue
demmithub config language  # Set language
```
