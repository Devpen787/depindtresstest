const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets*";

const BASE_TS = "2026-02-16T00:00:00.000Z";

const parseBody = (body: unknown) => {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return (body ?? {}) as Record<string, unknown>;
};

beforeEach(() => {
  cy.intercept("POST", SOLANA_RPC_URL, (req) => {
    const payload = parseBody(req.body);
    const method = payload.method as string | undefined;
    const id = Number(payload.id ?? 1);

    if (method === "getSlot") {
      req.alias = "solanaGetSlot";
      req.reply({
        jsonrpc: "2.0",
        id,
        result: 275000000,
      });
      return;
    }

    if (method === "getTokenSupply") {
      req.alias = "solanaGetTokenSupply";
      const mint = (Array.isArray(payload.params) ? payload.params[0] : "unknown") as string;
      const uiAmount = mint.length * 1000;
      req.reply({
        jsonrpc: "2.0",
        id,
        result: {
          context: { slot: 275000000 },
          value: {
            amount: String(uiAmount * 1_000_000),
            decimals: 6,
            uiAmount,
            uiAmountString: String(uiAmount),
          },
        },
      });
      return;
    }

    req.alias = "solanaRpcUnknown";
    req.reply({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Method not found in Cypress stub" },
    });
  });

  cy.intercept("GET", COINGECKO_MARKETS_URL, (req) => {
    req.alias = "coingeckoMarkets";
    const idsParam = String(req.query.ids ?? "");
    const ids = idsParam.split(",").filter(Boolean);

    const body = ids.map((tokenId, index) => {
      const seed = index + 1;
      return {
        id: tokenId,
        symbol: tokenId.slice(0, 4).toUpperCase(),
        name: tokenId.replace(/-/g, " "),
        current_price: Number((0.1 + seed * 0.03).toFixed(4)),
        market_cap: 1_000_000 * seed,
        total_volume: 100_000 * seed,
        circulating_supply: 5_000_000 * seed,
        total_supply: 10_000_000 * seed,
        max_supply: null,
        price_change_24h: Number((seed * 0.004).toFixed(4)),
        price_change_percentage_24h: Number((seed * 1.25).toFixed(3)),
        price_change_percentage_7d_in_currency: Number((seed * 2.1).toFixed(3)),
        price_change_percentage_30d_in_currency: Number((seed * 3.4).toFixed(3)),
        ath: Number((seed * 0.9).toFixed(4)),
        ath_date: BASE_TS,
        atl: Number((seed * 0.02).toFixed(4)),
        atl_date: BASE_TS,
        last_updated: BASE_TS,
        sparkline_in_7d: {
          price: [1, 1.1, 1.2, 1.15, 1.25].map((p) => Number((p * seed).toFixed(4))),
        },
      };
    });

    req.reply(body);
  });
});
