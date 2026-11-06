---
name: accessibility
description: "WCAG 2.1/2.2 AA audit methodology using the POUR framework: Perceivable, Operable, Understandable, Robust. Covers semantic HTML, ARIA patterns, keyboard navigation, focus management, colour contrast, screen reader testing, and dynamic content."
---

# Accessibility

Accessibility is not a feature — it is a quality dimension. WCAG 2.1 AA is the legal minimum in most jurisdictions and the practical baseline for any user-facing product.

## POUR Framework

Every WCAG criterion falls under one of four principles. Structure audits by walking through each.

- **Perceivable** — users can receive all information (visual, audio, text equivalents)
- **Operable** — users can operate all functionality (keyboard, no seizures, enough time)
- **Understandable** — content and UI are predictable and helpful
- **Robust** — works with assistive technology today and in the future

---

## Perceivable

### Text Alternatives (WCAG 1.1)
- Every `<img>` has `alt` text that describes its purpose in context
- Decorative images use `alt=""` (empty string) — do not omit the `alt` attribute
- Icons that convey meaning have an accessible name: `aria-label` on the icon element, or adjacent visually-hidden text
- Complex images (charts, diagrams) have a long description or an equivalent data table adjacent to them

### Colour Contrast (WCAG 1.4.3, 1.4.11)
| Text type | Minimum ratio |
|---|---|
| Normal text (< 18pt, or < 14pt bold) | 4.5:1 |
| Large text (≥ 18pt, or ≥ 14pt bold) | 3:1 |
| UI components and graphical objects | 3:1 |
| Decorative or disabled elements | No requirement |

Tools: Chrome DevTools colour picker shows the contrast ratio inline; the axe DevTools extension flags violations automatically.

### Information Not Colour-Dependent (WCAG 1.4.1)
- Status (error, warning, success) communicated via colour must also use an icon, text, or pattern
- Form validation errors cannot rely on red colour alone — include an error icon and text message

### Text Resize (WCAG 1.4.4)
- Page must be readable and functional when zoomed to 200% without horizontal scrolling
- Avoid fixed pixel heights on text containers — use `min-height` or let the container expand

---

## Operable

### Keyboard Navigation (WCAG 2.1)
Every interactive element must be reachable and operable by keyboard alone:
- Tab order matches the visual reading order
- All hover-triggered content (tooltips, dropdowns) is also triggerable by keyboard focus
- Keyboard shortcuts do not conflict with browser or OS shortcuts

**Focus visibility (WCAG 2.4.7)**: the focused element must have a visible focus indicator. Never use `outline: none` without providing an alternative focus style that meets 3:1 contrast against adjacent colours.

**`tabindex` rules**:
- `tabindex="0"` — adds custom element to natural tab order
- `tabindex="-1"` — focusable by script, not by Tab key (use for focus management)
- `tabindex > 0` — never use; creates unpredictable tab order

### Focus Management
- When content appears (modal opens, drawer expands), move focus to the first interactive element or the container heading
- When content is removed (modal closes), return focus to the element that triggered it
- After a route change in a SPA, move focus to the page heading or a skip link

### Modals and Dialogs (WCAG 2.1)
- Focus trapped inside the modal while it is open (Tab and Shift+Tab cycle within)
- `Escape` key closes the modal
- Focus returns to the trigger element when the modal closes
- Modal element has: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the dialog title

### No Keyboard Traps (WCAG 2.1.2)
Users must always be able to Tab away from any component. Never trap focus permanently.

### Timing (WCAG 2.2)
- Users can extend, pause, or disable time limits
- Auto-updating content can be paused or stopped

### No Seizure Triggers (WCAG 2.3)
- Nothing flashes more than 3 times per second

---

## Understandable

### Language (WCAG 3.1)
- `<html lang="en">` (or appropriate IETF BCP 47 code) on every page
- When language changes within content, mark the element: `<span lang="fr">Bonjour</span>`

