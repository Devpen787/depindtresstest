# DTSE Design System

Baseline reference: `public/dtse-theme-mock-light.html` (third-pass polish).  
Scope: DTSE stages only (`Stage 1` to `Stage 5`).  
Intent: stop UI drift by enforcing one reusable analytical product language.

## A. Product Design Principles

1. DTSE is a calm analytical product, not a flashy dashboard.
2. Hierarchy comes from structure, spacing, and type before color.
3. Primary evidence and interpretive context lead every screen.
4. Right rail supports interpretation; it never dominates evidence.
5. Each section must declare a role: `primary`, `secondary`, `support`, `note`, or `shell`.
6. Avoid generic admin-dashboard clutter (repeated pills, equal-weight cards, decorative chrome).
7. Minimize nested containers; prefer one clear container with internal spacing.
8. Use restrained enterprise/research visual language.
9. Preserve continuity between stages; do not re-theme each stage.
10. Any new motif must be systemized and documented before reuse.

## B. Visual Hierarchy Model

### Tier ranking

- Tier 1: page title, run briefing, primary chart, major interpretation.
- Tier 2: summary stats, risk summary, core evidence support.
- Tier 3: support notes, confidence composition, next-inspection actions.
- Tier 4: footer notes and developer/meta artifacts.

### Hierarchy implementation rules

- Typography:
  - Tier 1 gets largest sizes and strongest weight.
  - Tier 2 uses medium-large titles and prominent metrics.
  - Tier 3 uses compact titles and standard body scale.
  - Tier 4 stays small and muted.
- Spacing:
  - Tier 1 blocks receive largest padding and top-of-page placement.
  - Tier 2 uses standard card spacing.
  - Tier 3 uses tighter spacing and less vertical slack.
- Contrast:
  - Tier 1 surfaces may use stronger contrast and subtle shadow.
  - Tier 2 uses neutral card surfaces.
  - Tier 3 uses softer support surfaces.
- Placement:
  - Tier 1 appears before rail support modules.
  - Tier 2 follows evidence order.
  - Tier 3 never interrupts Tier 1 or Tier 2 reading flow.

## C. Layout Rules

### Screen structure (desktop)

1. App shell
2. Stage header (title + mode toggle)
3. Stage tabs
4. Stage framing strip (summary + chips + stats + briefing)
5. Main evidence + right rail layout
6. Footer note

### Permanent geometry

- `AppShell` max width: `1600px`
- Sidebar width: `220px`
- Main content padding: `24px` (desktop), `20px` (large tablet)
- Main evidence / rail split: `minmax(0, 1fr) + 350px`
- Section gap inside content: `16px`
- Card gap within grouped modules: `12px`

### Sidebar rules

- Keep brand and nav in one visual stack.
- Active item is subtle (tint + left accent), not button-like.
- Sidebar should be calmer than content area.

### Header and tabs rules

- Header: left (stage label/title/subtitle), right (mode control).
- Stage tabs are workflow controls, not decorative pills.
- Active tab uses stronger border and bottom inset cue.

### Footer rules

- One-line muted note only.
- Never use footer for meaningful analysis content.

### Responsive behavior

- Desktop large: 220px sidebar + full rail.
- Desktop standard: same structure with tighter type.
- Tablet: narrower sidebar (`188px`) and rail may stack under main column.
- Mobile-first adaptation is not a DTSE priority for this screen class.

## D. Design Tokens

Use these as baseline tokens; all stage screens inherit from this set.

### Color tokens

| Token | Value | Use |
|---|---:|---|
| `--bg` | `#e9eff6` | Global canvas |
| `--shell` | `#f6f9fd` | App frame background |
| `--surface` | `#ffffff` | Primary card surfaces |
| `--surface-soft` | `#f8fbff` | Chart/special support surface |
| `--surface-support` | `#f7fafe` | Support cards |
| `--line` | `#d6dfeb` | Standard borders |
| `--line-soft` | `#e3eaf3` | Support borders/dividers |
| `--text` | `#15243a` | Primary text |
| `--text-soft` | `#50627d` | Body/support text |
| `--text-muted` | `#6b7d95` | Labels/meta |
| `--accent` | `#3d71e0` | Active states, primary data line |
| `--accent-soft` | `#ebf2ff` | Active tab/toggle bg |
| `--good` | `#2f8655` | Positive metric state |
| `--warn` | `#a8782a` | Warning state |
| `--risk` | `#a84e57` | Risk state |
| `--sidebar` | `#2a3864` | Sidebar top tone |
| `--sidebar-2` | `#31406f` | Sidebar bottom tone |

### Spacing tokens

| Token | Value |
|---|---:|
| `--space-1` | `8px` |
| `--space-2` | `12px` |
| `--space-3` | `16px` |
| `--space-4` | `20px` |
| `--space-5` | `24px` |

### Radius tokens

| Token | Value | Use |
|---|---:|---|
| `--radius-major` | `16px` | Major cards (briefing, summary blocks) |
| `--radius-card` | `12px` | Standard cards |
| `--radius-inner` | `10px` | Internal sub-panels |
| pill | `999px` | Chips/tags only |

### Shadow rules

- Only for primary emphasis:
  - `--shadow-soft: 0 8px 22px rgba(15, 29, 52, 0.045)`
- Support cards should rely on tonal contrast + borders, not shadow stacks.

### Width and breakpoints

