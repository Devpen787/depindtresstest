import { SimulationParams } from '../model/types';
import { TrendingDown, Infinity, Swords, Zap } from 'lucide-react';

export interface SimulationScenario {
    id: string;
    name: string;
    iconName: string; // Storing string name to map to icon component in UI
    description: string;
    thesisPoint: string;
    focusChart?: string; // Optional: Name of the chart to auto-open
    params: Partial<SimulationParams>;
}

export const SCENARIOS: SimulationScenario[] = [
    {
        id: 'death_spiral',
        name: 'Liquidity Shock',
        iconName: 'TrendingDown',
        description: 'Simulate a 50% instant price crash due to investor unlocks.',
        thesisPoint: 'Notice how high-OpEx networks suffer immediate mass churn (Capitulation), while low-OpEx networks merely hibernate. This proves that high-cost hardware is a systemic risk during volatility.',
        focusChart: 'urban_density',
        params: {
            investorSellPct: 0.5, // 50% dump
            investorUnlockWeek: 20, // Week 20
            macro: 'bearish',
            growthCallEventPct: 0, // Reset others
            competitorYield: 0,
            maxMintWeekly: 5_000_000
        }
    },
    {
        id: 'infinite_subsidy',
        name: 'The Subsidy Trap',
        iconName: 'Infinity',
        description: 'High emissions with low organic demand.',
        thesisPoint: 'Observe the "Solvency Ratio" flatline below 0.5. The token price may rise temporarily, but the "Real Value" (Burn) never catches up, leading to an inevitable long-term collapse.',
        focusChart: 'solvency_ratio',
        params: {
            maxMintWeekly: 10_000_000, // Excessive printing
            demandType: 'consistent', // Flat demand
            burnPct: 0.1, // Low burn
            kMintPrice: 0.8, // High sensitivity to dilution
            investorSellPct: 0, // Reset
            growthCallEventPct: 0,
            competitorYield: 0,
            macro: 'neutral'
        }
    },
    {
        id: 'vampire_attack',
        name: 'Vampire Attack',
        iconName: 'Swords',
        description: 'A competitor offers 200% higher yields.',
        thesisPoint: 'Aggressive competitor yields drain your supply. If your "Moat" (Retention) is low, you will lose maximum node density in weeks, destroying the network effect.',
        focusChart: 'vampire_churn',
        params: {
            churnThreshold: 50, // Providers leave easily
            competitorYield: 2.0, // 200% advantage
            revenueStrategy: 'reserve', // Active treasury defense
            investorSellPct: 0, // Reset
            growthCallEventPct: 0,
            macro: 'bearish'
        }
    },
    {
        id: 'growth_shock',
        name: 'Aggressive Expansion',
        iconName: 'Zap',
        description: 'Viral marketing triggers +50% node growth in Week 20.',
        thesisPoint: 'Tests "Supply is King" thesis. If demand is laggy, this massive supply shock will crash token price (oversupply) unless the "Burn" (Usage) ramps up efficiently.',
        focusChart: 'urban_density',
        params: {
            growthCallEventWeek: 20,
            growthCallEventPct: 0.5, // +50% instant growth
            demandType: 'growth', // Assume organic demand is growing
            investorSellPct: 0, // Reset
            competitorYield: 0,
            macro: 'bullish'
        }
    },
    {
        id: 'project_onocoy',
        name: 'Project: Onocoy',
        iconName: 'Shield',
        description: 'High CapEx ($500+), Low Churn. The "Concrete Bunker".',
        thesisPoint: 'Hardware acts as a defensive moat. Even with low yields, miners stay because of sunk costs.',
        focusChart: 'urban_density',
        params: {
            initialProviders: 100,
            providerCostPerWeek: 10,
            hardwareCost: 500,
            churnThreshold: 0, // Very resilient
            competitorYield: 0,
            macro: 'bearish'
        }
    },
    {
        id: 'project_hivemapper',
        name: 'Project: Hivemapper',
        iconName: 'Shield',
        description: 'Med CapEx ($450), Med Churn. The "Wooden House".',
        thesisPoint: 'Vulnerable to prolonged downturns but resistant to minor shocks.',
        focusChart: 'urban_density',
        params: {
            initialProviders: 500,
            providerCostPerWeek: 5,
            hardwareCost: 450,
            churnThreshold: 20, // Moderate resilience
            competitorYield: 0,
            macro: 'bearish'
        }
    },
    {
        id: 'project_grass',
        name: 'Project: Grass',
        iconName: 'Zap',
        description: 'Zero CapEx ($0), High Churn. The "Straw Hut".',
        thesisPoint: 'Zero switching costs mean zero loyalty. Users leave instantly if yields drop.',
        focusChart: 'urban_density',
        params: {
            initialProviders: 1000,
            providerCostPerWeek: 0,
            hardwareCost: 0,
            churnThreshold: 100, // Extremely sensitive
            competitorYield: 0,
            macro: 'bearish'
        }
    },
    {
        id: 'project_geodnet',
        name: 'Vs Geodnet',
        iconName: 'Swords',
        description: 'Competitor Subsidy War.',
        thesisPoint: 'A direct competitor offering 150% APY. Can Onocoy miners resist the switch?',
        focusChart: 'vampire_churn',
        params: {
            initialProviders: 100,
            providerCostPerWeek: 15,
            hardwareCost: 700,
            churnThreshold: 0,
            competitorYield: 1.5, // 150% yield advantage
            macro: 'neutral'
        }
    }
];