### Forms (WCAG 1.3, 3.3)
- Every input has a programmatically associated `<label>` via `for`/`id`, or `aria-labelledby`
- Placeholder text is not a substitute for a label — it disappears on input and has poor contrast
- Error messages identify the specific field and describe what went wrong and how to fix it ("Enter a valid email address" not "Invalid input")
- Required fields are marked with more than colour: include "(required)" text, an asterisk with a legend, or `aria-required="true"`
- Personal data fields have appropriate `autocomplete` attributes

### Predictability (WCAG 3.2)
- Navigation is consistent across pages
- Components behave consistently — a button that submits a form here submits a form everywhere
- No unexpected context changes on focus or input: no auto-submit, no auto-navigation on select

---

## Robust

### Semantic HTML First

Prefer semantic HTML elements over ARIA. Semantic elements carry their roles implicitly and have better AT support.

| Use | Not |
|---|---|
| `<button>` | `<div role="button" onClick>` |
| `<nav>` | `<div role="navigation">` |
| `<main>` | `<div id="main">` |
| `<ul>` / `<ol>` with `<li>` | Divs with list-style |
| `<table>` with `<th>` headers | Grid of divs |

### ARIA — Only When Semantic HTML Is Insufficient

- Do not add `role` to elements that already have correct native semantics
- `aria-label` overrides the accessible name — use it only when there is no visible label to reference
- Use `aria-labelledby` to point to an existing visible element instead of duplicating text

**Common patterns:**
| Pattern | ARIA |
|---|---|
| Toggle button (accordion, dropdown) | `aria-expanded="true/false"` |
| Active navigation link | `aria-current="page"` |
| Selected tab/option | `aria-selected="true/false"` |
| Non-urgent status update | `aria-live="polite"` on the container |
| Urgent error announcement | `aria-live="assertive"` (use sparingly — interrupts the user) |
| Loading region | `aria-busy="true"` while loading |
| Icon-only button | `aria-label="Close"` |

**Name, Role, Value**: every interactive element must have an accessible name, the correct role (from native element or explicit ARIA), and correct state communicated via ARIA attributes.

---

## Testing Approach

### Automated (catches ~30–40% of issues)
- **axe-core** / Axe DevTools browser extension: run on each page and modal state
- Lighthouse accessibility audit
- An accessibility lint plugin for your framework (for example `eslint-plugin-jsx-a11y` or `eslint-plugin-vuejs-accessibility`) in CI — catches issues at lint time

### Manual keyboard test
1. Unplug the mouse
2. Tab through the full page — every interactive element must be reachable
3. Verify a visible focus indicator appears at every step
4. Operate every interactive widget: open dropdown, close modal, select item, submit form
5. Verify `Escape` closes all overlays
6. Verify focus returns to the trigger after closing modals

### Screen reader test
- **macOS**: VoiceOver — `Cmd+F5` to toggle; `Ctrl+Option+Right` to navigate
- **Windows**: NVDA (free download)
- Navigate with the virtual cursor (arrow keys)
- Verify content reads in a logical order
- Verify dynamic changes (loading complete, error appeared) are announced

### Zoom test
- Zoom browser to 200% and 400%
- Verify no content is clipped, overlapping, or requires horizontal scrolling at 200%

---

## Common Violations

| Issue | WCAG | Fix |
|---|---|---|
| Missing image `alt` | 1.1.1 | Descriptive alt; `alt=""` for decorative |
| Colour-only validation | 1.4.1 | Add icon and text alongside colour |
| Low contrast text | 1.4.3 | Adjust colours to meet ratio |
| Missing form labels | 1.3.1 | Associate `<label>` or use `aria-labelledby` |
| `outline: none` without alternative | 2.4.7 | Restore or replace focus indicator |
| Focus not managed on modal | 2.1.1 | Trap focus, return on close |
| No skip link | 2.4.1 | Add "Skip to main content" link as first focusable element |
| `<html>` missing `lang` | 3.1.1 | Set `<html lang="en">` |
| Icon-only button with no name | 4.1.2 | Add `aria-label` |
| `aria-live` on wrong container | 4.1.3 | Put `aria-live` on the container that receives updates, not the trigger |
