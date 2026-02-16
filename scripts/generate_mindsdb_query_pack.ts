import fs from 'node:fs';
import path from 'node:path';

type Mode = 'quick' | 'full';

interface CliOptions {
  mode: Mode;
  datasetPath?: string;
  outputDir: string;
  tableName: string;
  top: number;
}

interface DatasetRow {
  generated_at: string;
  protocol_id: string;
  protocol_name: string;
  chain: string;
  mode: Mode;
  gate_pass: boolean;
  baseline_min_solvency: number;
  break_even_pass: boolean;
  scale_max_providers: number;
  defense_improved: boolean;
  sensitivity_1_parameter: string;
  sensitivity_1_delta: number;
  sensitivity_2_parameter: string;
  sensitivity_2_delta: number;
  sensitivity_3_parameter: string;
  sensitivity_3_delta: number;
  flag_count: number;
  flags_text: string;
}

interface FailingProtocolRow {
  protocol_id: string;
  protocol_name: string;
  chain: string;
  baseline_min_solvency: number;
  break_even_pass: boolean;
  defense_improved: boolean;
  flag_count: number;
  flags_text: string;
}

interface SensitivityHotspotRow {
  factor: string;
  mentions: number;
  failing_mentions: number;
  avg_delta: number;
  max_delta: number;
}

interface ChainComparisonRow {
  chain: string;
  protocols: number;
  gate_pass_count: number;
  gate_pass_rate: number;
  break_even_pass_rate: number;
  defense_improved_rate: number;
  avg_baseline_min_solvency: number;
  median_scale_max_providers: number;
}

