---
name: api-design
description: "REST and GraphQL API design principles: resource naming, HTTP method semantics, status codes, error contracts, versioning, pagination, authentication patterns, and contract-first development."
---

# API Design

A good API is one developers want to use. It is predictable, consistent, honest about what it does, and explicit about what it cannot do.

## Contract-First Development

Define the API contract before writing implementation code.

Benefits:
- Frontend and backend can be developed in parallel against the same contract
- Design decisions are made when changing them is cheap — before code exists to defend
- The contract is documentation from day one

Tools: OpenAPI 3 / Swagger for REST; SDL files for GraphQL; JSON Schema for data shapes.

Work through the full contract: resources, methods, request shapes, response shapes, error codes, authentication requirements. Fill in all edge cases (empty results, not found, not authorised) before writing any implementation.

---

## REST Design

### Resource Naming
- Resources are **nouns**, not verbs: `/users`, `/orders`, `/articles`
- Use **plural** for collections: `/users` not `/user`
- Hierarchy for owned resources: `/users/{id}/orders`
- Actions that do not map to CRUD: use a verb sub-resource as a last resort — `POST /orders/{id}/cancel`

### HTTP Methods

| Method | Idempotent | Safe | Use for |
|---|---|---|---|
| GET | Yes | Yes | Retrieving resources — no side effects |
| POST | No | No | Creating resources; non-idempotent actions |
| PUT | Yes | No | Full replacement of a resource |
| PATCH | No | No | Partial update of a resource |
| DELETE | Yes | No | Deletion |

**Idempotent** means calling it multiple times produces the same result. Safe means it has no side effects.

### Status Codes

Use the correct code. Never return 200 for everything and encode the real status in the response body.

| Code | Meaning | Use for |
|---|---|---|
| 200 | OK | Successful GET, PATCH, PUT |
| 201 | Created | Successful POST that created a resource; include `Location` header |
| 204 | No Content | Successful DELETE; PATCH/PUT with no body to return |
| 400 | Bad Request | Malformed request syntax, wrong content type |
| 401 | Unauthorized | Not authenticated — include `WWW-Authenticate` header |
| 403 | Forbidden | Authenticated but not authorised for this action |
| 404 | Not Found | Resource does not exist — do not use for auth checks (leaks existence) |
| 409 | Conflict | State conflict: duplicate email, version mismatch, business rule violation |
| 422 | Unprocessable Entity | Well-formed request that fails semantic validation |
| 429 | Too Many Requests | Rate limit exceeded; include `Retry-After` header |
| 500 | Internal Server Error | Unhandled server error — do not expose stack trace |

### Error Response Schema

Pick one schema and use it everywhere. Inconsistency in error responses is the biggest API usability complaint.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid",
    "fields": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Enter a valid email address"
      }
    ]
  }
}
```

Rules:
- `code` is a machine-readable string constant — clients use it for conditional handling
- `message` is human-readable for developers, not end users
- Never expose stack traces, file paths, or SQL in production responses
- `fields` is present only for validation errors — identifies which specific field failed

### Pagination

Choose one strategy and apply it consistently across the API.

**Cursor-based** (preferred for large or frequently-updating datasets):
```
GET /orders?cursor=eyJpZCI6MTAwfQ&limit=20
Response: { data: [...], nextCursor: "eyJpZCI6MTIwfQ", hasMore: true }
```

**Offset-based** (simpler; fine for stable, small-to-medium datasets):
```
GET /orders?page=3&perPage=20
Response: { data: [...], total: 340, page: 3, perPage: 20 }
```

Always include the next-page indicator in the response. Do not require clients to calculate it.

### Versioning

| Strategy | Example | When to use |
|---|---|---|
| URL versioning | `/v1/users`, `/v2/users` | Most common; visible, cacheable, easy to route |
| Header versioning | `Accept: application/vnd.api.v2+json` | Cleaner URLs; harder to test in a browser |
| No versioning | — | Only viable for very small APIs with tight client control |

Maintain at least one previous major version while clients migrate. Deprecate explicitly with a sunset header (`Sunset: Sat, 01 Jan 2026 00:00:00 GMT`) and documentation.

---

## GraphQL Design

### Schema Design Principles
- Model the **domain**, not the database schema — types should reflect business concepts, not table structure
- Use specific custom scalars over bare primitives: `EmailAddress`, `URL`, `DateTime` instead of `String`
- Connections (Relay-style) for paginated collections: `UsersConnection { edges { node cursor } pageInfo }`
- Mutations return the modified resource or a payload type — never just a Boolean
- Use input types for mutation arguments: `createUser(input: CreateUserInput!)` not individual scalars

### Error Handling
GraphQL always returns HTTP 200. Distinguish error types explicitly:

- **User/validation errors**: return in the mutation payload as typed errors — not in the `errors` array
- **System errors**: return in the `errors` array; include no partial data that could be misleading

```graphql
type CreateUserPayload {
  user: User
  userErrors: [UserError!]!
}

type UserError {
  field: String
  code: String!
  message: String!
}
```

### N+1 Query Prevention
Resolving related entities naively triggers one database query per item in the parent list. Use DataLoader or a batching layer to batch all related-entity lookups into a single query per request.

---

## Breaking vs. Non-Breaking Changes

**Breaking changes** require a new major version or a deprecation window:
- Removing a field, endpoint, or operation
- Changing a field type
- Changing a field from optional to required
- Changing a status code's meaning
- Changing authentication requirements

**Non-breaking changes** (no versioning required):
- Adding a new optional field to a response
- Adding a new endpoint or operation
- Adding a new optional query parameter
- Relaxing a constraint (required → optional)
- Adding a new enum value (use caution — clients doing exhaustive matching will break)

---

## Authentication Patterns

| Pattern | Use for | Key rules |
|---|---|---|
| OAuth 2.0 / OIDC | User-facing web apps | Delegate to a known provider; never implement from scratch |
| API keys | Server-to-server | Never in client code; rotate regularly; scope to least privilege |
| JWT (bearer tokens) | Stateless APIs | Validate: signature, `exp`, `iss`, `aud`; store in `httpOnly` cookies for web |
| Session cookies | Traditional web apps | `httpOnly`, `Secure`, `SameSite=Strict` or `Lax`; invalidate server-side on logout |

Never put tokens in URLs — they appear in logs, proxy history, and browser history.

---

## Checklist

- [ ] Resources named as plural nouns
- [ ] HTTP methods used correctly (GET is safe and idempotent; POST is neither)
- [ ] Status codes reflect the actual outcome — no 200 for errors
- [ ] Error responses follow a consistent schema with machine-readable codes
- [ ] Pagination strategy defined and consistent across endpoints
- [ ] Auth tokens not in URLs
- [ ] No stack traces in production error responses
- [ ] Breaking changes versioned or behind a documented deprecation window
- [ ] Contract (OpenAPI / SDL) written before implementation
