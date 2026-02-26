import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadDTSEBundle, verifyDTSEBundle } from './dtseBundle';
import type { DTSERunContext } from '../types/dtse';

const VALID_BUNDLE: DTSERunContext = {
    scenario_grid_id: 'grid-001',
    run_id: 'run-abc-123',
    seed_policy: { seed: 42, locked: true },
    horizon_weeks: 52,
    n_sims: 100,
    evidence_status: 'complete',
    protocol_id: 'ono_v3_calibrated',
    model_version: '2.0.0',
    generated_at_utc: '2026-02-15T00:00:00.000Z',
    bundle_hash: 'sha256-abc123def456',
};

function makeFetchResponse(body: unknown, ok = true, status = 200) {
    return Promise.resolve({
        ok,
        status,
        statusText: ok ? 'OK' : 'Not Found',
        json: () => Promise.resolve(body),
    } as Response);
}

describe('loadDTSEBundle', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('happy path: returns a valid bundle with all required fields', async () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(makeFetchResponse(VALID_BUNDLE));

        const result = await loadDTSEBundle('/dtse/bundle.json');
        expect(result).toEqual(VALID_BUNDLE);
        expect(result.scenario_grid_id).toBe('grid-001');
        expect(result.run_id).toBe('run-abc-123');
        expect(result.seed_policy.seed).toBe(42);
        expect(result.horizon_weeks).toBe(52);
        expect(result.n_sims).toBe(100);
        expect(result.evidence_status).toBe('complete');
        expect(result.protocol_id).toBe('ono_v3_calibrated');
        expect(result.model_version).toBe('2.0.0');
        expect(result.bundle_hash).toBe('sha256-abc123def456');
    });

    it('uses default path when none is provided', async () => {
        const spy = vi.spyOn(globalThis, 'fetch').mockReturnValue(makeFetchResponse(VALID_BUNDLE));

        await loadDTSEBundle();
        expect(spy).toHaveBeenCalledWith('/dtse/bundle.json');
    });

    it('throws on HTTP failure (missing manifest / 404)', async () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(makeFetchResponse(null, false, 404));

        await expect(loadDTSEBundle('/dtse/missing.json')).rejects.toThrow(
            /DTSE bundle fetch failed: 404/,
        );
    });

    it('throws on non-object response (array)', async () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(makeFetchResponse([1, 2, 3]));

        await expect(loadDTSEBundle()).rejects.toThrow(/not a valid JSON object/);
    });

    it('throws on null response body', async () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(makeFetchResponse(null));

        await expect(loadDTSEBundle()).rejects.toThrow(/not a valid JSON object/);
    });

    it('throws when run_context field is missing (run_id)', async () => {
        const incomplete = { ...VALID_BUNDLE } as Record<string, unknown>;
        delete incomplete.run_id;

        vi.spyOn(globalThis, 'fetch').mockReturnValue(makeFetchResponse(incomplete));

        await expect(loadDTSEBundle()).rejects.toThrow(/missing required field: run_id/);
    });

    it('throws when multiple required fields are missing', async () => {
        const incomplete = { scenario_grid_id: 'grid-001' };

        vi.spyOn(globalThis, 'fetch').mockReturnValue(makeFetchResponse(incomplete));

        await expect(loadDTSEBundle()).rejects.toThrow(/missing required field/);
    });

    it('throws on malformed JSON (fetch .json() rejects)', async () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: () => Promise.reject(new SyntaxError('Unexpected token')),
            } as Response),
        );

        await expect(loadDTSEBundle()).rejects.toThrow(/Unexpected token/);
    });
});

describe('verifyDTSEBundle', () => {
    it('returns valid for a complete bundle', () => {
        const result = verifyDTSEBundle(VALID_BUNDLE);
        expect(result.valid).toBe(true);
        expect(result.missingFields).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it('detects missing required fields', () => {
        const incomplete = { ...VALID_BUNDLE } as Record<string, unknown>;
        delete incomplete.run_id;
        delete incomplete.horizon_weeks;

        const result = verifyDTSEBundle(incomplete as DTSERunContext);
        expect(result.valid).toBe(false);
        expect(result.missingFields.length).toBeGreaterThan(0);
        expect(result.missingFields.some(m => m.includes('run_id'))).toBe(true);
        expect(result.missingFields.some(m => m.includes('horizon_weeks'))).toBe(true);
    });

    it('detects invalid evidence_status value', () => {
        const bad = { ...VALID_BUNDLE, evidence_status: 'unknown' as never };
        const result = verifyDTSEBundle(bad);
        expect(result.valid).toBe(false);
        expect(result.warnings.some(w => w.includes('evidence_status'))).toBe(true);
    });

    it('detects non-string protocol_id', () => {
        const bad = { ...VALID_BUNDLE, protocol_id: 123 as never };
        const result = verifyDTSEBundle(bad);
        expect(result.valid).toBe(false);
        expect(result.warnings.some(w => w.includes('protocol_id'))).toBe(true);
    });

    it('detects invalid seed_policy (missing seed)', () => {
        const bad = { ...VALID_BUNDLE, seed_policy: { locked: true } as never };
        const result = verifyDTSEBundle(bad);
        expect(result.valid).toBe(false);
        expect(result.warnings.some(w => w.includes('seed_policy.seed'))).toBe(true);
    });

    it('detects invalid seed_policy (non-boolean locked)', () => {
        const bad = { ...VALID_BUNDLE, seed_policy: { seed: 42, locked: 'yes' } as never };
        const result = verifyDTSEBundle(bad);
        expect(result.valid).toBe(false);
        expect(result.warnings.some(w => w.includes('seed_policy.locked'))).toBe(true);
    });

    it('detects non-finite horizon_weeks', () => {
        const bad = { ...VALID_BUNDLE, horizon_weeks: NaN as never };
        const result = verifyDTSEBundle(bad);
        expect(result.valid).toBe(false);
        expect(result.warnings.some(w => w.includes('horizon_weeks'))).toBe(true);
    });

    it('detects empty string run_id', () => {
        const bad = { ...VALID_BUNDLE, run_id: '' };
        const result = verifyDTSEBundle(bad);
        expect(result.valid).toBe(false);
        expect(result.warnings.some(w => w.includes('run_id'))).toBe(true);
    });
});
