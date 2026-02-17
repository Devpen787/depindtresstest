describe("Global state sync", () => {
  beforeEach(() => {
    cy.viewport(1600, 900);
    cy.visit("/");
  });

  it("keeps canonical scenario/protocol state consistent across owner tabs", () => {
    cy.get('[data-cy="tab-benchmark"]').should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="global-context-state"]')
      .should("have.attr", "data-scenario-id", "baseline")
      .invoke("attr", "data-protocol-id")
      .as("protocolBefore");

    cy.get('[data-cy="scenario-library-trigger"]').click();
    cy.get('[data-cy="scenario-preset-vampire_attack"]').click();

    cy.get('[data-cy="global-context-state"]').should("have.attr", "data-scenario-id", "vampire_attack");
    cy.get('[data-cy="benchmark-decision-brief"]').should("contain.text", "Vampire Attack");

    cy.get('[data-cy="tab-diagnostic"]').click().should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="global-context-state"]').should("have.attr", "data-scenario-id", "vampire_attack");
    cy.get('[data-cy="diagnostic-decision-brief"]').should("contain.text", "Vampire Attack");

    cy.get('[data-cy="tab-thesis"]').click().should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="global-context-state"]').should("have.attr", "data-scenario-id", "vampire_attack");
    cy.get('[data-cy="strategy-decision-brief"]').should("contain.text", "Vampire Attack");

    cy.get("@protocolBefore").then((protocolBefore) => {
      const initialProtocol = String(protocolBefore);
      cy.get('[data-cy^="thesis-protocol-"]').then(($buttons) => {
        const target = [...$buttons]
          .map((btn) => btn.getAttribute("data-cy"))
          .find((id): id is string => Boolean(id && !id.endsWith(initialProtocol)));
        expect(target, "alternative thesis protocol button").to.exist;
        cy.get(`[data-cy="${target}"]`).click();
        cy.wrap(target!.replace("thesis-protocol-", "")).as("protocolAfter");
      });
    });

    cy.get("@protocolAfter").then((protocolAfter) => {
      const selectedProtocol = String(protocolAfter);
      cy.get('[data-cy="global-context-state"]').should("have.attr", "data-protocol-id", selectedProtocol);
      cy.get('[data-cy="global-context-state"]').should("have.attr", "data-scenario-id", "vampire_attack");

      cy.get('[data-cy="tab-benchmark"]').click().should("have.attr", "aria-selected", "true");
      cy.get('[data-cy="global-context-state"]').should("have.attr", "data-protocol-id", selectedProtocol);
      cy.get('[data-cy="global-context-state"]').should("have.attr", "data-scenario-id", "vampire_attack");

      cy.get('[data-cy="tab-diagnostic"]').click().should("have.attr", "aria-selected", "true");
      cy.get('[data-cy="global-context-state"]').should("have.attr", "data-protocol-id", selectedProtocol);
      cy.get('[data-cy="global-context-state"]').should("have.attr", "data-scenario-id", "vampire_attack");
    });
  });
});
