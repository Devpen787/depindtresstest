# MindsDB POC (Low Complexity)

This project now includes a lightweight export path for MindsDB-style querying without changing simulator runtime behavior.

## What this adds

- Reuses existing optimizer diagnostics output.
- Flattens diagnostics into table-ready rows.
- Writes CSV + JSONL for downstream SQL/agent workflows.

## Run it

Quick mode (recommended for iteration):

```bash
npm run mindsdb:export:quick
```

Full mode:

```bash
npm run mindsdb:export:full
```

Single-profile smoke run:

```bash
node --experimental-strip-types scripts/export_mindsdb_dataset.ts --mode quick --profile ono_v3_calibrated --rerun
```

Optional flags:

- `--profile <id>`: include one profile (repeatable).
- `--profiles <id1,id2>`: include a comma-separated list.
- `--max-profiles <n>`: cap exported profiles for fast iterations.
- `--rerun`: force fresh diagnostics instead of reusing existing reports.

## Output files

All outputs are written to `output/mindsdb/`:

- `depin_optimizer_<mode>_dataset.csv`
- `depin_optimizer_<mode>_dataset.jsonl`
- `depin_optimizer_<mode>_dataset.md`
- `depin_optimizer_<mode>_dataset_summary.json`

Rows include:

- Baseline health: min/final solvency, final providers, final price.
- Break-even check: suggested price, min solvency at suggested price, pass/fail.
- Scale check: max scalable providers and stress solvency.
- Defense check: suggested emission and churn delta under threat yield.
- Top-3 sensitivity factors.

## Query pack

Build a dashboard-style query pack from the exported dataset:

```bash
npm run mindsdb:query-pack:quick
```

Run the export command first if the dataset CSV does not exist yet.

Full-mode query pack:

```bash
npm run mindsdb:query-pack:full
```

Query pack outputs (in `output/mindsdb/query_pack/`):

- `depin_optimizer_<mode>_query_pack.sql`
- `depin_optimizer_<mode>_query_pack.md`
- `depin_optimizer_<mode>_query_pack_summary.json`
- `depin_optimizer_<mode>_query_pack_top_failing.csv`
- `depin_optimizer_<mode>_query_pack_sensitivity_hotspots.csv`
- `depin_optimizer_<mode>_query_pack_chain_comparison.csv`

Available query-pack flags:

- `--dataset-path <path>`: use a custom export CSV.
- `--table-name <name>`: set the SQL table name used in generated queries.
- `--top <n>`: cap top-failing protocol rows in the report.

## Priority remediation list

Generate the top remediation queue (default top 5 failing protocols):

```bash
npm run mindsdb:remediation:full
```

Quick-mode remediation list:

```bash
npm run mindsdb:remediation:quick
```

Outputs:

- `output/mindsdb/query_pack/depin_optimizer_<mode>_priority_remediation.md`
- `output/mindsdb/query_pack/depin_optimizer_<mode>_priority_remediation.json`
- `output/mindsdb/query_pack/depin_optimizer_<mode>_priority_remediation.csv`

Optional flags:

- `--top <n>`: change number of prioritized protocols.
- `--dataset-path <path>`: use a custom export dataset.

## How to use with MindsDB

Use the exported CSV/JSONL as your ingestion artifact in your preferred data store, then connect that store in MindsDB for SQL and agent queries.

## Import + Run Checklist

1. Generate fresh artifacts:
   - `npm run mindsdb:export:quick` (or `npm run mindsdb:export:full`)
   - `npm run mindsdb:query-pack:quick` (or `npm run mindsdb:query-pack:full`)
2. Ingest `output/mindsdb/depin_optimizer_<mode>_dataset.csv` into your target DB/table.
3. Connect that DB in MindsDB and confirm the table name matches the generated SQL file.
4. Open `output/mindsdb/query_pack/depin_optimizer_<mode>_query_pack.sql`.
5. Run query blocks in order:
   - Top failing protocols
   - Sensitivity hotspots (all)
   - Sensitivity hotspots (failing only)
   - Chain-level comparison
6. Use these companion outputs for review notes:
   - `output/mindsdb/query_pack/depin_optimizer_<mode>_query_pack.md`
   - `output/mindsdb/query_pack/depin_optimizer_<mode>_query_pack_top_failing.csv`
   - `output/mindsdb/query_pack/depin_optimizer_<mode>_query_pack_sensitivity_hotspots.csv`
   - `output/mindsdb/query_pack/depin_optimizer_<mode>_query_pack_chain_comparison.csv`
7. If table names differ in MindsDB, regenerate with:
   - `npm run mindsdb:query-pack:<mode> -- --table-name <your_table_name>`

Example analysis questions:

- Which protocols fail gate checks and why?
- Which chain has the highest median scale_max_providers?
- Which sensitivity factor is most common among gate failures?
