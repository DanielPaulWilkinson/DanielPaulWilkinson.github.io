---
name: i18n
description: "Internationalisation patterns: locale architecture, translation key naming conventions, plural forms, date/number/currency formatting with Intl APIs, RTL support, accessibility with i18n, and dynamic locale loading."
---

# Internationalisation (i18n)

Internationalisation is architecture, not text replacement. The decisions made here — key structure, plural handling, date formatting — are expensive to change later. Design them correctly from the start.

## Architecture Decisions

### Locale Identification

Use IETF BCP 47 language tags:
- `en-GB` (English, UK) not `en_GB` or `ENG`
- `fr-FR` for French (France), `fr-CA` for French (Canada)
- `ar-AE` for Arabic (UAE) — distinguishes region-specific formatting

**Language vs. region matters**: `en-AU` and `en-US` have different date formats (DD/MM/YYYY vs MM/DD/YYYY), currency symbols, and vocabulary. Do not collapse them to `en` if those differences matter.

### Locale Resolution and Fallback

```
User preference → Browser locale → Default locale
en-AU → en → en-GB (your default)
```

Define the fallback chain explicitly. Warn in development when a key falls back to the default locale — it surfaces translation gaps before they reach production.

Store the user's locale preference persistently: user profile (authenticated users), localStorage (unauthenticated).

---

## Message File Structure

Organise translation files by feature or domain — not as a single flat file. A flat file with 500+ keys becomes unmaintainable.

```
locales/
  en/
    common.json      ← shared strings (Save, Cancel, Loading, errors)
    auth.json        ← login, register, password reset
    orders.json      ← order-specific strings
    profile.json     ← profile page strings
  fr/
    common.json
    auth.json
    ...
```

Namespaced keys prevent collisions and make the source obvious: `orders.status.pending` not just `pending`.

Dynamic loading: load only the needed namespace on demand. Do not bundle all translations into the initial JS bundle.

---

## Translation Key Naming

Keys describe the **location and nature** of the string, not the string value.

**Good:**
```
auth.login.form.submitButton
auth.login.error.invalidCredentials
orders.list.emptyState.heading
orders.detail.status.pending
navigation.account.label
```

**Bad:**
```
loginButton              ← no location context
pleaseSignInToContinue   ← describes the value (breaks when the English changes)
error1                   ← meaningless
```

Rules:
- Use dot-notation hierarchy: `feature.component.element`
- Keys describe placement and purpose — not content
- Do not use the English string as the key (`"Please sign in"`) — this couples the key to the English translation and breaks when the English copy changes

---

## Pluralisation

Never construct plural strings with conditional code:

```typescript
// Bad — wrong in any language with more than two plural forms
const message = count === 1 ? 'You have 1 item' : `You have ${count} items`

// Good — use the i18n library's plural API
t('cart.items', { count })
```

Many languages have more than two plural forms:
- Russian: 3 forms (1, 2–4, 5+)
- Arabic: 6 forms
- Polish: 4 forms
- Japanese: 1 form (no plural distinction)

The i18n library handles CLDR plural rules automatically when you use its plural API.

Translation file with plural forms:
```json
{
  "cart.items": {
    "one": "You have {count} item",
    "other": "You have {count} items"
  }
}
```

---

## Interpolation

Never concatenate translated strings with variables — word order differs across languages.

```typescript
// Bad — "Hello" + name + "! You have" + count + "messages" breaks in many languages
`${t('greeting')} ${userName}! ${t('messages.count', { count })}`

// Good — interpolation inside the translation string
t('greeting.withName', { name: userName })
// Translation: "Hello, {name}!"  (English)
// Translation: "{name}さん、こんにちは！"  (Japanese — name first)
```

For complex sentences that include counts, names, or other variables, use a single translation key with all variables interpolated. Do not split the sentence across multiple keys.

---

## Date, Time, Number, and Currency Formatting

Use the `Intl` APIs or a library that wraps them. Never hardcode format strings.

```typescript
// Date formatting — locale-appropriate
new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(date)
// → "15 January 2024"

new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(date)
// → "15. Januar 2024"

// Number formatting
new Intl.NumberFormat('de-DE').format(12345.67)
// → "12.345,67"  (German uses . for thousands, , for decimal)

// Currency formatting
new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(99.99)
// → "£99.99"

// Relative time
new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(-1, 'day')
// → "ayer"  (yesterday)
```

