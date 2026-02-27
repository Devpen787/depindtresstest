/**
 * DTSE Bundle Sync & Verify Script
 *
 * Usage:
 *   node --experimental-strip-types scripts/sync_dtse_bundle.ts --mode sync
 *   node --experimental-strip-types scripts/sync_dtse_bundle.ts --mode verify
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const BUNDLE_DIR = path.resolve('public', 'dtse');
const MANIFEST_PATH = path.join(BUNDLE_DIR, 'manifest.json');

const REQUIRED_ARTIFACTS = ['run_context', 'outcomes', 'applicability'] as const;

const RUN_CONTEXT_REQUIRED_FIELDS = [
    'scenario_grid_id',
    'run_id',
    'seed_policy',
    'horizon_weeks',
    'n_sims',
    'evidence_status',
    'protocol_id',
    'model_version',
    'generated_at_utc',
    'bundle_hash',
] as const;

function parseMode(): 'sync' | 'verify' {
    const idx = process.argv.indexOf('--mode');
    const mode = idx !== -1 ? process.argv[idx + 1] : undefined;
    if (mode === 'sync' || mode === 'verify') return mode;
    console.error('Usage: --mode sync | verify');
    process.exit(1);
}

function readJson(filePath: string): unknown {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function verifyBundle(): boolean {
    console.log('[DTSE] Verifying bundle at', BUNDLE_DIR);
    let ok = true;

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('[DTSE] ERROR: manifest.json not found');
        return false;
    }

    const manifest = readJson(MANIFEST_PATH) as Record<string, unknown>;
    console.log(`[DTSE] Manifest version: ${manifest.version}`);
    console.log(`[DTSE] Protocol: ${manifest.protocol_id}`);
    console.log(`[DTSE] Generated: ${manifest.generated_at_utc}`);

    const artifacts = manifest.artifacts as Array<{ name: string; path: string; sha256: string }>;
    if (!Array.isArray(artifacts)) {
        console.error('[DTSE] ERROR: manifest.artifacts is not an array');
        return false;
    }

    for (const requiredName of REQUIRED_ARTIFACTS) {
        const entry = artifacts.find((a) => a.name === requiredName);
        if (!entry) {
            console.error(`[DTSE] ERROR: missing artifact "${requiredName}" in manifest`);
            ok = false;
            continue;
        }

        const artifactPath = path.join('public', entry.path.replace(/^\//, ''));
        if (!fs.existsSync(artifactPath)) {
            console.error(`[DTSE] ERROR: artifact file not found: ${artifactPath}`);
            ok = false;
            continue;
        }

        const data = readJson(artifactPath);
        console.log(`[DTSE]   ✓ ${requiredName} — present (${artifactPath})`);

        if (requiredName === 'run_context') {
            const rc = data as Record<string, unknown>;
            for (const field of RUN_CONTEXT_REQUIRED_FIELDS) {
                if (!(field in rc) || rc[field] === undefined || rc[field] === null) {
                    console.error(`[DTSE] ERROR: run_context missing required field: ${field}`);
                    ok = false;
                }
            }
            if ('weekly_solvency' in rc && rc.weekly_solvency !== undefined && rc.weekly_solvency !== null) {
                if (!Array.isArray(rc.weekly_solvency)) {
                    console.error('[DTSE] ERROR: run_context.weekly_solvency must be an array when present');
                    ok = false;
                } else {
                    const horizonWeeks = typeof rc.horizon_weeks === 'number' ? rc.horizon_weeks : null;
                    if (horizonWeeks !== null && rc.weekly_solvency.length !== horizonWeeks) {
                        console.error(
                            `[DTSE] ERROR: run_context.weekly_solvency length ${rc.weekly_solvency.length} does not match horizon_weeks ${horizonWeeks}`,
                        );
                        ok = false;
                    }
                    const hasInvalidPoint = rc.weekly_solvency.some((value) => (
                        typeof value !== 'number' || !Number.isFinite(value)
                    ));
                    if (hasInvalidPoint) {
                        console.error('[DTSE] ERROR: run_context.weekly_solvency contains non-finite values');
                        ok = false;
                    }
                }
            }
            if (ok) {
                console.log('[DTSE]   ✓ run_context fields validated');
            }
        }
    }

    if (ok) {
        console.log('[DTSE] ✓ Bundle verification passed');
    } else {
        console.error('[DTSE] ✗ Bundle verification failed — see errors above');
    }
    return ok;
}

function syncBundle(): void {
    console.log('[DTSE] Sync mode — checking bundle directory');

    if (!fs.existsSync(BUNDLE_DIR)) {
        fs.mkdirSync(BUNDLE_DIR, { recursive: true });
        console.log(`[DTSE] Created bundle directory: ${BUNDLE_DIR}`);
    }

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.warn('[DTSE] WARNING: No manifest.json found. Run the DTSE pipeline to generate a bundle.');
        console.log('[DTSE] Sync complete — no remote source configured (frozen bundle mode).');
        return;
    }

    const valid = verifyBundle();
    if (valid) {
        console.log('[DTSE] Sync complete — bundle is up to date and valid.');
    } else {
        console.error('[DTSE] Sync complete — bundle has issues that need attention.');
        process.exit(1);
    }
}

const mode = parseMode();

if (mode === 'verify') {
    const ok = verifyBundle();
    process.exit(ok ? 0 : 1);
} else {
    syncBundle();
}
