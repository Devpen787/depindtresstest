const STRESS_CHANNELS = [
  { id: 'baseline_neutral', label: 'Baseline Neutral' },
  { id: 'demand_contraction', label: 'Demand Contraction' },
  { id: 'liquidity_shock', label: 'Liquidity Shock' },
  { id: 'competitive_yield_pressure', label: 'Competitive-Yield Pressure' },
  { id: 'provider_cost_inflation', label: 'Provider Cost Inflation' },
] as const;

const BROKEN_VISIBLE_STRINGS = [
  'DATA_AVAILABLEData available',
  'SCENARIO_INACTIVE',
  '-999%',
  'ono_v3_calibrated',
];

const assertNoBrokenVisibleStrings = (text: string) => {
  BROKEN_VISIBLE_STRINGS.forEach((artifact) => {
    expect(text).not.to.contain(artifact);
  });
};

const ensureProtocolSelected = (protocolId: string) => {
  cy.get('[data-cy="dtse-dashboard-root"]').then(($root) => {
    const currentProtocolId = $root.attr('data-selected-protocol-id');
    const beforeRunId = Number($root.attr('data-simulation-run-id') ?? '0');

    if (currentProtocolId === protocolId) {
      cy.get('[data-cy="dtse-dashboard-root"]')
        .should('have.attr', 'data-selected-protocol-id', protocolId)
        .should('have.attr', 'data-loading', 'false');
      return;
    }

    cy.get('[data-cy="dtse-protocol-select"]').select(protocolId);
    cy.get('[data-cy="dtse-dashboard-root"]', { timeout: 15000 })
      .should('have.attr', 'data-selected-protocol-id', protocolId)
      .should(($nextRoot) => {
        expect(Number($nextRoot.attr('data-simulation-run-id') ?? '0')).to.be.greaterThan(beforeRunId);
      })
      .should('have.attr', 'data-loading', 'false');
  });
};

const ensureStressSelected = (stressId: string) => {
  cy.get('[data-cy="dtse-dashboard-root"]').then(($root) => {
    const currentStressId = $root.attr('data-stress-channel-id');
    const beforeRunId = Number($root.attr('data-simulation-run-id') ?? '0');

    if (currentStressId === stressId) {
      cy.get('[data-cy="dtse-dashboard-root"]')
        .should('have.attr', 'data-stress-channel-id', stressId)
        .should('have.attr', 'data-loading', 'false');
      return;
    }

    cy.get('[data-cy="dtse-stress-select"]').select(stressId);
    cy.get('[data-cy="dtse-dashboard-root"]', { timeout: 15000 })
      .should('have.attr', 'data-stress-channel-id', stressId)
      .should(($nextRoot) => {
        expect(Number($nextRoot.attr('data-simulation-run-id') ?? '0')).to.be.greaterThan(beforeRunId);
      })
      .should('have.attr', 'data-loading', 'false');
  });
};

describe('DTSE matrix coverage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('walks every DTSE protocol and stress channel through all five stages', () => {
    cy.get('[data-cy="dtse-view-mode-overview"]').click();
    cy.get('[data-cy="dtse-overview-root"]').should('be.visible');

    cy.get('[data-cy="dtse-protocol-select"] option').then(($options) => {
      const protocols = [...$options]
        .map((option) => ({
          id: option.getAttribute('value') ?? '',
          label: option.textContent?.trim() ?? '',
        }))
        .filter((protocol) => Boolean(protocol.id) && Boolean(protocol.label));

      expect(protocols.length).to.be.greaterThan(0);

      protocols.forEach((protocol) => {
        cy.log(`Protocol: ${protocol.label}`);
        ensureProtocolSelected(protocol.id);

        STRESS_CHANNELS.forEach((stress) => {
          cy.log(`Stress: ${stress.label}`);
          ensureStressSelected(stress.id);

          cy.get('[data-cy="dtse-stage-panel-1"]').should(($panel) => {
            const text = $panel.text();
            expect(text).to.contain('Stage 1 — Protocol Context');
            expect(text).to.contain(protocol.label);
            expect(text).to.contain(stress.label);
            assertNoBrokenVisibleStrings(text);
          });

          cy.get('[data-cy="dtse-stage-panel-2"]').should(($panel) => {
            const text = $panel.text();
            expect(text).to.contain('Stage 2 — What Can Be Scored');
            expect(text).to.contain('Scored now');
            expect(text).to.contain('Run constraints');
            assertNoBrokenVisibleStrings(text);
          });

          cy.get('[data-cy="dtse-stage-panel-3"]').should(($panel) => {
            const text = $panel.text();
            const outcomeCardCount = $panel.find('[data-cy^="dtse-outcome-"]').length;
            expect(text).to.contain('Stage 3 — What Broke First');
            expect(outcomeCardCount).to.be.greaterThan(0);
            assertNoBrokenVisibleStrings(text);
          });

          cy.get('[data-cy="dtse-stage-panel-4"]').should(($panel) => {
            const text = $panel.text();
            const signatureCount = $panel.find('[data-cy^="dtse-signature-"]').length;
            const hasEmptyState = text.includes('No failure signatures in this run');
            expect(text).to.contain('Stage 4 — Failure Patterns');
            expect(signatureCount > 0 || hasEmptyState).to.eq(true);
            assertNoBrokenVisibleStrings(text);
          });

          cy.get('[data-cy="dtse-stage-panel-5"]').should(($panel) => {
            const text = $panel.text();
            const recommendationCount = $panel.find('[data-cy^="dtse-rec-"]').length;
            const hasEmptyState = text.includes('No immediate next test');
            expect(text).to.contain('Stage 5 — Next Tests');
            expect(recommendationCount > 0 || hasEmptyState).to.eq(true);
            assertNoBrokenVisibleStrings(text);
          });
        });
      });
    });
  });
});
