# DTSE UI Review Checklist

Use this before merge for any DTSE stage UI change.

## Hierarchy

- Primary evidence (briefing/chart/story) is visually dominant.
- Tier order is clear: primary -> secondary -> support -> note.
- Right rail does not compete with main evidence.

## Component Reuse

- Screen is built from documented DTSE components.
- No one-off component style without inventory update.
- New components (if any) are justified and documented.

## Right Rail Discipline

- Rail has focused support modules (not an overflow dump).
- Rail typography/contrast remains quieter than main column.
- Rail module count is controlled and readable.

## Chart Treatment

- Chart header uses DTSE format (title, subtitle, restrained legend).
- Gridline density is controlled.
- Threshold and annotation are concise and non-redundant.
- Chart reads as evidence object, not decorative block.

## Token Consistency

- Uses DTSE tokens for color, spacing, radius, border, and shadows.
- No ad-hoc palette or motif introduced.
- Semantic colors are restrained and not overused.

## Visual Balance

- No oversized dead zones in main column.
- No excessive nested card-in-card boxing.
- Support/note sections are clearly lower emphasis than evidence.

## Zoom QA

- 100%: hierarchy and readability are clear.
- 67%: composition remains balanced and scannable.
- 50%: sidebar does not dominate; main evidence still leads.

## Drift Prevention

- Stage does not introduce a new visual language.
- Workflow tabs remain consistent with DTSE stage progression.
- Footer remains a muted note, not analytical content.
