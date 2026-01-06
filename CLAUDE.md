# CLAUDE.md - DemmitHub Project Guide

## Project Overview

**DemmitHub** is an AI-powered CLI tool for generating smart commit messages, pull requests, and issues.

### Tech Stack

- **Runtime**: Deno
- **UI Framework**: React + Ink (Terminal UI)
- **Language**: TypeScript
- **AI Integration**: Vercel AI SDK + OpenRouter
- **Git Integration**: simple-git
- **GitHub Integration**: Octokit
- **Schema Validation**: Zod
- **Config Format**: YAML

---

## Project Structure

```
src/
├── main.ts                 # Entry point
├── type.ts                 # Global type definitions
├── schema.ts               # Zod schema definitions
├── commands/               # CLI command implementations
│   ├── root.ts            # Root command
│   ├── commit.ts          # Commit functionality
│   ├── issue.ts           # Issue management
│   ├── init.ts            # Initial setup
│   └── config/            # Configuration commands
│       ├── language.ts
│       ├── editor.ts
│       └── overview.ts
├── components/            # Reusable Ink components
│   ├── agent_loop.tsx     # AI agent loop UI
│   ├── carousel.tsx       # Carousel component
│   ├── select.tsx         # Select menu
│   ├── selection.tsx      # Selection UI
│   ├── setup_flow.tsx     # Setup flow
│   ├── spinner.tsx        # Loading spinner
│   └── text_input.tsx     # Text input
├── constants/             # Constant definitions
│   ├── ai.ts             # AI provider definitions
│   ├── config.ts         # Default configuration
│   ├── editor.ts         # Editor definitions
│   ├── language.ts       # Supported languages
│   ├── message.ts        # System messages
│   ├── shortcuts.ts      # Keyboard shortcuts
│   └── commands/         # Command definitions
│       ├── flags.ts
│       └── options.ts
├── features/              # Feature-specific logic
│   ├── commit/           # Commit functionality
│   │   ├── ui.tsx       # UI component
│   │   ├── hook.ts      # React hooks
│   │   └── reducer.ts   # State management
│   └── issue/            # Issue functionality
│       ├── ui.tsx
│       ├── hook.ts
│       └── reducer.ts
├── lib/                   # Library code
│   ├── command.ts        # Command base class
│   └── errors.ts         # Error definitions
├── screens/              # Screen components
│   └── edit-commit-message/  # Commit message editor screen
│       ├── EditCommitMessage.tsx
│       ├── state/        # State management
│       │   └── context.tsx
│       └── components/   # Screen-specific components
│           ├── Body.tsx
│           ├── Contents.tsx
│           ├── Header.tsx
│           ├── Hooter.tsx
│           ├── Line.tsx
│           └── StatusBar.tsx
├── services/              # Service layer
│   ├── ai.ts             # AI integration service
│   ├── config.ts         # Configuration management service
│   ├── env.ts            # Environment variable service
│   ├── git/              # Git-related services
│   │   ├── git_service.ts        # Git service integration
│   │   ├── commit_repository.ts  # Commit operations
│   │   ├── diff_repository.ts    # Diff operations
│   │   ├── remote_repository.ts  # Remote operations
│   │   ├── rev_parse_repository.ts  # Rev-parse operations
│   │   └── status_repository.ts  # Status operations
│   └── github/           # GitHub-related services
│       └── issue.ts
└── utils/                 # Utility functions
    ├── cycle_zip.ts
    ├── edit.ts           # Text editing
    ├── parser.ts         # Parser utilities
    ├── path.ts           # Path operations
    ├── split-text-to-lines.ts
    ├── tui.ts            # TUI helpers
    └── editor/           # Editor-related utilities
        ├── get_commit_state.ts
        ├── get_commit_prefix_state.ts
        └── get_commit_description_state.ts
```

---

## Architecture

### 1. Command Pattern

Hierarchical command structure using `BaseCommand` inheritance:

```typescript
// lib/command.ts
export abstract class BaseCommand<F extends FlagType, O extends OptionType> {
  abstract name: string;
  abstract description: string;
  abstract commands: Command[];
  abstract defaultFlags: F;
  abstract defaultOptions: O;
  abstract execute(
    remainingArgs: string[],
    consumedArgs: string[],
    flags: F,
    options: O,
  ): Promise<void>;
}
```

