import { describe, expect, it } from 'vitest';
import { classifyDepinDecision, type DepinDecisionInput } from './depinDecisionTree';

type Fixture = {
  id: string;
  input: DepinDecisionInput;
  expected: 'DePIN-LI' | 'DePIN-LD' | 'Not DePIN';
};

const FIXTURES: Fixture[] = [
  {
    id: 'akash',
    input: {
      hasThreeSidedPlatform: true,
      hasTokenIncentivesForSupply: true,
      hasPhysicalInfrastructureSupply: true,
      supplyAssetsFungible: true,
    },
    expected: 'DePIN-LI',
  },
  {
    id: 'helium_iot',
    input: {
      hasThreeSidedPlatform: true,
      hasTokenIncentivesForSupply: true,
      hasPhysicalInfrastructureSupply: true,
      supplyAssetsFungible: false,
    },
    expected: 'DePIN-LD',
  },
  {
    id: 'bitcoin',
    input: {
      hasThreeSidedPlatform: false,
      hasTokenIncentivesForSupply: true,
      hasPhysicalInfrastructureSupply: true,
      supplyAssetsFungible: true,
    },
    expected: 'Not DePIN',
  },
];

describe('DePIN decision-tree fixtures', () => {
  it('matches paper fixtures for Akash, Helium, and Bitcoin', () => {
    FIXTURES.forEach((fixture) => {
      const result = classifyDepinDecision(fixture.input);
      expect(result.classification, fixture.id).toBe(fixture.expected);
    });
  });
});
