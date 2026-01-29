# Dropdown UI with Scrolling Support

The dropdown completion UI displays up to 5 suggestions at a time. When there
are more than 5 suggestions, users can scroll through them using Tab (next) and
Shift+Tab (previous).

## Visual Representation

The selected suggestion is highlighted with:

- Green arrow (`→`) in the left margin
- Inverse colors on the completion text

### Example: First page (suggestions 1-5)

```bash
❯ fix(|
→→(src)           # Selected (index 0)
→ (components)
→ (api)
→ (lib)
→ (features)
```

### Example: Middle page (suggestions 4-8)

When scrolling down, the window shifts to show the selected item:

```bash
❯ fix(|
→ (lib)
→ (features)
→→ (services)     # Selected (index 6)
→ (store)
→ (types)
```

### Example: Last page (suggestions 8-12)

```bash
❯ fix(|
→ (store)
→ (types)
→ (config)
→→(tests)         # Selected (index 10)
→ (docs)
```

## Implementation Details

- **Maximum visible items**: 5 suggestions
- **Navigation**: Tab (next), Shift+Tab (previous)
- **Scroll behavior**: The selected item is kept at positions 0-2 (top 3 rows)
  of the visible window
  - When navigating down with Tab, the window scrolls when the selected item
    would move to position 3 or below
  - When navigating up with Shift+Tab, the window scrolls to keep the selected
    item at position 2 or above
  - This keeps the selected item near the top/middle, making it easy to see what
    comes next
- **Wrapping**: Navigating past the last item wraps to the first item (and vice
  versa), resetting scroll position

### Scroll Simulation (12 suggestions total)

| Action | Selected Index | Scroll Offset | Visible Range | Selected Position |
| ------ | -------------- | ------------- | ------------- | ----------------- |
| Start  | 0              | 0             | 0-4           | 0 (top)           |
| Tab    | 1              | 0             | 0-4           | 1                 |
| Tab    | 2              | 0             | 0-4           | 2                 |
| Tab    | 3              | 1             | 1-5           | 2                 |
| Tab    | 4              | 2             | 2-6           | 2                 |
| Tab    | 5              | 3             | 3-7           | 2 (middle page)   |
| Tab    | 6              | 4             | 4-8           | 2                 |
| ...    | ...            | ...           | ...           | ...               |
