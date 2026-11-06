---
name: performance-optimization
description: "Systematic approach to performance work: measure first, identify the highest-impact bottleneck, fix it, then measure again. Covers Core Web Vitals, bundle analysis, rendering performance, caching, and network optimisation."
---

# Performance Optimization

Measure before optimising. An unmeasured optimisation is guesswork. A change that does not improve a tracked metric is waste.

## The Rule: Measure → Identify → Fix → Measure Again

1. Record the baseline metric with a reproducible method
2. Identify the actual bottleneck (not a guess)
3. Apply one fix at a time — multiple simultaneous changes hide which one helped
4. Re-measure with the same tool to confirm improvement
5. Confirm no regression in other metrics

Never ship a performance fix without a before/after comparison.

---

## Core Web Vitals

Google's user-experience metrics. LCP affects SEO; all three affect perceived quality and user trust.

| Metric | What it measures | Good | Needs work | Poor |
|---|---|---|---|---|
| **LCP** — Largest Contentful Paint | Main content load speed | < 2.5s | 2.5–4s | > 4s |
| **INP** — Interaction to Next Paint | Responsiveness to input | < 200ms | 200–500ms | > 500ms |
| **CLS** — Cumulative Layout Shift | Visual stability | < 0.1 | 0.1–0.25 | > 0.25 |

---

## Measurement Tools

**Synthetic (in-browser):**
- Chrome DevTools → Performance tab: record traces, inspect main thread, identify long tasks and layout events
- Chrome DevTools → Network tab: request waterfall, transfer sizes, cache behaviour, time-to-first-byte
- Lighthouse: automated CWV audit with recommendations — run via Chrome DevTools or `npx lighthouse`

**Bundle analysis:**
- `rollup-visualizer` (Vite): add to `vite.config.ts` plugins — generates a treemap of bundle composition
- `webpack-bundle-analyzer` (Webpack): equivalent for webpack builds
- `source-map-explorer`: analyses the final bundle using source maps

**Runtime / real-user:**
- Vue DevTools → Performance tab: component render timings, event traces
- Chrome DevTools → Memory tab: heap snapshots, allocation timeline for memory leaks

**Important**: always measure in a production build (`npm run build && npm run preview`). Dev mode intentionally skips optimisations and is 3–10× slower.

---

## Profiling Workflow

1. **Reproduce the slow scenario** in a production-like build
2. **Record a trace** covering the specific user action being measured
3. **Identify the bottleneck**: the longest tasks on the main thread, the heaviest network transfers, the most frequent renders
4. **Confirm the root cause** in code before changing anything — find the specific file and function
5. **Apply one fix** — do not bundle multiple changes
6. **Re-measure** to confirm the metric improved
7. **Check for regressions** — LCP, INP, and CLS can trade off against each other

---

## Bundle Size

### Identify what is large
- Run bundle analyser — look for unexpectedly large modules and duplicates
- Two versions of the same package in the bundle is a common, non-obvious problem (check with `npm ls <package>`)
- Look for packages imported in full that support tree-shaking: `import _ from 'lodash'` vs. `import debounce from 'lodash/debounce'`

### Reduction strategies
- **Code splitting**: `import()` for routes and heavy non-critical components
- **Lazy loading**: defer below-the-fold components until after initial paint
- **Replace heavy libraries**: moment.js → date-fns, full lodash → lodash-es cherry-picks, heavy chart libs → lightweight alternatives
- **Move to server-side**: utilities only used in SSR/API routes do not belong in the client bundle
- **Image optimisation**: WebP or AVIF format, correct intrinsic dimensions, `loading="lazy"` for off-screen images

### Bundle size budget
| Segment | Target (uncompressed) |
|---|---|
| Critical path (initial paint) | < 100KB JS |
| Total initial JS | < 300KB |
| Any single lazy-loaded chunk | < 100KB |

---

## Rendering Performance (Vue)

### Unnecessary re-renders
- Components re-render when any reactive dependency changes — trace which reactive values a component actually reads
- Use `computed` instead of recalculating in template expressions — computed values are cached until their dependencies change
- `v-once` for content that never changes after initial render
- `v-memo` for list items that should only re-render on specific prop changes
- Avoid reactive getters that return new object/array references on every call — Vue treats them as changed even if the content is identical

### Expensive computations
- Heavy calculations in `computed` are cached — prefer them over `methods` called in templates
- Move expensive pure functions outside components and call them lazily
- Web Workers for CPU-intensive work that would block the main thread (parsing, encryption, large data transforms)

### Long lists
- Virtualise lists with more than ~100 visible items — render only the visible rows
- Use `vue-virtual-scroller` or equivalent
- `key` attribute on `v-for` items must be stable and unique — avoid array index as key in sorted/filtered lists

### Layout thrashing
- Do not read layout properties (`offsetHeight`, `getBoundingClientRect`, `scrollTop`) inside loops
- Batch all DOM reads first, then all writes — interleaving reads and writes forces the browser to recalculate layout repeatedly

---

## Network Performance

- **Preconnect** to critical third-party origins (fonts, CDNs): `<link rel="preconnect" href="https://fonts.googleapis.com">`
- **Preload** critical resources that the browser discovers late: `<link rel="preload" as="image" href="/hero.webp">`
- **HTTP/2**: multiplexes many requests over one connection — small parallel requests are cheap
- **Caching**: static assets should have content-hash filenames and long `Cache-Control: max-age`; API responses should have the shortest acceptable TTL
- **Eliminate render-blocking resources**: CSS in `<head>` is fine; JavaScript should be `async` or `defer` unless truly critical

---

## Caching Strategy

| Layer | When to cache | Invalidation |
|---|---|---|
| HTTP cache | Static assets, stable API data | Content-hash filenames; `Cache-Control` headers |
| In-memory (Pinia store) | Frequently read, rarely changing data within a session | Clear on logout / data mutation |
| Browser storage (localStorage) | User preferences, draft content | Explicit clear; version key for schema changes |
| Service worker | Full offline support | `workbox` strategies; activate new SW on update |

Define invalidation strategy before adding any cache. Stale data is a correctness problem, not just a UX problem.

---

## Anti-Patterns

| Anti-pattern | Problem |
|---|---|
| Optimising before measuring | May fix the wrong bottleneck |
| Measuring in dev mode | Results are not representative of production |
| Multiple simultaneous changes | Cannot isolate which change helped |
| `debounce` as a performance fix | Masks the real problem; does not fix it |
| Adding a cache without an invalidation strategy | Stale data bugs |
| Premature code splitting | Increases request count; may worsen LCP |
| Fixing CPU when the bottleneck is network | Wrong layer |

---

## Checklist

- [ ] Baseline metric recorded with a specific tool before the change
- [ ] Improvement confirmed with the same tool after the change
- [ ] No regression in other Core Web Vitals
- [ ] Bundle size not exceeded without justification
- [ ] Measurement performed in a production build
- [ ] Caching additions have a defined invalidation strategy
- [ ] Long lists are virtualised if > 100 visible items
