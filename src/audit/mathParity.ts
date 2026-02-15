export const DEFAULT_TOLERANCE = 1e-9;

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

export function trapDoorGrowth(profit: number, barrier = 20, sensitivity = 0.5): number {
  if (profit <= barrier) {
    return 0;
  }
  return sensitivity * (profit - barrier);
}

export function mercenaryChurn(price: number, threshold = 1, k = 5): number {
  return 1 / (1 + Math.exp(k * (price - threshold)));
}

export function priceImpactFunction(pressure: number, liquidity = 1000, k = 0.1): number {
  return k * Math.tanh((pressure / liquidity) * 100);
}

export function calculateRBe(tokenPrice: number, emission: number, cost: number): number {
  return (tokenPrice * emission) / cost;
}

export function gauntletCostPerGb(
  week: number,
  mintedTokens = 200,
  initialPrice = 5,
  decay = 0.05,
  capacity = 1000,
): number {
  const price = initialPrice * Math.exp(-decay * week);
  return (mintedTokens * price) / capacity;
}

export function gauntletRevPerGb(
  _week: number,
  demandGb = 200,
  servicePriceGb = 0.5,
  capacity = 1000,
): number {
  return (demandGb * servicePriceGb) / capacity;
}

export function firstGauntletCrossoverWeek(
  weeks = 52,
  mintedTokens = 200,
  initialPrice = 5,
  decay = 0.05,
  capacity = 1000,
  demandGb = 200,
  servicePriceGb = 0.5,
): number | null {
  for (let week = 0; week < weeks; week += 1) {
    const cost = gauntletCostPerGb(week, mintedTokens, initialPrice, decay, capacity);
    const rev = gauntletRevPerGb(week, demandGb, servicePriceGb, capacity);
    if (cost <= rev) {
      return week;
    }
  }
  return null;
}

export function calculateSurvivalRate(priceDropPercent: number, capex: number, sensitivity: number): number {
  const baseThreshold = clamp(0.35 + (capex / 1000), 0.1, 0.95);
  const effectiveThreshold = clamp(baseThreshold - 0.02 * sensitivity, 0.02, 0.95);
  const slope = 6 + 0.8 * sensitivity;
  return 1 / (1 + Math.exp(slope * (priceDropPercent - effectiveThreshold)));
}

export function binarySearchHistory(
  low = 0,
  high = 100,
  root = 5,
  iterations = 10,
): { history: number[]; low: number; high: number } {
  const history: number[] = [];

  for (let i = 0; i < iterations; i += 1) {
    const mid = (low + high) / 2;
    history.push(mid);

    if (mid >= root) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return { history, low, high };
}

