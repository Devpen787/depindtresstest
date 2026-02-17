import { describe, expect, it } from 'vitest';
import { KPI_OWNER_REGISTRY, resolveKpiFamily, resolveKpiOwnerVersions } from './kpiOwnerRegistry';

describe('kpiOwnerRegistry', () => {
  it('resolves explicit family mappings', () => {
    expect(resolveKpiFamily('benchmark_payback')).toBe('payback');
    expect(resolveKpiFamily('solvency_ratio')).toBe('solvency');
    expect(resolveKpiFamily('benchmark_efficiency')).toBe('utility');
  });

  it('falls back to heuristic mapping when explicit metric is missing', () => {
    expect(resolveKpiFamily('projected_tail_risk')).toBe('tail_risk');
    expect(resolveKpiFamily('custom_utilization_index')).toBe('utility');
  });

  it('returns deduplicated owner versions by resolved family', () => {
    const versions = resolveKpiOwnerVersions([
      'benchmark_payback',
      'comp_payback_period',
      'weekly_retention_rate',
      'diagnostic_join_flow'
    ]);

    expect(versions.payback).toEqual(KPI_OWNER_REGISTRY.payback);
    expect(versions.tail_risk).toEqual(KPI_OWNER_REGISTRY.tail_risk);
    expect(versions.sensitivity).toEqual(KPI_OWNER_REGISTRY.sensitivity);
  });
});
