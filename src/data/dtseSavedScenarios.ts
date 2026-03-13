import type {
  DTSEApplicabilityEntry,
  DTSEFailureSignature,
  DTSEOutcome,
  DTSERecommendation,
  DTSERunContext,
  DTSEStressChannel,
} from '../types/dtse';
import type { DTSESequenceView } from '../utils/dtseSequenceView';

export interface DTSESavedScenarioPack {
  runContext: DTSERunContext;
  applicability: DTSEApplicabilityEntry[];
  outcomes: DTSEOutcome[];
  failureSignatures: DTSEFailureSignature[];
  recommendations: DTSERecommendation[];
  sequenceView: DTSESequenceView | null;
}

export const makeDTSESavedScenarioPackKey = (
  protocolId: string,
  stressChannelId: DTSEStressChannel['id'],
): string => `${protocolId}::${stressChannelId}`;
