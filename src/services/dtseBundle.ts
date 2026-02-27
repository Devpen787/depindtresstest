import type { DTSERunContext, DTSEBundleVerification } from '../types/dtse';

const DEFAULT_BUNDLE_PATH = '/dtse/bundle.json';

const REQUIRED_FIELDS: (keyof DTSERunContext)[] = [
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
];

const VALID_EVIDENCE_STATUSES = ['complete', 'partial', 'missing'] as const;

function assertString(obj: Record<string, unknown>, field: string, path: string): string[] {
    if (typeof obj[field] !== 'string' || (obj[field] as string).length === 0) {
        return [`DTSE bundle invalid field type: ${field} must be a non-empty string at path ${path}`];
    }
    return [];
}

function assertNumber(obj: Record<string, unknown>, field: string, path: string): string[] {
    if (typeof obj[field] !== 'number' || !Number.isFinite(obj[field] as number)) {
        return [`DTSE bundle invalid field type: ${field} must be a finite number at path ${path}`];
    }
    return [];
}

function validateBundleShape(data: Record<string, unknown>, path: string): {
    missingFields: string[];
    warnings: string[];
} {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    for (const field of REQUIRED_FIELDS) {
        if (!(field in data) || data[field] === undefined || data[field] === null) {
            missingFields.push(`DTSE bundle missing required field: ${field} at path ${path}`);
        }
    }

    if (missingFields.length > 0) return { missingFields, warnings };

    warnings.push(...assertString(data, 'scenario_grid_id', path));
    warnings.push(...assertString(data, 'run_id', path));
    warnings.push(...assertString(data, 'protocol_id', path));
    warnings.push(...assertString(data, 'model_version', path));
    warnings.push(...assertString(data, 'generated_at_utc', path));
    warnings.push(...assertString(data, 'bundle_hash', path));

    warnings.push(...assertNumber(data, 'horizon_weeks', path));
    warnings.push(...assertNumber(data, 'n_sims', path));

    if (!VALID_EVIDENCE_STATUSES.includes(data.evidence_status as typeof VALID_EVIDENCE_STATUSES[number])) {
        warnings.push(`DTSE bundle invalid evidence_status: expected one of ${VALID_EVIDENCE_STATUSES.join(', ')} at path ${path}`);
    }

    const sp = data.seed_policy as Record<string, unknown> | undefined;
    if (!sp || typeof sp !== 'object') {
        warnings.push(`DTSE bundle invalid field type: seed_policy must be an object at path ${path}`);
    } else {
        if (typeof sp.seed !== 'number' || !Number.isFinite(sp.seed)) {
            warnings.push(`DTSE bundle invalid field type: seed_policy.seed must be a finite number at path ${path}`);
        }
        if (typeof sp.locked !== 'boolean') {
            warnings.push(`DTSE bundle invalid field type: seed_policy.locked must be a boolean at path ${path}`);
        }
    }

    if ('weekly_solvency' in data && data.weekly_solvency !== undefined && data.weekly_solvency !== null) {
        if (!Array.isArray(data.weekly_solvency)) {
            warnings.push(`DTSE bundle invalid field type: weekly_solvency must be an array at path ${path}`);
        } else {
            const horizonWeeks = typeof data.horizon_weeks === 'number' ? data.horizon_weeks : null;
            if (horizonWeeks !== null && data.weekly_solvency.length !== horizonWeeks) {
                warnings.push(
                    `DTSE bundle invalid field type: weekly_solvency length must match horizon_weeks at path ${path}`,
                );
            }
            const invalidPoint = data.weekly_solvency.find((value) => (
                typeof value !== 'number' || !Number.isFinite(value)
            ));
            if (invalidPoint !== undefined) {
                warnings.push(`DTSE bundle invalid field type: weekly_solvency must contain only finite numbers at path ${path}`);
            }
        }
    }

    return { missingFields, warnings };
}

/**
 * Load a pre-computed DTSE bundle from the public directory.
 * Default mode is frozen bundle load — no recomputation.
 */
export async function loadDTSEBundle(bundlePath?: string): Promise<DTSERunContext> {
    const resolvedPath = bundlePath ?? DEFAULT_BUNDLE_PATH;

    const response = await fetch(resolvedPath);
    if (!response.ok) {
        throw new Error(`DTSE bundle fetch failed: ${response.status} ${response.statusText} at path ${resolvedPath}`);
    }

    const data: unknown = await response.json();

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error(`DTSE bundle is not a valid JSON object at path ${resolvedPath}`);
    }

    const record = data as Record<string, unknown>;
    const { missingFields } = validateBundleShape(record, resolvedPath);

    if (missingFields.length > 0) {
        throw new Error(missingFields.join('\n'));
    }

    return data as DTSERunContext;
}

/**
 * Verify integrity and completeness of an already-loaded DTSE bundle.
 */
export function verifyDTSEBundle(bundle: DTSERunContext): DTSEBundleVerification {
    const record = bundle as unknown as Record<string, unknown>;
    const { missingFields, warnings } = validateBundleShape(record, '<in-memory>');

    return {
        valid: missingFields.length === 0 && warnings.length === 0,
        missingFields,
        warnings,
    };
}