**Rules:**
- Always pass the locale explicitly — never rely on the browser's locale matching the user's chosen locale
- Do not use `toLocaleDateString()` or `toLocaleTimeString()` without an explicit locale argument
- Store all dates as UTC; convert to local time for display only
- Currency amounts store the ISO currency code alongside the numeric value — `{ amount: 99.99, currency: 'GBP' }`

---

## RTL (Right-to-Left) Support

Arabic, Hebrew, Persian, and Urdu are RTL. RTL support requires more than flipping text direction.

### HTML

Set `dir="rtl"` on `<html>` when the locale is RTL. This flows the entire page layout automatically.

```html
<html lang="ar" dir="rtl">
```

Mark inline LTR content within RTL text:
```html
<p>مرحبا <span dir="ltr">user@example.com</span></p>
```

Numbers and code remain LTR within RTL text.

### CSS

Use logical CSS properties instead of physical directional properties:

| Physical (avoid) | Logical (use) |
|---|---|
| `margin-left: 16px` | `margin-inline-start: 16px` |
| `padding-right: 8px` | `padding-inline-end: 8px` |
| `border-left: 1px` | `border-inline-start: 1px` |
| `text-align: left` | `text-align: start` |
| `float: right` | `float: inline-end` |

Logical properties resolve based on the document's writing direction automatically.

### Icons

Icons with directional meaning (arrows, chevrons, forward/back controls) should be mirrored for RTL. Use `transform: scaleX(-1)` or provide RTL-specific icon variants.

### Testing

Switch the browser or system locale to Arabic and inspect the layout. Common failures: fixed-width containers that clip text, `margin-left: auto` pushing elements the wrong direction, icons not mirrored.

---

## Dynamic Locale Loading

Load only the needed locale at startup. Lazy-load additional namespaces as users navigate to features that need them.

```typescript
// Initial load — load only current locale's common namespace
const messages = await import(`./locales/${locale}/common.json`)
i18n.setLocaleMessage(locale, messages.default)

// Lazy load a feature namespace when the user navigates to it
async function loadOrdersNamespace(locale: string) {
  const messages = await import(`./locales/${locale}/orders.json`)
  i18n.mergeLocaleMessage(locale, messages.default)
}
```

---

## Accessibility with i18n

- Always set `<html lang="...">` to the active locale — screen readers use this to select the correct pronunciation engine
- Update the `lang` attribute dynamically when the user switches locale
- Keep the language switcher itself accessible — it must work before any locale-specific resources are loaded
- RTL layouts require `dir="rtl"` on `<html>` — assistive technology uses this for navigation order

---

## Common Pitfalls

| Pitfall | Problem | Fix |
|---|---|---|
| Concatenating translated fragments | Word order differs per language | Use interpolation inside a single key |
| Hardcoded date format strings | Wrong in most locales | `Intl.DateTimeFormat` with explicit locale |
| Using English string as the key | Breaks when copy changes | Use descriptive key names |
| Conditional plurals in code | Wrong for languages with > 2 plural forms | i18n library plural API |
| No fallback locale | Missing key shows raw key to user | Define fallback; warn in dev on missing keys |
| Single flat translation file | Unmaintainable at scale | Namespace by feature/domain |
| Same key reused for different contexts | Translation cannot capture context difference | Distinct keys: `action.add.button` vs `math.addition.label` |

---

## Checklist

- [ ] No hardcoded user-visible strings in source code
- [ ] Translation keys are namespaced and describe placement, not content
- [ ] Plurals use the i18n library's plural API — no ternary conditionals
- [ ] Dates, numbers, and currencies formatted with `Intl` APIs and explicit locale
- [ ] Layout uses logical CSS properties (`margin-inline-start`, not `margin-left`)
- [ ] `<html lang="...">` and `dir` attributes updated on locale change
- [ ] Fallback locale defined; missing keys logged as warnings in development
- [ ] Translation files organised by feature/domain namespace
- [ ] Locale loading is dynamic — not all locales bundled into initial JS
