# DTSE Stage Story Rewrite Brief

Date: 2026-03-09

Scope: Improve DTSE readability and narrative flow so each stage feels like it is telling a clear story, without stripping out necessary context or forcing every stage into the same layout pattern.

This brief supersedes ad hoc chat guidance about “less text” by turning it into implementation rules that are specific enough to build, but flexible enough to preserve nuance.

## Product Problem

DTSE currently explains too much in the same visual voice:

- explainer text
- dense cards
- repeated labels
- repeated “mini report” sections

As a result, the user has to assemble the story manually.

The problem is not only copy volume. The deeper issue is that too many elements have equal visual weight, so the stage does not make a judgment obvious before asking the user to read details.

## Non-Negotiable Constraint

Do not “simplify” DTSE by deleting context that the user genuinely needs.

This rewrite must avoid:

- rigid, same-template-everywhere layouts
- replacing explanation with vague product copy
- forcing charts where a chart adds no value
- collapsing serious protocol-specific reasoning into shallow summaries

The goal is editorial hierarchy, not simplification theater.

## Core Principle

Each stage needs a point of view.

Each stage should answer one dominant question first, then support that answer with the right amount of detail.

That does not mean every stage needs the same structure.

## Narrative Design Rules

Use these across DTSE, but apply them with judgment:

1. Give each stage one dominant takeaway.
2. Give each stage one dominant structural anchor.
3. Demote supporting evidence so it does not compete with the takeaway.
4. Reduce repeated card framing and repeated label stacks.
5. Keep nuance where it changes interpretation or decision quality.

## What “Story” Means In DTSE

Story does not mean marketing language.

It means:

- the user understands what they are seeing
- the order of information feels intentional
- the stage makes a claim before it shows raw support
- the support explains that claim instead of sitting beside it as equal-weight material

## Stage Rewrite Plan

### Stage 1: Protocol Context

Primary file:

- `src/components/DTSE/DTSEContextStage.tsx`

Current weakness:

- Reads like a context dump.
- Market facts, model assumptions, protocol structure, and peer notes all compete at once.
- The stage earns trust, but too slowly.

Job of the rewritten stage:

- Act like a briefing board.
- Tell the user what this protocol is, what stress is applied, and where the likely pressure will show up.

Required structural change:

- Replace the current “mostly cards” first impression with a briefing strip at the top.

Top briefing strip must answer:

1. What is this protocol?
2. What stress is this run applying?
3. What kind of system pressure should the user expect first?

Recommended layout:

- Left: protocol identity
- Center: stress channel
- Right: likely pressure point

Then add a simple flow row:

- `Protocol structure -> Stress applied -> Expected pressure path`

Keep:

- market context
- model assumptions
- peers

But demote them below the briefing strip as supporting evidence.

Do not:

- open Stage 1 with equal-weight cards only
- make the user read three separate sections before they understand the setup

Copy direction:

- Keep plain-language explanatory tone.
- Avoid unnecessary analyst phrasing.
- Use short declarative sentences.

Acceptance criteria:

- A first-time user can explain the run in one sentence after reading only the top of Stage 1.
- The difference between live market facts and model assumptions is still obvious.
- Peer context remains visible but no longer competes with the stage’s main briefing.

### Stage 2: What Can Be Scored

Primary file:

- `src/components/DTSE/DTSEApplicabilityStage.tsx`

Current weakness:

- Too much of the stage is still a metric inventory.
- The user has to read many cards to understand why DTSE trusts some metrics and holds out others.
- A single compressed takeaway sentence would oversimplify this stage.

Job of the rewritten stage:

- Explain scoring fairness.
- Teach the user how to interpret scored, proxy-backed, and held-out metrics in this run.

Required structural change:

- Make the top of the stage a coverage map plus an explanatory trust block.

Recommended order:

1. Coverage overview
2. How to read this run
3. Metric-by-metric scoring basis

Coverage overview should visually separate:

- scored now
- proxy-backed
- held out

The explanatory trust block should explicitly answer:

1. What DTSE is willing to score here
2. Why some metrics are proxy-backed
3. Why some metrics are held out

This block must not collapse into one sentence.

Recommended tone:

- `DTSE only scores metrics that are fair under this protocol and stress setup.`
- `Some metrics are proxy-backed because this run has enough evidence to estimate them indirectly, but not measure them directly.`
- `Others are held out because scoring them here would create false precision.`

Metric cards should remain, but they should be clearly secondary to the stage explanation.

Do not:

- reduce Stage 2 to only a scoreboard
- turn the whole stage into one explanatory paragraph
- assume the reader understands proxy logic without explicit explanation

Acceptance criteria:

- A new user can explain why scored metrics are different from held-out metrics without reading every card.
- The stage still preserves metric-specific basis and nuance.
- The user does not confuse proxy-backed metrics with broken metrics.

### Stage 3: What Broke First

Primary file:

- `src/components/DTSE/DTSEOutcomesStage.tsx`

Current strength:

- It already has a useful sequence orientation.

Current weakness:

- The stage still splits attention between sequence, metric tiles, chart scaffolding, and explanatory text.
- It is closer to a story than the other stages, but it still feels too dashboard-like.

Job of the rewritten stage:

- Show failure order.
- Make the user understand sequence before metric levels.

Required structural change:

- Make the sequence view the undisputed hero.

