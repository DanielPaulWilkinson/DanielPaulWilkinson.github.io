---
name: unslop
description: "Detect and remove AI writing patterns. Scan text for puffery, vague attributions, AI vocabulary, and style tells. Rewrite for clarity and human voice."
aliases: ["ai-text-detection", "human-voice"]
---

# Unslop: Cut AI tells from any writing

> Source: cursor/plugins pstack.

Remove AI patterns and add human voice to text, documentation, comments, and generated content.

## Process

1. **Scan** for patterns below.
2. **Rewrite** — preserve meaning, match intended tone.
3. **Add soul** (see next section).
4. **Self-audit**: "What makes this obviously AI generated?" Fix remaining tells.

## Adding soul

Removing patterns is half the job. Sterile, voiceless writing is just as obvious.

- **Have opinions.** React to facts instead of neutrally listing pros and cons.
- **Vary rhythm.** Short sentences. Then longer ones that take their time. Mix it up.
- **Acknowledge complexity.** "Impressive but also kind of unsettling" beats "impressive."
- **Use "I" when it fits.** First person isn't unprofessional.
- **Let some mess in.** Perfect structure looks machine-made.
- **Be specific.** Not "this is concerning" but "there's something unsettling about agents churning away at 3am."

## Patterns to detect and fix

### Content

1. **Puffery** — "pivotal moment", "testament to", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted". Cut puffery, state what happened.
   - ❌ This represents a pivotal moment in the project's evolution.
   - ✅ This changed how the project works.

2. **Name-dropping** — Listing media outlets without context. Pick one, say what was said.
   - ❌ According to Forbes, Bloomberg, and The New York Times, the trend is growing.
   - ✅ Forbes reported a 40% increase in adoption.

3. **Superficial -ing phrases** — "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Delete or expand with real sources.
   - ❌ The update highlights the importance of security while ensuring backwards compatibility.
   - ✅ The update maintains backwards compatibility without breaking existing code.

4. **Promotional language** — "nestled", "vibrant", "breathtaking", "groundbreaking", "renowned", "stunning", "must-visit". Use neutral descriptions.
   - ❌ Our groundbreaking, vibrant platform nestled in the cloud.
   - ✅ Our cloud-based platform.

5. **Vague attributions** — "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete.
   - ❌ Experts suggest this approach improves performance.
   - ✅ Benchmarks show a 25% performance improvement.

6. **Formulaic challenges** — "Despite challenges... continues to thrive." Replace with specific facts.
   - ❌ Despite challenges, the team continues to innovate.
   - ✅ The team shipped three features despite losing two developers to other projects.

### Language

1. **AI vocabulary** — Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Replace with plain words.
   - ❌ We delve into the intricate interplay of components to enhance performance.
   - ✅ We examine how components interact to improve performance.

2. **Fancy ways to say "is"** — "serves as", "stands as", "boasts", "features". Just say "is" or "has".
   - ❌ This tool serves as a powerful solution that boasts enterprise features.
   - ✅ This tool is powerful and has enterprise features.

3. **"Not just X, but Y"** — State the point directly instead.
   - ❌ This is not just a library, but a complete ecosystem.
   - ✅ This is a complete ecosystem.

4. **Rule of three** — Forcing ideas into groups of three. Use the natural number.
   - ❌ The system is fast, reliable, and scalable.
   - ✅ The system is fast and reliable. (Keep only what matters.)

5. **Synonym cycling** — protagonist, main character, central figure, hero all in one paragraph. Pick one, repeat it.
   - ❌ The protagonist faces the antagonist. Our main character must overcome the villain. The hero emerges victorious.
   - ✅ The protagonist faces the antagonist and emerges victorious.

6. **False ranges** — "from X to Y" where X and Y aren't on a meaningful scale. List topics directly.
   - ❌ Topics range from setup to advanced configuration.
   - ✅ Setup, basic configuration, and advanced tuning.

### Style

1. **Em dash overuse** — Avoid em dashes entirely. Use periods or commas only (no parentheses, no en dashes, no hyphen-as-dash substitutes). Em dashes are an AI tell.
   - ❌ The API handles requests — including edge cases — with grace.
   - ✅ The API handles requests, including edge cases, with grace.

2. **Colon overuse** — Colons are fine before a list or example. Not as mid-sentence connectors.
   - ❌ If you're coming from automation: instead of registering handlers, describe conditions.
   - ✅ Describing conditions works better than registering handlers.

3. **Boldface overuse** — Don't bold every proper noun or acronym.
   - ❌ **TypeScript** and **React** are **JavaScript** tools.
   - ✅ TypeScript and React are JavaScript tools.

4. **Inline-header lists** — The tell is a bold label and colon that restates the line: "**Performance:** Performance improved...". Convert to prose. (A bold lead-in that ends in a period and is followed by new detail is fine: "**Schema in TypeScript.** Tables live in one file.")
   - ❌ **Benefits:** Our approach provides better performance, easier maintenance, and faster development.
   - ✅ Our approach performs better, is easier to maintain, and speeds up development.

