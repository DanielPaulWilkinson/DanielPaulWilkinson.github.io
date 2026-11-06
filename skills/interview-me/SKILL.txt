---
name: interview-me
description: >-
  Use before planning or building a new project, product, system or big decision
  when the ask is vague or underspecified, or when the user says "interview me"
  or "grill me". Not for clear tasks, quick questions or scheduled/routine runs.
---
# Interview me: find out what they actually want
Adapted from addyosmani/agent-skills (https://github.com/addyosmani/agent-skills, MIT licence). British English throughout.

## Steps
1. Write a one-line guess at what the user really wants (the goal behind the ask), with a confidence percentage and what is still unknown.
2. Ask **one question at a time**. With each, state your current best guess so they can just say "yes" or correct it. Wait for the answer before the next question.
3. Prioritise questions that would most change the plan: the real goal and why, who it is for, what "done" looks like, constraints (time, money, people), and what they would cut first.
4. Watch for answers that sound like "best practice" rather than their real preference, and gently probe them.
5. Stop at about 95% confidence or **5 questions**, whichever comes first.
6. Summarise: the goal, the smallest version worth doing, what is out of scope, and **Next action:**.

## Rules
- Skip this entirely when the ask is already clear or is just a request for information.
- Never run it in a routine, scheduled or non-interactive context.
- If the honest answer is "don't build this yet", say so.
- Pairs with the-fool skill: interview-me before building, the-fool once a plan exists.
