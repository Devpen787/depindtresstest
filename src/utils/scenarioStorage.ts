/**
 * Custom Scenario Storage - LocalStorage-based save/load for user scenarios
 */

import { SimulationParams } from '../model/types';

export interface CustomScenario {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    protocolId: string; // Which protocol this was created for
    params: Partial<SimulationParams>;
}

const STORAGE_KEY = 'depin_custom_scenarios';

/**
 * Get all saved custom scenarios from localStorage
 */
export function getCustomScenarios(): CustomScenario[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Save a new custom scenario
 */
export function saveCustomScenario(
    name: string,
    description: string,
    protocolId: string,
    params: Partial<SimulationParams>
): CustomScenario {
    const scenarios = getCustomScenarios();

    const newScenario: CustomScenario = {
        id: `custom_${Date.now()}`,
        name,
        description,
        createdAt: new Date().toISOString(),
        protocolId,
        params
    };

    scenarios.push(newScenario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));

    return newScenario;
}

/**
 * Delete a custom scenario by ID
 */
export function deleteCustomScenario(id: string): boolean {
    const scenarios = getCustomScenarios();
    const filtered = scenarios.filter(s => s.id !== id);

    if (filtered.length < scenarios.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }
    return false;
}

/**
 * Export all scenarios as JSON (for sharing)
 */
export function exportScenarios(): string {
    return JSON.stringify(getCustomScenarios(), null, 2);
}

/**
 * Import scenarios from JSON string
 */
export function importScenarios(json: string): number {
    try {
        const imported = JSON.parse(json) as CustomScenario[];
        const existing = getCustomScenarios();

        // Merge, avoiding duplicates by ID
        const existingIds = new Set(existing.map(s => s.id));
        const newScenarios = imported.filter(s => !existingIds.has(s.id));

        const merged = [...existing, ...newScenarios];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

        return newScenarios.length;
    } catch {
        return 0;
    }
}
