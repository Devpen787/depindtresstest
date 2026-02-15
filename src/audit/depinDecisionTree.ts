export type DepinClassification = 'DePIN-LI' | 'DePIN-LD' | 'Not DePIN';

export interface DepinDecisionInput {
  hasThreeSidedPlatform: boolean;
  hasTokenIncentivesForSupply: boolean;
  hasPhysicalInfrastructureSupply: boolean;
  supplyAssetsFungible: boolean;
}

export interface DepinDecisionResult {
  classification: DepinClassification;
  satisfiedCriteria: number;
  notes: string[];
}

export function classifyDepinDecision(input: DepinDecisionInput): DepinDecisionResult {
  const notes: string[] = [];
  let satisfiedCriteria = 0;

  if (input.hasThreeSidedPlatform) {
    satisfiedCriteria += 1;
  } else {
    notes.push('missing_three_sided_platform');
  }

  if (input.hasTokenIncentivesForSupply) {
    satisfiedCriteria += 1;
  } else {
    notes.push('missing_token_incentives_for_supply');
  }

  if (input.hasPhysicalInfrastructureSupply) {
    satisfiedCriteria += 1;
  } else {
    notes.push('missing_physical_infrastructure_supply');
  }

  if (satisfiedCriteria < 3) {
    return {
      classification: 'Not DePIN',
      satisfiedCriteria,
      notes,
    };
  }

  return {
    classification: input.supplyAssetsFungible ? 'DePIN-LI' : 'DePIN-LD',
    satisfiedCriteria,
    notes,
  };
}
