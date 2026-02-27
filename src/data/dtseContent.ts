import type {
    DTSERunContext,
    DTSEApplicabilityEntry,
    DTSEOutcome,
    DTSEFailureSignature,
    DTSERecommendation,
    DTSEMetricInsight,
    DTSEProtocolBrief,
} from '../types/dtse';
import type { ProtocolProfileV1 } from './protocols';

// ---------------------------------------------------------------------------
// DTSEProtocolPack — self-contained stress-test data for a single protocol
// ---------------------------------------------------------------------------

export interface DTSEProtocolPack {
    protocolId: string;
    protocolName: string;
    mechanism: string;
    runContext: DTSERunContext;
    applicability: DTSEApplicabilityEntry[];
    metricLabels: Record<string, string>;
    unitMap: Record<string, string>;
}

export interface DTSEDashboardPack {
    runContext: DTSERunContext;
    protocolBrief: DTSEProtocolBrief;
    applicability: DTSEApplicabilityEntry[];
    outcomes: DTSEOutcome[];
    failureSignatures: DTSEFailureSignature[];
    recommendations: DTSERecommendation[];
}

// ---------------------------------------------------------------------------
// Shared metric labels & units
// ---------------------------------------------------------------------------

const METRIC_LABELS: Record<string, string> = {
    solvency_ratio: 'Solvency Ratio',
    payback_period: 'Payback Period',
    weekly_retention_rate: 'Weekly Retention',
    network_utilization: 'Network Utilization',
    tail_risk_score: 'Tail Risk Score',
    vampire_churn: 'Vampire Churn',
    stress_resilience_index: 'Stress Resilience Index',
};

const UNIT_MAP: Record<string, string> = {
    solvency_ratio: 'x',
    payback_period: 'months',
    weekly_retention_rate: '%',
    network_utilization: '%',
    tail_risk_score: 'score',
    stress_resilience_index: 'score',
};

// ---------------------------------------------------------------------------
// Standard applicability (all 6 metrics reportable unless overridden)
// ---------------------------------------------------------------------------

function standardApplicability(overrides?: Partial<Record<string, Pick<DTSEApplicabilityEntry, 'verdict' | 'reasonCode' | 'details'>>>): DTSEApplicabilityEntry[] {
    const metricIds = ['solvency_ratio', 'payback_period', 'weekly_retention_rate', 'network_utilization', 'tail_risk_score', 'vampire_churn'];
    return metricIds.map((metricId) => {
        const override = overrides?.[metricId];
        return {
            metricId,
            verdict: override?.verdict ?? 'R',
            reasonCode: override?.reasonCode ?? 'DATA_AVAILABLE',
            details: override?.details,
        } as DTSEApplicabilityEntry;
    });
}

// ---------------------------------------------------------------------------
// Helper to build a run context
// ---------------------------------------------------------------------------

function buildRunContext(
    protocolId: string,
    gridId: string,
    outcomes: DTSEOutcome[],
    failureSignatures: DTSEFailureSignature[],
    recommendations: DTSERecommendation[],
): DTSERunContext {
    const horizonWeeks = 52;
    const solvencyTarget = outcomes.find((outcome) => outcome.metric_id === 'solvency_ratio')?.value ?? 1.1;
    const weeklySolvency = buildWeeklySolvencySeries(solvencyTarget, horizonWeeks);
    return {
        scenario_grid_id: gridId,
        run_id: `dtse-${protocolId}-001`,
        seed_policy: { seed: 42, locked: true },
        horizon_weeks: horizonWeeks,
        n_sims: 1000,
        evidence_status: 'complete',
        protocol_id: protocolId,
        model_version: '1.2.0',
        generated_at_utc: '2025-06-01T00:00:00Z',
        bundle_hash: `sha256:${protocolId}_pack_v1`,
        weekly_solvency: weeklySolvency,
        outcomes,
        failure_signatures: failureSignatures,
        recommendations,
    };
}

