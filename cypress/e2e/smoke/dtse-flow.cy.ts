describe("DTSE flow smoke", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("DTSE tab is the default landing tab", () => {
    cy.get('[data-cy="tab-dtse"]').should("have.attr", "aria-selected", "true");
  });

  it("DTSE dashboard root is visible on load", () => {
    cy.get('[data-cy="dtse-dashboard-root"]').should("be.visible");
  });

  it("allows protocol switching from DTSE header", () => {
    cy.get('[data-cy="dtse-protocol-select"]').should("be.visible").select("hivemapper_v1");
    cy.get('[data-cy="dtse-context-stage"]').should("contain.text", "Hivemapper");
  });

  it("can progress through stages via next button", () => {
    cy.get('[data-cy="dtse-dashboard-root"]').should("be.visible");
    cy.get('[data-cy="dtse-stage-panel-1"]').should("be.visible");

    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-2"]').should("be.visible");

    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-panel-3"]').should("be.visible");

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
    cy.get('[data-cy="dtse-stage-panel-5"]').should("be.visible");
  });

  it('does not display a "Thesis" label in the DTSE view', () => {
    cy.get('[data-cy="dtse-dashboard-root"]').should("be.visible");
    cy.get('[data-cy="dtse-dashboard-root"]').should("not.contain.text", "Thesis");
  });
});