**Features:**
- Type-safe flags (boolean) and options (string) using generics
- Automatic CLI argument parsing via `parseArgs`
- Automatic sub-command routing
- Auto-generated help messages

**Command Structure:**
```
demmithub (RootCommand)
├── init (InitCommand)
├── config (ConfigCommand)
│   ├── language (LanguageCommand)
│   ├── editor (EditorCommand)
│   └── overview (OverviewCommand)
├── issue (IssueCommand)
└── commit (CommitCommand)
```

### 2. Service Layer

Business logic is separated into services:

#### AIService (`services/ai.ts`)
- AI integration using Vercel AI SDK
- Supports OpenRouter provider
- `generateStructuredOutput`: Structured output based on Zod schemas
- `streamStructuredArrayOutput`: Streaming array output

```typescript
const aiService = await AIService.create();
const result = await aiService.generateStructuredOutput(
  messages,
  system,
  schema
);
```

#### ConfigService (`services/config.ts`)
- 3-level configuration scope: `global` → `project` → `local`
- YAML format configuration file management
- `getMerged()`: Configuration merging based on priority

**Configuration File Paths:**
- Global: `~/.config/demmithub/.config.yml`
- Project: `./.demmithub.yml`
- Local: `./.demmithub.local.yml`

#### GitService (`services/git/git_service.ts`)
- Functionality split using repository pattern
- Uses `simple-git`

```typescript
const gitService = new GitService();
await gitService.diff.getGitDiffStaged();
await gitService.commit.commitWithMessages(messages);
await gitService.status.getStatus();
```

### 3. TUI with React + Ink

Ink enables using React for terminal UI:

```typescript
import { render } from "ink";

export async function runTui(element: JSX.Element) {
  return new Promise<void>((resolve) => {
    const { waitUntilExit } = render(element);
    waitUntilExit().then(resolve);
  });
}
```

**Key Components:**
- `Select`: Selection menu
- `Spinner`: Loading indicator
- `TextInput`: Text input
- `Carousel`: Carousel display

### 4. State Management Pattern

React Hooks + Reducer pattern:

```typescript
// features/commit/reducer.ts
export type CommitState =
  | { step: "loading" }
  | { step: "select"; messages: CommitMessages }
  | { step: "edit"; selectedMessage: Message }
  | { step: "commit"; commitMessage: string }
  | { step: "done" }
  | { step: "error" };

export function commitReducer(
  state: CommitState,
  action: CommitAction
): CommitState {
  // State machine
}
```

**Flow:**
```
loading → select → edit → commit → done
    ↓        ↓       ↓       ↓
         error ←──────┴───────┘
```

### 5. Schema-Driven Design

Type-safe AI output with Zod + AI SDK:

```typescript
// schema.ts
export const CommitSchema = z.object({
  commit_message: z.array(
    z.object({
      header: z.string(),
      body: z.string().nullable(),
      footer: z.string().nullable(),
    })
  ),
});

// AI output automatically conforms to schema
const result = await aiService.generateStructuredOutput(
  messages,
  system,
  CommitSchema
);
```

---

## Coding Conventions

### TypeScript

1. **Type Definition Placement**
   - Global types: `src/type.ts`
   - Service-specific types: `export type` within each service file
   - Component-specific types: Within each component file

2. **Naming Conventions**
   - File names: snake_case (`commit_repository.ts`)
   - Components: PascalCase (`EditCommitMessage.tsx`)
   - Functions/variables: camelCase (`generateCommitMessages`)
   - Types/interfaces: PascalCase (`CommitState`)
   - Constants: UPPER_SNAKE_CASE (`COMMIT_SYSTEM_MESSAGE`)

3. **Type Annotations**
   - Explicitly type function return values
   - Public APIs must have explicit types
   - Private variables can rely on inference

### React + Ink

1. **Function Components**
   - Use function declaration form: `export function Component() {}`
   - Hooks use `use` prefix

2. **Component Organization**
   - Reusable components: `components/`
   - Screen components: `screens/`
   - Feature-specific UI: `features/*/ui.tsx`

3. **State Management**
   - Complex state: `useReducer` + custom hooks
   - Simple state: `useState`

### Service Layer

1. **Class Design**
   - Services are implemented as classes
   - Constructor for dependency injection
   - Factory methods (`create()`) for async initialization

2. **Repository Pattern**
   - Repository class per data source (Git, GitHub)
   - Split repositories by concern (commit, diff, status)

