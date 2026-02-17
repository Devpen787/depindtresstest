type PerfEvent = {
  name: string;
  durationMs: number;
  at: string;
  meta?: Record<string, unknown>;
};

const primaryTabs = [
  "benchmark",
  "diagnostic",
  "thesis",
  "case_study",
  "decision_tree",
  "benchmark",
] as const;

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
};

describe("Tab switch perf", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.__depinPerfEvents = [];
    });
  });

  it("captures tab-switch timings for repeated primary journeys", () => {
    for (let round = 0; round < 5; round += 1) {
      primaryTabs.forEach((tabId) => {
        cy.get(`[data-cy="tab-${tabId}"]`).click().should("have.attr", "aria-selected", "true");
      });
    }

    cy.window().then((win) => {
      const events = (win.__depinPerfEvents ?? []) as PerfEvent[];
      const tabSwitchEvents = events.filter((event) => event.name === "tab-switch");
      const durations = tabSwitchEvents
        .map((event) => Number(event.durationMs))
        .filter((value) => Number.isFinite(value))
        .sort((a, b) => a - b);

      const avg =
        durations.length === 0 ? 0 : durations.reduce((sum, value) => sum + value, 0) / durations.length;
      const summary = {
        count: durations.length,
        minMs: durations[0] ?? 0,
        p50Ms: percentile(durations, 50),
        p90Ms: percentile(durations, 90),
        p95Ms: percentile(durations, 95),
        maxMs: durations[durations.length - 1] ?? 0,
        avgMs: avg,
      };

      expect(summary.count).to.be.greaterThan(20);

      cy.writeFile("output/perf/tab-switch-events.json", {
        capturedAt: new Date().toISOString(),
        rounds: 5,
        tabSequence: primaryTabs,
        summary,
        tabSwitchEvents,
      });
    });
  });
});
