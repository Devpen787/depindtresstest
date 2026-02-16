describe("Dashboard live API smoke", () => {
  it("reaches live Solana RPC and CoinGecko markets", () => {
    cy.intercept("POST", "https://api.mainnet-beta.solana.com").as("solanaRpc");
    cy.intercept("GET", "https://api.coingecko.com/api/v3/coins/markets*").as("coingeckoMarkets");

    cy.visit("/");

    cy.wait("@solanaRpc", { timeout: 30000 }).then((interception) => {
      const statusCode = interception.response?.statusCode ?? 0;
      expect([200, 403, 429]).to.include(statusCode);
    });

    cy.get('[data-cy="sim-view-explorer"]').click();

    cy.wait("@coingeckoMarkets", { timeout: 45000 }).then((interception) => {
      const statusCode = interception.response?.statusCode ?? 0;
      expect([200, 304, 429]).to.include(statusCode);
    });
  });
});
