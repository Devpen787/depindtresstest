import type { AggregateResult, DerivedMetrics, SimulationParams as NewSimulationParams } from '../model';

export interface SimulationWorkerJob {
  protocolId: string;
  params: NewSimulationParams;
  useNewModel: boolean;
}

export interface SimulationWorkerPeerJob {
  protocolId: string;
  params: NewSimulationParams;
}

export interface SimulationWorkerRunRequest {
  type: 'runSimulation';
  runId: number;
  jobs: SimulationWorkerJob[];
  activeProfileId: string;
}

export interface SimulationWorkerRunResult {
  type: 'runSimulationResult';
  runId: number;
  allResults: Record<string, AggregateResult[]>;
  derivedMetrics: DerivedMetrics | null;
  error?: string;
}

export interface SimulationWorkerPeerRequest {
  type: 'runPeerCalibration';
  runId: number;
  jobs: SimulationWorkerPeerJob[];
}

export interface SimulationWorkerPeerResult {
  type: 'runPeerCalibrationResult';
  runId: number;
  peerResults: Record<string, AggregateResult[]>;
  error?: string;
}

export type SimulationWorkerRequest = SimulationWorkerRunRequest | SimulationWorkerPeerRequest;
export type SimulationWorkerResponse = SimulationWorkerRunResult | SimulationWorkerPeerResult;
