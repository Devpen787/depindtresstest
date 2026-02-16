---
name: depin-planning-with-files
description: File-based planning workflow for multi-step research, model audits, and stress-pack deliverables.
source: https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/planning-with-files
risk: safe
---

# DePIN Planning With Files

## When to Use This Skill

Use this skill when:

- Task requires many tool calls or multiple phases.
- You are producing audit artifacts, stress reports, or research summaries.
- You need stable working memory across long sessions.

Do not use this skill when:

- Task is a quick single-file edit.

## Planning Files

Create these in the project workspace:

- `output/working_memory/task_plan.md`
- `output/working_memory/findings.md`
- `output/working_memory/progress.md`

## Minimal Workflow

1. Write the goal and phases in `task_plan.md`.
2. Log evidence and discoveries in `findings.md`.
3. Log command runs and outcomes in `progress.md`.
4. Update phase status after each meaningful step.
5. Before decisions, re-read plan and findings.

## Repo-Focused Phase Template

1. Baseline reproduction (tests/scripts and current failure surface)
2. Root cause isolation (files, hypotheses, evidence)
3. Fix and verification (targeted and broad checks)
4. Report artifacts update (`output/`, `docs/`, or audit files)

## Guardrails

- Do not repeat the same failed action without changing approach.
- Escalate after 3 failed attempts with evidence of attempts.
- Keep findings concise and command-linked.

## Limitations

- This skill organizes execution; it does not replace verification gates.
- Pair with `depin-verification-before-completion` before final claims.
