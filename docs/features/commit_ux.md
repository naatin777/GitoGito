# Commit Message UX Specification

## Overview

DemmitHub provides an intelligent commit message editing experience that follows the Conventional Commits format. The interface offers two complementary autocompletion modes to help users write well-formatted commit messages efficiently.

## UI Mockups

### Type Input with List Suggestions
When the user starts typing a commit type, matching suggestions appear below:

```bash
╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Header ❯ f| (1/50)                                                                                             │
│        → fix - A bug fix                                                                                       │
│        → feat - A new feature                                                                                  │
│                                                                                                                │
│ Body   │                                                                                                       │
│                                                                                                                │
│ Footer │                                                                                                       │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

### Suffix Suggestions After Type
Once a valid type is entered, the system suggests next steps:

```bash
╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Header ❯ fix| (1/50)                                                                                           │
│        → :                                                                                                     │
│        → !:                                                                                                    │
│        → (src):                                                                                                │
│        → (components):                                                                                         │
│                                                                                                                │
│ Body   │                                                                                                       │
│                                                                                                                │
│ Footer │                                                                                                       │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

## User Experience Requirements

### 1. Dual Completion Modes

#### 1.1 Inline Completion (GitHub Copilot-style)
**Purpose**: Provide a single, most relevant suggestion directly in the input field

**Visual Behavior**:
- The suggestion appears in dimmed text immediately after the cursor
- User's input is shown in normal color, suggestion in gray
- Updates in real-time as the user types

**Interaction**:
- `Tab`: Accept the inline suggestion
- Continue typing: Ignore the suggestion and keep writing
- `Esc`: Dismiss the suggestion

**Example**:
```
User types: "f"
Display: f|ix  ← "ix" appears in gray
```

#### 1.2 List Completion (Dropdown-style)
**Purpose**: Display multiple relevant suggestions for user selection

**Visual Behavior**:
- Suggestions appear below the input field
- Each item shows the value and a description
- Current selection is highlighted with inverse colors
- Arrow indicator (`→`) marks each suggestion

**Interaction**:
- `Tab`: Navigate to next suggestion
- `Shift+Tab`: Navigate to previous suggestion
- `Enter`: Accept the selected suggestion
- `Esc`: Close the suggestion list
- Keep typing: Filter suggestions in real-time

**Example**:
```
→ fix - A bug fix
→ feat - A new feature
→ docs - Documentation changes
```

### 2. Context-Aware Suggestions

The system analyzes the current input and cursor position to provide appropriate suggestions:

#### 2.1 Type Input Phase
**When**: User is typing the commit type (before `:`)

**Suggestions**:
- Conventional commit types: `fix`, `feat`, `docs`, `style`, `refactor`, etc.
- Filtered by current input (e.g., typing "f" shows only "fix" and "feat")

#### 2.2 After Type Completion
**When**: User has entered a valid type

**Suggestions**:
- `:` - Proceed to description (no scope)
- `!:` - Mark as breaking change
- `(` - Add scope information

#### 2.3 Scope Input Phase
**When**: User is typing inside parentheses `(scope)`

**Suggestions**:
- Project-defined scopes (e.g., `auth`, `ui`, `api`, `components`)
- Close pattern: `(scope):` to complete the scope

#### 2.4 Description Phase
**When**: User is typing after the `:`

**Suggestions**:
- No autocomplete (free-form text)

### 3. Smart Text Wrapping

#### 3.1 Purpose
Ensure long commit messages remain readable by wrapping at word boundaries instead of breaking words mid-character.

#### 3.2 Behavior
**Word-boundary Wrapping**:
- When text exceeds the available width, wrap at the nearest space
- Never break a word in the middle
- Preserve existing line breaks

**Example**:
```
Input: "fix: add user authentication feature"
Width: 20 characters

Wrapped:
fix: add user
authentication
feature
```

vs. character-based wrapping (what we avoid):
```
fix: add user authen
tication feature
```

#### 3.3 Unicode Support
- Properly calculate display width for multi-byte characters
- Support for Japanese, Chinese, emoji, etc.

## Conventional Commits Format

The UI enforces this structure:

```
<type>[!][(scope)]: <description>

[body]

[footer]
```

**Components**:
- `type`: Category of change (required)
  - `fix`: Bug fixes
  - `feat`: New features
  - `docs`: Documentation
  - `style`: Code style changes
  - `refactor`: Code refactoring
  - etc.

- `!`: Breaking change indicator (optional)
- `scope`: Area of change (optional)
- `description`: Brief summary (required)

## User Journey Examples

### Example 1: Simple Bug Fix
```
1. User types "f"
   → Sees: fix, feat suggestions
   → Inline shows: "ix"

2. User presses Tab
   → Accepts "fix"
   → Sees: :, !:, ( suggestions

3. User types ":"
   → Cursor moves to description

4. User types "resolve login issue"
   → Complete: "fix: resolve login issue"
```

### Example 2: Feature with Scope
```
1. User types "feat"
   → System recognizes complete type
   → Shows suffix suggestions

2. User types "("
   → Enters scope mode
   → Sees scope suggestions: auth, ui, api

3. User types "au"
   → Filters to "auth"
   → Inline shows: "th"

4. User accepts → "feat(auth"
   → Sees: ):", suggesting to close

5. User types "):"
   → Moves to description

6. User types "add two-factor authentication"
   → Complete: "feat(auth): add two-factor authentication"
```

### Example 3: Breaking Change
```
1. User types "refactor!"
   → System detects breaking change marker
   → Shows: : suggestion

2. User types ": migrate to new API"
   → Complete: "refactor!: migrate to new API"
```

## Accessibility Considerations

### Visual Clarity
- Clear distinction between user input and suggestions (color/opacity)
- Selected item in list has high contrast (inverse colors)
- Cursor position always visible

### Keyboard Navigation
- All features accessible via keyboard
- No mouse required
- Standard key bindings (Tab, Enter, Esc)

### Responsive Design
- Adapts to terminal width
- Text wrapping prevents horizontal overflow
- Suggestions list scrolls if too many items

## Future Enhancements

### Intelligent Suggestions
- Learn from commit history to prioritize frequently used types/scopes
- AI-powered description suggestions based on staged changes

### Customization
- User-defined types and scopes
- Project-specific conventions
- Custom keybindings

### Rich Editing
- Multi-line description support with smart wrapping
- Preview mode showing final commit message
- Syntax highlighting for special elements (scope, breaking change)
