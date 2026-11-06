---
name: documentation-and-adrs
description: "When and what to document: JSDoc/TSDoc standards for public APIs, README structure, ADR format for architectural decisions, changelog conventions, and code comment philosophy — document the why, not the what."
---

# Documentation and ADRs

Document the *why*, not the *what*. Code describes what it does. Documentation describes why it exists, what the contract is for callers, and what decisions were made that future maintainers should understand.

## When to Document

**Always document:**
- Exported functions, components, composables, and hooks — every caller needs the contract
- Non-obvious decisions — if you had to think about it, someone else will too
- Workarounds, hacks, and known limitations — context that would otherwise be lost on the next read
- Architecture decisions — ADRs for anything significant or potentially contested

**Document cautiously:**
- Implementation details — they become lies the moment the code changes without updating the comment

**Do not document:**
- What the code obviously does: `// increment the counter` above `count++` adds nothing
- A restatement of the code in prose: a comment that says the same thing as the adjacent code in natural language

**The test**: if the comment would still be accurate after you deleted the code and rewrote it differently to achieve the same result, it documents intent. If it would become false, it documents implementation — and will eventually lie.

---

## JSDoc / TSDoc Standards

### What to Write

```typescript
/**
 * Calculates the total price of an order including applicable tax.
 *
 * @param order - The order to calculate. Must have at least one line item.
 * @param taxRate - Tax rate as a decimal (0.20 for 20%). Must be in range [0, 1].
 * @returns Total price including tax, rounded to 2 decimal places.
 * @throws {InvalidOrderError} When the order has no line items.
 *
 * @example
 * const total = calculateOrderTotal(order, 0.20)
 * // Returns 120.00 for a subtotal of 100.00 at 20% tax
 */
function calculateOrderTotal(order: Order, taxRate: TaxRate): Money { ... }
```

### Minimum viable JSDoc for a public function:
- One-sentence summary (the first line — shown in IDE tooltips)
- `@param` for any parameter whose name does not fully explain its meaning or constraints
- `@returns` describing the return value and any notable caveats
- `@throws` for known, expected error cases
- `@example` for non-trivial usage patterns

### What not to add:
- `@param id - The user ID` — if the parameter name is self-documenting, the JSDoc adds noise
- Descriptions that restate the TypeScript type

### Vue Component Documentation

Document components with the same JSDoc approach:

```typescript
/**
 * Paginated data table with sortable columns and row-level actions.
 *
 * The table manages its own sort state. The parent controls which data
 * is displayed via the `items` prop and handles actions via emitted events.
 *
 * @emits sort-change - When the user changes the sort column or direction.
 *   Payload: `{ column: string; direction: 'asc' | 'desc' }`
 * @emits row-click  - When the user clicks a data row. Payload: the full row item.
 */
```

Document: the component's purpose, any non-obvious prop constraints, events emitted with payload shapes, and slot usage for complex slot contracts.

---

## README Structure

A README a new developer can read in 15 minutes and then be productive:

```markdown
# Project Name

One sentence: what this is and why it exists.

## Getting Started

### Prerequisites
- Node 20+
- [Any accounts or access required before setup]

### Setup
```sh
git clone ...
npm install
cp .env.example .env
# Fill in the values in .env — see the comments for where to get each one
npm run dev
```

### Run the tests
```sh
npm test
```

## Architecture Overview

2–4 paragraphs: how the system is structured at a high level. What are the main layers? 
What does each do? Link to detailed docs for each area.

## Key Concepts

Brief glossary of domain-specific terms used in the codebase. What does "order" mean 
here? What is a "shipment"? Saves hours of confusion for new joiners.

## Development Guide

### Project structure
Where to find things: components, stores, API calls, tests, config.

### Branching strategy
Branch naming, PR process, review expectations.

### Environment variables
Link to where they are documented (never the values themselves in the README).

## Deployment

How to deploy. Who does it. What can go wrong.

## Troubleshooting

Known gotchas and their solutions. This section saves future developers hours — 
add to it every time you waste time on a problem that was not documented.
```

