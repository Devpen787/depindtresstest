const SCENARIO_LABELS: Record<string, string> = {
  baseline: 'Baseline Neutral',
  baseline_neutral: 'Baseline Neutral',
  death_spiral: 'Liquidity Shock',
  liquidity_shock: 'Liquidity Shock',
  vampire_attack: 'Competitive-Yield Pressure',
  competitive_yield_pressure: 'Competitive-Yield Pressure',
  demand_contraction: 'Demand Contraction',
  provider_cost_inflation: 'Provider Cost Inflation',
  growth_shock: 'Aggressive Expansion (Legacy)',
  infinite_subsidy: 'Subsidy Trap (Legacy)',
  project_onocoy: 'Project Onocoy (Legacy)',
  project_hivemapper: 'Project Hivemapper (Legacy)',
  project_grass: 'Project Grass (Legacy)',
  project_geodnet: 'Project Geodnet (Legacy)',
};

const formatFallback = (value: string): string => (
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

export const getScenarioDisplayLabel = (scenarioId?: string | null): string => {
  if (!scenarioId) return SCENARIO_LABELS.baseline;
  return SCENARIO_LABELS[scenarioId] ?? formatFallback(scenarioId);
};
