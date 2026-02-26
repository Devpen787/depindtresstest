import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type {
  DTSERunContext,
  DTSEApplicabilityEntry,
  DTSEOutcome,
  DTSEFailureSignature,
  DTSERecommendation,
} from '../../types/dtse';
import type { GuardrailBand } from '../../constants/guardrails';
import { DTSEContextStage } from './DTSEContextStage';
import { DTSEApplicabilityStage } from './DTSEApplicabilityStage';
import { DTSEOutcomesStage } from './DTSEOutcomesStage';
import { DTSESignatureStage } from './DTSESignatureStage';
import { DTSERecommendationsStage } from './DTSERecommendationsStage';

const STAGE_COUNT = 5;

const STAGE_LABELS: string[] = [
  'Protocol Context',
  'Applicability',
  'Outcomes',
  'Failure Signature',
  'Recommendations',
];

const DEMO_RUN_CONTEXT: DTSERunContext = {
  scenario_grid_id: 'grid-onocoy-baseline-2026Q1',
  run_id: 'dtse-run-001',
  seed_policy: { seed: 42, locked: true },
  horizon_weeks: 52,
  n_sims: 100,
  evidence_status: 'partial',
  protocol_id: 'onocoy',
  model_version: 'Agent-Based v2',
  generated_at_utc: new Date().toISOString(),
  bundle_hash: 'sha256:demo0000',
  outcomes: [
    { metric_id: 'solvency_ratio', value: 1.18, band: 'watchlist' },
    { metric_id: 'payback_period', value: 28, band: 'watchlist' },
    { metric_id: 'weekly_retention_rate', value: 94.2, band: 'healthy' },
    { metric_id: 'network_utilization', value: 31, band: 'watchlist' },
    { metric_id: 'tail_risk_score', value: 42, band: 'watchlist' },
  ],
  failure_signatures: [
    {
      id: 'fs-subsidy-trap',
      label: 'Subsidy Trap',
      pattern: 'Emissions exceed organic demand revenue, creating dependency on token inflation.',
      severity: 'high',
      affected_metrics: ['solvency_ratio', 'payback_period'],
    },
    {
      id: 'fs-density-gap',
      label: 'Density Gap',
      pattern: 'Network coverage density insufficient to attract enterprise-grade demand.',
      severity: 'medium',
      affected_metrics: ['network_utilization'],
    },
    {
      id: 'fs-churn-cascade',
      label: 'Churn Cascade',
      pattern: 'Negative feedback loop where provider exits reduce coverage, further reducing demand.',
      severity: 'low',
      affected_metrics: ['weekly_retention_rate', 'tail_risk_score'],
    },
  ],
  recommendations: [
    {
      id: 'rec-001',
      priority: 'high',
      owner: 'Protocol Team',
      rationale: 'Solvency ratio is in watchlist band. Emission schedule needs tightening to approach 1.3x floor.',
      action: 'Reduce weekly emission cap by 15% and re-evaluate after 4 weeks.',
      expected_effect: 'Move solvency ratio from 1.18 toward 1.30+ healthy threshold.',
    },
    {
      id: 'rec-002',
      priority: 'medium',
      owner: 'Business Development',
      rationale: 'Network utilization at 31% indicates underutilized capacity.',
      action: 'Launch enterprise partnership pipeline targeting 3 new data consumers within 8 weeks.',
      expected_effect: 'Increase utilization from 31% toward 35%+ healthy band.',
    },
    {
      id: 'rec-003',
      priority: 'low',
      owner: 'Community Ops',
      rationale: 'Retention is healthy but tail risk is elevated — early churn warning.',
      action: 'Introduce provider loyalty bonus program for nodes active >26 weeks.',
      expected_effect: 'Reduce tail risk score from 42 toward <35 healthy threshold.',
    },
  ],
};

const DEMO_APPLICABILITY: DTSEApplicabilityEntry[] = [
  { metricId: 'solvency_ratio', verdict: 'R', reasonCode: 'DATA_AVAILABLE' },
  { metricId: 'payback_period', verdict: 'R', reasonCode: 'DATA_AVAILABLE' },
  { metricId: 'weekly_retention_rate', verdict: 'R', reasonCode: 'PROXY_ACCEPTED', details: 'Proxy source accepted (runnable) for weekly_retention_rate.' },
  { metricId: 'network_utilization', verdict: 'NR', reasonCode: 'DATA_MISSING', details: 'No primary utilization data pipeline configured.' },
  { metricId: 'tail_risk_score', verdict: 'R', reasonCode: 'DATA_AVAILABLE' },
  { metricId: 'vampire_churn', verdict: 'NR', reasonCode: 'SOURCE_GRADE_INSUFFICIENT', details: 'Competitor data sourced from interpolation.' },
];

const METRIC_LABELS: Record<string, string> = {
  solvency_ratio: 'Solvency Ratio',
  payback_period: 'Payback Period',
  weekly_retention_rate: 'Weekly Retention',
  network_utilization: 'Network Utilization',
  tail_risk_score: 'Tail Risk Score',
  vampire_churn: 'Vampire Churn',
};