Every `npm run` command a developer will need should be in the README. Screenshots for visual tools; terminal output for CLI tools.

---

## Architecture Decision Records (ADRs)

An ADR captures a significant architectural or design decision: the context, the options considered, and the chosen direction.

### When to Write an ADR

Write one when:
- Adopting a new technology, library, or framework
- Changing the data model significantly
- Choosing between meaningfully different architectural approaches
- Making a decision that future developers will question without context
- Deprecating an existing approach

Do not write ADRs for implementation details or routine coding choices.

### ADR Format

```markdown
# ADR-NNN: [Short imperative title — "Use Pinia instead of Vuex"]

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-NNN
**Date**: YYYY-MM-DD
**Authors**: [names]

## Context

What problem required a decision? What constraints existed? What was the state of the 
codebase or team at the time?

Write this so a developer joining a year later understands why the decision was necessary — 
not just what was decided.

## Decision

What was decided. State it directly. One to three paragraphs.

## Alternatives Considered

For each alternative: what it was, and the specific reason it was not chosen.
Do not just list alternatives without explaining why each one lost.

## Consequences

What becomes easier as a result of this decision?
What becomes harder or more constrained?
What assumptions does this decision rely on?
What technical debt does it introduce, if any?
```

**Numbering**: prefix with `ADR-001`, `ADR-002`. Store in `docs/decisions/` or `adr/`. Commit ADRs in the same PR as the change they document.

When an ADR is superseded, update its status and link to the replacement — do not delete it. The history of why a decision changed is part of the value.

---

## Changelog

Follow [Keep a Changelog](https://keepachangelog.com) format. The changelog is for humans who want to know what changed between versions — not for developers reading commit history.

```markdown
# Changelog

## [Unreleased]

## [2.1.0] - 2024-02-01

### Added
- User profile avatar upload with crop support

### Changed
- Order list now sorts by most recent by default

### Deprecated
- `getUserById` — use `fetchUser` instead; will be removed in v3.0

### Removed
- Legacy `/v1/orders` endpoint (deprecated in v2.0.0, sunset 2024-01-31)

### Fixed
- Navigation breaks when the URL contains a hash

### Security
- Updated `fast-xml-parser` to fix CVE-2023-34104
```

**Rules:**
- Every user-visible change belongs in the changelog
- Internal refactors do not belong unless they change observable behaviour
- Security fixes always go in the `Security` section with a CVE reference where available
- Keep `[Unreleased]` at the top and move it to a release version on ship

---

## Code Comment Philosophy

Three types of comment that add real value:

**1. Intent**: why does this code exist? What requirement does it serve?
```typescript
// The API returns epoch timestamps in seconds, not milliseconds
const timestamp = apiResponse.created_at * 1000
```

**2. Warning**: this is a trap. Future developer — be aware.
```typescript
// Do NOT use `user.id` here — it may be stale if the user recently updated their profile.
// Use `auth.currentUser.id` from the auth composable instead.
```

**3. External context**: something outside the code that explains a decision.
```typescript
// Workaround for a Safari bug with position:sticky inside overflow:scroll containers.
// See: https://bugs.webkit.org/show_bug.cgi?id=XXXXX
// Remove once Safari 18 is the minimum supported version.
```

One type that adds no value:

**4. Restatement**: says exactly what the code says.
```typescript
// Get the user by ID
const user = await getUser(id)
```

---

## Checklist

- [ ] All exported functions, components, and composables have a JSDoc summary
- [ ] `@throws` documented for all known error cases
- [ ] `@example` added for non-trivial usage
- [ ] README includes working setup steps a new developer can follow without asking anyone
- [ ] Significant architectural decisions have committed ADRs
- [ ] Changelog updated for every user-visible or breaking change
- [ ] Security fixes in changelog reference the CVE
- [ ] Comments explain why or warn — not what the code already shows
- [ ] No commented-out code in production — use version control to recover deleted code
