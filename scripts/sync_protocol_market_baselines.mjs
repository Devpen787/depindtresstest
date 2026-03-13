#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const MASTER_PATH = path.join(repoRoot, 'src/data/protocol_master_sheet.tsv');

const toLines = (text) => text.split(/\r?\n/).filter((line) => line.length > 0);

const parseTsv = (rawText) => {
  const lines = toLines(rawText);
  if (lines.length < 2) {
    throw new Error('protocol_master_sheet.tsv is empty');
  }
  const headers = lines[0].split('\t');
  const rows = lines.slice(1).map((line) => {
    const cells = line.split('\t');
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (cells[idx] ?? '').trim();
    });
    return row;
  });
  return { headers, rows };
};

const formatPrice = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '';
  if (value >= 1) return value.toFixed(4).replace(/\.?0+$/, '');
  if (value >= 0.01) return value.toFixed(6).replace(/\.?0+$/, '');
  if (value >= 0.0001) return value.toFixed(8).replace(/\.?0+$/, '');
  return value.toPrecision(8).replace(/\.?0+$/, '');
};

const resolveSupplyBaseline = (token) => {
  const max = Number(token.max_supply ?? 0);
  const total = Number(token.total_supply ?? 0);
  const circulating = Number(token.circulating_supply ?? 0);
  if (Number.isFinite(max) && max > 0) return Math.round(max);
  if (Number.isFinite(total) && total > 0) return Math.round(total);
  if (Number.isFinite(circulating) && circulating > 0) return Math.round(circulating);
  return null;
};

const fetchCoinGeckoMarkets = async (ids) => {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('ids', ids.join(','));
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', '250');
  url.searchParams.set('page', '1');
  url.searchParams.set('sparkline', 'false');

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('CoinGecko response was not an array');
  }
  return data;
};

const writeTsv = (headers, rows) => {
  const lines = [headers.join('\t')];
  for (const row of rows) {
    const cells = headers.map((header) => String(row[header] ?? '').trim());
    lines.push(cells.join('\t'));
  }
  return `${lines.join('\n')}\n`;
};

const main = async () => {
  if (!fs.existsSync(MASTER_PATH)) {
    throw new Error(`Missing file: ${MASTER_PATH}`);
  }

  const raw = fs.readFileSync(MASTER_PATH, 'utf8');
  const { headers, rows } = parseTsv(raw);

  const protocolRows = rows.filter((row) => row.record_type === 'protocol' && row.coingecko_id);
  const ids = Array.from(new Set(protocolRows.map((row) => row.coingecko_id)));
  if (ids.length === 0) {
    console.log('No protocol rows with coingecko_id found.');
    return;
  }

  const markets = await fetchCoinGeckoMarkets(ids);
  const marketById = new Map(markets.map((token) => [token.id, token]));
  const updates = [];

  for (const row of protocolRows) {
    const token = marketById.get(row.coingecko_id);
    if (!token) continue;

    const nextPrice = formatPrice(Number(token.current_price ?? 0));
    const nextSupply = resolveSupplyBaseline(token);

    const prevPrice = row.initial_price_usd;
    const prevSupply = row.supply_tokens;

    if (nextPrice) {
      row.initial_price_usd = nextPrice;
    }
    if (nextSupply !== null) {
      row.supply_tokens = String(nextSupply);
    }

    if (row.initial_price_usd !== prevPrice || row.supply_tokens !== prevSupply) {
      updates.push({
        protocolId: row.protocol_id,
        coingeckoId: row.coingecko_id,
        oldSupply: prevSupply,
        newSupply: row.supply_tokens,
        oldPrice: prevPrice,
        newPrice: row.initial_price_usd,
      });
    }
  }

  fs.writeFileSync(MASTER_PATH, writeTsv(headers, rows), 'utf8');

  if (updates.length === 0) {
    console.log('No protocol baseline updates were required.');
    return;
  }

  console.log(`Updated ${updates.length} protocol baseline rows in src/data/protocol_master_sheet.tsv`);
  for (const change of updates) {
    console.log(
      `${change.protocolId} (${change.coingeckoId}) supply ${change.oldSupply} -> ${change.newSupply}; price ${change.oldPrice} -> ${change.newPrice}`,
    );
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
