# DTSE Execution Rubric

Date: 2026-03-10

Purpose: keep the DTSE rewrite grounded in one practical standard so we do not drift back into "show everything" dashboard behavior.

This document is not a product spec. It is an execution filter.

Use it before, during, and after every DTSE UI change.

## Core Diagnosis

DTSE is no longer structurally broken, but it still over-explains.

The current failure mode is:

- too many visible objects
- too many equal-weight boards
- repeated meaning across summary, explanation, and detail
- metadata rendered as primary content
- wide-screen layouts that amplify clutter

The problem is not missing information.

The problem is that too much valid information is visible at the same time.

## Non-Negotiables

1. Do not hide core meaning behind `Advanced`, accordions, or modals.
2. Do not keep repeated explanation just because it is analytically valid.
3. Do not create a new card for every separate thought.
4. Do not repeat the same fact in summary, detail, and metadata form.
5. Do not optimize DTSE around maximum content density.
6. Do not design the full-width desktop state as if more width means more columns.

## What The User Must Get From DTSE

By the end of the flow, a first-time serious reader should be able to answer:

1. What run am I looking at?
2. What is fair to score here?
3. What broke first?
4. Why did it break that way?
5. What should be tested next?

Anything that does not help one of those five questions should be demoted, merged, or removed.

## The Working Rule

Every stage gets:

- one hero board
- one supporting section
- one detail section at most

Not every stage needs all three.

If a stage already communicates its point clearly with a hero board plus detail, do not add a support section just because there is more information available.

## What Counts As Metadata

These are usually useful, but rarely deserve primary placement:

- reason codes
- confidence provenance labels
- repeated severity labels
- run counts such as `patterns total`
- duplicated score state like `Scored now` inside every row when the section already says it
- repeated peer-fit and reference tags
- repeated explanation of how to read DTSE

Default action:

- keep in export
- keep in tests if needed
- keep in `More` if it materially helps interpretation
- keep in inline footer text if necessary
- do not render as a separate top-level board unless it changes a decision

## Repetition Test

Run this on every visible section:

1. Is this saying something new?
2. Is it changing interpretation?
3. Is it changing a decision?
4. Could the same function be served by one line of text instead of a board?

If the answer is "no" to 2 and 3, it should probably not be a full board.

## Stage Rules

### Stage 1

Job:

- orient the user once

Must keep:

- protocol identity
- stress identity
- likely pressure path
- one clean split between market context and model assumptions

Must remove or avoid:

- repeated protocol definition
- repeated stress explanation
- setup boards that restate what the top board already said
- decorative peer chips

Target structure:

- one `Run briefing` hero board
- one lower `Protocol brief` board
- one lower `Run setup` board
- one lower row for `Market context` vs `Model assumptions`

### Stage 2

Job:

- explain scoring fairness

Must keep:

- what is scored
- what is held out
- why proxy-backed metrics are still acceptable here

Must remove or avoid:

- turning every metric state into its own badge language
- top-level duplication between trust summary and constraints
- chip walls when plain text lists are enough

Target structure:

- one trust board
- one lower metric detail split

### Stage 3

Job:

- show failure order

Must keep:

- stress entry point
- what moves first
- trigger timing
- one transmission pathway
- supporting metric board below

Must remove or avoid:

- multiple top boards that restate the same sequence
- decorative legends that the chart already explains
- small sub-cards that only carry one number

Target structure:

- one failure-sequence hero board
- one lower metrics section

### Stage 4

Job:

- explain the causal story

Must keep:

- one lead fracture
- one propagation chain
- supporting patterns

Must remove or avoid:

- separate "impact" boards that just restate the lead fracture
- repeating the same signature in hero, takeaway, and detail without compression
- linked-metric badge rows when plain text will do

Target structure:

- one lead pattern board
- one short propagation strip
- supporting patterns as compact rows or compact cards

### Stage 5

Job:

- turn meaning into action

Must keep:

- what this run means
- the first rerun to start with
- what to change
- what success looks like
- the remaining reruns

Must remove or avoid:

- memo-style repetition of rationale
- a full card grid of protocol meaning if one board can do the same job
- equal-weight recommendation cards when one is clearly the lead

Target structure:

- one decision board
- one compact protocol-meaning section
- one expanded lead rerun
- remaining reruns as compressed rows

## Desktop Layout Rules

DTSE looks better when the window narrows because the layout becomes more linear.

So on desktop:

1. Use a real max-width for DTSE content.
2. Prefer asymmetrical layouts over many equal columns.
3. Do not let `xl` layouts create more simultaneous decision zones than necessary.
4. A wide screen should increase breathing room, not content count.
5. When in doubt, choose the layout that resembles the narrower, more readable state.

## Visual Rules

1. Fewer pills.
2. Fewer nested borders.
3. Fewer section headers that restate the content below them.
4. Larger differences between hero, support, and detail levels.
5. If something can be plain text, keep it plain text.

## Visual Representation Test

Before keeping any chart, board, stat tile, badge row, or card cluster, ask:

1. Did we pick the right visual representation for this information?
2. Is this best shown as a board, a row, a list, a chart, or plain text?
3. Does this representation help the user understand faster, or just display more structure?
4. Are we using a visual component because it is truly clearer, or because it is easy to render?
5. If this section became one sentence or one row, would the user lose anything important?

Use this as the default:

- Use plain text when the point is singular and explanatory.
- Use a row or compact rail when the information is comparative but simple.
- Use a board when the user needs to pause and interpret.
- Use a chart only when shape, sequence, or comparison matters more than the exact sentence.
- Do not use cards for metadata just because the rest of the dashboard uses cards.

Common DTSE mistakes:

- showing one number in its own box when inline text would do
- turning labels into pills when section hierarchy already explains them
- using multiple sibling cards where one narrative board is clearer
- choosing a grid because there is space, not because the content is truly parallel

## Implementation Order

For every DTSE pass:

1. identify repetition
2. delete or demote first
3. only then restyle
4. run focused Vitest
5. run `npm run build`
6. run DTSE Cypress gate
7. review live on desktop width and a slightly narrower width
8. explicitly ask: was this the right visual representation?

Do not start with polish.

Always start by removing unnecessary visible structure.

## Completion Gate For A Stage

Do not call a stage done unless all of this is true:

1. The stage job is obvious in under 5 seconds.
2. The main point is visible without reading every board.
3. No important fact is repeated in more than one primary section.
4. Metadata is not competing with the main story.
5. The full-width desktop state still feels intentional.
6. Focused Vitest passes.
7. `npm run build` passes.
8. DTSE Cypress gate passes.
9. The chosen visual representation is actually the clearest one for the information.

## Current Priority

Use this order for the next passes:

1. add a real DTSE content max-width and tame the full desktop spread
2. compress or remove the separate global DTSE guide in guided mode
3. simplify Stage 1 further if needed after the shell change
4. reduce Stage 4 to one lead board plus compact follow-ons
5. reduce Stage 5 to one expanded rerun plus compressed follow-ons

If a change adds a new card, label, or badge, it must justify why the user needs it.
