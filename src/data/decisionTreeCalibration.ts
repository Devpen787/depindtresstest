import calibrationCsvRaw from './decision_tree_calibration.csv?raw';
import type { DemandType, ProtocolProfileV1 } from './protocols';

export interface DecisionTreeCalibration {
    protocolId: string;
    targetUtilization: number;
    liquidityPctOfMarketCap: number;
    liquidityMinUsd: number;
    liquidityMaxUsd: number;
    liquidityFloorUsd: number;
    investorSellMultiplier: number;
    investorSellPctMin: number;
    investorSellPctMax: number;
    emissionCapPctOfSupply: number;
    baseDemandFloor: number;
    breakEvenMintMultiplier: number;
    burnBackedDemandFraction: number;
    burnBackedMintMultiplier: number;
}

type CalibrationOverride = Partial<Omit<DecisionTreeCalibration, 'protocolId'>> & {
    protocolId: string;
};

const TARGET_UTILIZATION_BY_DEMAND: Record<DemandType, number> = {
    growth: 0.45,
    consistent: 0.35,
    volatile: 0.28,
    'high-to-decay': 0.32
};

const getDefaultInvestorSellMultiplier = (providerCount: number): number => {
    if (providerCount >= 100_000) return 0.35;
    if (providerCount >= 10_000) return 0.5;
    if (providerCount >= 1_000) return 0.7;
    return 0.9;
};

const parseOptionalNumber = (value: string, protocolId: string, column: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
        console.warn(`[decision_tree_calibration] Invalid number for ${protocolId}.${column}: "${value}"`);
        return undefined;
    }
    return parsed;
};

const parseCalibrationCsv = (rawCsv: string): Map<string, CalibrationOverride> => {
    const lines = rawCsv
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));

    if (lines.length < 2) {
        return new Map();
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const getIndex = (column: string) => headers.indexOf(column);
    const getCell = (cells: string[], column: string) => {
        const index = getIndex(column);
        return index >= 0 ? (cells[index] ?? '').trim() : '';
    };

    const rows = new Map<string, CalibrationOverride>();

    for (let i = 1; i < lines.length; i += 1) {
        const cells = lines[i].split(',');
        const protocolId = getCell(cells, 'protocol_id');
        if (!protocolId) continue;

        const row: CalibrationOverride = { protocolId };

        row.targetUtilization = parseOptionalNumber(getCell(cells, 'target_utilization'), protocolId, 'target_utilization');
        row.liquidityPctOfMarketCap = parseOptionalNumber(getCell(cells, 'liquidity_pct_of_market_cap'), protocolId, 'liquidity_pct_of_market_cap');
        row.liquidityMinUsd = parseOptionalNumber(getCell(cells, 'liquidity_min_usd'), protocolId, 'liquidity_min_usd');
        row.liquidityMaxUsd = parseOptionalNumber(getCell(cells, 'liquidity_max_usd'), protocolId, 'liquidity_max_usd');
        row.liquidityFloorUsd = parseOptionalNumber(getCell(cells, 'liquidity_floor_usd'), protocolId, 'liquidity_floor_usd');
        row.investorSellMultiplier = parseOptionalNumber(getCell(cells, 'investor_sell_multiplier'), protocolId, 'investor_sell_multiplier');
        row.investorSellPctMin = parseOptionalNumber(getCell(cells, 'investor_sell_pct_min'), protocolId, 'investor_sell_pct_min');
        row.investorSellPctMax = parseOptionalNumber(getCell(cells, 'investor_sell_pct_max'), protocolId, 'investor_sell_pct_max');
        row.emissionCapPctOfSupply = parseOptionalNumber(getCell(cells, 'emission_cap_pct_of_supply'), protocolId, 'emission_cap_pct_of_supply');
        row.baseDemandFloor = parseOptionalNumber(getCell(cells, 'base_demand_floor'), protocolId, 'base_demand_floor');
        row.breakEvenMintMultiplier = parseOptionalNumber(getCell(cells, 'break_even_mint_multiplier'), protocolId, 'break_even_mint_multiplier');
        row.burnBackedDemandFraction = parseOptionalNumber(getCell(cells, 'burn_backed_demand_fraction'), protocolId, 'burn_backed_demand_fraction');
        row.burnBackedMintMultiplier = parseOptionalNumber(getCell(cells, 'burn_backed_mint_multiplier'), protocolId, 'burn_backed_mint_multiplier');

        rows.set(protocolId.toLowerCase(), row);
    }

    return rows;
};

const parsedCalibrationRows = parseCalibrationCsv(calibrationCsvRaw);

const withOverrides = (base: DecisionTreeCalibration, override?: CalibrationOverride): DecisionTreeCalibration => {
    if (!override) return base;

    return {
        ...base,
        targetUtilization: override.targetUtilization ?? base.targetUtilization,
        liquidityPctOfMarketCap: override.liquidityPctOfMarketCap ?? base.liquidityPctOfMarketCap,
        liquidityMinUsd: override.liquidityMinUsd ?? base.liquidityMinUsd,
        liquidityMaxUsd: override.liquidityMaxUsd ?? base.liquidityMaxUsd,
        liquidityFloorUsd: override.liquidityFloorUsd ?? base.liquidityFloorUsd,
        investorSellMultiplier: override.investorSellMultiplier ?? base.investorSellMultiplier,
        investorSellPctMin: override.investorSellPctMin ?? base.investorSellPctMin,
        investorSellPctMax: override.investorSellPctMax ?? base.investorSellPctMax,
        emissionCapPctOfSupply: override.emissionCapPctOfSupply ?? base.emissionCapPctOfSupply,
        baseDemandFloor: override.baseDemandFloor ?? base.baseDemandFloor,
        breakEvenMintMultiplier: override.breakEvenMintMultiplier ?? base.breakEvenMintMultiplier,
        burnBackedDemandFraction: override.burnBackedDemandFraction ?? base.burnBackedDemandFraction,
        burnBackedMintMultiplier: override.burnBackedMintMultiplier ?? base.burnBackedMintMultiplier
    };
};

export const getDecisionTreeCalibration = (profile: ProtocolProfileV1): DecisionTreeCalibration => {
    const baseCalibration: DecisionTreeCalibration = {
        protocolId: profile.metadata.id,
        targetUtilization: TARGET_UTILIZATION_BY_DEMAND[profile.parameters.demand_regime.value] ?? 0.32,
        liquidityPctOfMarketCap: 0.002,
        liquidityMinUsd: 150_000,
        liquidityMaxUsd: 25_000_000,
        liquidityFloorUsd: 500_000,
        investorSellMultiplier: getDefaultInvestorSellMultiplier(profile.parameters.initial_active_providers.value),
        investorSellPctMin: 0.01,
        investorSellPctMax: 0.12,
        emissionCapPctOfSupply: 0.005,
        baseDemandFloor: 12_000,
        breakEvenMintMultiplier: 1.8,
        burnBackedDemandFraction: 0.5,
        burnBackedMintMultiplier: 3.0
    };

    const defaultOverrides = parsedCalibrationRows.get('default');
    const protocolOverrides = parsedCalibrationRows.get(profile.metadata.id.toLowerCase());

    return withOverrides(withOverrides(baseCalibration, defaultOverrides), protocolOverrides);
};
