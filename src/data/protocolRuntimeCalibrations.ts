import type { SimulationParams } from '../model/types';

export type ProtocolRuntimeCalibration = Partial<
    Pick<
        SimulationParams,
        | 'kBuyPressure'
        | 'kSellPressure'
        | 'kDemandPrice'
        | 'kMintPrice'
        | 'baseServicePrice'
        | 'servicePriceElasticity'
        | 'preorderBacklogFraction'
        | 'preorderReleaseWeeks'
        | 'sunkCostChurnDamping'
    >
>;

const PROTOCOL_RUNTIME_CALIBRATIONS: Record<string, ProtocolRuntimeCalibration> = {
    helium_bme_v1: {
        // Structural calibration from 2026-02-16 Helium backtest pass.
        preorderBacklogFraction: 0.8743521455442533,
        preorderReleaseWeeks: 12,
        sunkCostChurnDamping: 0.31689069885760546
    },
    ionet_v1: {
        // Pass-3 strict-pass calibration from remediation sweeps.
        kBuyPressure: 0.08,
        kSellPressure: 0.08,
        kDemandPrice: 0.1,
        kMintPrice: 0.005,
        baseServicePrice: 1.1,
        servicePriceElasticity: 0.3
    }
};

export const getProtocolRuntimeCalibration = (protocolId: string): ProtocolRuntimeCalibration => {
    return PROTOCOL_RUNTIME_CALIBRATIONS[protocolId] ?? {};
};