const UNIT_MAP: Record<string, string> = {
  solvency_ratio: 'x',
  payback_period: 'months',
  weekly_retention_rate: '%',
  network_utilization: '%',
  tail_risk_score: 'score',
};

export const DTSEDashboard: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);

  const ctx = DEMO_RUN_CONTEXT;

  const goNext = useCallback(() => {
    setCurrentStage((s) => Math.min(s + 1, STAGE_COUNT - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStage((s) => Math.max(s - 1, 0));
  }, []);

  const handleStageKeyDown = (e: React.KeyboardEvent, stageIdx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCurrentStage(stageIdx);
      return;
    }
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = Math.min(stageIdx + 1, STAGE_COUNT - 1);
    else if (e.key === 'ArrowLeft') next = Math.max(stageIdx - 1, 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = STAGE_COUNT - 1;

    if (next !== null) {
      e.preventDefault();
      setCurrentStage(next);
      window.requestAnimationFrame(() => {
        document.getElementById(`dtse-stage-btn-${next}`)?.focus();
      });
    }
  };

  const handleExport = useCallback(() => {
    const payload = {
      runContext: ctx,
      applicability: DEMO_APPLICABILITY,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dtse-export-${ctx.run_id}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [ctx]);

  return (
    <div data-cy="dtse-dashboard-root" className="flex flex-col h-full">
      {/* Persistent run context strip */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Protocol</span>
              <p className="text-sm font-bold text-slate-100">{ctx.protocol_id}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Scenario Grid</span>
              <p className="text-sm font-bold text-slate-100 font-mono">{ctx.scenario_grid_id}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Horizon</span>
              <p className="text-sm font-bold text-slate-100">{ctx.horizon_weeks}w &middot; {ctx.n_sims} sims</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Evidence</span>
              <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                ctx.evidence_status === 'complete'
                  ? 'bg-emerald-900/60 text-emerald-400'
                  : ctx.evidence_status === 'partial'
                    ? 'bg-amber-900/60 text-amber-400'
                    : 'bg-red-900/60 text-red-400'
              }`}>
                {ctx.evidence_status}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">
            {ctx.model_version} &middot; {ctx.run_id}
          </div>
        </div>
      </div>

      {/* Stage indicator bar */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-800/50">
        <div role="tablist" aria-label="DTSE evaluation stages" className="flex items-center gap-1">
          {STAGE_LABELS.map((label, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className={`h-px flex-1 max-w-[40px] transition-colors ${
                  idx <= currentStage ? 'bg-indigo-500' : 'bg-slate-800'
                }`} />
              )}
              <button
                id={`dtse-stage-btn-${idx}`}
                role="tab"
                tabIndex={currentStage === idx ? 0 : -1}
                aria-selected={currentStage === idx}
                aria-controls={`dtse-stage-panel-${idx}`}
                data-cy={`dtse-stage-${idx + 1}`}
                onClick={() => setCurrentStage(idx)}
                onKeyDown={(e) => handleStageKeyDown(e, idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  currentStage === idx
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : idx < currentStage
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-900 text-slate-500 hover:text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStage === idx
                    ? 'bg-white/20'
                    : idx < currentStage
                      ? 'bg-indigo-600/40 text-indigo-300'
                      : 'bg-slate-800 text-slate-600'
                }`}>
                  {idx + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stage content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div
          id={`dtse-stage-panel-${currentStage}`}
          role="tabpanel"
          aria-labelledby={`dtse-stage-btn-${currentStage}`}
          data-cy={`dtse-stage-panel-${currentStage + 1}`}
        >
          {currentStage === 0 && (
            <DTSEContextStage
              protocolId={ctx.protocol_id}
              protocolName={ctx.protocol_id.charAt(0).toUpperCase() + ctx.protocol_id.slice(1)}
              modelVersion={ctx.model_version}
              generatedAt={ctx.generated_at_utc}
            />
          )}

          {currentStage === 1 && (
            <DTSEApplicabilityStage
              entries={DEMO_APPLICABILITY}
              metricLabels={METRIC_LABELS}
            />
          )}

          {currentStage === 2 && (
            <DTSEOutcomesStage
              outcomes={ctx.outcomes ?? []}
              metricLabels={METRIC_LABELS}
              unitMap={UNIT_MAP}
            />
          )}

          {currentStage === 3 && (
            <DTSESignatureStage
              signatures={ctx.failure_signatures ?? []}
            />
          )}

          {currentStage === 4 && (
            <DTSERecommendationsStage
              recommendations={ctx.recommendations ?? []}
              onExport={handleExport}
            />
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <button
          data-cy="dtse-prev-stage"
          onClick={goPrev}
          disabled={currentStage === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            currentStage === 0
              ? 'text-slate-700 cursor-not-allowed'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <span className="text-[10px] text-slate-600 font-mono">
          Stage {currentStage + 1} of {STAGE_COUNT}
        </span>

        <button
          data-cy="dtse-next-stage"
          onClick={goNext}
          disabled={currentStage === STAGE_COUNT - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            currentStage === STAGE_COUNT - 1
              ? 'text-slate-700 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
          }`}
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