function roundTo3(value: number): number {
    return Math.round(value * 1000) / 1000;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function buildWeeklySolvencySeries(targetRatio: number, horizonWeeks: number): number[] {
    const clampedTarget = clamp(targetRatio, 0.55, 2.8);
    const startOffset = clampedTarget < 1
        ? 0.24
        : clampedTarget < 1.3
            ? 0.16
            : 0.10;
    const startRatio = clamp(clampedTarget + startOffset, 0.7, 2.8);
    const volatility = clampedTarget < 1
        ? 0.07
        : clampedTarget < 1.3
            ? 0.055
            : 0.04;

    const series: number[] = [];
    for (let index = 0; index < horizonWeeks; index += 1) {
        const progress = horizonWeeks <= 1 ? 1 : index / (horizonWeeks - 1);
        const trend = startRatio + (clampedTarget - startRatio) * progress;
        const oscillation = Math.sin((index / Math.max(1, horizonWeeks - 1)) * Math.PI * 3) * volatility * (1 - progress * 0.85);
        series.push(roundTo3(clamp(trend + oscillation, 0.5, 3)));
    }

    if (series.length > 0) {
        series[series.length - 1] = roundTo3(clampedTarget);
    }
    return series;
}

// ---------------------------------------------------------------------------
// Protocol packs
// ---------------------------------------------------------------------------

const onocoyPack: DTSEProtocolPack = {
    protocolId: 'ono_v3_calibrated',
    protocolName: 'ONOCOY',
    mechanism: 'Fixed Emissions w/ Partial Burn',
    runContext: buildRunContext(
        'ono_v3_calibrated',
        'ono-stress-base-v3',
        [
            { metric_id: 'solvency_ratio', value: 1.15, band: 'watchlist', evidence_ref: 'ono_solvency_sim' },
            { metric_id: 'payback_period', value: 18, band: 'watchlist', evidence_ref: 'ono_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 96.2, band: 'healthy', evidence_ref: 'ono_retention_sim' },
            { metric_id: 'network_utilization', value: 42, band: 'watchlist', evidence_ref: 'ono_util_sim' },
            { metric_id: 'tail_risk_score', value: 38, band: 'watchlist', evidence_ref: 'ono_tail_sim' },
        ],
        [
            { id: 'ono-fs-01', label: 'Emission Overshoot', pattern: 'Fixed emissions exceed burn at low demand, diluting token value', severity: 'high', affected_metrics: ['solvency_ratio', 'tail_risk_score'] },
            { id: 'ono-fs-02', label: 'Station Clustering', pattern: 'Geographic over-concentration reduces marginal data value per station', severity: 'medium', affected_metrics: ['network_utilization', 'weekly_retention_rate'] },
            { id: 'ono-fs-03', label: 'Burn-Rate Lag', pattern: 'Partial burn adjusts slower than demand shifts, causing solvency dip', severity: 'medium', affected_metrics: ['solvency_ratio'] },
        ],
        [
            { id: 'ono-rec-01', priority: 'high', owner: 'tokenomics', rationale: 'Burn fraction (65%) may be insufficient during demand troughs', action: 'Increase burn fraction to 75% or introduce dynamic burn curve', expected_effect: 'Improves solvency ratio from 1.15x toward 1.3x' },
            { id: 'ono-rec-02', priority: 'medium', owner: 'growth', rationale: 'Network utilization below healthy threshold', action: 'Launch enterprise RTK data partnerships to increase demand-side revenue', expected_effect: 'Target utilization above 50%' },
            { id: 'ono-rec-03', priority: 'medium', owner: 'operations', rationale: 'Station clustering degrades coverage value', action: 'Implement geo-weighted reward multipliers for underserved regions', expected_effect: 'Improve retention in low-density areas' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const heliumPack: DTSEProtocolPack = {
    protocolId: 'helium_bme_v1',
    protocolName: 'Helium',
    mechanism: 'Burn-and-Mint Equilibrium',
    runContext: buildRunContext(
        'helium_bme_v1',
        'helium-bme-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 1.42, band: 'healthy', evidence_ref: 'hnt_solvency_sim' },
            { metric_id: 'payback_period', value: 8, band: 'healthy', evidence_ref: 'hnt_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 97.1, band: 'healthy', evidence_ref: 'hnt_retention_sim' },
            { metric_id: 'network_utilization', value: 35, band: 'watchlist', evidence_ref: 'hnt_util_sim' },
            { metric_id: 'tail_risk_score', value: 28, band: 'healthy', evidence_ref: 'hnt_tail_sim' },
        ],
        [
            { id: 'hnt-fs-01', label: 'IoT Demand Plateau', pattern: 'Data credit burn stagnates as IoT adoption slows, weakening BME equilibrium', severity: 'medium', affected_metrics: ['solvency_ratio', 'network_utilization'] },
            { id: 'hnt-fs-02', label: '5G CapEx Overhang', pattern: 'Heavy 5G infrastructure investment without proportional subscriber revenue', severity: 'high', affected_metrics: ['payback_period', 'tail_risk_score'] },
        ],
        [
            { id: 'hnt-rec-01', priority: 'medium', owner: 'growth', rationale: 'Network utilization in watchlist despite large hotspot fleet', action: 'Accelerate enterprise IoT onboarding and roaming partnerships', expected_effect: 'Increase data credit burn rate by 30%' },
            { id: 'hnt-rec-02', priority: 'high', owner: 'strategy', rationale: '5G deployment cost may outpace subscriber growth', action: 'Phase 5G rollout to high-demand metro areas first; defer rural expansion', expected_effect: 'Reduce tail risk score below 25' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const renderPack: DTSEProtocolPack = {
    protocolId: 'adaptive_elastic_v1',
    protocolName: 'Render',
    mechanism: 'Burn-and-Mint + Work Rewards',
    runContext: buildRunContext(
        'adaptive_elastic_v1',
        'render-elastic-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 1.35, band: 'healthy', evidence_ref: 'rndr_solvency_sim' },
            { metric_id: 'payback_period', value: 14, band: 'watchlist', evidence_ref: 'rndr_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 94.5, band: 'watchlist', evidence_ref: 'rndr_retention_sim' },
            { metric_id: 'network_utilization', value: 62, band: 'healthy', evidence_ref: 'rndr_util_sim' },
            { metric_id: 'tail_risk_score', value: 32, band: 'healthy', evidence_ref: 'rndr_tail_sim' },
        ],
        [
            { id: 'rndr-fs-01', label: 'GPU Price Compression', pattern: 'Commoditization of GPU compute drives per-job revenue below provider opex', severity: 'high', affected_metrics: ['payback_period', 'weekly_retention_rate'] },
            { id: 'rndr-fs-02', label: 'Elastic Supply Overshoot', pattern: 'Work-reward minting exceeds burn during low-demand cycles', severity: 'medium', affected_metrics: ['solvency_ratio'] },
            { id: 'rndr-fs-03', label: 'Centralized Client Risk', pattern: 'Revenue concentration in a few large rendering studios', severity: 'medium', affected_metrics: ['network_utilization', 'tail_risk_score'] },
        ],
        [
            { id: 'rndr-rec-01', priority: 'high', owner: 'tokenomics', rationale: 'Payback period enters watchlist under GPU price pressure', action: 'Introduce tiered work-reward scaling that reduces minting when utilization drops below 40%', expected_effect: 'Stabilize payback under 12 months' },
            { id: 'rndr-rec-02', priority: 'medium', owner: 'growth', rationale: 'Revenue concentration creates single-point-of-failure risk', action: 'Diversify into AI inference and scientific computing workloads', expected_effect: 'Reduce client concentration HHI by 30%' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const filecoinPack: DTSEProtocolPack = {
    protocolId: 'filecoin_v1',
    protocolName: 'Filecoin',
    mechanism: 'Proof-of-Storage + Collateral',
    runContext: buildRunContext(
        'filecoin_v1',
        'fil-storage-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 1.55, band: 'healthy', evidence_ref: 'fil_solvency_sim' },
            { metric_id: 'payback_period', value: 22, band: 'watchlist', evidence_ref: 'fil_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 98.1, band: 'healthy', evidence_ref: 'fil_retention_sim' },
            { metric_id: 'network_utilization', value: 55, band: 'healthy', evidence_ref: 'fil_util_sim' },
            { metric_id: 'tail_risk_score', value: 25, band: 'healthy', evidence_ref: 'fil_tail_sim' },
        ],
        [
            { id: 'fil-fs-01', label: 'Collateral Lock Spiral', pattern: 'Rising collateral requirements deter new providers during price drops', severity: 'high', affected_metrics: ['weekly_retention_rate', 'network_utilization'] },
            { id: 'fil-fs-02', label: 'Storage Deal Drought', pattern: 'Verified deal flow insufficient to justify provider hardware investment', severity: 'medium', affected_metrics: ['payback_period', 'solvency_ratio'] },
            { id: 'fil-fs-03', label: 'Sector Expiry Cliff', pattern: 'Mass sector expirations create sudden supply contraction and retrieval risk', severity: 'high', affected_metrics: ['tail_risk_score', 'network_utilization'] },
        ],
        [
            { id: 'fil-rec-01', priority: 'high', owner: 'protocol', rationale: 'High collateral requirements create barrier to entry', action: 'Implement progressive collateral schedule that scales with provider track record', expected_effect: 'Lower new-provider churn by 15%' },
            { id: 'fil-rec-02', priority: 'medium', owner: 'growth', rationale: 'Payback period in watchlist due to hardware costs', action: 'Subsidize onboarding for Filecoin Plus verified deals targeting enterprise archival', expected_effect: 'Reduce effective payback to <18 months' },
            { id: 'fil-rec-03', priority: 'medium', owner: 'operations', rationale: 'Sector expiry cliff poses tail risk', action: 'Incentivize rolling renewals with early-renewal reward bonus', expected_effect: 'Smooth expiry curve, reducing tail risk below 20' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const akashPack: DTSEProtocolPack = {
    protocolId: 'akash_v1',
    protocolName: 'Akash',
    mechanism: 'Reverse Auction Marketplace',
    runContext: buildRunContext(
        'akash_v1',
        'akash-auction-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 1.08, band: 'watchlist', evidence_ref: 'akt_solvency_sim' },
            { metric_id: 'payback_period', value: 10, band: 'healthy', evidence_ref: 'akt_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 91.3, band: 'watchlist', evidence_ref: 'akt_retention_sim' },
            { metric_id: 'network_utilization', value: 38, band: 'watchlist', evidence_ref: 'akt_util_sim' },
            { metric_id: 'tail_risk_score', value: 45, band: 'watchlist', evidence_ref: 'akt_tail_sim' },
        ],
        [
            { id: 'akt-fs-01', label: 'Race-to-Bottom Pricing', pattern: 'Reverse auction drives provider margins negative under competition', severity: 'high', affected_metrics: ['solvency_ratio', 'weekly_retention_rate'] },
            { id: 'akt-fs-02', label: 'Demand Volatility', pattern: 'Sporadic compute demand creates feast-or-famine utilization', severity: 'medium', affected_metrics: ['network_utilization', 'tail_risk_score'] },
            { id: 'akt-fs-03', label: 'Low Burn Rate', pattern: '20% burn fraction insufficient to offset inflationary emissions', severity: 'medium', affected_metrics: ['solvency_ratio'] },
        ],
        [
            { id: 'akt-rec-01', priority: 'high', owner: 'tokenomics', rationale: 'Solvency ratio barely above 1.0x', action: 'Raise burn fraction from 20% to 35% and introduce staking-weighted fee redistribution', expected_effect: 'Improve solvency ratio toward 1.3x' },
            { id: 'akt-rec-02', priority: 'medium', owner: 'growth', rationale: 'Network utilization below healthy band', action: 'Establish persistent deployment partnerships with cloud-native startups', expected_effect: 'Increase utilization above 50%' },
            { id: 'akt-rec-03', priority: 'medium', owner: 'operations', rationale: 'Provider retention impacted by margin pressure', action: 'Introduce provider SLA tiers with premium pricing for guaranteed uptime', expected_effect: 'Retention above 95%' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const hivemapperPack: DTSEProtocolPack = {
    protocolId: 'hivemapper_v1',
    protocolName: 'Hivemapper',
    mechanism: 'Map-to-Earn + Data Sales',
    runContext: buildRunContext(
        'hivemapper_v1',
        'hivemapper-map2earn-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 0.92, band: 'watchlist', evidence_ref: 'honey_solvency_sim' },
            { metric_id: 'payback_period', value: 28, band: 'watchlist', evidence_ref: 'honey_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 88.5, band: 'watchlist', evidence_ref: 'honey_retention_sim' },
            { metric_id: 'network_utilization', value: 45, band: 'watchlist', evidence_ref: 'honey_util_sim' },
            { metric_id: 'tail_risk_score', value: 52, band: 'watchlist', evidence_ref: 'honey_tail_sim' },
        ],
        [
            { id: 'hive-fs-01', label: 'Map Saturation', pattern: 'High-value areas fully mapped; new coverage yields diminishing marginal value', severity: 'high', affected_metrics: ['network_utilization', 'solvency_ratio'] },
            { id: 'hive-fs-02', label: 'Data Sales Lag', pattern: 'Enterprise map data sales insufficient to offset token emission costs', severity: 'high', affected_metrics: ['solvency_ratio', 'payback_period'] },
            { id: 'hive-fs-03', label: 'Contributor Fatigue', pattern: 'Declining per-km rewards cause casual contributors to churn', severity: 'medium', affected_metrics: ['weekly_retention_rate'] },
        ],
        [
            { id: 'hive-rec-01', priority: 'high', owner: 'tokenomics', rationale: 'Solvency ratio below 1.0x indicates emission-revenue imbalance', action: 'Shift to freshness-weighted rewards: higher payout for re-mapping stale areas', expected_effect: 'Rebalance emissions toward revenue-generating coverage' },
            { id: 'hive-rec-02', priority: 'high', owner: 'growth', rationale: 'Data sales must scale to support token economics', action: 'Secure multi-year enterprise contracts for fleet navigation data', expected_effect: 'Close solvency gap, targeting ratio above 1.2x' },
            { id: 'hive-rec-03', priority: 'medium', owner: 'operations', rationale: 'Casual contributor churn threatens coverage breadth', action: 'Introduce streak bonuses and regional leaderboard incentives', expected_effect: 'Improve weekly retention above 92%' },
        ],
    ),
    applicability: standardApplicability({
        vampire_churn: { verdict: 'NR', reasonCode: 'DATA_MISSING', details: 'No direct competitor mapping network to measure churn against' },
    }),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const dimoPack: DTSEProtocolPack = {
    protocolId: 'dimo_v1',
    protocolName: 'DIMO',
    mechanism: 'Vehicle Data Marketplace',
    runContext: buildRunContext(
        'dimo_v1',
        'dimo-vehicle-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 0.85, band: 'watchlist', evidence_ref: 'dimo_solvency_sim' },
            { metric_id: 'payback_period', value: 32, band: 'watchlist', evidence_ref: 'dimo_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 93.2, band: 'watchlist', evidence_ref: 'dimo_retention_sim' },
            { metric_id: 'network_utilization', value: 30, band: 'watchlist', evidence_ref: 'dimo_util_sim' },
            { metric_id: 'tail_risk_score', value: 55, band: 'watchlist', evidence_ref: 'dimo_tail_sim' },
        ],
        [
            { id: 'dimo-fs-01', label: 'Data Monetization Gap', pattern: 'Vehicle telemetry data sales far below emission cost, widening solvency gap', severity: 'critical', affected_metrics: ['solvency_ratio', 'payback_period'] },
            { id: 'dimo-fs-02', label: 'OEM Gatekeeping', pattern: 'Manufacturer API restrictions limit accessible telemetry depth', severity: 'high', affected_metrics: ['network_utilization', 'tail_risk_score'] },
            { id: 'dimo-fs-03', label: 'Device Dependency', pattern: 'Hardware dongle requirement creates friction for user onboarding', severity: 'medium', affected_metrics: ['weekly_retention_rate'] },
        ],
        [
            { id: 'dimo-rec-01', priority: 'critical', owner: 'strategy', rationale: 'Solvency below 1.0x requires urgent revenue action', action: 'Close insurance and fleet-management data licensing deals to generate recurring revenue', expected_effect: 'Target solvency above 1.0x within 6 months' },
            { id: 'dimo-rec-02', priority: 'high', owner: 'product', rationale: 'OEM data restrictions limit data completeness', action: 'Develop software-only vehicle integrations (OBD-II apps) to reduce hardware dependency', expected_effect: 'Increase eligible vehicle pool by 3x' },
            { id: 'dimo-rec-03', priority: 'medium', owner: 'tokenomics', rationale: 'Low burn fraction (25%) insufficient for current emissions', action: 'Increase burn fraction to 40% and introduce data-buyer staking requirements', expected_effect: 'Improve solvency ratio by 0.2x' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const grassPack: DTSEProtocolPack = {
    protocolId: 'grass_v1',
    protocolName: 'Grass',
    mechanism: 'Bandwidth Sharing + AI Data',
    runContext: buildRunContext(
        'grass_v1',
        'grass-bandwidth-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 0.78, band: 'intervention', evidence_ref: 'grass_solvency_sim' },
            { metric_id: 'payback_period', value: 0, band: 'healthy', evidence_ref: 'grass_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 82.0, band: 'intervention', evidence_ref: 'grass_retention_sim' },
            { metric_id: 'network_utilization', value: 18, band: 'intervention', evidence_ref: 'grass_util_sim' },
            { metric_id: 'tail_risk_score', value: 68, band: 'intervention', evidence_ref: 'grass_tail_sim' },
        ],
        [
            { id: 'grass-fs-01', label: 'Emission Flood', pattern: '3.5M tokens/week with only 10% burn creates severe dilution pressure', severity: 'critical', affected_metrics: ['solvency_ratio', 'tail_risk_score'] },
            { id: 'grass-fs-02', label: 'Passive Node Churn', pattern: 'Zero hardware cost means low switching cost; users leave on any reward decline', severity: 'high', affected_metrics: ['weekly_retention_rate'] },
            { id: 'grass-fs-03', label: 'AI Data Demand Uncertainty', pattern: 'Revenue depends on opaque AI training data demand that may shift rapidly', severity: 'high', affected_metrics: ['network_utilization', 'solvency_ratio'] },
            { id: 'grass-fs-04', label: 'Regulatory Proxy Risk', pattern: 'Residential bandwidth sharing may face ISP or regulatory pushback', severity: 'medium', affected_metrics: ['tail_risk_score'] },
        ],
        [
            { id: 'grass-rec-01', priority: 'critical', owner: 'tokenomics', rationale: 'Solvency in intervention band; burn fraction critically low', action: 'Increase burn fraction from 10% to 40% immediately', expected_effect: 'Move solvency from 0.78x toward 1.0x' },
            { id: 'grass-rec-02', priority: 'high', owner: 'growth', rationale: 'Network utilization in intervention band', action: 'Secure long-term AI data pipeline contracts with verifiable demand commitments', expected_effect: 'Increase utilization above 30%' },
            { id: 'grass-rec-03', priority: 'high', owner: 'operations', rationale: 'Retention in intervention band due to low switching costs', action: 'Introduce loyalty staking tiers with boosted rewards for long-term participants', expected_effect: 'Improve retention above 90%' },
        ],
    ),
    applicability: standardApplicability({
        payback_period: { verdict: 'NR', reasonCode: 'DATA_AVAILABLE', details: 'Zero hardware cost makes payback instant; metric is trivially healthy' },
    }),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const ionetPack: DTSEProtocolPack = {
    protocolId: 'ionet_v1',
    protocolName: 'io.net',
    mechanism: 'GPU Marketplace + Staking',
    runContext: buildRunContext(
        'ionet_v1',
        'ionet-gpu-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 1.22, band: 'watchlist', evidence_ref: 'io_solvency_sim' },
            { metric_id: 'payback_period', value: 40, band: 'intervention', evidence_ref: 'io_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 89.5, band: 'watchlist', evidence_ref: 'io_retention_sim' },
            { metric_id: 'network_utilization', value: 25, band: 'watchlist', evidence_ref: 'io_util_sim' },
            { metric_id: 'tail_risk_score', value: 58, band: 'watchlist', evidence_ref: 'io_tail_sim' },
        ],
        [
            { id: 'io-fs-01', label: 'GPU Underutilization', pattern: 'Supply of GPU nodes far exceeds current AI inference demand', severity: 'high', affected_metrics: ['network_utilization', 'payback_period'] },
            { id: 'io-fs-02', label: 'Staking Concentration', pattern: 'Top stakers control disproportionate governance and reward share', severity: 'medium', affected_metrics: ['tail_risk_score'] },
            { id: 'io-fs-03', label: 'Token Price Dependency', pattern: 'Provider revenue denominated in IO tokens; price decline amplifies payback period', severity: 'high', affected_metrics: ['payback_period', 'weekly_retention_rate'] },
        ],
        [
            { id: 'io-rec-01', priority: 'high', owner: 'growth', rationale: 'Payback period in intervention band at 40 months', action: 'Focus onboarding AI inference customers with guaranteed minimum compute commitments', expected_effect: 'Reduce payback below 24 months' },
            { id: 'io-rec-02', priority: 'medium', owner: 'tokenomics', rationale: 'High burn fraction (90%) is good but utilization is low', action: 'Introduce demand-side subsidies funded by protocol treasury to bootstrap usage', expected_effect: 'Increase utilization above 40%' },
            { id: 'io-rec-03', priority: 'medium', owner: 'governance', rationale: 'Staking concentration creates centralization risk', action: 'Cap individual staking influence and introduce quadratic reward scaling', expected_effect: 'Reduce Gini coefficient of reward distribution' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const nosanaPack: DTSEProtocolPack = {
    protocolId: 'nosana_v1',
    protocolName: 'Nosana',
    mechanism: 'GPU Grid + CI/CD',
    runContext: buildRunContext(
        'nosana_v1',
        'nosana-grid-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 0.75, band: 'intervention', evidence_ref: 'nos_solvency_sim' },
            { metric_id: 'payback_period', value: 15, band: 'watchlist', evidence_ref: 'nos_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 90.8, band: 'watchlist', evidence_ref: 'nos_retention_sim' },
            { metric_id: 'network_utilization', value: 22, band: 'watchlist', evidence_ref: 'nos_util_sim' },
            { metric_id: 'tail_risk_score', value: 62, band: 'watchlist', evidence_ref: 'nos_tail_sim' },
        ],
        [
            { id: 'nos-fs-01', label: 'Zero Burn Inflation', pattern: 'No burn mechanism means all emissions are purely dilutive', severity: 'critical', affected_metrics: ['solvency_ratio', 'tail_risk_score'] },
            { id: 'nos-fs-02', label: 'Mining Sunset Cliff', pattern: 'Mining rewards ending 2025 creates uncertain provider incentive structure', severity: 'high', affected_metrics: ['weekly_retention_rate', 'payback_period'] },
            { id: 'nos-fs-03', label: 'CI/CD Niche Limitation', pattern: 'GPU CI/CD market smaller than general AI inference; limits addressable demand', severity: 'medium', affected_metrics: ['network_utilization'] },
        ],
        [
            { id: 'nos-rec-01', priority: 'critical', owner: 'tokenomics', rationale: 'Solvency in intervention band with 0% burn', action: 'Introduce fee-based burn mechanism: burn 30% of compute job fees', expected_effect: 'Move solvency from 0.75x toward 1.0x' },
            { id: 'nos-rec-02', priority: 'high', owner: 'strategy', rationale: 'Mining sunset creates transition risk', action: 'Design post-mining fee-sharing model before 2025 deadline', expected_effect: 'Maintain provider retention through transition' },
            { id: 'nos-rec-03', priority: 'medium', owner: 'growth', rationale: 'CI/CD niche too narrow for sustainable utilization', action: 'Expand to general AI inference workloads alongside CI/CD', expected_effect: 'Increase addressable market by 5x' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const geodnetPack: DTSEProtocolPack = {
    protocolId: 'geodnet_v1',
    protocolName: 'Geodnet',
    mechanism: 'RTK Mining + Token Burn',
    runContext: buildRunContext(
        'geodnet_v1',
        'geodnet-rtk-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 1.48, band: 'healthy', evidence_ref: 'geod_solvency_sim' },
            { metric_id: 'payback_period', value: 24, band: 'watchlist', evidence_ref: 'geod_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 96.8, band: 'healthy', evidence_ref: 'geod_retention_sim' },
            { metric_id: 'network_utilization', value: 52, band: 'healthy', evidence_ref: 'geod_util_sim' },
            { metric_id: 'tail_risk_score', value: 22, band: 'healthy', evidence_ref: 'geod_tail_sim' },
        ],
        [
            { id: 'geod-fs-01', label: 'Halving Squeeze', pattern: 'Annual emission halving may push marginal stations below profitability', severity: 'medium', affected_metrics: ['payback_period', 'weekly_retention_rate'] },
            { id: 'geod-fs-02', label: 'RTK Competition', pattern: 'Traditional CORS networks and satellite services compete on coverage', severity: 'medium', affected_metrics: ['network_utilization', 'tail_risk_score'] },
        ],
        [
            { id: 'geod-rec-01', priority: 'medium', owner: 'tokenomics', rationale: 'Payback at watchlist boundary due to $500 hardware cost', action: 'Negotiate hardware supplier bulk discounts and pass savings to new operators', expected_effect: 'Reduce payback below 18 months' },
            { id: 'geod-rec-02', priority: 'medium', owner: 'growth', rationale: 'Compete with legacy CORS networks', action: 'Target precision agriculture and autonomous vehicle markets with sub-cm accuracy guarantees', expected_effect: 'Maintain utilization above 50% through halving events' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const alephPack: DTSEProtocolPack = {
    protocolId: 'aleph_v1',
    protocolName: 'Aleph.im',
    mechanism: 'Staking + Utility Sink',
    runContext: buildRunContext(
        'aleph_v1',
        'aleph-staking-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 1.05, band: 'watchlist', evidence_ref: 'aleph_solvency_sim' },
            { metric_id: 'payback_period', value: 0, band: 'healthy', evidence_ref: 'aleph_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 95.5, band: 'healthy', evidence_ref: 'aleph_retention_sim' },
            { metric_id: 'network_utilization', value: 28, band: 'watchlist', evidence_ref: 'aleph_util_sim' },
            { metric_id: 'tail_risk_score', value: 42, band: 'watchlist', evidence_ref: 'aleph_tail_sim' },
        ],
        [
            { id: 'aleph-fs-01', label: 'Staking Yield Compression', pattern: 'Low utility sink means staking yields decline as supply grows', severity: 'medium', affected_metrics: ['solvency_ratio', 'tail_risk_score'] },
            { id: 'aleph-fs-02', label: 'Compute Demand Gap', pattern: 'Decentralized compute demand insufficient to absorb staked capacity', severity: 'high', affected_metrics: ['network_utilization', 'solvency_ratio'] },
            { id: 'aleph-fs-03', label: 'Low Burn Pressure', pattern: '10% burn fraction provides minimal deflationary counterweight', severity: 'medium', affected_metrics: ['solvency_ratio'] },
        ],
        [
            { id: 'aleph-rec-01', priority: 'high', owner: 'growth', rationale: 'Utilization in watchlist band; compute demand must grow', action: 'Partner with dApp developers needing decentralized indexing and storage', expected_effect: 'Increase utilization above 40%' },
            { id: 'aleph-rec-02', priority: 'medium', owner: 'tokenomics', rationale: 'Solvency marginally above 1.0x', action: 'Introduce compute-payment burn: burn 25% of compute fees', expected_effect: 'Improve solvency toward 1.2x' },
            { id: 'aleph-rec-03', priority: 'medium', owner: 'product', rationale: 'Staking alone insufficient utility sink', action: 'Require ALEPH staking for premium API access tiers', expected_effect: 'Increase effective token lockup by 20%' },
        ],
    ),
    applicability: standardApplicability({
        payback_period: { verdict: 'NR', reasonCode: 'DATA_AVAILABLE', details: 'Zero hardware cost (virtual nodes); payback is trivially instant' },
    }),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

const xnetPack: DTSEProtocolPack = {
    protocolId: 'xnet_v1',
    protocolName: 'XNET',
    mechanism: 'Wireless + Revitalization Burn',
    runContext: buildRunContext(
        'xnet_v1',
        'xnet-wireless-stress-v1',
        [
            { metric_id: 'solvency_ratio', value: 0.72, band: 'intervention', evidence_ref: 'xnet_solvency_sim' },
            { metric_id: 'payback_period', value: 42, band: 'intervention', evidence_ref: 'xnet_payback_sim' },
            { metric_id: 'weekly_retention_rate', value: 84.0, band: 'intervention', evidence_ref: 'xnet_retention_sim' },
            { metric_id: 'network_utilization', value: 15, band: 'intervention', evidence_ref: 'xnet_util_sim' },
            { metric_id: 'tail_risk_score', value: 72, band: 'intervention', evidence_ref: 'xnet_tail_sim' },
        ],
        [
            { id: 'xnet-fs-01', label: 'Subscriber Bootstrapping', pattern: 'New wireless network has far more infrastructure than subscribers', severity: 'critical', affected_metrics: ['network_utilization', 'solvency_ratio'] },
            { id: 'xnet-fs-02', label: 'Hardware Payback Cliff', pattern: '$900 node cost with 42-month payback; providers exit before break-even', severity: 'critical', affected_metrics: ['payback_period', 'weekly_retention_rate'] },
            { id: 'xnet-fs-03', label: 'Carrier Competition', pattern: 'Incumbent carriers can undercut on coverage and pricing in early stages', severity: 'high', affected_metrics: ['tail_risk_score', 'network_utilization'] },
            { id: 'xnet-fs-04', label: 'Burn Mechanism Inefficiency', pattern: 'Revitalization burn requires revenue that does not yet exist at scale', severity: 'high', affected_metrics: ['solvency_ratio'] },
        ],
        [
            { id: 'xnet-rec-01', priority: 'critical', owner: 'strategy', rationale: 'Multiple metrics in intervention band; network is pre-product-market-fit', action: 'Focus deployment on 3-5 high-density metro areas with guaranteed subscriber demand', expected_effect: 'Improve utilization from 15% toward 35%' },
            { id: 'xnet-rec-02', priority: 'critical', owner: 'tokenomics', rationale: 'Solvency deeply in intervention', action: 'Reduce emissions by 50% until subscriber revenue covers at least 60% of emission cost', expected_effect: 'Move solvency above 0.9x' },
            { id: 'xnet-rec-03', priority: 'high', owner: 'operations', rationale: 'Provider retention in intervention due to long payback', action: 'Offer hardware leasing program to reduce upfront cost below $300', expected_effect: 'Reduce effective payback below 24 months' },
            { id: 'xnet-rec-04', priority: 'high', owner: 'growth', rationale: 'Need subscriber base to generate revitalization burn revenue', action: 'Partner with MVNOs for wholesale wireless capacity agreements', expected_effect: 'Generate baseline subscriber revenue within 3 months' },
        ],
    ),
    applicability: standardApplicability(),
    metricLabels: METRIC_LABELS,
    unitMap: UNIT_MAP,
};

// ---------------------------------------------------------------------------
// Exported registry
// ---------------------------------------------------------------------------

export const DTSE_PROTOCOL_PACKS: Record<string, DTSEProtocolPack> = {
    ono_v3_calibrated: onocoyPack,
    helium_bme_v1: heliumPack,
    adaptive_elastic_v1: renderPack,
    filecoin_v1: filecoinPack,
    akash_v1: akashPack,
    hivemapper_v1: hivemapperPack,
    dimo_v1: dimoPack,
    grass_v1: grassPack,
    ionet_v1: ionetPack,
    nosana_v1: nosanaPack,
    geodnet_v1: geodnetPack,
    aleph_v1: alephPack,
    xnet_v1: xnetPack,
};

/**
 * Retrieve a protocol pack by ID, throwing if the ID is unknown.
 */
export function getDTSEProtocolPack(protocolId: string): DTSEProtocolPack {
    const pack = DTSE_PROTOCOL_PACKS[protocolId];
    if (!pack) {
        throw new Error(
            `DTSE: No protocol pack found for "${protocolId}". Available: ${Object.keys(DTSE_PROTOCOL_PACKS).join(', ')}`,
        );
    }
    return pack;
}

const CHAIN_LABELS: Record<ProtocolProfileV1['metadata']['chain'], string> = {
    solana: 'Solana',
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    cosmos: 'Cosmos',
    filecoin: 'Filecoin',
    other: 'Other',
};

const PROTOCOL_BRIEF_OVERRIDES: Record<string, Omit<DTSEProtocolBrief, 'protocol_id' | 'protocol_name' | 'chain'>> = {
    ono_v3_calibrated: {
        depin_surface: 'GNSS reference-station network for high-precision positioning.',
        demand_signal: 'Enterprise/location demand depends on coverage quality and geographic density.',
        supply_signal: 'Providers run reference stations; uptime + quality drive reward durability.',
        token_utility: ['Provider rewards', 'Coverage growth incentives', 'Demand-linked burn pressure'],
        notes: 'Coverage density and reward discipline are primary resilience levers.',
    },
    helium_bme_v1: {
        depin_surface: 'IoT and mobile wireless coverage network with burn-and-mint equilibrium.',
        demand_signal: 'Data-credit burn from enterprise and consumer traffic drives revenue pressure.',
        supply_signal: 'Hotspot operators expand radio coverage where rewards remain durable.',
        token_utility: ['Coverage mining rewards', 'Data-credit burn sink', 'Network participation incentives'],
        notes: 'Adoption velocity and demand-side data-credit usage govern long-term balance.',
    },
    adaptive_elastic_v1: {
        depin_surface: 'Distributed GPU marketplace for rendering and AI workloads.',
        demand_signal: 'Job volume and workload mix determine burn velocity and margin stability.',
        supply_signal: 'GPU providers join/exit based on expected utilization and payout quality.',
        token_utility: ['Work rewards', 'Burn from compute jobs', 'Supply elasticity incentives'],
        notes: 'Utilization quality and client concentration are key fragility drivers.',
    },
    filecoin_v1: {
        depin_surface: 'Decentralized storage network anchored by provider collateral and deal flow.',
        demand_signal: 'Verified storage demand and retrieval usage define monetized utility.',
        supply_signal: 'Storage providers invest in hardware and collateral under long payback horizons.',
        token_utility: ['Storage/retrieval settlement', 'Collateral lockups', 'Protocol incentives'],
        notes: 'Collateral burden and renewal cadence shape resilience under market stress.',
    },
    akash_v1: {
        depin_surface: 'Decentralized cloud marketplace using reverse-auction infrastructure supply.',
        demand_signal: 'Workload consistency and tenant commitments stabilize recurring compute demand.',
        supply_signal: 'Providers price capacity aggressively, creating margin and retention sensitivity.',
        token_utility: ['Marketplace settlement', 'Burn share from fees', 'Provider reward mechanics'],
        notes: 'Price competition and low burn periods can quickly pressure solvency.',
    },
    hivemapper_v1: {
        depin_surface: 'Dashcam-powered map-to-earn network monetizing geospatial freshness.',
        demand_signal: 'Enterprise map buyers pay for freshness, density, and regional coverage quality.',
        supply_signal: 'Contributors provide road coverage where incentives justify ongoing capture.',
        token_utility: ['Coverage rewards', 'Freshness incentives', 'Growth-phase emissions'],
        notes: 'Freshness economics and demand conversion must improve together.',
    },
    dimo_v1: {
        depin_surface: 'User-owned vehicle telemetry network serving insurance and mobility demand.',
        demand_signal: 'Data buyers require high-quality telemetry and recurring commercial contracts.',
        supply_signal: 'Drivers onboard hardware/software integrations for tokenized rewards.',
        token_utility: ['Data-sharing rewards', 'Buyer settlement utility', 'Participation incentives'],
        notes: 'Monetization depth vs. emissions is the central sustainability constraint.',
    },
    grass_v1: {
        depin_surface: 'Residential bandwidth-sharing layer serving AI/web data access markets.',
        demand_signal: 'Buyer demand depends on clean traffic quality, reliability, and compliance.',
        supply_signal: 'Low-friction node supply grows quickly but can churn rapidly under reward decay.',
        token_utility: ['Bandwidth incentives', 'Demand routing rewards', 'Bootstrapping emissions'],
        notes: 'Quality-adjusted utilization and churn defense dominate risk profile.',
    },
    ionet_v1: {
        depin_surface: 'GPU cloud marketplace orchestrating distributed inference/compute supply.',
        demand_signal: 'Sustained enterprise inference demand determines provider ROI durability.',
        supply_signal: 'GPU operators participate based on payback speed and token revenue stability.',
        token_utility: ['Compute settlement', 'Staking participation', 'Demand growth incentives'],
        notes: 'Payback compression and utilization depth are primary operational levers.',
    },
    nosana_v1: {
        depin_surface: 'Solana-native GPU grid focused on AI inference and CI/CD workloads.',
        demand_signal: 'Compute job volume in target verticals determines monetization reliability.',
        supply_signal: 'Providers face transition risk as mining-era incentives phase out.',
        token_utility: ['Job settlement', 'Node reward mechanics', 'Staking/governance participation'],
        notes: 'Post-mining incentive design is pivotal for sustained network retention.',
    },
    geodnet_v1: {
        depin_surface: 'RTK precision-location network funded by data demand and token incentives.',
        demand_signal: 'Precision-location enterprise demand and subscription durability drive burn.',
        supply_signal: 'Reference-station operators respond to halving schedules and local economics.',
        token_utility: ['RTK service settlement', 'Provider rewards', 'Revenue-linked burn dynamics'],
        notes: 'Halving discipline works only if paid demand scales with coverage.',
    },
    aleph_v1: {
        depin_surface: 'Decentralized cloud stack with staking-backed compute and indexing services.',
        demand_signal: 'Developer and dApp service adoption governs monetized utilization.',
        supply_signal: 'Virtual node operators scale quickly when incentives outpace demand.',
        token_utility: ['Service settlement utility', 'Staking security sink', 'Node incentives'],
        notes: 'Utility sink expansion is required to offset low burn pressure.',
    },
    xnet_v1: {
        depin_surface: 'Wireless infrastructure network monetizing subscriber demand and coverage quality.',
        demand_signal: 'Subscriber growth and MVNO partnerships determine revenue conversion speed.',
        supply_signal: 'Radio providers need shorter hardware payback to avoid retention cliffs.',
        token_utility: ['Coverage rewards', 'Buy-and-burn sink', 'Subscriber growth incentives'],
        notes: 'Pre-PMF infrastructure oversupply creates elevated solvency and churn risk.',
    },
};

function deriveDefaultProtocolBrief(profile: ProtocolProfileV1): Omit<DTSEProtocolBrief, 'protocol_id' | 'protocol_name' | 'chain'> {
    const note = profile.metadata.notes.split('.').map((chunk) => chunk.trim()).filter(Boolean)[0]
        ?? `${profile.metadata.name} DePIN network.`;
    const isLocation = profile.metadata.model_type === 'location_based';
    return {
        depin_surface: note.endsWith('.') ? note : `${note}.`,
        demand_signal: isLocation
            ? 'Demand quality depends on geographic coverage depth and route-level service reliability.'
            : 'Demand quality depends on sustained workload volume and buyer conversion durability.',
        supply_signal: isLocation
            ? 'Supply resilience is shaped by node placement quality and operator retention.'
            : 'Supply resilience is shaped by provider economics, utilization, and reward credibility.',
        token_utility: isLocation
            ? ['Coverage incentives', 'Demand-linked utility sink', 'Provider participation rewards']
            : ['Workload settlement utility', 'Incentive calibration', 'Provider retention rewards'],
        notes: 'Interpret with protocol-specific applicability gates and evidence quality constraints.',
    };
}

function deriveStressResilienceOutcome(outcomes: DTSEOutcome[]): DTSEOutcome {
    const scoreByBand: Record<DTSEOutcome['band'], number> = {
        healthy: 85,
        watchlist: 62,
        intervention: 38,
    };
    const avgScore = outcomes.length === 0
        ? 60
        : Math.round(outcomes.reduce((sum, outcome) => sum + scoreByBand[outcome.band], 0) / outcomes.length);
    const band = avgScore >= 70 ? 'healthy' : avgScore >= 55 ? 'watchlist' : 'intervention';
    return {
        metric_id: 'stress_resilience_index',
        value: avgScore,
        band,
        evidence_ref: 'derived_from_guardrail_bands',
    };
}

function withDerivedOutcomes(outcomes: DTSEOutcome[]): DTSEOutcome[] {
    const withoutDerived = outcomes.filter((outcome) => outcome.metric_id !== 'stress_resilience_index');
    return [...withoutDerived, deriveStressResilienceOutcome(withoutDerived)];
}

export const DTSE_METRIC_INSIGHTS: Record<string, DTSEMetricInsight> = {
    solvency_ratio: {
        metric_id: 'solvency_ratio',
        definition: 'Revenue coverage relative to emissions burden.',
        why_relevant: 'Captures whether token incentives are economically sustainable.',
        decision_use: 'Primary guardrail for subsidy dependence risk.',
        target: 'Healthy ≥ 1.30',
        interpretation: {
            healthy: 'Incentive spend is sufficiently covered by demand-linked value.',
            watchlist: 'Coverage is thin; prioritize emission discipline and demand quality.',
            intervention: 'Sustainability breach; immediate tokenomics intervention required.',
        },
    },
    payback_period: {
        metric_id: 'payback_period',
        definition: 'Estimated provider CAPEX payback duration under stress outcomes.',
        why_relevant: 'Long payback periods weaken operator retention and onboarding quality.',
        decision_use: 'Guides incentive calibration for durable provider participation.',
        target: 'Healthy ≤ 24 months',
        interpretation: {
            healthy: 'Provider economics are attractive for sustained participation.',
            watchlist: 'ROI horizon is stretched and may weaken conviction.',
            intervention: 'Economics likely too weak for resilient supply growth.',
        },
    },
    weekly_retention_rate: {
        metric_id: 'weekly_retention_rate',
        definition: 'Share of active providers retained week-over-week.',
        why_relevant: 'Measures stability of productive supply under stress.',
        decision_use: 'Early warning for churn cascades and coverage decay.',
        target: 'Healthy ≥ 93%',
        interpretation: {
            healthy: 'Provider stickiness supports operational continuity.',
            watchlist: 'Retention softening signals emerging fragility.',
            intervention: 'Churn pressure threatens service reliability.',
        },
    },
    network_utilization: {
        metric_id: 'network_utilization',
        definition: 'Demand served versus available network capacity.',
        why_relevant: 'Low utilization implies incentive leakage and weak demand conversion.',
        decision_use: 'Prioritizes GTM focus and supply allocation strategy.',
        target: 'Healthy ≥ 35%',
        interpretation: {
            healthy: 'Capacity is productively monetized.',
            watchlist: 'Demand conversion is under target; tighten supply-demand matching.',
            intervention: 'Severe underutilization; revisit growth and incentive posture.',
        },
    },
    tail_risk_score: {
        metric_id: 'tail_risk_score',
        definition: 'Composite stress fragility score focused on worst-case outcomes.',
        why_relevant: 'Captures non-linear downside risk missed by averages.',
        decision_use: 'Prioritizes mitigation where failure impact is concentrated.',
        target: 'Healthy < 35',
        interpretation: {
            healthy: 'Tail scenarios are manageable with current controls.',
            watchlist: 'Stress fragility is rising; add preventive controls.',
            intervention: 'High downside concentration; escalation recommended.',
        },
    },
    vampire_churn: {
        metric_id: 'vampire_churn',
        definition: 'Estimated churn pressure induced by competing yield alternatives.',
        why_relevant: 'Reveals susceptibility to mercenary capital rotation.',
        decision_use: 'Informs retention defense and reward-quality strategy.',
        target: 'Lower is better',
        interpretation: {
            healthy: 'Competitive yield pressure is contained.',
            watchlist: 'Rotation risk is material and should be monitored.',
            intervention: 'High migration pressure threatens supply continuity.',
        },
    },
    stress_resilience_index: {
        metric_id: 'stress_resilience_index',
        definition: 'Derived composite score summarizing multi-metric resilience under stress.',
        why_relevant: 'Provides a single directional signal to summarize cross-metric risk.',
        decision_use: 'Executive summary metric; interpret with underlying primary metrics.',
        target: 'Healthy ≥ 70',
        interpretation: {
            healthy: 'Cross-metric resilience is robust.',
            watchlist: 'Mixed resilience profile; targeted remediation needed.',
            intervention: 'System-level fragility is elevated.',
        },
    },
};

export const DTSE_REASON_LABELS: Record<DTSEApplicabilityEntry['reasonCode'], string> = {
    DATA_AVAILABLE: 'Data available',
    DATA_MISSING: 'Data missing',
    SOURCE_GRADE_INSUFFICIENT: 'Source quality insufficient',
    MANUAL_OVERRIDE: 'Manual override',
    PROXY_ACCEPTED: 'Proxy accepted',
    INTERPOLATION_RISK: 'Interpolation risk',
};

export function buildDTSEProtocolPack(profile: ProtocolProfileV1): DTSEDashboardPack {
    const pack = getDTSEProtocolPack(profile.metadata.id);
    const baseOutcomes = pack.runContext.outcomes ?? [];
    const outcomes = withDerivedOutcomes(baseOutcomes);
    const failureSignatures = pack.runContext.failure_signatures ?? [];
    const recommendations = pack.runContext.recommendations ?? [];
    const protocolBriefTemplate = PROTOCOL_BRIEF_OVERRIDES[profile.metadata.id] ?? deriveDefaultProtocolBrief(profile);

    return {
        runContext: {
            ...pack.runContext,
            protocol_id: profile.metadata.id,
            model_version: 'Agent-Based v2',
            outcomes,
            failure_signatures: failureSignatures,
            recommendations,
        },
        protocolBrief: {
            protocol_id: profile.metadata.id,
            protocol_name: profile.metadata.name,
            chain: CHAIN_LABELS[profile.metadata.chain] ?? profile.metadata.chain,
            ...protocolBriefTemplate,
        },
        applicability: pack.applicability,
        outcomes,
        failureSignatures,
        recommendations,
    };
}
