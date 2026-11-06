---
name: ux-patterns
description: "UI/UX design patterns for production-quality interfaces: loading, empty, error, and success states; form design; interaction feedback; progressive disclosure; and Nielsen's usability heuristics."
---

# UX Patterns

Every interface has states beyond the happy path. Design all of them — or users will encounter blank screens, confusing failures, and dead ends.

## The Four States Every Data-Driven Component Needs

Any component that loads data or accepts input exists in at least four states. Design all four before writing code.

| State | What the user sees | What it communicates |
|---|---|---|
| **Loading** | Skeleton screen or spinner | "Working on it" |
| **Empty** | Designed empty state | "Nothing here yet" — with a next action |
| **Error** | Error message and recovery path | "Something went wrong" — here is what to do |
| **Populated** | The data | "Here is what you asked for" |

---

## Loading State

- **Skeleton screens** (content-shaped placeholders) for content that loads once on page entry — they reduce perceived load time by setting shape expectations
- **Spinners** for short operations or actions triggered by the user (button submits, search queries)
- **Disable interactive elements** while an operation is in progress to prevent double-submission
- For operations expected to take > 3 seconds: show progress with an estimate or a progress bar
- Never leave the previous state visible and stale while new data is loading — indicate clearly that a refresh is in progress

---

## Empty State

Empty is not zero — it is the user's first experience of a feature. Design it deliberately.

A good empty state:
- Explains what will appear here when there is content ("Your orders will appear here once you place one")
- Provides a direct call to action ("Place your first order →")
- Includes an illustration or contextual icon that makes the purpose clear
- Does not show a blank container or "No results found" without context

---

## Error State

- Describe what went wrong in plain language — not error codes or technical identifiers
- Tell the user what they can do: retry, go back, contact support, check their connection
- Distinguish clearly between:
  - **User errors** (validation, wrong input) — inline, adjacent to the field, in the user's control
  - **System errors** (service failure, network problem) — page or section level, not user's fault
- Offer a retry button for transient failures (network errors, service timeouts)
- For destructive or irreversible errors, provide a clear path to recovery or escalation

---

## Success State

- Confirm the action completed: "Your changes have been saved", "Order placed successfully"
- For repeatable form workflows (data entry forms): clear or reset the form after success
- For destructive actions (delete, send): confirm specifically what was completed ("Profile deleted. Changes cannot be undone.")
- Do not silently succeed — users who are not told something worked will re-submit

---

## Form Design

### Labels
- Every input has a visible, always-present label — not just placeholder text
- Placeholder text disappears on typing and has insufficient contrast — it cannot substitute for a label
- Label position: above the field is most scannable; inline labels (placeholders) are a common accessibility failure

### Validation timing
- Validate on **blur** (when the user leaves the field) — not on every keystroke, which is intrusive
- Validate on **submit** for any fields the user skipped
- Show inline errors directly adjacent to the field they describe, not only in a summary banner

### Error messages
- Describe the specific problem: "Enter a valid email address" not "Invalid input"
- Describe how to fix it: "Password must be at least 8 characters" not "Password too short"
- Do not clear the user's input when showing a validation error — preserve the field value

### Submit button states
- Disable or show a loading indicator on the submit button during submission — prevent double submission
- Re-enable after a failure so the user can retry
- Label the button with what it does: "Save changes", "Place order", "Create account" — not just "Submit"

### Multi-step forms
- Show step count and progress: "Step 2 of 4"
- Allow the user to go back without losing data
- Save progress where possible for longer flows

---

## Interaction Feedback

Every user action should produce visible feedback within 100ms. Anything longer feels broken.

| Delay | User perception | Appropriate response |
|---|---|---|
| 0–100ms | Instantaneous | Immediate visual state change (hover, pressed) |
| 100ms–1s | Slight pause — acceptable | Visual feedback started (spinner, disabled state) |
| 1–10s | Uncomfortable | Spinner or progress with message |
| > 10s | Frustrating | Progress bar with time estimate; consider background processing |

### Affordance

Elements that can be interacted with should look like they can be:
- Buttons are distinguishable from text (shape, fill, or elevation)
- Links are underlined or distinctly coloured — not styled to look like buttons unless they navigate
- Draggable items have a handle cursor (`cursor: grab`) or a grip icon
- Disabled elements are visually distinct and do not receive focus

---

## Progressive Disclosure

Show only what the user needs for the current task. Reveal additional complexity on demand.

**Use when:**
- An interface has many options but users typically need only a few
- Advanced settings exist that are rarely used
- An action reveals contextual information ("Show details", "Advanced options")

**Common patterns:**
- **Accordion**: collapse related content, expand on demand
- **"Show more" / "Show less"**: truncate long content and reveal
- **Tabs**: separate related but distinct content into named views
- **Step wizard**: guide through a process one step at a time, hiding future steps

**Do not use for:** information the user needs for the primary task. Progressive disclosure is for secondary and advanced options, not core content.

---

## Navigation Patterns

- **Breadcrumbs**: show the hierarchy path; each segment is a link back to that level
- **Active state**: clearly mark the current page in navigation (colour, weight, `aria-current="page"`)
- **Back navigation**: preserve scroll position and unsaved state when returning to a list from a detail view
- **Pagination vs. infinite scroll**:
  - Pagination: when users need to find specific items, return to their place, or share a URL to a specific page
  - Infinite scroll: when browsing a feed with no specific destination (social, discovery)
- **Sticky navigation**: keep primary navigation accessible on scroll for pages where users navigate frequently

---

## Nielsen's 10 Usability Heuristics

Apply as a quick audit pass on any UI:

1. **Visibility of system status** — users always know what is happening
2. **Match between system and real world** — familiar language, not jargon
3. **User control and freedom** — undo, back, cancel are always available
4. **Consistency and standards** — platform conventions are followed
5. **Error prevention** — confirm destructive actions; validate before submission
6. **Recognition over recall** — options visible; minimise memory load
7. **Flexibility and efficiency** — shortcuts for power users; simple path for novices
8. **Aesthetic and minimalist design** — irrelevant information competes for attention
9. **Help users recognise, diagnose, and recover from errors** — plain language; suggest a fix
10. **Help and documentation** — contextual help available; edge cases documented

---

## Common Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Blank loading screen | Users think it is broken | Skeleton screens or immediate spinner |
| "No results" with no context | Dead end for users | Explain why; suggest alternatives |
| Form cleared on validation error | User loses their input | Preserve field values; show errors |
| Success with no feedback | User re-submits | Show confirmation message |
| Confirm dialog with two ambiguous options | "OK" vs "OK" | Use action labels: "Delete" and "Cancel" |
| Submitting disabled with no explanation | User is confused | Show which fields are invalid |
| Modal without a close affordance | Trapped user | Always provide Escape key + visible close button |
| Hover-only interactions | Inaccessible on touch and keyboard | All hover content also on focus |