5. **Title case headings** — Use sentence case.
   - ❌ # Important Configuration Details
   - ✅ # Important configuration details

6. **Decorative emojis** — Remove from headings and bullets.
   - ❌ ## 🚀 Getting Started
   - ✅ ## Getting started

7. **Curly quotes** — Replace with straight quotes.
   - ❌ "Use straight quotes," not "curly ones."
   - ✅ "Use straight quotes," not "curly ones."

### Communication artifacts

1. **Chatbot phrases** — "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Remove.
   - ❌ I hope this helps! Let me know if you have questions.
   - ✅ (End naturally without filler.)

2. **Cutoff disclaimers** — "While specific details are limited..." Find sources or remove.
   - ❌ While specific details are limited, reports suggest growth.
   - ✅ [Provide specific data or remove the claim.]

3. **Sycophantic tone** — "Great question! You're absolutely right!" Respond directly.
   - ❌ Great question! You're absolutely right about the performance impact.
   - ✅ The performance impact occurs because...

### Filler

1. **Filler phrases** — "In order to" becomes "To". "Due to the fact that" becomes "Because". "It is important to note that" gets deleted.
   - ❌ In order to understand this, it is important to note that, due to the fact that the system is distributed, responses may vary.
   - ✅ Because the system is distributed, responses may vary.

2. **Excessive hedging** — "could potentially possibly be argued that it might" becomes "may".
   - ❌ It could potentially be argued that this might improve performance.
   - ✅ This may improve performance.

3. **Generic conclusions** — "The future looks bright." State specific plans or facts.
   - ❌ The future looks bright for this technology.
   - ✅ Version 2.0 ships in Q4 with streaming support.

### Jargon

1. **Abstract metaphor nouns** — substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), surface (as in "API surface"), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame, north star, flywheel. These read as technical but usually have a plainer concrete word.
   - ❌ We're leveraging this as a wedge into the enterprise market, using it as a north star for future development.
   - ✅ We're using this to enter the enterprise market and guiding future development by it.

Examples of replacements:
- "Substrate" → "base"
- "Wedge in" → "add"
- "Vector" → "way" or "method"
- "Gold-plating" → "more than the job needs"
- "Ratchet" → the mechanism's real name or "a limit that only tightens"
- "Evacuate" → "move out"
- "Endgame" → "the last phase"
- "North star" → "goal" or "target"

### Plain speech

1. **Say what it does, not how it feels** — "the database stays close at hand", "SQL you can read", "types that follow your schema" name a feeling. The fix names the mechanism or a number.
   - ❌ This library brings types close at hand, letting you write SQL you can read.
   - ✅ `.toSQL()` returns the exact string sent to the database. Type definitions auto-sync with schema.

   Ask: what should the reader do or know? If you can't restate it as a concrete instruction, fact, or number, cut it.

2. **Shorten or split dense sentences** — If the reader has to backtrack to parse a sentence, break it in two or drop clauses.
   - ❌ The middleware, which processes requests before they reach handlers, validates input against a schema defined in the config, ensuring type safety across the entire stack.
   - ✅ The middleware validates input against the schema. This ensures type safety. Handlers receive clean data.

3. **Active voice** — Prefer it. Catch "is/are/was/were + past participle" and name the actor.
   - ❌ Queries are validated by the compiler. The file is parsed by the loader.
   - ✅ The compiler validates queries. The loader parses the file.

   Passive is fine only when the actor is unknown or genuinely doesn't matter.

4. **Cut adverbs, or use a stronger verb** — "runs quickly" becomes "is fast" or the number. "significantly improves" becomes the measured delta.
   - ❌ The update significantly improves performance.
   - ✅ The update adds a 40% performance boost.

5. **Prefer the plain word** — utilize → use, leverage → use, facilitate → help, numerous → many, in the event that → if.
   - ❌ We facilitate numerous improvements by utilizing this approach.
   - ✅ We improve many things using this approach.

## Workflow

**For any piece of text:**

1. **Read** the text with fresh eyes.
2. **Mark** patterns as you spot them — write the line number or quote.
3. **Rewrite** each pattern using the fixes above. Preserve the original meaning.
4. **Read aloud** — does it sound human? Natural rhythm?
5. **Self-audit**: Could this appear unchanged in a different project's docs? Cut it. Does every sentence do work? Keep only what matters.
6. **Final check**: No puffery, no vague attribution, no AI vocabulary, no false ranges, no filler. ✅

## When to use this skill

- Code review of documentation, comments, or generated text
- Writing blog posts, READMEs, or technical guides
- Reviewing AI-generated content before publishing
- Editing your own writing to strip robotic phrasing
- Training models or tuning LLM outputs
