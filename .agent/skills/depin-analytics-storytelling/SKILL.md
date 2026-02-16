---
name: depin-analytics-storytelling
description: Analyzes simulation data to create narrative reports with "Nano Banana" visual context.
---

# Analytics & Storytelling Skill

This skill transforms raw simulation data into a compelling narrative with visual context.

## Workflow

1.  **Analyze Data**:
    -   Read the latest simulation result (e.g., `simulation-result.json` or `optimization-report.json`).
    -   Identify the "Headline": Is this a Success, Warning, or Failure scenario?
    -   Extract key metrics: Break-even month, Max drawdown, Retention rate.

2.  **Generate Narrative**:
    -   Write a short, punchy summary (Title + 3 bullet points).
    -   *Tone*: Professional but engaging (like a financial news report).

3.  **Visual Context (Nano Banana)**:
    -   Based on the "Headline", generate a cover image using `generate_image`.
    -   **Prompt Strategy**:
        -   *Success/Growth*: "Futuristic eco-city, golden hour sunlight, soaring geometric structures, hyper-realistic, 8k, cinematic lighting."
        -   *Warning/Risk*: "Storm clouds gathering over digital landscape, neon red warning lights, cyberpunk aesthetic, atmospheric fog."
        -   *Failure/Crash*: "Shattered glass abstract, dark moody colors, glitch art style, dramatic shadows."
    -   Save image as `narrative_cover_[timestamp].webp`.

4.  **Output**:
    -   Save the narrative text and image path to `story_[timestamp].md`.
    -   (Optional) Update `src/components/Story/VisualContext.tsx` with the new asset.

## Usage

```bash
# Run the storytelling flow on the latest result
@antigravity run depin-analytics-storytelling
```
