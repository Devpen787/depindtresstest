import { GENERATED_PROTOCOL_PROFILES } from './generated/protocolProfiles.generated';

export type DemandType = 'consistent' | 'high-to-decay' | 'growth' | 'volatile';
export type MacroCondition = 'bearish' | 'bullish' | 'sideways';

export interface ProtocolProfileV1 {
    version: string;
    metadata: {
        id: string;
        name: string;
        mechanism: string;
        notes: string;
        model_type: 'location_based' | 'fungible_resource';
        source: string;
        coingeckoId: string;
        chain: 'solana' | 'ethereum' | 'polygon' | 'cosmos' | 'filecoin' | 'other';
    };
    parameters: {
        supply: { value: number; unit: string };
        emissions: { value: number; unit: string };
        burn_fraction: { value: number; unit: string };
        adjustment_lag: { value: number; unit: string };
        demand_regime: { value: DemandType; unit: string };
        provider_economics: {
            opex_weekly: { value: number; unit: string };
            churn_threshold: { value: number; unit: string };
        };
        initial_active_providers: { value: number; unit: string };
        initial_price: { value: number; unit: string };
        hardware_cost: { value: number; unit: string };
        pro_tier_pct: { value: number; unit: string };
    };
}

export const PROTOCOL_PROFILES: ProtocolProfileV1[] = GENERATED_PROTOCOL_PROFILES as ProtocolProfileV1[];
