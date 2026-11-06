---
name: security-and-hardening
description: "Audits code for security vulnerabilities using OWASP Top 10 methodology. Covers input validation, authentication, authorisation, secrets handling, XSS/CSRF/injection prevention, and dependency risk. Use during code review, pre-release audits, or dedicated security investigations."
---

# Security and Hardening

Identify real attack vectors, not hypothetical ones. Every finding must have a concrete exploit path — without it, the finding is noise.

## Audit Approach

Work through each risk category systematically. For each finding, state:
1. **The attack vector** — how an attacker would exploit it
2. **The impact** — what they could access, modify, or destroy
3. **The fix** — the specific code change that closes the vulnerability

---

## OWASP Top 10 (2021)

### A01: Broken Access Control
The most common and impactful category. Authentication proves who you are; authorisation controls what you can do.

- Is every action checked for authorisation, not just authentication?
- Can a user access or modify another user's data by changing an ID in the URL or request body (IDOR — Insecure Direct Object Reference)?
- Are access control checks enforced server-side? Client-side-only checks (hidden UI, frontend route guards) are not security controls.
- Are admin or elevated-privilege actions protected against CSRF?
- Can privilege escalation occur through parameter manipulation or JWT claims modification?

**Frontend rule**: hiding a UI element is not authorisation. Assume every hidden route, button, and API call can be reached directly.

---

### A02: Cryptographic Failures
- Are passwords hashed with a modern adaptive algorithm: bcrypt, argon2, or scrypt? Never MD5, SHA1, or unsalted SHA-256.
- Is sensitive data (PII, payment data, health data) encrypted at rest?
- Is TLS enforced for all communication? Are certificates valid and auto-renewed?
- Are cryptographic keys and certificates in a secrets manager — not hardcoded or in version control?
- Are tokens generated with a CSPRNG and of sufficient entropy (not sequential IDs)?

---

### A03: Injection

**SQL**: Parameterised queries only. No string concatenation in SQL — including ORDER BY, table names, and column names if they accept user input.

**XSS (Cross-Site Scripting)**:
- Flag every use of `v-html`, `innerHTML`, `dangerouslySetInnerHTML`, `document.write`
- If user-supplied content reaches the DOM via these, is it sanitised by a trusted library (DOMPurify)?
- Verify Vue's template engine escapes interpolated values — it does by default, but `v-html` bypasses it entirely
- Flag `eval()`, `Function(string)`, `setTimeout(string)`, `setInterval(string)`

**Command injection**: shell commands constructed from user input — flag and require allowlisting.

**Template injection**: user input inserted into server-side template strings.

---

### A04: Insecure Design
- Are there business logic flaws? (e.g., a discount applied multiple times, a quantity field that accepts negative values, a free-tier limit bypassable by racing requests)
- Is rate limiting applied to sensitive operations: login, password reset, OTP, registration?
- Are OTPs and password reset links single-use and short-lived?
- Are there race conditions in state transitions (TOCTOU — time-of-check-to-time-of-use)?

---

### A05: Security Misconfiguration
- Are default credentials changed in all environments?
- Do production error responses expose stack traces, file paths, or framework details?
- Are HTTP security headers set?

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | Restricts which resources can load (XSS mitigation) |
| `Strict-Transport-Security` | Forces HTTPS |
| `X-Content-Type-Options: nosniff` | Prevents MIME sniffing |
| `X-Frame-Options: DENY` | Prevents clickjacking |
| `Referrer-Policy` | Controls referrer information |

- Are CORS policies as restrictive as possible? `Access-Control-Allow-Origin: *` on authenticated endpoints is a critical finding.
- Are unused features, endpoints, debug routes, and sample accounts disabled in production?

---

### A06: Vulnerable and Outdated Components
- Run `npm audit --audit-level=moderate` — are there unfixed CVEs in the dependency tree?
- Are major dependencies on supported, actively maintained versions?
- Are transitive dependencies pinned via lockfile (`package-lock.json`, `yarn.lock`)?

**CI gate**: `npm audit --audit-level=high` should fail the build.

---

### A07: Identification and Authentication Failures
- Are session tokens invalidated on logout (server-side, not just client-side cookie deletion)?
- Are password reset tokens single-use, short-lived (< 1 hour), and unpredictable?
- Is there account lockout or exponential backoff on login failures?
- Are JWTs validated fully: signature algorithm, expiry (`exp`), issuer (`iss`), audience (`aud`)? Beware the `alg: none` attack.
- Are refresh tokens stored in `httpOnly` cookies — not `localStorage` (XSS accessible) or `sessionStorage`?

---

### A08: Software and Data Integrity Failures
- Is `npm install` always run from a lockfile in CI (not `npm install --legacy-peer-deps` without a lock)?
- Are CI/CD pipeline files protected against modification by untrusted contributors?
- Are third-party scripts loaded from a CDN validated with Subresource Integrity (`integrity="sha384-..."` attribute)?

---

### A09: Security Logging and Monitoring Failures
- Are authentication events logged: login, logout, failed login, password reset?
- Are access control violations (403s) logged with enough context to investigate?
- Do logs include: timestamp, user ID, IP, resource, action, outcome — without including passwords, tokens, or PII?
- Are logs stored separately from the application and write-protected?

---

### A10: Server-Side Request Forgery (SSRF)
- Does the application fetch URLs provided or influenced by users?
- Are internal network addresses (`169.254.x.x`, `10.x.x.x`, `localhost`) blocked in an outbound URL allowlist?
- Are redirects followed without re-checking the destination against the allowlist?

---

## Secrets Management

- **Never** commit secrets to version control. Scan `.env` files, config files, and any hardcoded strings.
- Git scan command: `git log -p --all | grep -i -E '(password|secret|key|token|api_key)\s*='`
- Confirm `.gitignore` contains `.env`, `.env.*`, and any local config files
- Environment variables prefixed `VITE_`, `NEXT_PUBLIC_`, or `REACT_APP_` are embedded in the client bundle — they are visible to any user. Never put secrets there.
- Production secrets belong in a secrets manager (Vault, AWS Secrets Manager, GitHub Encrypted Secrets).

---

## Input Validation

Validate at every system boundary — user input, API responses, URL parameters, file uploads:

| Property | Check |
|---|---|
| Type | Is it the expected type? |
| Range | Within acceptable bounds? |
| Format | Matches expected pattern (email, UUID, URL)? |
| Size | Within length/size limits? |
| Allowed values | If a finite set, is the value in the set? |

TypeScript types are compile-time only. They do not validate runtime data crossing a network boundary.

---

## Dependency Risk Assessment

Before adding a new dependency, verify:
1. Download count and maintenance activity (last commit date, open issues, active maintainer)
2. `npm audit` result after adding
3. Known CVEs in the advisory database
4. License compatibility
5. Transitive dependency footprint — a small utility pulling in many transitive deps multiplies the attack surface

---

## Checklist

- [ ] Every authenticated action checks authorisation, not just authentication
- [ ] No user-controlled content reaches the DOM without sanitisation
- [ ] No secrets in source code or committed `.env` files
- [ ] `npm audit` passes at high severity (moderate for explicit review)
- [ ] HTTP security headers configured
- [ ] Rate limiting on login, registration, and password reset
- [ ] Session tokens invalidated server-side on logout
- [ ] Production errors reveal no stack traces or internal paths
- [ ] JWTs validated for signature, expiry, issuer, and audience
- [ ] Tokens stored in `httpOnly` cookies, not localStorage
