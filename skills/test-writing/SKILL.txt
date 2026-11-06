---
name: test-writing
description: "Writes effective tests that catch real bugs: unit, integration, and E2E. Covers TDD red-green-refactor, test pyramid strategy, behaviour-driven naming, mocking boundaries, and systematic edge case coverage."
---

# Test Writing

Write tests that catch real bugs and describe expected behaviour. A test that cannot fail is not a test.

## Core Principle

Test behaviour, not implementation. Tests should describe what the system does from the outside — inputs, outputs, side effects — not how it does it internally. Tests tied to implementation details break on every refactor; tests tied to behaviour survive them.

## When to Use

- Before writing new code (TDD: write the failing test first)
- After implementation, to add coverage for edge cases, error paths, and unhappy flows
- When fixing a bug (write a failing test that reproduces the bug, then fix it)
- When reviewing tests that only assert existence without interaction verification

**When NOT to use:**
- Do not write tests for trivial boilerplate with no logic
- Do not write tests to hit a coverage percentage — write them to prevent real failures

---

## Test Pyramid

```
        E2E tests (few)
       ─────────────────
    Integration tests (some)
   ──────────────────────────
  Unit tests (many)
─────────────────────────────────
```

**Unit tests**: one function or component in isolation. Fast, precise, many. Mock all external dependencies.

**Integration tests**: two or more real units working together. Test at API/composable boundaries. Some mocking allowed.

**E2E tests**: the full user journey through the real application. Slow, brittle — keep few, make them high value.

---

## TDD: Red-Green-Refactor

1. **Red** — write a failing test that describes the desired behaviour. Run it; confirm it fails for the right reason.
2. **Green** — write the minimal code to make it pass. Do not over-engineer.
3. **Refactor** — clean the code while keeping the test green. Run tests after each change.

Never skip the Red step. A test written after the code is already working cannot tell you whether it would have caught the bug.

---

## Anatomy of a Good Test

**Structure: Arrange — Act — Assert**

```typescript
it('returns EMAIL_ALREADY_REGISTERED when the email is already in use', async () => {
  // Arrange
  const existingUser = createUser({ email: 'test@example.com' });
  await userRepository.save(existingUser);

  // Act
  const result = await registerUser({ email: 'test@example.com', password: 'hunter2' });

  // Assert
  expect(result.ok).toBe(false);
  expect(result.error).toBe('EMAIL_ALREADY_REGISTERED');
});
```

**One behaviour per test.** Multiple assertions per test are fine when they all verify the same behaviour. Multiple behaviours per test is not.

**Test names describe behaviour, not code:**
- Bad: `test('registerUser function')`
- Bad: `test('returns false')`
- Good: `it('returns EMAIL_ALREADY_REGISTERED when the email is already in use')`
- Good: `it('redirects to the dashboard after successful login')`

---

## What to Test

### Always test:
- The happy path (correct inputs → expected output)
- The error path (bad inputs, system failures → correct error handling)
- Edge cases: empty arrays, null/undefined, zero, max/min values, empty strings
- Boundary conditions: exactly at limits (0, 1, N, N+1)
- Async failures: what happens when a promise rejects or a request times out

### Coverage priority by area:
| Area | Priority | Rationale |
|---|---|---|
| Business logic and domain rules | High | Bugs here cost the most |
| API boundaries and data transforms | High | Contracts must hold |
| Components with conditional rendering or interactions | Medium | Behaviour visible to users |
| Pure layout/presentational components | Low | E2E covers these |
| Third-party library wrappers | Lowest | Test your code, not the library |

---

## Mocking Strategy

Mock at the boundary of your system — not inside it. A mock replaces an external dependency (HTTP, database, time, random). It does not replace internal functions.

**Mock these:**
- HTTP clients (`fetch`, `axios`, `ofetch`)
- Database repositories or ORM clients
- External service SDKs
- `Date.now()`, `setTimeout`, `Math.random()`
- File system access

**Do not mock these:**
- Internal utility functions
- Domain objects — use real ones with test data factories
- The function under test itself

**Spies**: use only when you need to assert a function was called with specific arguments (e.g., analytics events, side-effect calls).

---

## Vue Component Tests

Test components as users interact with them:
- Query by accessible role, label, or visible text — not by CSS class or component name
- Trigger user events (`click`, `input`, `submit`, `keydown`) — never call internal methods directly
- Assert on what the user sees — not on internal state or component data

```typescript
// Bad — tests implementation detail (internal state)
expect(wrapper.vm.isSubmitting).toBe(true);

// Good — tests user-visible behaviour
expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
```

For async operations, use `flushPromises()` or `waitFor()` — never arbitrary `setTimeout`.

---

## Edge Case Checklist

For any new function or component, verify:
- [ ] Empty input (empty string, empty array, null, undefined)
- [ ] Single-element input where multiple are expected
- [ ] Maximum or minimum boundary values
- [ ] Concurrent calls or rapid re-triggers
- [ ] Async failure (rejected promise, network timeout)
- [ ] Missing permissions or unauthenticated user
- [ ] Partial data (some fields present, others absent)
- [ ] Idempotency — does calling twice produce the same result?

---

## Flaky Test Prevention

Flaky tests fail intermittently without code changes. Prevent them:
- Never use `setTimeout` or `sleep` in tests — use `vi.runAllTimers()`, `flushPromises()`, or `waitFor()`
- Never depend on test execution order — each test must be independently runnable
- Reset all mocks and shared state in `beforeEach` / `afterEach`
- Avoid fixed date assertions — freeze time with `vi.useFakeTimers()` or use relative assertions
- Use explicit waits (`waitFor`) instead of assuming async operations have finished

---

## Red Flags

- Tests with no assertions, or always-true assertions (`expect(true).toBe(true)`)
- Tests that only assert a function was called, not what it returned or what changed
- Tests querying by CSS class names or `data-testid` values that describe implementation
- Long `beforeEach` setup blocks — suggests the unit is too large
- Tests that break when you rename an internal variable
- No tests for error state, empty state, or loading state
- Mocking the function under test
- 100% line coverage with 0% behaviour coverage
