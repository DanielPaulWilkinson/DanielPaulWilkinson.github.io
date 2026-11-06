---
name: observability
description: "Design and implement observability for production systems: structured logging, RED metrics, distributed tracing, symptom-based alerting, SLOs, and dashboards. Covers what to instrument, how to structure it, and how to alert on what actually matters."
---

# Observability

You cannot fix what you cannot see. Observability tells you the health of your system before users report that it is broken.

## The Three Pillars

| Pillar | Answers | Purpose |
|---|---|---|
| **Logs** | What happened? | Debugging specific incidents |
| **Metrics** | How is it performing over time? | Trending, alerting, SLOs |
| **Traces** | Where did a specific request spend its time? | Latency attribution, dependency mapping |

Use all three. They answer different questions and are complementary, not alternatives.

---

## Structured Logging

### Format: Always JSON

Log as machine-parseable JSON — not free-form text strings that require regex to query.

```json
{
  "timestamp": "2024-01-15T10:23:45.123Z",
  "level": "error",
  "service": "order-api",
  "traceId": "abc-123-xyz",
  "spanId": "def-456",
  "userId": "user-789",
  "action": "order.create",
  "orderId": "order-999",
  "errorCode": "PAYMENT_DECLINED",
  "message": "Order creation failed: payment declined",
  "durationMs": 342
}
```

Always include: `timestamp`, `level`, `service`, `message`. Add domain context fields as needed. Include `traceId` on every log line to correlate logs with traces.

### What to Log

**Always:**
- Application start and shutdown (configuration summary — no secrets)
- Authenticated user requests: user ID, resource, action, outcome
- Authentication events: login, logout, failed login (never log the attempted password)
- Business state transitions: order status changes, payment processing, user account changes
- Outbound calls to external services: target, status code, duration
- Errors and exceptions: full stack trace, contextual fields

**Never:**
- Passwords, secret keys, tokens, session IDs
- PII (full names, emails, payment data) unless explicitly required and access-controlled
- Verbose debug trace of every function call in production

### Log Levels

| Level | Use for |
|---|---|
| `error` | Unrecoverable failure requiring human attention |
| `warn` | Recoverable issue, degraded state, deprecated feature use |
| `info` | Normal notable events: request received, state changed, job completed |
| `debug` | Detailed diagnostic information — **off in production** by default |

Production log level should be `info` or `warn`. `debug` in production drowns real signals.

---

## RED Metrics

Instrument every service with three baseline metric categories:

| Metric | What it measures | Example |
|---|---|---|
| **Rate** | Throughput (requests per second) | `http_requests_total` (counter) |
| **Errors** | Error rate (failed requests) | `http_errors_total` (counter) |
| **Duration** | Latency (how long requests take) | `http_request_duration_seconds` (histogram) |

Instrument at the service boundary first. Add business-domain metrics (orders placed, payments processed) as a second layer.

### Metric Types

| Type | Use for | Example |
|---|---|---|
| **Counter** | Monotonically increasing value; rate of change is meaningful | Total requests, total errors |
| **Gauge** | Current value that can go up or down | Queue depth, active connections, cache size |
| **Histogram** | Distribution of values; enables percentile calculations | Request duration, payload size |

For latency, always use a histogram — averages are misleading. Report p50, p95, and p99. A p99 of 5s means 1% of users wait 5 seconds.

### Label Cardinality

Labels slice metrics into dimensions. Keep cardinality bounded — unbounded labels explode storage and query cost.

**Good labels**: `service`, `endpoint`, `http_method`, `status_code`, `environment`

**Never as labels**: `user_id`, `request_id`, `session_token`, `email` — these are unbounded and create millions of unique label combinations.

---

## Distributed Tracing

A trace follows a single request through all the services and operations it touches. Each unit of work within a trace is a **span**.

### What to Instrument as Spans

- Incoming HTTP requests
- Outbound HTTP calls to other services
- Database queries (include sanitised query string, rows affected)
- Cache operations (hit/miss)
- Message queue publishes and consumes
- External service SDK calls

### Context Propagation

Pass the `traceparent` header (W3C Trace Context standard) on every outbound call. This links spans across service boundaries into a single trace.

```typescript
// When making an outbound call, include the trace context
const response = await fetch(url, {
  headers: {
    ...getTraceContextHeaders(), // traceparent, tracestate
    'Content-Type': 'application/json',
  }
});
```

### Useful Span Attributes (OpenTelemetry semantic conventions)

```
http.method, http.url, http.status_code, http.response_content_length
db.system, db.statement, db.operation, db.sql.table
messaging.system, messaging.destination, messaging.message_id
```

---

## Alerting

### Alert on Symptoms, Not Causes

**Good alert**: "5xx error rate > 1% for 5 minutes" — users are being affected right now.

**Bad alert**: "CPU utilisation > 80%" — an internal metric. The service may be healthy despite high CPU.

Alert on user-facing symptoms:
- Error rate above threshold
- Request latency p99 above threshold
- Success rate below threshold
- Health check endpoint failing

### Alert Quality

| Property | Requirement |
|---|---|
| **Actionable** | Every alert maps to a runbook with specific steps |
| **Relevant** | Alert fires when users are affected, not when something is merely unusual |
| **Low noise** | False positives get ignored — tune thresholds before shipping |
| **Fast** | Alert fires before users report the problem |

**Alert fatigue rule**: if an alert fires more than twice a week without resulting in action, either fix the underlying issue or raise the threshold. An alert that is always firing is noise, not a signal.

### Severity Levels

| Level | Definition | Response time |
|---|---|---|
| Critical (P1) | User-facing service down or severely degraded | Immediate, 24/7 |
| High (P2) | Significant degradation affecting many users | Within 30 minutes |
| Medium (P3) | Partial degradation or SLO at risk | Business hours |
| Low (P4) | Informational, approaching a threshold | Review next day |

---

## SLOs (Service Level Objectives)

An SLO is a target for a user-experience metric. It sets the reliability bar and creates a shared language between engineering and stakeholders.

### Define SLOs Around User Experience

- **Availability**: "99.9% of requests return a successful response over a 30-day rolling window"
- **Latency**: "95% of requests complete in under 300ms"
- **Error rate**: "Error rate remains below 0.1% in any 5-minute window"

### Error Budget

If SLO is 99.9%, the error budget is 0.1% — approximately 43 minutes of downtime per month.

When the error budget is depleted:
- Reliability work takes priority over feature work
- Root cause analysis is required before the next deployment

Track error budget burn rate on dashboards — a fast burn rate is an early warning of SLO breach.

---

## Dashboards

A useful dashboard answers a specific question at a glance. An unfocused dashboard is noise.

**Service health dashboard** — one per service:
- Requests per second (rate)
- Error rate (%)
- Latency (p50, p95, p99)
- SLO burn rate

**Business metrics dashboard** — domain-specific:
- Orders placed per hour
- Payment success rate
- Active users

**Principle**: if a dashboard panel requires explanation to interpret, redesign it or add a title that states the question it answers.

---

## Checklist

- [ ] Logs are structured JSON with `timestamp`, `level`, `service`, `traceId`, `message`
- [ ] No passwords, tokens, or PII in logs
- [ ] RED metrics (rate, errors, duration) instrumented for all services
- [ ] Histograms used for latency — percentiles available (p95, p99)
- [ ] Distributed trace context propagated on all outbound calls
- [ ] Alerts fire on user-facing symptoms, not internal metrics
- [ ] Every alert has a corresponding runbook
- [ ] SLOs defined with quantified error budgets
- [ ] Service health dashboard covers rate, errors, and latency
