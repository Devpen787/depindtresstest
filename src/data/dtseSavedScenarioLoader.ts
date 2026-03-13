import type { DTSEStressChannel } from '../types/dtse';
import type { DTSESavedScenarioPack } from './dtseSavedScenarios';
import { makeDTSESavedScenarioPackKey } from './dtseSavedScenarios';

type SavedScenarioRegistry = Record<string, DTSESavedScenarioPack>;

type SavedScenarioModule = {
  DTSE_SAVED_SCENARIO_PACKS_FOR_PROTOCOL: SavedScenarioRegistry;
};

const savedScenarioProtocolModuleLoaders = import.meta.glob<SavedScenarioModule>(
  './generated/dtseSavedScenarioPacks.protocol.*.generated.ts',
);

const savedScenarioRegistryPromises = new Map<string, Promise<SavedScenarioRegistry>>();

const getSavedScenarioProtocolModulePath = (protocolId: string) => (
  `./generated/dtseSavedScenarioPacks.protocol.${protocolId}.generated.ts`
);

const loadDTSESavedScenarioRegistry = async (protocolId: string): Promise<SavedScenarioRegistry | null> => {
  if (!savedScenarioRegistryPromises.has(protocolId)) {
    const loader = savedScenarioProtocolModuleLoaders[getSavedScenarioProtocolModulePath(protocolId)];
    if (!loader) {
      return null;
    }

    savedScenarioRegistryPromises.set(
      protocolId,
      loader().then((module) => module.DTSE_SAVED_SCENARIO_PACKS_FOR_PROTOCOL),
    );
  }

  return savedScenarioRegistryPromises.get(protocolId) ?? null;
};

export const loadDTSESavedScenarioPack = async (
  protocolId: string,
  stressChannelId: DTSEStressChannel['id'],
): Promise<DTSESavedScenarioPack | null> => {
  const registry = await loadDTSESavedScenarioRegistry(protocolId);
  if (!registry) return null;
  return registry[makeDTSESavedScenarioPackKey(protocolId, stressChannelId)] ?? null;
};
