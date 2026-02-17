/// <reference lib="webworker" />

import type { AggregateResult, DerivedMetrics, SimulationParams as NewSimulationParams, SimResult } from '../model';
import { calculateDerivedMetrics, runSimulation as runNewSimulation, simulateOne } from '../model';
import type { SimulationParams as LegacySimulationParams } from '../model/SimulationAdapter';
import { getProtocolModule } from '../protocols/registry';
import type {
  SimulationWorkerJob,
  SimulationWorkerPeerJob,
  SimulationWorkerRequest,
  SimulationWorkerResponse
} from './simulationWorkerTypes';

const mapNewResultsToAggregate = (newResults: ReturnType<typeof runNewSimulation>): AggregateResult[] => {
  return newResults.map((r) => ({
    t: r.t,
    price: r.price,
    supply: r.supply,
    demand: r.demand,
    demand_served: r.demandServed,
    providers: r.providers,
    capacity: r.capacity,
    servicePrice: r.servicePrice,
    minted: r.minted,
    burned: r.burned,
    utilization: r.utilisation,
    profit: r.profit,
    scarcity: r.scarcity,
    incentive: r.incentive,
    buyPressure: r.buyPressure,
    sellPressure: r.sellPressure,
    netFlow: r.netFlow,
    churnCount: r.churnCount,
    joinCount: r.joinCount,
    solvencyScore: r.solvencyScore,
    netDailyLoss: r.netDailyLoss,
    dailyMintUsd: r.dailyMintUsd,
    dailyBurnUsd: r.dailyBurnUsd,
    urbanCount: r.urbanCount,
    ruralCount: r.ruralCount,
    weightedCoverage: r.weightedCoverage,
    treasuryBalance: r.treasuryBalance || { mean: 0, p10: 0, p90: 0 },
    vampireChurn: r.vampireChurn || { mean: 0, p10: 0, p90: 0 },
    mercenaryCount: r.mercenaryCount || { mean: 0, p10: 0, p90: 0 },
    proCount: r.proCount || { mean: 0, p10: 0, p90: 0 },
    underwaterCount: r.underwaterCount || { mean: 0, p10: 0, p90: 0 },
    costPerCapacity: r.costPerCapacity || { mean: 0, p10: 0, p90: 0 },
    revenuePerCapacity: r.revenuePerCapacity || { mean: 0, p10: 0, p90: 0 },
    entryBarrierActive: r.entryBarrierActive || { mean: 0, p10: 0, p90: 0 }
  })) as unknown as AggregateResult[];
};

const runLegacyModel = (params: NewSimulationParams): AggregateResult[] => {
  const allSims: SimResult[][] = [];
  for (let i = 0; i < params.nSims; i++) {
    allSims.push(simulateOne(params as unknown as LegacySimulationParams, params.seed + i));
  }

  const aggregate: AggregateResult[] = [];
  const keys: (keyof SimResult)[] = [
    'price', 'supply', 'demand', 'demand_served', 'providers', 'capacity', 'servicePrice',
    'minted', 'burned', 'utilization', 'profit', 'scarcity', 'incentive', 'solvencyScore',
    'netDailyLoss', 'dailyMintUsd', 'dailyBurnUsd', 'treasuryBalance', 'vampireChurn',
    'mercenaryCount', 'proCount', 'underwaterCount', 'costPerCapacity', 'revenuePerCapacity',
    'entryBarrierActive'
  ];

  for (let tStep = 0; tStep < params.T; tStep++) {
    const step: Partial<AggregateResult> = { t: tStep };
    keys.forEach((key) => {
      const values = allSims
        .map((sim) => sim[tStep]?.[key] as number)
        .filter((v) => v !== undefined)
        .sort((a, b) => a - b);
      if (values.length === 0) return;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const p10 = values[Math.floor(values.length * 0.1)] || 0;
      const p90 = values[Math.floor(values.length * 0.9)] || 0;
      step[key] = { mean, p10, p90 } as any;
    });
    aggregate.push(step as AggregateResult);
  }

  return aggregate;
};

const runJob = (
  job: SimulationWorkerJob,
  activeProfileId?: string
): { aggregate: AggregateResult[]; derivedMetrics: DerivedMetrics | null } => {
  const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(job.protocolId);

  if (job.useNewModel) {
    const newResults = runNewSimulation(job.params);
    let aggregate = mapNewResultsToAggregate(newResults);
    aggregate = protocolModule.postProcessAggregates
      ? protocolModule.postProcessAggregates(aggregate)
      : aggregate;
    const derivedMetrics = activeProfileId === job.protocolId
      ? calculateDerivedMetrics(newResults, job.params)
      : null;
    return { aggregate, derivedMetrics };
  }

  let aggregate = runLegacyModel(job.params);
  aggregate = protocolModule.postProcessAggregates
    ? protocolModule.postProcessAggregates(aggregate)
    : aggregate;
  return { aggregate, derivedMetrics: null };
};

const runPeerJob = (job: SimulationWorkerPeerJob): AggregateResult[] => {
  const protocolModule = getProtocolModule<NewSimulationParams, AggregateResult>(job.protocolId);
  const newResults = runNewSimulation(job.params);
  const mapped = mapNewResultsToAggregate(newResults);
  return protocolModule.postProcessAggregates
    ? protocolModule.postProcessAggregates(mapped)
    : mapped;
};

self.onmessage = (event: MessageEvent<SimulationWorkerRequest>) => {
  const message = event.data;

  try {
    if (message.type === 'runSimulation') {
      let derivedMetrics: DerivedMetrics | null = null;
      const allResults: Record<string, AggregateResult[]> = {};

      message.jobs.forEach((job) => {
        const result = runJob(job, message.activeProfileId);
        allResults[job.protocolId] = result.aggregate;
        if (result.derivedMetrics) {
          derivedMetrics = result.derivedMetrics;
        }
      });

      const response: SimulationWorkerResponse = {
        type: 'runSimulationResult',
        runId: message.runId,
        allResults,
        derivedMetrics
      };
      self.postMessage(response);
      return;
    }

    const peerResults: Record<string, AggregateResult[]> = {};
    message.jobs.forEach((job) => {
      peerResults[job.protocolId] = runPeerJob(job);
    });

    const response: SimulationWorkerResponse = {
      type: 'runPeerCalibrationResult',
      runId: message.runId,
      peerResults
    };
    self.postMessage(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown worker error';
    if (message.type === 'runSimulation') {
      self.postMessage({
        type: 'runSimulationResult',
        runId: message.runId,
        allResults: {},
        derivedMetrics: null,
        error: errorMessage
      } as SimulationWorkerResponse);
      return;
    }

    self.postMessage({
      type: 'runPeerCalibrationResult',
      runId: message.runId,
      peerResults: {},
      error: errorMessage
    } as SimulationWorkerResponse);
  }
};