Top of stage should answer:

1. What broke first?
2. What followed?
3. What remained contained?

Recommended layout:

- dominant sequence/timeline visual
- concise annotation beside or under the visual
- supporting metric readouts below

Metric tiles must become supporting evidence, not the primary reading path.

If baseline drift is flat:

- use a compact intentional state
- do not leave a large empty or low-signal chart container

Do not:

- place equal emphasis on all charts and tiles
- make the user infer the order from five separate metric cards

Acceptance criteria:

- A first-time user can state the first break and next break without scanning every metric tile.
- The stage feels like a sequence explanation, not a mixed chart gallery.

### Stage 4: Failure Patterns

Primary file:

- `src/components/DTSE/DTSESignatureStage.tsx`

Current strength:

- The content is strong.
- Users already react to this stage as one of the clearest parts of DTSE.

Current weakness:

- It still presents patterns as stacked diagnosis cards.
- The causal logic exists, but the layout does not foreground it.

Job of the rewritten stage:

- Explain why the observed break sequence matters.
- Present failure patterns as a causal story.

Required structural change:

- Reframe each pattern card around causal logic, not metadata.

Preferred reading order for each pattern:

1. What happened
2. Why it matters
3. What it propagates into

Recommended structure:

- primary signature at top with extra prominence
- linked patterns below in a lighter relationship structure
- optionally use arrows, chain connectors, or a causal rail if it helps

Linked metrics should remain, but they should feel like evidence attached to the pattern, not a separate equal-weight panel.

Do not:

- present Stage 4 as another list of boxes with the same rhythm as Stage 2 or Stage 5
- let badges and card chrome dominate the actual causal explanation

Acceptance criteria:

- The user can explain the primary failure pattern in plain language after reading only the top half of the stage.
- Linked patterns feel like consequences or adjacent dynamics, not just more cards.

### Stage 5: Next Tests

Primary file:

- `src/components/DTSE/DTSERecommendationsStage.tsx`

Current strength:

- The stage is now materially better than before.
- It has real reruns and clearer ownership/timing.

Current weakness:

- It still leans text-heavy.
- It can still feel like stacked analyst notes instead of decision-oriented narrative.

Job of the rewritten stage:

- Turn protocol meaning into the rationale for the next reruns.
- Make the best next test obvious.

Required structural change:

- Keep protocol meaning visible.
- Do not hide it behind advanced controls.
- But integrate it more directly into the action logic.

Recommended stage order:

1. What this means for this protocol
2. Best next rerun
3. What would look different if the rerun worked
4. Secondary reruns

Recommendation cards should become more comparative.

Each card should make these contrasts obvious:

- current issue
- lever to change
- expected shift

Reduce repeated stacked label blocks where possible.

Protocol insights should remain visible, but they should feel like the reasoning behind the reruns, not a second dashboard bolted onto the stage.

Do not:

- hide important meaning in advanced mode
- append a heavy interpretation block after the action cards
- force every recommendation into long memo-style text

Acceptance criteria:

- The user can identify the best next rerun and why it matters without reading every secondary note.
- Protocol-specific meaning remains visible and useful.
- The stage ends in action, not in another interpretation wall.

## Shared Visual Changes

These should be implemented carefully across stages, but only where they improve reading order:

1. Increase contrast between cards and page background.
2. Reduce nested cards where the parent and child convey the same hierarchy.
3. Use more whitespace between narrative blocks and less between label + sentence pairs.
4. Avoid repeated “all caps label + paragraph” stacks when a sentence with a bold lead-in would read faster.

Examples:

- Better: `Why it matters: Demand weakens before token support resets.`
- Worse: separate label box, separate paragraph, separate sub-box, all with the same weight

## Shared Copy Changes

Rewrite toward:

- shorter sentences
- fewer repeated qualifiers
- less analyst boilerplate
- stronger direct language

Do not rewrite toward:

- generic executive fluff
- marketing phrasing
- vague summaries that lose causal detail

## What Not To Standardize

These should remain stage-specific:

- Stage 1 needs more context than Stage 3
- Stage 2 needs more explanation than a one-line takeaway
- Stage 3 benefits from a strong visual anchor more than Stage 5
- Stage 5 can keep more protocol-specific nuance when it improves the decision

## Implementation Order

Recommended order of execution:

1. Stage 2 rewrite
2. Stage 4 rewrite
3. Stage 1 rewrite
4. Stage 5 rewrite
5. Stage 3 refinement pass
6. Shared contrast and spacing pass

Reason:

- Stage 2 and Stage 4 will reveal whether the narrative direction is working without requiring a full DTSE redesign up front.

## Verification Requirements

After each stage rewrite:

- verify the stage still renders in Guided and Overview
- run DTSE smoke and a11y Cypress
- manually inspect desktop layout for scanability
- manually inspect at least one first-time-user path on ONOCOY

After all five stages:

- run the DTSE matrix regression
- manually compare at least two protocols under two different stress channels
- confirm no stage regressed into hidden context or oversimplified explanation

## Definition Of Done

This rewrite is done when:

- DTSE no longer feels primarily like stacked cards and labeled paragraphs
- each stage makes one dominant idea obvious before asking for detailed reading
- context is preserved where the user needs it
- no stage feels like it was flattened by a rigid template
- the product reads more like a guided reasoning flow than an internal model report
