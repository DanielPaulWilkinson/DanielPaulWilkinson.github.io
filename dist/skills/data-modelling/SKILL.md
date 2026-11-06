---
name: data-modelling
description: "Domain model design: entities vs value objects, making invalid states unrepresentable in the type system, discriminated unions for state machines, relationship patterns, normalisation principles, and type-driven design for correctness."
---

# Data Modelling

A good data model makes invalid states unrepresentable. Business rules encoded in structure cannot be bypassed; business rules scattered as runtime checks can be.

## Core Concepts

### Entity vs Value Object

**Entity**: has an identity that persists independently of its attributes. Two entities with identical data are different things if they have different identities.

```typescript
// Entity — identity is User.id; same email doesn't mean same user
interface User {
  id: UserId           // identity
  email: EmailAddress
  name: FullName
  createdAt: Date
}
```

**Value Object**: defined entirely by its value. Two value objects with equal data are interchangeable. No identity of their own.

```typescript
// Value object — same address value = same address
type EmailAddress = string & { readonly _brand: 'EmailAddress' }
type Money = { readonly amount: number; readonly currency: CurrencyCode }
```

**Rule of thumb**: if you would say "the same user" (identity matters), it is an entity. If you would say "the same email address" (value is what matters), it is a value object.

---

## Make Invalid States Unrepresentable

The compiler should prevent invalid data from being constructed — not runtime checks after the fact.

### Branded / Nominal Types

Prevent mixing up values with the same structural type:

```typescript
type UserId = string & { readonly _brand: 'UserId' }
type OrderId = string & { readonly _brand: 'OrderId' }
type ProductId = string & { readonly _brand: 'ProductId' }

// The compiler will reject this — OrderId is not assignable to UserId
function getUser(id: UserId): User { ... }
getUser(order.id) // TypeError at compile time
```

Define constructor functions that validate and brand values:
```typescript
function parseUserId(raw: string): UserId {
  if (!isUUID(raw)) throw new Error('Invalid UserId')
  return raw as UserId
}
```

### Discriminated Unions for State Machines

Model mutually exclusive states as a union. Each branch carries only the data that exists in that state.

```typescript
// Bad — optional fields proliferate; no compiler guarantee they are set correctly
interface Order {
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: Date          // only relevant when paid
  paymentRef?: string    // only relevant when paid
  cancelledAt?: Date     // only relevant when cancelled
  cancelReason?: string  // only relevant when cancelled
}

// Good — each state is a separate type; invalid combinations are impossible
type Order =
  | { status: 'pending';   createdAt: Date }
  | { status: 'paid';      createdAt: Date; paidAt: Date; paymentRef: string }
  | { status: 'cancelled'; createdAt: Date; cancelledAt: Date; reason: string }
```

Pattern matching forces exhaustive handling at every call site:

```typescript
function describeOrder(order: Order): string {
  switch (order.status) {
    case 'pending':   return 'Awaiting payment'
    case 'paid':      return `Paid on ${order.paidAt.toDateString()}`
    case 'cancelled': return `Cancelled: ${order.reason}`
    // TypeScript errors if a case is unhandled
  }
}
```

### Non-Empty Arrays

Encode the "at least one" constraint in the type:

```typescript
type NonEmptyArray<T> = [T, ...T[]]

function applyDiscounts(items: NonEmptyArray<LineItem>): Total { ... }
// Caller cannot pass an empty array — the compiler rejects it
```

### Constrained Numeric Ranges

For values with known bounds, validate at the boundary and encode in a branded type:

```typescript
type Percentage = number & { readonly _brand: 'Percentage' } // 0–100
type TaxRate = number & { readonly _brand: 'TaxRate' }       // 0–1

function parseTaxRate(n: number): TaxRate {
  if (n < 0 || n > 1) throw new Error('Tax rate must be between 0 and 1')
  return n as TaxRate
}
```

---

## Relationship Patterns

