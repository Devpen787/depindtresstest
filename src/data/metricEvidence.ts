export type SourceGrade = 'primary' | 'secondary' | 'proxy' | 'interpolated';
export type ReproducibilityStatus = 'runnable' | 'not_runnable';

export interface MetricEvidence {
    metricId: string;
    definition: string;
    sourceUrlOrQueryId: string;
    sourceGrade: SourceGrade;
    timeWindow: string;
    extractionTimestampUtc?: string;
    reproducibilityStatus: ReproducibilityStatus;
    notes?: string;
}

export const METRIC_EVIDENCE_REGISTRY: Record<string, MetricEvidence> = {
    // Core simulator metrics
    solvency_ratio: {
        metricId: 'solvency_ratio',
        definition: 'Burn-to-mint sustainability ratio from simulation trajectories.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    weekly_retention_rate: {
        metricId: 'weekly_retention_rate',
        definition: 'Provider cohort retention under current stress parameters.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    treasury_balance: {
        metricId: 'treasury_balance',
        definition: 'Simulated reserve accumulation under selected revenue strategy.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    payback_period: {
        metricId: 'payback_period',
        definition: 'Estimated miner CAPEX payback based on simulated rewards and OPEX.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    network_coverage_score: {
        metricId: 'network_coverage_score',
        definition: 'Coverage utility proxy from weighted capacity and topology assumptions.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    vampire_churn: {
        metricId: 'vampire_churn',
        definition: 'Simulated churn attributable to competitor-yield pressure.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    effective_capacity: {
        metricId: 'effective_capacity',
        definition: 'Simulated serviceable network capacity.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    urban_density: {
        metricId: 'urban_density',
        definition: 'Provider concentration proxy used for resilience diagnostics.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    quality_distribution: {
        metricId: 'quality_distribution',
        definition: 'Pro vs basic provider mix from the simulated hardware-tier split.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    supply_trajectory: {
        metricId: 'supply_trajectory',
        definition: 'Modeled token supply path under emission and burn assumptions.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    network_utilization: {
        metricId: 'network_utilization',
        definition: 'Demand served divided by available capacity in simulation.',
        sourceUrlOrQueryId: 'model://src/model/simulation.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },

    // Comparison view metrics
    comp_token_price_end: {
        metricId: 'comp_token_price_end',
        definition: 'Final simulated token price under matched stress parameters.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_inflation_apy: {
        metricId: 'comp_inflation_apy',
        definition: 'Annualized inflation inferred from simulated supply trajectory.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_max_drawdown: {
        metricId: 'comp_max_drawdown',
        definition: 'Worst simulated peak-to-trough drawdown during the horizon.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_active_nodes_end: {
        metricId: 'comp_active_nodes_end',
        definition: 'Final simulated active provider count under shared stress.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_churn_rate: {
        metricId: 'comp_churn_rate',
        definition: 'Cumulative simulated churn relative to joins in the scenario.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_utilization: {
        metricId: 'comp_utilization',
        definition: 'Average simulated utilization over the selected horizon.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_monthly_earnings: {
        metricId: 'comp_monthly_earnings',
        definition: 'Estimated monthly provider earnings from simulated reward flow.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_payback_period: {
        metricId: 'comp_payback_period',
        definition: 'Estimated payback period from simulated provider economics.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    comp_real_rev_emissions: {
        metricId: 'comp_real_rev_emissions',
        definition: 'Revenue-to-emission coverage ratio from simulation outputs.',
        sourceUrlOrQueryId: 'model://src/components/Simulator/ComparisonView.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },

    // Benchmark cards / matrix
    benchmark_payback: {
        metricId: 'benchmark_payback',
        definition: 'Benchmark payback estimate from simulation plus cohort context.',
        sourceUrlOrQueryId: 'model://src/components/Benchmark/BenchmarkView.tsx',
        sourceGrade: 'proxy',
        timeWindow: '52_week_projection',
        reproducibilityStatus: 'runnable',
    },
    benchmark_efficiency: {
        metricId: 'benchmark_efficiency',
        definition: 'Composite efficiency score from demand coverage and utilization.',
        sourceUrlOrQueryId: 'model://src/components/Benchmark/BenchmarkView.tsx',
        sourceGrade: 'proxy',
        timeWindow: '52_week_projection',
        reproducibilityStatus: 'runnable',
    },
    benchmark_sustain: {
        metricId: 'benchmark_sustain',
        definition: 'Sustainability ratio normalized from burn and emission estimates.',
        sourceUrlOrQueryId: 'model://src/viewmodels/BenchmarkViewModel.ts',
        sourceGrade: 'proxy',
        timeWindow: '52_week_projection',
        reproducibilityStatus: 'runnable',
    },
    benchmark_retention: {
        metricId: 'benchmark_retention',
        definition: 'Estimated weekly retention using modeled provider trajectories.',
        sourceUrlOrQueryId: 'model://src/components/Benchmark/BenchmarkView.tsx',
        sourceGrade: 'proxy',
        timeWindow: '52_week_projection',
        reproducibilityStatus: 'runnable',
    },

    // Diagnostic panels
    diagnostic_underwater_count: {
        metricId: 'diagnostic_underwater_count',
        definition: 'Count of simulated providers in sustained loss conditions.',
        sourceUrlOrQueryId: 'model://src/components/Diagnostic/SolvencyScorecard.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    diagnostic_cost_vs_revenue: {
        metricId: 'diagnostic_cost_vs_revenue',
        definition: 'Simulated incentive cost per capacity versus revenue per capacity.',
        sourceUrlOrQueryId: 'model://src/components/Diagnostic/SolvencyScorecard.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    diagnostic_join_flow: {
        metricId: 'diagnostic_join_flow',
        definition: 'Simulated provider joins and entry-barrier activation behavior.',
        sourceUrlOrQueryId: 'model://src/components/Diagnostic/SolvencyScorecard.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },

    // Decision tree wizard KPIs
    decision_financial_solvency: {
        metricId: 'decision_financial_solvency',
        definition: 'Top-level solvency score shown in Decision Tree wizard.',
        sourceUrlOrQueryId: 'model://src/audit/decisionTreeViewMath.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    decision_miner_payback: {
        metricId: 'decision_miner_payback',
        definition: 'Wizard payback period estimate for provider cohort economics.',
        sourceUrlOrQueryId: 'model://src/audit/decisionTreeViewMath.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    decision_utility_utilization: {
        metricId: 'decision_utility_utilization',
        definition: 'Wizard-level utilization ratio from aggregated demand and capacity.',
        sourceUrlOrQueryId: 'model://src/audit/decisionTreeViewMath.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },
    decision_risk_resilience: {
        metricId: 'decision_risk_resilience',
        definition: 'Composite resilience score used to route risk branch priority.',
        sourceUrlOrQueryId: 'model://src/audit/decisionTreeViewMath.ts',
        sourceGrade: 'proxy',
        timeWindow: 'simulation_horizon_weeks',
        reproducibilityStatus: 'runnable',
    },

    // Explorer table metrics
    explorer_risk_level: {
        metricId: 'explorer_risk_level',
        definition: 'Protocol risk label derived from profile demand-regime mapping.',
        sourceUrlOrQueryId: 'model://src/components/explorer/ExplorerTab.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'snapshot_refresh_5m',
        reproducibilityStatus: 'runnable',
    },
    explorer_payback_period: {
        metricId: 'explorer_payback_period',
        definition: 'Estimated hardware payback from profile emissions, OPEX, and live token price.',
        sourceUrlOrQueryId: 'model://src/components/explorer/ExplorerTab.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'snapshot_refresh_5m',
        reproducibilityStatus: 'runnable',
    },
    explorer_stress_score: {
        metricId: 'explorer_stress_score',
        definition: 'Explorer stress score proxy from burn fraction and demand regime.',
        sourceUrlOrQueryId: 'model://src/components/explorer/ExplorerTab.tsx',
        sourceGrade: 'proxy',
        timeWindow: 'snapshot_refresh_5m',
        reproducibilityStatus: 'runnable',
    },

    // Thesis dashboard metrics
    thesis_network_solvency: {
        metricId: 'thesis_network_solvency',
        definition: 'Thesis-mode solvency output from reserve/burn strategy simulation.',
        sourceUrlOrQueryId: 'model://src/components/ThesisDashboard.tsx',
        sourceGrade: 'proxy',
        timeWindow: '12_month_thesis_loop',
        reproducibilityStatus: 'runnable',
    },
    thesis_miner_retention: {
        metricId: 'thesis_miner_retention',
        definition: 'Thesis-mode retention percentage from initial vs final active nodes.',
        sourceUrlOrQueryId: 'model://src/components/ThesisDashboard.tsx',
        sourceGrade: 'proxy',
        timeWindow: '12_month_thesis_loop',
        reproducibilityStatus: 'runnable',
    },

    // Backtest references (synthetic overlays)
    historical_overlay_reference: {
        metricId: 'historical_overlay_reference',
        definition: 'Standardized historical reference curves for pattern comparison.',
        sourceUrlOrQueryId: 'synthetic://src/data/historical_events.ts',
        sourceGrade: 'interpolated',
        timeWindow: '52_weeks_standardized',
        reproducibilityStatus: 'runnable',
        notes: 'Deterministic synthetic overlays; not raw on-chain exports.',
    },
};

export const SOURCE_GRADE_LABEL: Record<SourceGrade, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    proxy: 'Proxy',
    interpolated: 'Interpolated',
};

export const REPRO_LABEL: Record<ReproducibilityStatus, string> = {
    runnable: 'Runnable',
    not_runnable: 'Not Runnable',
};

export const getMetricEvidence = (metricId: string): MetricEvidence | undefined => {
    return METRIC_EVIDENCE_REGISTRY[metricId];
};

export const withExtractionTimestamp = (
    evidence: MetricEvidence | undefined,
    extractionTimestampUtc?: string
): MetricEvidence | undefined => {
    if (!evidence) return undefined;
    if (!extractionTimestampUtc) return evidence;
    return { ...evidence, extractionTimestampUtc };
};
