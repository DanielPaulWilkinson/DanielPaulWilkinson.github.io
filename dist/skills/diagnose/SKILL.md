---
name: diagnose
description: "Investigates a technical problem in an existing codebase using evidence-first methodology: form multiple hypotheses, gather code evidence to confirm or reject each, classify evidence quality, and identify root causes across system layers. Use from any agent that needs to understand a problem thoroughly before deciding how to fix it."
---

# Diagnose

Determine what is actually wrong before theorising how to fix it. The codebase is the primary source of truth.

## Evidence-First Rule

Read code before forming hypotheses. Hypotheses formed without evidence anchor to the wrong place and survive longer than they should.

---

## Investigation Steps

### Step 1 — Sharpen the symptom

Define exactly what fails, when, and under what conditions. Vague symptoms produce vague diagnoses.

- What is the observable failure? Quote error messages or describe behaviour precisely.
- Under what conditions does it occur? (specific inputs, user actions, environment, data state)
- Under what conditions does it NOT occur? Negative cases constrain the hypothesis space.
- When did it start? Was there a deploy, a data change, or a dependency update near that time?

### Step 2 — Check recent changes

Run `git log --oneline -20` on relevant files. Regressions are most often the most recent change. If the problem appeared after a specific date or deploy, check commits in that window first.

### Step 3 — Map the execution path

Read the code from entry point to failure. Do not hypothesise yet. Trace:
- Where does control enter the affected area?
- What data flows through it and how is it transformed?
- Where does the actual behaviour diverge from the expected behaviour?
- What state is involved? Where is it set and read?

Read real code. Do not reason from memory or general knowledge about what the code probably does.

### Step 4 — Form hypotheses (minimum 3)

Generate competing explanations before exploring any single one. This prevents anchoring on the first plausible idea. For each hypothesis:

- What would need to be true for this to be the root cause?
- What evidence would confirm it?
- What evidence would definitively rule it out?

List hypotheses before gathering targeted evidence. Order them by how cheaply they can be confirmed or rejected.

### Step 5 — Gather evidence

For each hypothesis, read the relevant code, trace the data flow, check tests, and inspect recent changes. Classify every piece of evidence:

| Classification | Meaning |
|---|---|
| **Fact** | Directly observed: specific file, line, log output, or test result |
| **Inference** | Logical conclusion derived from one or more Facts |
| **Opinion** | Judgment that cannot be directly verified from the code |

Rate confidence: **High** (multiple independent confirming facts), **Medium** (partial or indirect evidence), **Low** (plausible but unconfirmed).

Only cite `file:line` references you have actually read. Never fabricate a location.

### Step 6 — Check each system layer

Problems rarely announce which layer caused them. Consciously check each:

- **Presentation**: rendering, component state, event handling, user input handling
- **Business logic**: rules, calculations, state machines, invariants
- **Data access**: queries, caching, mapping, serialisation/deserialisation
- **Integration**: API contracts, error handling across service boundaries, timeouts
- **Configuration**: environment variables, feature flags, deployment config, dependency versions
- **Infrastructure**: network, storage, platform-specific behaviour

Note which layers you checked and cleared — gaps in the check are gaps in the diagnosis.

### Step 7 — Identify root cause(s)

Distinguish symptom from cause. A crash is a symptom. A missing null check is a cause. State the root cause in terms of:
- What invariant is violated, or
- What assumption turned out to be wrong

Multiple root causes are common. Flag all of them. Fixing the most visible one without the others leaves the system fragile.

Secondary causes matter: often the primary fix is obvious, but a secondary cause (a missing validation, a misleading error message, an absent test) will let the same class of bug recur under different conditions.

### Step 8 — Validate the diagnosis

Before moving to solutions, verify the diagnosis is complete:

- Does the root cause explain the symptom fully?
- Does it explain why the problem appears under condition X but not condition Y?
- If the root cause were fixed, would the symptom disappear — or is there a residual cause?
- Is there an alternative hypothesis still standing that hasn't been ruled out?

If the diagnosis does not fully explain the symptom, say so explicitly. An incomplete diagnosis produces solutions with gaps.

---

## Evidence Quality Checklist

Before presenting conclusions, verify:

- [ ] Every Fact cites a specific `file:line`, log output, or test result
- [ ] Every Inference follows directly from stated Facts — no reasoning gaps
- [ ] Opinions are labeled as such and kept out of the conclusions
- [ ] At least two alternative hypotheses were genuinely tested and eliminated
- [ ] The root cause fully explains the symptom including its trigger conditions

## Analysis Gaps

Always state explicitly what could not be verified:

- Code paths requiring runtime observation (logs, profiling, production-only data)
- Behaviour that depends on external services not accessible locally
- Conditions that are difficult to reproduce
- Areas where evidence is ambiguous or contradictory

Gaps inform the confidence level on the diagnosis and the risk profile of any proposed solution. A gap that is not disclosed is a hidden assumption.

---

## Scope: When to Use This Skill

This skill covers **complex, multi-layer problems** where the root cause is not immediately obvious and requires systematic investigation. Examples:
- Intermittent failures that are hard to reproduce
- Performance regressions with multiple potential causes
- Data inconsistencies across components
- Systemic architectural problems affecting multiple areas

For a single, well-localised bug with a clear symptom and obvious fix, the `debugger` agent handles it with less overhead.
