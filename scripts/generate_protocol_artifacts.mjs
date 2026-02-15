#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MASTER_PATH = path.join(repoRoot, 'src/data/protocol_master_sheet.tsv');
const GENERATED_DIR = path.join(repoRoot, 'src/data/generated');
const PROFILES_OUT = path.join(GENERATED_DIR, 'protocolProfiles.generated.ts');
const VERIFICATION_OUT = path.join(GENERATED_DIR, 'protocolVerificationSummary.generated.ts');
const CALIBRATION_OUT = path.join(repoRoot, 'src/data/decision_tree_calibration.csv');

const requiredColumns = [
    'record_type',
    'protocol_id',
    'profile_version',
    'name',
    'mechanism',
    'model_type',
    'source',
    'coingecko_id',
    'chain',
    'notes',
    'supply_tokens',
    'emissions_tokens_per_week',
    'burn_fraction',
    'adjustment_lag_weeks',
    'demand_regime',
    'opex_weekly_usd',
    'churn_threshold_usd_week',
    'initial_active_providers',
    'initial_price_usd',
    'hardware_cost_usd',
    'pro_tier_pct',
    'target_utilization',
    'liquidity_pct_of_market_cap',
    'liquidity_min_usd',
    'liquidity_max_usd',
    'liquidity_floor_usd',
    'investor_sell_multiplier',
    'investor_sell_pct_min',
    'investor_sell_pct_max',
    'emission_cap_pct_of_supply',
    'base_demand_floor',
    'break_even_mint_multiplier',
    'burn_backed_demand_fraction',
    'burn_backed_mint_multiplier',
    'diagnostic_project_id',
    'diagnostic_category',
    'diagnostic_risk_level',
    'diagnostic_all_core_points_verified'
];

const toLines = (text) => text.split(/\r?\n/).filter(Boolean);

const parseTsv = (rawText) => {
    const lines = toLines(rawText);
    if (lines.length < 2) {
        throw new Error('Master sheet is empty or missing data rows.');
    }

    const headers = lines[0].split('\t').map((header) => header.trim());
    for (const column of requiredColumns) {
        if (!headers.includes(column)) {
            throw new Error(`Missing required column "${column}" in protocol_master_sheet.tsv`);
        }
    }

    const rows = [];
    for (let i = 1; i < lines.length; i += 1) {
        const cells = lines[i].split('\t');
        const row = {};
        headers.forEach((header, idx) => {
            row[header] = (cells[idx] ?? '').trim();
        });
        rows.push(row);
    }

    return rows;
};

