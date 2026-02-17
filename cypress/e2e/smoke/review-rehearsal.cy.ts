describe("Onocoy review rehearsal", () => {
  const openActionsMenu = () => {
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="toggle-export"]').length === 0) {
        cy.get('[data-cy="header-actions"]').click();
      }
    });
    cy.get('[data-cy="toggle-export"]').should("exist");
  };

  const assertExport = (surface: "benchmark" | "diagnostics" | "strategy") => {
    openActionsMenu();
    cy.get('[data-cy="toggle-export"]').should("not.be.disabled");
    cy.get('[data-cy="toggle-export"]').click();
    cy.get('[data-cy="export-toast"]')
      .should("be.visible")
      .and("contain.text", `decision-brief-${surface}-`)
      .and("contain.text", "Exported");
  };

  beforeEach(() => {
    cy.viewport(1600, 900);
    cy.visit("/");
  });

  it("completes the canonical first-review path with decision-brief closure", () => {
    const startedAt = Date.now();

    cy.get('[data-cy="tab-benchmark"]').should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="benchmark-decision-brief"]').should("be.visible");
    cy.get('[data-cy="benchmark-decision-brief-repro"]').should("contain.text", "Hash #");
    cy.get('[data-cy="benchmark-decision-brief-export-help"]').should("be.visible");
    cy.contains("Next step:").should("exist");
    assertExport("benchmark");

    cy.get("body").then(($body) => {
      const scenarioSelect = $body.find('[data-cy="global-scenario-select"]:visible');
      if (scenarioSelect.length === 0) {
        cy.wrap("").as("selectedScenarioValue");
        cy.wrap("").as("selectedScenarioLabel");
        return;
      }

      cy.get('[data-cy="global-scenario-select"] option').then(($options) => {
        if ($options.length > 1) {
          const scenarioValue = String($options.eq(1).val());
          const scenarioLabel = String($options.eq(1).text()).trim();
          cy.wrap(scenarioValue).as("selectedScenarioValue");
          cy.wrap(scenarioLabel).as("selectedScenarioLabel");
          cy.get('[data-cy="global-scenario-select"]').select(scenarioValue);
        } else {
          cy.wrap("").as("selectedScenarioValue");
          cy.wrap("").as("selectedScenarioLabel");
        }
      });
    });

    cy.get('[data-cy="tab-diagnostic"]').click().should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="diagnostic-decision-brief"]').should("be.visible");
    cy.get('[data-cy="diagnostic-decision-brief-repro"]').should("contain.text", "Hash #");
    cy.get('[data-cy="diagnostic-decision-brief-export-help"]').should("be.visible");
    cy.contains("Use Suggested Mode").should("exist");
    cy.contains("Next step:").should("exist");
    cy.get('@selectedScenarioLabel').then((selectedScenarioLabel) => {
      if (selectedScenarioLabel) {
        cy.get('[data-cy="diagnostic-decision-brief"]').should("contain.text", String(selectedScenarioLabel));
      }
    });
    assertExport("diagnostics");

    cy.get('[data-cy="tab-thesis"]').click().should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="strategy-decision-brief"]').should("be.visible");
    cy.get('[data-cy="strategy-decision-brief-repro"]').should("contain.text", "Hash #");
    cy.get('[data-cy="strategy-decision-brief-export-help"]').should("be.visible");
    cy.contains("Next step:").should("exist");
    cy.get('@selectedScenarioLabel').then((selectedScenarioLabel) => {
      if (selectedScenarioLabel) {
        cy.get('[data-cy="strategy-decision-brief"]').should("contain.text", String(selectedScenarioLabel));
      }
    });
    assertExport("strategy");

    cy.get('[data-cy="tab-case_study"]').click().should("have.attr", "aria-selected", "true");
    openActionsMenu();
    cy.get('[data-cy="open-advanced-workspace"]').click();
    cy.get('[data-cy="sim-view-sandbox"]').should("have.attr", "aria-selected", "true");
    openActionsMenu();
    cy.get('[data-cy="sim-view-return-appendix"]').click();
    cy.get('[data-cy="tab-case_study"]').should("have.attr", "aria-selected", "true");

    cy.get('[data-cy="tab-decision_tree"]').click().should("have.attr", "aria-selected", "true");
    cy.get('[data-cy="decision-tree-root"]').should("exist");
    openActionsMenu();
    cy.get('[data-cy="toggle-export"]').should("be.disabled");
    cy.get("body").type("{esc}");
    cy.get('[data-cy="decision-tree-exit"]').click();
    cy.get('[data-cy="tab-case_study"]').should("have.attr", "aria-selected", "true");

    cy.get('[data-cy="tab-benchmark"]').click().should("have.attr", "aria-selected", "true");
    cy.get('@selectedScenarioValue').then((selectedScenarioValue) => {
      if (selectedScenarioValue) {
        cy.get('[data-cy="global-scenario-select"]:visible').should("have.value", String(selectedScenarioValue));
      }
    });
    cy.get('@selectedScenarioLabel').then((selectedScenarioLabel) => {
      if (selectedScenarioLabel) {
        cy.get('[data-cy="benchmark-decision-brief"]').should("contain.text", String(selectedScenarioLabel));
      }
    });

    cy.then(() => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      expect(elapsedSeconds).to.be.lessThan(120);
    });
  });
});
