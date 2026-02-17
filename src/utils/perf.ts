type PerfMeta = Record<string, unknown>;

interface PerfEvent {
  name: string;
  durationMs: number;
  at: string;
  meta?: PerfMeta;
}

declare global {
  interface Window {
    __depinPerfEvents?: PerfEvent[];
  }
}

const MAX_EVENTS = 200;

export const recordPerf = (name: string, durationMs: number, meta?: PerfMeta): void => {
  if (typeof window !== 'undefined') {
    const event: PerfEvent = {
      name,
      durationMs,
      at: new Date().toISOString(),
      meta
    };
    const existing = window.__depinPerfEvents || [];
    window.__depinPerfEvents = [...existing.slice(-(MAX_EVENTS - 1)), event];
  }

  if (import.meta.env.DEV || durationMs >= 250) {
    const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
    console.info(`[perf] ${name}: ${durationMs.toFixed(1)}ms${suffix}`);
  }
};
