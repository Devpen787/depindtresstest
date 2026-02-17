describe("Keyboard accessibility smoke", () => {
  const activateTabWithEnter = (selector: string) => {
    cy.get(selector).focus().should("have.focus");
    cy.focused().type("{enter}");
  };

  const activateButtonWithEnter = (selector: string) => {
    cy.get(selector).focus().should("have.focus").type("{enter}");
  };
  const openActionsMenu = () => {
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="toggle-export"]').length === 0) {
        cy.get('[data-cy="header-actions"]').click();
      }
    });
    cy.get('[data-cy="toggle-export"]').should("exist");
  };

  beforeEach(() => {
    cy.viewport(1600, 900);
    cy.visit("/");
  });

  it("supports keyboard activation for the canonical default journey", () => {
    cy.get('[role="tablist"][aria-label="Primary dashboard sections"]').should("exist");
    cy.get('[data-cy="tab-benchmark"]').should("have.attr", "aria-selected", "true").focus().type("{rightarrow}");
    cy.get('[data-cy="tab-diagnostic"]').should("have.attr", "aria-selected", "true");

    cy.focused().type("{rightarrow}");
    cy.get('[data-cy="tab-thesis"]').should("have.attr", "aria-selected", "true");

    cy.focused().type("{rightarrow}");
    cy.get('[data-cy="tab-decision_tree"]').should("have.attr", "aria-selected", "true");

    activateTabWithEnter('[data-cy="tab-case_study"]');
    cy.get('[data-cy="tab-case_study"]').should("have.attr", "aria-selected", "true");

    openActionsMenu();
    cy.get('[data-cy="open-advanced-workspace"]').click();
    cy.get('[data-cy="sim-view-sandbox"]').should("have.attr", "aria-selected", "true").focus().type("{leftarrow}");
    cy.get('[data-cy="sim-view-comparison"]').should("have.attr", "aria-selected", "true");

    cy.focused().type("{rightarrow}");
    cy.get('[data-cy="sim-view-sandbox"]').should("have.attr", "aria-selected", "true");

    openActionsMenu();
    cy.get('[data-cy="sim-view-return-appendix"]').click();
    cy.get('[data-cy="tab-case_study"]').should("have.attr", "aria-selected", "true");

    activateTabWithEnter('[data-cy="tab-benchmark"]');
    cy.get('[data-cy="benchmark-decision-brief"]').should("be.visible");
    openActionsMenu();
    cy.get('[data-cy="toggle-export"]').should("not.be.disabled").click();
    cy.get('[data-cy="export-toast"]').should("be.visible");

    activateTabWithEnter('[data-cy="tab-decision_tree"]');
    cy.get('[data-cy="tab-decision_tree"]', { timeout: 10000 }).should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="decision-tree-root"]', { timeout: 10000 }).should("exist");
    openActionsMenu();
    cy.get('[data-cy="toggle-export"]').should("be.disabled");
    cy.get('[data-cy="header-actions"]').click();
    activateButtonWithEnter('[data-cy="decision-tree-exit"]');
    cy.get('[data-cy="tab-benchmark"]').should("have.attr", "aria-selected", "true");
  });

  it("exposes key ARIA semantics for tabs and menu controls", () => {
    cy.get('[data-cy="tab-benchmark"]').should("have.attr", "role", "tab");
    cy.get('[data-cy="tab-benchmark"]').should("have.attr", "aria-controls").then((panelId) => {
      const id = String(panelId);
      cy.get(`#${id}`).should("have.attr", "role", "tabpanel").and("have.attr", "aria-labelledby", "tab-benchmark");
    });

    cy.get('[data-cy="tab-benchmark"]').focus().type("{end}");
    cy.get('[data-cy="tab-case_study"]').should("have.attr", "aria-selected", "true");
    openActionsMenu();
    cy.get('[data-cy="open-advanced-workspace"]').click();
    cy.get('[role="tablist"][aria-label="Advanced workspace views"]').should("exist");
    cy.get('[data-cy="sim-view-sandbox"]').should("have.attr", "role", "tab");

    cy.get('[aria-haspopup="menu"]').first().focus();
    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.get('[role="menu"]').should("be.visible");
    cy.get("body").type("{esc}");
  });
});
