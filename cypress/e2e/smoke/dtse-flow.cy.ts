describe("DTSE flow smoke", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("DTSE tab is the default landing tab", () => {
    cy.get('[data-cy="tab-dtse"]').should("have.attr", "aria-selected", "true");
  });

  it("DTSE dashboard root is visible on load", () => {
    cy.get('[data-cy="dtse-dashboard-root"]').should("be.visible");
    cy.get('[data-cy="dtse-intro-card"]').should("contain.text", "DTSE compares the selected stress contract to a matched baseline");
    cy.get('[data-cy="dtse-trust-chip-market"]').should("contain.text", "Market context");
    cy.get('[data-cy="dtse-trust-chip-model"]').should("contain.text", "Model source");
    cy.get('[data-cy="dtse-trust-chip-confidence"]').should("contain.text", "Scoring confidence");
  });

  it("allows protocol switching from DTSE header", () => {
    cy.get('[data-cy="dtse-protocol-select"]').should("be.visible").select("hivemapper_v1");
    cy.get('[data-cy="dtse-context-stage"]').should("contain.text", "Hivemapper");
  });

  it("allows stress-channel switching from DTSE header", () => {
    cy.get('[data-cy="dtse-stress-select"]').should("be.visible").select("demand_contraction");
    cy.contains("Demand Contraction").should("exist");

    cy.get('[data-cy="dtse-stress-select"]').select("competitive_yield_pressure");
    cy.contains("Competitive-Yield Pressure").should("exist");
  });

  it("reruns DTSE outputs when the stress channel changes", () => {
    cy.get('[data-cy="dtse-stress-select"]').should("be.visible").select("competitive_yield_pressure");

    cy.get('[data-cy="dtse-stage-4"]').click();
    cy.get('[data-cy="dtse-signature-elastic-provider-exit"]', { timeout: 10000 }).should("exist");

    cy.get('[data-cy="dtse-stage-5"]').click();
    cy.get('[data-cy="dtse-rec-live-response-elastic-provider-exit"]', { timeout: 10000 }).should("exist");

    cy.get('[data-cy="dtse-stress-select"]').select("liquidity_shock");

    cy.get('[data-cy="dtse-stage-4"]').click();
    cy.get('[data-cy="dtse-signature-elastic-provider-exit"]', { timeout: 10000 }).should("not.exist");

    cy.get('[data-cy="dtse-stage-5"]').click();
    cy.get('[data-cy="dtse-rec-live-response-elastic-provider-exit"]', { timeout: 10000 }).should("not.exist");
    cy.get('[data-cy="dtse-rec-live-response-liquidity-driven-compression"]', { timeout: 10000 }).should("exist");
  });

  it("can progress through stages via next button", () => {
    cy.get('[data-cy="dtse-dashboard-root"]').should("be.visible");
    cy.get('[data-cy="dtse-stage-panel-1"]').should("be.visible");

    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-2"]').should("be.visible");

    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-3"]').should("be.visible");
    cy.get('[data-cy="dtse-stage-panel-3"]').should("contain.text", "What Broke First");
    cy.get('[data-cy="dtse-stage-panel-3"]').should(($panel) => {
      const hasChart =
        $panel.find('[data-cy="dtse-baseline-drift-chart"]').length > 0 ||
        $panel.find('[data-cy="dtse-transmission-pathway"]').length > 0;
      const hasLoading = $panel.text().includes("Loading stress charts");
      const hasUnavailable = $panel.text().includes("Sequence view unavailable");
      expect(hasChart || hasLoading || hasUnavailable).to.eq(true);
    });

    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-4"]').should("be.visible");

    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-5"]').should("be.visible");
  });

  it("can go back through stages via prev button", () => {
    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-2"]').should("be.visible");

    cy.get('[data-cy="dtse-prev-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-1"]').should("be.visible");
  });

  it("keeps scenario-inactive metrics out of the Stage 2 exception summary", () => {
    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-2"]').should("be.visible");
    cy.get('[data-cy="dtse-applicability-exceptions"]').should("contain.text", "Run constraints");
    cy.get('[data-cy="dtse-applicability-exceptions"]').should("not.contain.text", "Vampire Churn");
    cy.get('[data-cy="dtse-stage-panel-2"]').should("contain.text", "Vampire Churn");
  });

  it("final stage shows recommendations or export area", () => {
    for (let i = 0; i < 4; i++) {
      cy.get('[data-cy="dtse-next-stage"]').click();
    }
    cy.get('[data-cy="dtse-stage-panel-5"]').should("be.visible");
    cy.get('[data-cy="dtse-stage-panel-5"]').should("exist");
  });

  it("can switch to overview mode and view all stages on one page", () => {
    cy.get('[data-cy="dtse-view-mode-overview"]').click();
    cy.get('[data-cy="dtse-overview-root"]').should("be.visible");
    cy.get('[data-cy="dtse-stage-panel-1"]').should("be.visible");
    cy.get('[data-cy="dtse-stage-panel-5"]').should("exist");
    cy.get('[data-cy="dtse-stage-5"]').click();
    cy.get('[data-cy="dtse-stage-panel-5"]').scrollIntoView().should("be.visible");
  });

  it('does not display a "Thesis" label in the DTSE view', () => {
    cy.get('[data-cy="dtse-dashboard-root"]').should("be.visible");
    cy.get('[data-cy="dtse-dashboard-root"]').should("not.contain.text", "Thesis");
  });

  it("exposes DTSE-specific Learn, Data, and Actions menus", () => {
    cy.get('[data-cy="header-learn"]').click();
    cy.contains("How DTSE Works").should("be.visible");
    cy.contains("Metric Definitions").should("be.visible");
    cy.contains("Product Docs").should("be.visible");

    cy.get('[data-cy="header-data"]').click();
    cy.contains("Refresh market data").should("be.visible");
    cy.contains("Auto-refresh every 5 minutes").should("be.visible");
    cy.contains(/Model engine:/).should("be.visible");

    cy.get('[data-cy="header-actions"]').click();
    cy.contains("Export DTSE run").should("be.visible");
    cy.contains("Open Stress Lab").should("be.visible");
  });

  it("opens Stress Lab from DTSE Actions", () => {
    cy.get('[data-cy="header-actions"]').click();
    cy.contains("Open Stress Lab").click();
    cy.get('[data-cy="sim-view-sandbox"]').should("have.attr", "aria-selected", "true");
  });
});