const toNumber = (row, field, options = {}) => {
    const value = row[field];
    if (value === undefined || value === null || value === '') {
        if (options.optional) return undefined;
        throw new Error(`Missing required numeric field "${field}" for protocol "${row.protocol_id}"`);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid numeric field "${field}"="${value}" for protocol "${row.protocol_id}"`);
    }
    return parsed;
};

const toBoolean = (value) => {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const ensureDir = (targetDir) => {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
};

const normalizeDemandRegime = (value) => {
    if (value === 'consistent' || value === 'growth' || value === 'volatile' || value === 'high-to-decay') {
        return value;
    }
    throw new Error(`Unsupported demand_regime "${value}"`);
};

const normalizeModelType = (value) => {
    if (value === 'location_based' || value === 'fungible_resource') {
        return value;
    }
    throw new Error(`Unsupported model_type "${value}"`);
};

const normalizeChain = (value) => {
    const valid = ['solana', 'ethereum', 'polygon', 'cosmos', 'filecoin', 'other'];
    if (valid.includes(value)) return value;
    throw new Error(`Unsupported chain "${value}"`);
};

const normalizeRiskLevel = (value) => {
    if (!value) return 'unknown';
    const normalized = value.toLowerCase();
    const valid = ['low', 'moderate', 'high', 'extreme'];
    return valid.includes(normalized) ? normalized : 'unknown';
};

const generateProtocolProfiles = (protocolRows) => {
    return protocolRows.map((row) => ({
        version: row.profile_version || '1.2',
        metadata: {
            id: row.protocol_id,
            name: row.name,
            mechanism: row.mechanism,
            notes: row.notes,
            model_type: normalizeModelType(row.model_type),
            source: row.source,
            coingeckoId: row.coingecko_id,
            chain: normalizeChain(row.chain)
        },
        parameters: {
            supply: { value: toNumber(row, 'supply_tokens'), unit: 'tokens' },
            emissions: { value: toNumber(row, 'emissions_tokens_per_week'), unit: 'tokens/week' },
            burn_fraction: { value: toNumber(row, 'burn_fraction'), unit: 'decimal' },
            adjustment_lag: { value: toNumber(row, 'adjustment_lag_weeks'), unit: 'weeks' },
            demand_regime: { value: normalizeDemandRegime(row.demand_regime), unit: 'category' },
            provider_economics: {
                opex_weekly: { value: toNumber(row, 'opex_weekly_usd'), unit: 'usd/week' },
                churn_threshold: { value: toNumber(row, 'churn_threshold_usd_week'), unit: 'usd/week_profit' }
            },
            initial_active_providers: { value: toNumber(row, 'initial_active_providers'), unit: 'nodes' },
            initial_price: { value: toNumber(row, 'initial_price_usd'), unit: 'usd' },
            hardware_cost: { value: toNumber(row, 'hardware_cost_usd'), unit: 'usd' },
            pro_tier_pct: { value: toNumber(row, 'pro_tier_pct'), unit: 'decimal' }
        }
    }));
};

const emitProtocolProfilesTs = (protocolProfiles) => {
    return `/**\n * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.\n *\n * Source: src/data/protocol_master_sheet.tsv\n * Generator: scripts/generate_protocol_artifacts.mjs\n */\n\nexport const GENERATED_PROTOCOL_PROFILES = ${JSON.stringify(protocolProfiles, null, 4)};\n`;
};

const emitVerificationSummaryTs = (protocolRows) => {
    const summary = {};
    for (const row of protocolRows) {
        summary[row.protocol_id] = {
            diagnosticProjectId: row.diagnostic_project_id || null,
            category: row.diagnostic_category || null,
            riskLevel: normalizeRiskLevel(row.diagnostic_risk_level),
            allCorePointsVerified: toBoolean(row.diagnostic_all_core_points_verified)
        };
    }

    return `/**\n * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.\n *\n * Source: src/data/protocol_master_sheet.tsv\n * Generator: scripts/generate_protocol_artifacts.mjs\n */\n\nexport interface ProtocolVerificationSummary {\n    diagnosticProjectId: string | null;\n    category: string | null;\n    riskLevel: 'low' | 'moderate' | 'high' | 'extreme' | 'unknown';\n    allCorePointsVerified: boolean;\n}\n\nexport const GENERATED_PROTOCOL_VERIFICATION_SUMMARY: Record<string, ProtocolVerificationSummary> = ${JSON.stringify(summary, null, 4)};\n`;
};

const emitCalibrationCsv = (defaultRow, protocolRows) => {
    const headers = [
        'protocol_id',
        'label',
        'target_utilization',
        'liquidity_pct_of_market_cap',
        'liquidity_min_usd',
        'liquidity_max_usd',
        'liquidity_floor_usd',
        'investor_sell_multiplier',
        'investor_sell_pct_min',
        'investor_sell_pct_max',
        'emission_cap_pct_of_supply',
        'base_demand_floor',
        'break_even_mint_multiplier',
        'burn_backed_demand_fraction',
        'burn_backed_mint_multiplier'
    ];

    const serializeCalibrationRow = (row, label) => {
        return [
            row.protocol_id,
            label,
            row.target_utilization,
            row.liquidity_pct_of_market_cap,
            row.liquidity_min_usd,
            row.liquidity_max_usd,
            row.liquidity_floor_usd,
            row.investor_sell_multiplier,
            row.investor_sell_pct_min,
            row.investor_sell_pct_max,
            row.emission_cap_pct_of_supply,
            row.base_demand_floor,
            row.break_even_mint_multiplier,
            row.burn_backed_demand_fraction,
            row.burn_backed_mint_multiplier
        ].join(',');
    };

    const lines = [headers.join(',')];
    lines.push(serializeCalibrationRow(defaultRow, 'DEFAULT'));
    protocolRows.forEach((row) => {
        lines.push(serializeCalibrationRow(row, row.name));
    });
    return `${lines.join('\n')}\n`;
};

const main = () => {
    if (!fs.existsSync(MASTER_PATH)) {
        throw new Error(`Master sheet not found: ${MASTER_PATH}`);
    }

    const raw = fs.readFileSync(MASTER_PATH, 'utf8');
    const rows = parseTsv(raw);
    const defaultRow = rows.find((row) => row.record_type === 'default' && row.protocol_id === 'default');
    const protocolRows = rows.filter((row) => row.record_type === 'protocol');

    if (!defaultRow) {
        throw new Error('Missing default row: record_type=default and protocol_id=default');
    }
    if (protocolRows.length === 0) {
        throw new Error('No protocol rows found in master sheet.');
    }

    const protocolProfiles = generateProtocolProfiles(protocolRows);
    const profilesTs = emitProtocolProfilesTs(protocolProfiles);
    const verificationTs = emitVerificationSummaryTs(protocolRows);
    const calibrationCsv = emitCalibrationCsv(defaultRow, protocolRows);

    ensureDir(GENERATED_DIR);
    fs.writeFileSync(PROFILES_OUT, profilesTs, 'utf8');
    fs.writeFileSync(VERIFICATION_OUT, verificationTs, 'utf8');
    fs.writeFileSync(CALIBRATION_OUT, calibrationCsv, 'utf8');

    console.log(`Generated ${path.relative(repoRoot, PROFILES_OUT)}`);
    console.log(`Generated ${path.relative(repoRoot, VERIFICATION_OUT)}`);
    console.log(`Generated ${path.relative(repoRoot, CALIBRATION_OUT)}`);
};

main();
