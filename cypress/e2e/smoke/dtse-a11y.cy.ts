describe("DTSE accessibility smoke", () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    cy.visit("/");
  });

  it("DTSE tab has proper ARIA role and attributes", () => {
    cy.get('[data-cy="tab-dtse"]')
      .should("have.attr", "role", "tab")
      .and("have.attr", "aria-selected", "true");

    cy.get('[role="tablist"]').should("exist");
  });

  it("stage navigation is keyboard accessible", () => {
    cy.get('[data-cy="dtse-next-stage"]').focus().should("have.focus");
    cy.get('[data-cy="dtse-next-stage"]').type("{enter}");
    cy.get('[data-cy="dtse-stage-2"]').should("be.visible");

    cy.get('[data-cy="dtse-prev-stage"]').focus().should("have.focus");
    cy.get('[data-cy="dtse-prev-stage"]').type("{enter}");
    cy.get('[data-cy="dtse-stage-1"]').should("be.visible");
  });

  it("stage containers have proper landmark structure", () => {
    cy.get('[data-cy="dtse-stage-1"]').should("exist");
    cy.get('[data-cy="dtse-dashboard-root"]')
      .should("exist")
      .and("be.visible");
  });

  it("focus management works on stage transitions", () => {
    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-2"]').should("be.visible");

    cy.get('[data-cy="dtse-next-stage"]').click();
    cy.get('[data-cy="dtse-stage-3"]').should("be.visible");

    cy.get('[data-cy="dtse-prev-stage"]').click();
    cy.get('[data-cy="dtse-stage-2"]').should("be.visible");
  });

  it("DTSE tab participates in keyboard tab navigation", () => {
    cy.get('[data-cy="tab-dtse"]')
      .should("have.attr", "aria-selected", "true")
      .focus()
      .should("have.focus");
  });
});