function parseArgs(argv: string[]): CliOptions {
  const defaultMode: Mode = 'quick';
  const options: CliOptions = {
    mode: defaultMode,
    outputDir: path.join(process.cwd(), 'output', 'mindsdb', 'query_pack'),
    tableName: `depin_optimizer_${defaultMode}_dataset`,
    top: 10,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--mode') {
      const value = argv[i + 1];
      if (value !== 'quick' && value !== 'full') {
        throw new Error(`Invalid --mode value: ${value}`);
      }
      options.mode = value;
      options.tableName = `depin_optimizer_${value}_dataset`;
      i += 1;
      continue;
    }

    if (arg === '--dataset-path') {
      options.datasetPath = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--output-dir') {
      options.outputDir = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--table-name') {
      options.tableName = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--top') {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --top value: ${argv[i + 1]}`);
      }
      options.top = Math.floor(value);
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.datasetPath) {
    options.datasetPath = path.join(
      process.cwd(),
      'output',
      'mindsdb',
      `depin_optimizer_${options.mode}_dataset.csv`
    );
  }

  return options;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = i + 1 < text.length ? text[i + 1] : '';

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.length > 0 && entry.some((cell) => cell.length > 0));
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBoolean(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

function round(value: number, precision = 4): number {
  const base = 10 ** precision;
  return Math.round(value * base) / base;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function readDataset(datasetPath: string): DatasetRow[] {
  if (!fs.existsSync(datasetPath)) {
    throw new Error(
      `Dataset not found at ${datasetPath}. Run "npm run mindsdb:export:quick" or "npm run mindsdb:export:full" first.`
    );
  }

  const raw = fs.readFileSync(datasetPath, 'utf-8');
  const rows = parseCsv(raw);
  if (rows.length < 2) {
    return [];
  }

  const header = rows[0];
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const get = (cells: string[], key: string) => cells[index[key]] ?? '';

  return rows.slice(1).map((cells) => ({
    generated_at: get(cells, 'generated_at'),
    protocol_id: get(cells, 'protocol_id'),
    protocol_name: get(cells, 'protocol_name'),
    chain: get(cells, 'chain'),
    mode: (get(cells, 'mode') as Mode) || 'quick',
    gate_pass: toBoolean(get(cells, 'gate_pass')),
    baseline_min_solvency: toNumber(get(cells, 'baseline_min_solvency')),
    break_even_pass: toBoolean(get(cells, 'break_even_pass')),
    scale_max_providers: toNumber(get(cells, 'scale_max_providers')),
    defense_improved: toBoolean(get(cells, 'defense_improved')),
    sensitivity_1_parameter: get(cells, 'sensitivity_1_parameter'),
    sensitivity_1_delta: toNumber(get(cells, 'sensitivity_1_delta')),
    sensitivity_2_parameter: get(cells, 'sensitivity_2_parameter'),
    sensitivity_2_delta: toNumber(get(cells, 'sensitivity_2_delta')),
    sensitivity_3_parameter: get(cells, 'sensitivity_3_parameter'),
    sensitivity_3_delta: toNumber(get(cells, 'sensitivity_3_delta')),
    flag_count: toNumber(get(cells, 'flag_count')),
    flags_text: get(cells, 'flags_text'),
  }));
}

function buildFailingProtocols(rows: DatasetRow[], top: number): FailingProtocolRow[] {
  return rows
    .filter((row) => !row.gate_pass)
    .sort((a, b) => {
      if (a.baseline_min_solvency !== b.baseline_min_solvency) {
        return a.baseline_min_solvency - b.baseline_min_solvency;
      }
      return a.protocol_name.localeCompare(b.protocol_name);
    })
    .slice(0, top)
    .map((row) => ({
      protocol_id: row.protocol_id,
      protocol_name: row.protocol_name,
      chain: row.chain,
      baseline_min_solvency: round(row.baseline_min_solvency),
      break_even_pass: row.break_even_pass,
      defense_improved: row.defense_improved,
      flag_count: row.flag_count,
      flags_text: row.flags_text,
    }));
}

function buildSensitivityHotspots(rows: DatasetRow[]): SensitivityHotspotRow[] {
  const factorMap = new Map<
    string,
    { mentions: number; failingMentions: number; totalDelta: number; maxDelta: number }
  >();

  for (const row of rows) {
    const factors: Array<{ factor: string; delta: number }> = [
      { factor: row.sensitivity_1_parameter, delta: row.sensitivity_1_delta },
      { factor: row.sensitivity_2_parameter, delta: row.sensitivity_2_delta },
      { factor: row.sensitivity_3_parameter, delta: row.sensitivity_3_delta },
    ];

    for (const entry of factors) {
      if (!entry.factor) {
        continue;
      }

      const previous = factorMap.get(entry.factor) ?? {
        mentions: 0,
        failingMentions: 0,
        totalDelta: 0,
        maxDelta: 0,
      };

      previous.mentions += 1;
      previous.totalDelta += entry.delta;
      previous.maxDelta = Math.max(previous.maxDelta, entry.delta);
      if (!row.gate_pass) {
        previous.failingMentions += 1;
      }

      factorMap.set(entry.factor, previous);
    }
  }

  return [...factorMap.entries()]
    .map(([factor, stats]) => ({
      factor,
      mentions: stats.mentions,
      failing_mentions: stats.failingMentions,
      avg_delta: round(stats.totalDelta / Math.max(1, stats.mentions)),
      max_delta: round(stats.maxDelta),
    }))
    .sort((a, b) => {
      if (a.mentions !== b.mentions) {
        return b.mentions - a.mentions;
      }
      return b.avg_delta - a.avg_delta;
    });
}

function buildChainComparison(rows: DatasetRow[]): ChainComparisonRow[] {
  const chainMap = new Map<
    string,
    {
      protocols: number;
      gatePass: number;
      breakEvenPass: number;
      defenseImproved: number;
      solvencyTotal: number;
      scaleValues: number[];
    }
  >();

  for (const row of rows) {
    const previous = chainMap.get(row.chain) ?? {
      protocols: 0,
      gatePass: 0,
      breakEvenPass: 0,
      defenseImproved: 0,
      solvencyTotal: 0,
      scaleValues: [] as number[],
    };

    previous.protocols += 1;
    previous.gatePass += row.gate_pass ? 1 : 0;
    previous.breakEvenPass += row.break_even_pass ? 1 : 0;
    previous.defenseImproved += row.defense_improved ? 1 : 0;
    previous.solvencyTotal += row.baseline_min_solvency;
    previous.scaleValues.push(row.scale_max_providers);

    chainMap.set(row.chain, previous);
  }

  return [...chainMap.entries()]
    .map(([chain, stats]) => ({
      chain,
      protocols: stats.protocols,
      gate_pass_count: stats.gatePass,
      gate_pass_rate: round(stats.gatePass / Math.max(1, stats.protocols)),
      break_even_pass_rate: round(stats.breakEvenPass / Math.max(1, stats.protocols)),
      defense_improved_rate: round(stats.defenseImproved / Math.max(1, stats.protocols)),
      avg_baseline_min_solvency: round(stats.solvencyTotal / Math.max(1, stats.protocols)),
      median_scale_max_providers: round(median(stats.scaleValues)),
    }))
    .sort((a, b) => {
      if (a.gate_pass_rate !== b.gate_pass_rate) {
        return b.gate_pass_rate - a.gate_pass_rate;
      }
      return b.median_scale_max_providers - a.median_scale_max_providers;
    });
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }

  return `${lines.join('\n')}\n`;
}

function buildSql(tableName: string, mode: Mode, top: number): string {
  return [
    '-- MindsDB Query Pack for DePIN optimizer dataset',
    `-- Generated for mode: ${mode}`,
    `-- Expected table: ${tableName}`,
    '',
    '-- 1) Top failing protocols by weakest baseline solvency',
    `SELECT protocol_id, protocol_name, chain, baseline_min_solvency, break_even_pass, defense_improved, flags_text`,
    `FROM ${tableName}`,
    `WHERE mode = '${mode}' AND gate_pass = false`,
    `ORDER BY baseline_min_solvency ASC, protocol_name ASC`,
    `LIMIT ${top};`,
    '',
    '-- 2) Sensitivity hotspots (all protocols)',
    'WITH sensitivity AS (',
    `  SELECT chain, protocol_id, sensitivity_1_parameter AS factor, sensitivity_1_delta AS delta FROM ${tableName} WHERE mode = '${mode}' AND sensitivity_1_parameter <> ''`,
    '  UNION ALL',
    `  SELECT chain, protocol_id, sensitivity_2_parameter AS factor, sensitivity_2_delta AS delta FROM ${tableName} WHERE mode = '${mode}' AND sensitivity_2_parameter <> ''`,
    '  UNION ALL',
    `  SELECT chain, protocol_id, sensitivity_3_parameter AS factor, sensitivity_3_delta AS delta FROM ${tableName} WHERE mode = '${mode}' AND sensitivity_3_parameter <> ''`,
    ')',
    'SELECT factor, COUNT(*) AS mentions, AVG(delta) AS avg_delta, MAX(delta) AS max_delta',
    'FROM sensitivity',
    'GROUP BY factor',
    'ORDER BY mentions DESC, avg_delta DESC;',
    '',
    '-- 3) Sensitivity hotspots in failing protocols only',
    'WITH failing AS (',
    `  SELECT * FROM ${tableName} WHERE mode = '${mode}' AND gate_pass = false`,
    '), sensitivity AS (',
    `  SELECT chain, protocol_id, sensitivity_1_parameter AS factor, sensitivity_1_delta AS delta FROM failing WHERE sensitivity_1_parameter <> ''`,
    '  UNION ALL',
    `  SELECT chain, protocol_id, sensitivity_2_parameter AS factor, sensitivity_2_delta AS delta FROM failing WHERE sensitivity_2_parameter <> ''`,
    '  UNION ALL',
    `  SELECT chain, protocol_id, sensitivity_3_parameter AS factor, sensitivity_3_delta AS delta FROM failing WHERE sensitivity_3_parameter <> ''`,
    ')',
    'SELECT factor, COUNT(*) AS failing_mentions, AVG(delta) AS failing_avg_delta',
    'FROM sensitivity',
    'GROUP BY factor',
    'ORDER BY failing_mentions DESC, failing_avg_delta DESC;',
    '',
    '-- 4) Chain-level comparison',
    'SELECT',
    '  chain,',
    '  COUNT(*) AS protocols,',
    '  AVG(CASE WHEN gate_pass THEN 1 ELSE 0 END) AS gate_pass_rate,',
    '  AVG(CASE WHEN break_even_pass THEN 1 ELSE 0 END) AS break_even_pass_rate,',
    '  AVG(CASE WHEN defense_improved THEN 1 ELSE 0 END) AS defense_improved_rate,',
    '  AVG(baseline_min_solvency) AS avg_baseline_min_solvency,',
    '  AVG(scale_max_providers) AS avg_scale_max_providers',
    `FROM ${tableName}`,
    `WHERE mode = '${mode}'`,
    'GROUP BY chain',
    'ORDER BY gate_pass_rate DESC, avg_scale_max_providers DESC;',
    '',
  ].join('\n');
}

function buildMarkdown(
  mode: Mode,
  tableName: string,
  failing: FailingProtocolRow[],
  sensitivity: SensitivityHotspotRow[],
  chainComparison: ChainComparisonRow[],
  top: number
): string {
  const lines: string[] = [];
  lines.push('# MindsDB Query Pack');
  lines.push('');
  lines.push(`Mode: ${mode}`);
  lines.push(`Target table: \`${tableName}\``);
  lines.push('');

  lines.push(`## Top ${top} Failing Protocols`);
  lines.push('');
  lines.push('| Protocol | Chain | Baseline Min Solvency | Break-even | Defense | Flags |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  if (failing.length === 0) {
    lines.push('| none | - | - | - | - | - |');
  } else {
    for (const row of failing) {
      lines.push(
        `| ${row.protocol_name} (${row.protocol_id}) | ${row.chain} | ${row.baseline_min_solvency} | ${row.break_even_pass ? 'PASS' : 'FAIL'} | ${row.defense_improved ? 'PASS' : 'FAIL'} | ${row.flag_count} |`
      );
    }
  }
  lines.push('');

  lines.push('## Sensitivity Hotspots');
  lines.push('');
  lines.push('| Factor | Mentions | Failing Mentions | Avg Delta | Max Delta |');
  lines.push('| --- | --- | --- | --- | --- |');
  if (sensitivity.length === 0) {
    lines.push('| none | - | - | - | - |');
  } else {
    for (const row of sensitivity) {
      lines.push(
        `| ${row.factor} | ${row.mentions} | ${row.failing_mentions} | ${row.avg_delta} | ${row.max_delta} |`
      );
    }
  }
  lines.push('');

  lines.push('## Chain-Level Comparison');
  lines.push('');
  lines.push('| Chain | Protocols | Gate Pass Rate | Break-even Pass Rate | Defense Improved Rate | Avg Baseline Min Solvency | Median Scale Max Providers |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  if (chainComparison.length === 0) {
    lines.push('| none | - | - | - | - | - | - |');
  } else {
    for (const row of chainComparison) {
      lines.push(
        `| ${row.chain} | ${row.protocols} | ${row.gate_pass_rate} | ${row.break_even_pass_rate} | ${row.defense_improved_rate} | ${row.avg_baseline_min_solvency} | ${row.median_scale_max_providers} |`
      );
    }
  }

  lines.push('');
  lines.push('Use the `.sql` file in this folder for direct MindsDB SQL execution.');
  return `${lines.join('\n')}\n`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const rows = readDataset(options.datasetPath!);

  const failing = buildFailingProtocols(rows, options.top);
  const sensitivity = buildSensitivityHotspots(rows);
  const chainComparison = buildChainComparison(rows);

  ensureDir(options.outputDir);
  const baseName = `depin_optimizer_${options.mode}_query_pack`;
  const sqlPath = path.join(options.outputDir, `${baseName}.sql`);
  const mdPath = path.join(options.outputDir, `${baseName}.md`);
  const summaryPath = path.join(options.outputDir, `${baseName}_summary.json`);
  const failingCsvPath = path.join(options.outputDir, `${baseName}_top_failing.csv`);
  const sensitivityCsvPath = path.join(options.outputDir, `${baseName}_sensitivity_hotspots.csv`);
  const chainCsvPath = path.join(options.outputDir, `${baseName}_chain_comparison.csv`);

  fs.writeFileSync(sqlPath, buildSql(options.tableName, options.mode, options.top), 'utf-8');
  fs.writeFileSync(
    mdPath,
    buildMarkdown(options.mode, options.tableName, failing, sensitivity, chainComparison, options.top),
    'utf-8'
  );
  fs.writeFileSync(failingCsvPath, toCsv(failing), 'utf-8');
  fs.writeFileSync(sensitivityCsvPath, toCsv(sensitivity), 'utf-8');
  fs.writeFileSync(chainCsvPath, toCsv(chainComparison), 'utf-8');

  const summary = {
    generatedAt: new Date().toISOString(),
    mode: options.mode,
    datasetPath: options.datasetPath,
    tableName: options.tableName,
    totalProtocols: rows.length,
    gateFailCount: rows.filter((row) => !row.gate_pass).length,
    files: {
      sql: sqlPath,
      markdown: mdPath,
      summary: summaryPath,
      topFailingCsv: failingCsvPath,
      sensitivityCsv: sensitivityCsvPath,
      chainComparisonCsv: chainCsvPath,
    },
  };

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf-8');

  console.log(`MindsDB query pack generated for ${rows.length} protocols.`);
  console.log(`SQL: ${sqlPath}`);
  console.log(`Markdown: ${mdPath}`);
  console.log(`Summary: ${summaryPath}`);
}

main();