### Ownership vs Reference

**Composition (owns)**: the child cannot meaningfully exist without the parent. Destroy the parent → destroy the children.

```typescript
// Order owns its line items — a line item has no meaning outside an order
interface Order {
  id: OrderId
  lineItems: LineItem[]  // embedded; no separate LineItem identity
}
```

**Association (references)**: the related entity exists and is managed independently.

```typescript
// Order references a Customer — the customer exists independently of orders
interface Order {
  id: OrderId
  customerId: CustomerId   // ID reference; Customer is not embedded
}
```

### Many-to-Many

Represent via a named join entity that can carry its own data:

```typescript
// Bad — obscures that the relationship has its own data
interface Project {
  memberIds: UserId[]
}

// Good — join entity carries the relationship's own data
interface ProjectMembership {
  projectId: ProjectId
  userId: UserId
  role: ProjectRole
  joinedAt: Date
}
```

---

## Normalisation Principles

### First Normal Form (1NF)
Each attribute holds a single, atomic value. No repeating groups, no delimited lists in a single field.
- Bad: `tags: "javascript,typescript,vue"` (delimited string in one column)
- Good: separate `Tag` entity with a join table, or a proper array column

### Do Not Denormalise Without a Measured Reason
Denormalisation (duplicating data for read performance) introduces a consistency risk. Do it deliberately:
- Define which copy is the source of truth
- Document the process for keeping copies in sync
- Use it only after profiling shows normalised reads are too slow

### Avoid the "Magic String" Pattern
Replace repeated string constants with enums or union types:

```typescript
// Bad — typos are silently valid; no autocomplete
const status = 'cancled' // typo undetected at compile time

// Good
type OrderStatus = 'pending' | 'paid' | 'cancelled'
const status: OrderStatus = 'cancled' // TypeError
```

---

## Type System Design

### Domain Vocabulary in Types

Types should use domain language, not implementation language:

```typescript
// Bad — bare primitives; no domain meaning
function createOrder(userId: string, items: { id: string; qty: number }[])

// Good — types express domain concepts
function createOrder(customerId: CustomerId, items: NonEmptyArray<OrderLineItem>)
```

### Derive Secondary Types

When a type is used in multiple forms (create, update, view), derive the variants from the authoritative domain type:

```typescript
interface User { id: UserId; email: EmailAddress; name: FullName; createdAt: Date }

type CreateUserInput = Omit<User, 'id' | 'createdAt'>     // derived
type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>  // derived
```

This ensures they stay in sync — change `User` and both derived types update automatically.

---

## Domain Modelling Checklist

Before finalising a model:
- [ ] Entities have stable identities; value objects are compared by value
- [ ] Invalid states are unrepresentable — discriminated unions, branded types, or constrained types
- [ ] Optional fields are only optional when the concept genuinely does not apply (not "we don't know yet")
- [ ] Entity relationships use embedding (composition) vs. ID reference (association) correctly
- [ ] Many-to-many relationships have a named join entity if the relationship carries its own data
- [ ] Domain concepts have their own named types — not bare `string`, `number`, `boolean`
- [ ] The model reads in domain language — a non-technical domain expert could understand entity names

---

## Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| Bare `string` for all IDs | Easy to mix up entity IDs | Branded types: `UserId`, `OrderId`, `ProductId` |
| Optional fields for absent-but-unknown data | Null proliferation; every access requires guards | Discriminated union; require value at construction |
| Flat status strings with conditional optional fields | Invalid states representable | Discriminated union per state |
| Embedding mutable related entities | Synchronisation problems | Reference by ID; load independently |
| Duplicate type definitions for related shapes | Types diverge over time | Derive with `Omit`, `Pick`, `Partial` from one authoritative type |
| Deep nesting | Hard to query, update, and reason about | Flatten with ID references; limit nesting to 2 levels |
| `any` or `object` for domain values | No type safety on critical data | Specific types for every domain concept |