- Max content width: `1600px`.
- Right rail width: `350px` (`332px` at narrower desktop).
- Breakpoints:
  - `<=1400px`: reduce title/type scales.
  - `<=1180px`: rail can stack, briefing becomes single-column.
  - `<=980px`: sidebar transforms to top section.

## E. Typography System

Typography must create authority without drama.

| Level | Size | Weight | Line-height | Notes |
|---|---:|---:|---:|---|
| Page title | `38px` | `810` | `1.03` | Tier 1, one per screen |
| Section title | `28px` | `790` | `1.1` | Summary framing |
| Card title | `22px` | `780` | `1.15` | Primary/secondary cards |
| Quiet support title | `19px` | `720` | `1.2` | Note panels |
| Card label | `10.5-12px` | `650-700` | `1.2` | Meta labels only |
| Body text | `15-17px` | `400-500` | `1.42-1.45` | Core interpretation copy |
| Support text | `13-14px` | `500-620` | `1.36-1.42` | Rail and note content |
| Metric value | `22-38px` | `760-810` | `0.98-1.06` | Emphasize hierarchy |
| Chip text | `11.5-12px` | `620` | `1` | Compact metadata |
| Chart annotation | `11px` | `620` | n/a | Keep concise |

Uppercase policy:

- Allowed for compact labels only (`brief-label`, `summary-stat-k`, mini headers).
- Never uppercase long content lines or major titles.

Competition rule:

- Rail text must never visually compete with Tier 1 heading/copy.

## F. Component Treatment Rules

### Primary cards

- Examples: `RunBriefingCard`, `ChartCard`
- Stronger surface contrast and controlled shadow.
- Larger padding (`20px+`).
- Clear header separation/divider.
- Strongest title sizes.

### Secondary cards

- Examples: `SummaryStatCard`, `RiskSummaryCard`, `EvidenceScoringCard`
- Neutral card surface with thin border.
- Consistent height and internal rhythm.
- Semantic color use is restrained to values/markers.

### Support cards

- Examples: `ConfidenceCompositionCard`, `MetricSignalStrengthCard`, `NextInspectionCard`
- Lower contrast support surface.
- Compact headers.
- Reduced visual chrome.

### Note panels

- Example: `InterpretationBoundariesPanel`
- Quieter contrast than support cards.
- Divider/list treatment preferred over many boxed mini-cards.
- Should read after evidence, never before it.

### Chips/tags

- Metadata chips are compact and quiet.
- Tag pills for evidence items use neutral surfaces.
- Do not create badge walls.

### Chart containers

- One outer card + one inner plotting frame.
- No extra wrappers without purpose.

### Mini metric boxes

- Use for compact stats inside support cards.
- Tight vertical rhythm.
- Avoid oversized typography.

### Workflow tabs

- Equal width, consistent rhythm, clear active state.
- Must read as stage progression control.

## G. Chart Language Rules

### Header format

- Left: chart title + one-line interpretive subtitle.
- Right: minimal legend with consistent line markers.
- Include top divider below header when needed.

### Plot style

- Keep gridlines sparse (`3-5` key lines).
- Use clear line contrast: primary line + threshold line.
- Use subtle area fill only when needed for trend context.
- Keep plotting frame calm (`surface-soft` tone).

### Annotation rules

- One chart should usually have at most one primary callout.
- Annotation text must be short (`1 line` preferred).
- Highlight zones should be subtle (`low opacity` band).
- Threshold label should not duplicate annotation wording.

### Threshold treatment

- Use dashed threshold line with stable color.
- Include one discreet threshold label.

### Density rules

- Do not over-label x/y axes.
- Keep label density lower than business-intel dashboards.
- Remove chart chrome if it does not add interpretation value.

## H. Interaction and States

Interactions must be subtle and consistent.

### Sidebar links

- Hover: slight tint increase.
- Active: soft tint + accent left border.
- Disabled: reduce opacity and pointer interaction.

### Stage tabs

- Hover: minor bg shift.
- Active: accent-tinted surface + inset bottom cue.

### Chips

- Default static metadata style.
- If interactive: hover only adjusts border/background subtly.

### Cards

- Hover on interactive cards only: border shift, no dramatic lift.
- Non-interactive cards should remain still.

### Chart elements

- If interactive in future: tooltip and marker emphasis only.
- Avoid animated theatrics.

## I. Consistency Guardrails

## Never do this

1. Do not redesign each stage from scratch.
2. Do not introduce new visual motifs per stage.
3. Do not make right rail louder than main evidence.
4. Do not overuse semantic colors.
5. Do not use thick borders everywhere.
6. Do not nest card-inside-card-inside-card without clear reason.
7. Do not use decorative gradients, glassmorphism, or neon accents.
8. Do not copy generic admin template patterns that flatten hierarchy.
9. Do not ship one-off component styles outside token rules.
10. Do not add support modules before validating primary evidence clarity.

## J. Zoom and Readability Requirements

Mandatory visual QA at browser zoom:

- `100%`:
  - Full hierarchy and role differentiation must be obvious.
  - Run briefing and chart must lead.
- `67%`:
  - Overall composition remains balanced.
  - Sidebar must not overpower content.
  - Stat strip and rail still readable as distinct support layers.
- `50%`:
  - Page still scans correctly:
    - title and primary cards dominate
    - right rail appears supportive
    - no collapsed visual noise bands

Review fail conditions:

- Tier 3 appears louder than Tier 1.
- Chart loses primary-evidence role.
- Sidebar becomes dominant slab.
- Support panels read as equal importance to main evidence.
