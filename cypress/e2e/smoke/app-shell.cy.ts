describe("Dashboard smoke", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("boots the app shell", () => {
    cy.get('[data-cy="dashboard-root"]').should("be.visible");
    cy.get('[data-cy="app-title"]').should("contain.text", "DePIN Stress Test");
    cy.get('[data-cy="run-matrix"]').should("exist");
    cy.wait("@solanaGetSlot");
  });

  it("switches primary tabs", () => {
    cy.get('[data-cy="tab-benchmark"]').click().should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="tab-thesis"]').click().should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="tab-diagnostic"]').click().should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="tab-case_study"]').click().should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="tab-simulator"]').click().should("have.attr", "aria-pressed", "true");
  });

  it("switches simulator modes and reruns", () => {
    cy.get('[data-cy="sim-view-explorer"]').click().should("have.attr", "aria-pressed", "true");
    cy.wait("@coingeckoMarkets");
    cy.wait("@solanaGetTokenSupply");
    cy.get('[data-cy="sim-view-comparison"]').click().should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="sim-view-sandbox"]').click().should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="run-matrix"]').click().should("be.visible");
  });

  it("opens and exits decision tree mode", () => {
    cy.get('[data-cy="open-decision-tree"]').click();
    cy.get('[data-cy="decision-tree-root"]').should("exist");
    cy.get('[data-cy="decision-tree-exit"]').click();
    cy.get('[data-cy="dashboard-root"]').should("be.visible");
  });
});
