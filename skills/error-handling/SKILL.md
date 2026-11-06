---
name: error-handling
description: "Systematic error handling strategy: error taxonomy, error boundaries, retry patterns with exponential backoff, graceful degradation, user-facing messages, and error monitoring. Covers both frontend and API layers."
---

# Error Handling

Handle errors deliberately, not accidentally. The question is not "does this throw?" but "when it throws, what does the user experience and what does the system record?"

## Error Taxonomy

Classify errors before handling them. Different categories need different treatment.

| Category | Examples | User message | Recovery path |
|---|---|---|---|
| **Validation** | Invalid email, missing required field | Inline field error | User corrects and resubmits |
| **Business rule** | Insufficient balance, duplicate booking, rate limit | Plain-language explanation | User takes alternative action |
| **Authentication** | Session expired, not logged in | "Please log in" | Redirect to login |
| **Authorisation** | Not permitted | "You don't have access" | Return or request access |
| **Network** | Timeout, connection refused, offline | "Unable to connect — try again" | Retry or check connection |
| **System** | Unexpected server error, dependency failure | "Something went wrong" | Retry; escalate if persists |

**Rule**: never expose system errors to users. Never expose stack traces, file paths, database errors, or internal service names.

---

## Error Boundaries

An error boundary is a component or layer that catches errors from below and prevents them propagating to crash the entire application.

### Frontend (Vue)

Use `errorCaptured` lifecycle hook or a dedicated wrapper component to catch render errors within a section:

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  // Return false to prevent propagation to parent boundaries
  return false
})

function reset() {
  error.value = null
}
</script>

<template>
  <slot v-if="!error" />
  <div v-else class="error-boundary">
    <p>Something went wrong in this section.</p>
    <button @click="reset">Try again</button>
  </div>
</template>
```

**Granularity**: a broken recommendations widget should not crash the product page. Apply boundaries at component sections, not only at the page root.

### Service / API Layer

Catch errors at service boundaries before they reach UI components. Transform raw errors (Axios errors, fetch rejections, HTTP error responses) into typed domain error objects:

```typescript
// Bad — raw error reaches the component
const user = await api.get(`/users/${id}`)

// Good — typed error returned from the service layer
const result = await userService.getById(id)
if (!result.ok) {
  // result.error is a typed error with a code and message
}
```

Never let a `catch` block silently discard an error without at minimum logging it.

---

## Async Error Handling

Every async operation can fail. Handle all paths explicitly.

```typescript
// Bad — unhandled promise rejection
fetchUser(id).then(user => setUser(user))

// Good — explicit error path
fetchUser(id)
  .then(user => setUser(user))
  .catch(error => handleError(error))

// Good — async/await with try/catch
try {
  const user = await fetchUser(id)
  setUser(user)
} catch (error) {
  handleError(error)
}
```

### Composable Error State

For API calls used in components, the composable should expose all three states explicitly:

```typescript
const { data: user, loading, error } = useUser(id)
// Component template must handle all three states
```

Do not leave `error` unused. A composable that returns an error state no component ever renders is broken observability.

---

## Retry Patterns

Not all errors are permanent. Network failures, rate limits, and transient service outages benefit from retry.

### When to retry

- Network timeout or connection failure
- `429 Too Many Requests`
- `503 Service Unavailable`
- Any idempotent operation (GET, PUT, DELETE)

### When NOT to retry

- `400 Bad Request` — the input is wrong; retrying sends the same wrong input
- `401 Unauthorized` — retrying will not fix authentication
- `403 Forbidden` — retrying will not fix authorisation
- `422 Validation failure` — same input, same result

### Exponential Backoff with Jitter

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 200
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error
      if (!isRetryable(error)) throw error
      // Exponential backoff with random jitter to avoid thundering herd
      const delay = baseDelayMs * 2 ** attempt + Math.random() * 100
      await sleep(Math.min(delay, 30_000)) // cap at 30 seconds
    }
  }
  throw new Error('Unreachable')
}
```

Cap the maximum delay to prevent very long waits on repeated failures. Add jitter to prevent all retrying clients hitting the server simultaneously after an outage.

---

## Graceful Degradation

When a non-critical dependency fails, the core functionality should continue working.

**Examples:**
- Analytics service is down → page loads; events are dropped silently with a log
- Recommendations service is down → product page loads; "Recommended for you" section shows a placeholder or is hidden
- Image CDN is unreachable → `alt` text displays; page layout does not collapse

**Strategy:**
1. Identify which dependencies are critical (the page cannot function without) vs. non-critical
2. Wrap non-critical calls in try/catch with a fallback value
3. Log the failure for alerting; do not surface the error to the user
4. Design the fallback state as a deliberate UI choice, not just an empty gap

---

## User-Facing Error Messages

### Rules

1. **Plain language**: write for the user, not for the developer
2. **Actionable**: tell the user what to do next
3. **Honest but not technical**: acknowledge the problem without dumping internals
4. **Consistent tone**: match the application's voice

### Templates

| Situation | Message |
|---|---|
| Network failure | "Unable to connect. Check your internet connection and try again." |
| Server error | "Something went wrong on our end. Please try again in a moment." |
| Session expired | "Your session has expired. Please log in again." |
| Not found | "We couldn't find what you were looking for." |
| Not authorised | "You don't have permission to do that." |
| Rate limited | "Too many attempts. Please wait a moment before trying again." |
| Form validation | "Enter a valid email address" / "Password must be at least 8 characters" |

### What Not to Show

- Stack traces or file paths
- HTTP status codes in user-facing text
- Internal service names or database error messages
- Codes that mean nothing to users: "Error code: INTERNAL_SVC_EXCEPTION_408"

---

## Error Monitoring

All unhandled errors in production should be captured by an error monitoring service (Sentry, Datadog, Bugsnag).

**What to capture:**
- Error type and message
- Full stack trace
- User ID (if authenticated) — hashed or anonymised if PII requirements apply
- URL and route
- Browser, OS, device class (for frontend errors)
- Breadcrumbs: recent user actions leading to the error
- Release version — to pinpoint when a regression was introduced

**What not to capture:**
- Passwords, tokens, payment data in breadcrumbs or context
- High-cardinality values that inflate event volume per user (track error patterns, not every individual occurrence)

Configure alerts for: new error types, error rate spikes, regressions in previously resolved errors.

---

## Checklist

- [ ] Every async call has an explicit error handler — no unhandled promise rejections
- [ ] `catch` blocks never silently discard errors — at minimum, log them
- [ ] Error boundaries prevent component-level crashes from crashing the entire page
- [ ] User-facing messages are plain language with a recovery action
- [ ] System errors are logged but not displayed to users
- [ ] Retries use exponential backoff with jitter and only on retryable error codes
- [ ] Non-critical dependencies degrade gracefully with a fallback UI
- [ ] All unhandled errors are captured by error monitoring in production
- [ ] No passwords, tokens, or PII in error logs or captured context
