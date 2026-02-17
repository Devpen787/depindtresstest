import { describe, expect, it } from 'vitest';
import { buildDecisionBrief, formatDecisionBriefMarkdown } from './decisionBrief';

const baseContext = {
  surface: 'benchmark' as const,
  protocolName: 'Onocoy',
  protocolId: 'onocoy',
  scenarioName: 'Baseline',
  scenarioId: 'baseline',
  modelVersion: 'Agent-Based v2'
};

const runnableEvidence = {
  metricId: 'benchmark_payback',
  definition: 'Benchmark payback estimate.',
  sourceUrlOrQueryId: 'model://benchmark',
  sourceGrade: 'proxy' as const,
  timeWindow: '52_week_projection',
  reproducibilityStatus: 'runnable' as const
};

describe('buildDecisionBrief evidence policy', () => {
  it('keeps GO when evidence is complete', () => {
    const brief = buildDecisionBrief({
      context: baseContext,
      verdict: 'go',
      guardrailBand: 'healthy',
      summary: 'Test summary',
      drivers: [],
      actions: [],
      evidence: [runnableEvidence]
    });

    expect(brief.runId).toBeTruthy();
    expect(brief.initialVerdict).toBe('go');
    expect(brief.verdict).toBe('go');
    expect(brief.evidenceStatus).toBe('complete');
    expect(brief.kpiOwnerVersions.payback?.owner).toBe('Benchmark');
    expect(brief.policyNotes).toHaveLength(0);
  });

  it('downgrades GO to HOLD when evidence is partial', () => {
    const brief = buildDecisionBrief({
      context: baseContext,
      verdict: 'go',
      guardrailBand: 'healthy',
      summary: 'Test summary',
      drivers: [],
      actions: [],
      evidence: [
        {
          ...runnableEvidence,
          reproducibilityStatus: 'not_runnable' as const
        }
      ]
    });

    expect(brief.runId).toBeTruthy();
    expect(brief.initialVerdict).toBe('go');
    expect(brief.verdict).toBe('hold');
    expect(brief.evidenceStatus).toBe('partial');
    expect(brief.policyNotes.length).toBeGreaterThan(0);
  });

  it('downgrades GO to HOLD when evidence is missing', () => {
    const brief = buildDecisionBrief({
      context: baseContext,
      verdict: 'go',
      guardrailBand: 'healthy',
      summary: 'Test summary',
      drivers: [],
      actions: [],
      evidence: [undefined]
    });

    expect(brief.runId).toBeTruthy();
    expect(brief.initialVerdict).toBe('go');
    expect(brief.verdict).toBe('hold');
    expect(brief.evidenceStatus).toBe('missing');
    expect(brief.policyNotes.length).toBeGreaterThan(0);
  });

  it('formats a human-readable markdown brief', () => {
    const brief = buildDecisionBrief({
      context: baseContext,
      verdict: 'go',
      guardrailBand: 'watchlist',
      summary: 'Readable summary for stakeholder handoff.',
      drivers: [
        {
          label: 'Payback risk',
          value: '27.0 months',
          threshold: 'Watchlist above 24 months',
          metricId: 'benchmark_payback'
        }
      ],
      actions: [
        {
          action: 'Reduce emissions growth rate',
          ownerRole: 'Protocol team',
          trigger: 'Payback remains above threshold',
          expectedEffect: 'Improves miner profitability runway'
        }
      ],
      evidence: [runnableEvidence],
      reproducibility: {
        runId: 'run_test',
        runTimestampUtc: '2026-02-17T12:00:00.000Z',
        paramsSnapshot: { burnPct: 0.3, demandType: 'growth' }
      }
    });

    const markdown = formatDecisionBriefMarkdown(brief);
    expect(markdown).toContain('# Decision Brief');
    expect(markdown).toContain('## Verdict');
    expect(markdown).toContain('Final verdict: GO');
    expect(markdown).toContain('## Top Drivers');
    expect(markdown).toContain('Payback risk');
    expect(markdown).toContain('## Params Snapshot');
    expect(markdown).toContain('"burnPct": 0.3');
  });
});