3. **Error Handling**
   - Custom error classes: `lib/errors.ts`
   - Services throw appropriate errors
   - UI layer catches and displays

### Testing

1. **Test Files**
   - Test files use `*_test.ts` suffix
   - Place in same directory as implementation

2. **Test Structure**
   - Use Deno standard `@std/testing`
   - Write tests with `Deno.test()`

### Git

1. **Commit Messages**
   - Conventional Commits format
   - `type(scope): subject`
   - Example: `feat(commit): add commit message validation`

2. **Branches**
   - `feat/*`: New features
   - `fix/*`: Bug fixes
   - `chore/*`: Other changes

---

## Key Feature Flows

### Commit Feature

1. **Commit Message Generation Flow:**
```
User: demmithub commit
  ↓
Loading: Fetch Git diff
  ↓
AI: Generate commit messages from diff (multiple candidates)
  ↓
Select: User selects a candidate
  ↓
Edit: Edit in editor
  ↓
Commit: Commit to Git
  ↓
Done
```

2. **Implementation Files:**
- `commands/commit.ts`: Command entry point
- `features/commit/ui.tsx`: UI component
- `features/commit/hook.ts`: Business logic
- `features/commit/reducer.ts`: State management
- `services/git/`: Git operations
- `services/ai.ts`: AI integration

### Config Feature

1. **Configuration Priority:**
```
Default configuration
  ↓ (Override)
Global config (~/.config/demmithub/.config.yml)
  ↓ (Override)
Project config (./.demmithub.yml)
  ↓ (Override)
Local config (./.demmithub.local.yml)
```

2. **Configuration Items:**
- `language`: Output language (Supports 15 languages including English and Japanese)
- `editor`: Text editor (vim, emacs, nano, vscode, etc.)
- `overview`: Project overview
- `provider`: AI provider (OpenRouter, ChatGPT, Claude, Google Gemini)
- `model`: AI model name

---

## Dependencies

### NPM Dependencies
- `@openrouter/ai-sdk-provider`: OpenRouter AI integration
- `ai`: Vercel AI SDK
- `ink`: React for CLI
- `octokit`: GitHub API
- `react`: UI library
- `simple-git`: Git operations
- `zod`: Schema validation

### Deno Dependencies (JSR)
- `@std/assert`: Assertions
- `@std/cli`: CLI utilities
- `@std/dotenv`: Environment variables
- `@std/fmt`: Formatter
- `@std/front-matter`: Front Matter parser
- `@std/fs`: File system
- `@std/path`: Path operations
- `@std/testing`: Testing
- `@std/yaml`: YAML parser

---

## Development Guidelines

### Adding New Features

1. **Adding a Command:**
   - Create new command file in `commands/`
   - Extend `BaseCommand`
   - Register in `RootCommand` in `main.ts`

2. **Adding UI Components:**
   - Reusable: `components/`
   - Screens: `screens/`
   - Feature-specific: `features/*/ui.tsx`

3. **Adding Services:**
   - Create service class in `services/`
   - Design with dependency injection in mind
   - Create accompanying test file

### Editor Integration

Use `utils/edit.ts` for commit message editor editing:

```typescript
export async function editText(initialText: string): Promise<string> {
  // Open editor and edit text
}
```

Supported editors are defined in `constants/editor.ts`.

### Customizing AI Integration

1. **System Prompts:**
   - Defined in `constants/message.ts`
   - `COMMIT_SYSTEM_MESSAGE`: For commit message generation

2. **Schema Definitions:**
   - Define Zod schemas in `schema.ts`
   - Guarantees AI output structure

3. **Adding Providers:**
   - Add to `getModel()` method in `services/ai.ts`
   - Add constants to `constants/ai.ts`

---

## Troubleshooting

### Common Issues

1. **AI Not Responding**
   - Check if `AI_API_KEY` environment variable is set
   - Verify provider and model are correctly configured in config file

2. **Git Operations Failing**
   - Verify current directory is a Git repository
   - Check `simple-git` error messages

3. **Configuration Not Applied**
   - Check configuration file priority
   - Verify merged configuration with `getMerged()`

---

## Reference Links

- [Deno Documentation](https://deno.land/manual)
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Zod Documentation](https://zod.dev/)
- [simple-git](https://github.com/steveukx/git-js)
