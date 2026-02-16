import fs from 'node:fs';
import path from 'node:path';

type Mode = 'quick' | 'full';

interface CliOptions {
  mode: Mode;
  datasetPath?: string;
  outputDir: string;
  top: number;
}

interface DatasetRow {
  protocol_id: string;
  protocol_name: string;
  chain: string;
  gate_pass: boolean;
  baseline_min_solvency: number;
  break_even_pass: boolean;
  defense_improved: boolean;
  sensitivity_1_parameter: string;
  sensitivity_2_parameter: string;
  sensitivity_3_parameter: string;
  flag_count: number;
  flags_text: string;
}

interface RemediationRow {
  rank: number;
  protocol_id: string;
  protocol_name: string;
  chain: string;
  baseline_min_solvency: number;
  priority: string;
  primary_focus: string;
  secondary_focus: string;
  validation_command: string;
  flags_text: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    mode: 'full',
    outputDir: path.join(process.cwd(), 'output', 'mindsdb', 'query_pack'),
    top: 5,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--mode') {
      const value = argv[i + 1];
      if (value !== 'quick' && value !== 'full') {
        throw new Error(`Invalid --mode value: ${value}`);
      }
      options.mode = value;
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

function toBoolean(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, precision = 4): number {
  const base = 10 ** precision;
  return Math.round(value * base) / base;
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
    protocol_id: get(cells, 'protocol_id'),
    protocol_name: get(cells, 'protocol_name'),
    chain: get(cells, 'chain'),
    gate_pass: toBoolean(get(cells, 'gate_pass')),
    baseline_min_solvency: toNumber(get(cells, 'baseline_min_solvency')),
    break_even_pass: toBoolean(get(cells, 'break_even_pass')),
    defense_improved: toBoolean(get(cells, 'defense_improved')),
    sensitivity_1_parameter: get(cells, 'sensitivity_1_parameter'),
    sensitivity_2_parameter: get(cells, 'sensitivity_2_parameter'),
    sensitivity_3_parameter: get(cells, 'sensitivity_3_parameter'),
    flag_count: toNumber(get(cells, 'flag_count')),
    flags_text: get(cells, 'flags_text'),
  }));
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function priorityBand(minSolvency: number): string {
  if (minSolvency <= 0.01) {
    return 'P0 critical';
  }
  if (minSolvency <= 0.05) {
    return 'P1 high';
  }
  if (minSolvency <= 0.25) {
    return 'P2 elevated';
  }
  return 'P3 moderate';
}

function actionForFactor(factor: string): string {
  switch (factor) {
    case 'Demand Strength':
      return 'Recalibrate demand side (`kBuyPressure`, `baseDemand`, demand regime) and rerun break-even check.';
    case 'Dilution Sensitivity':
      return 'Reduce dilution pressure (`kMintPrice`, `maxMintWeekly`, burn alignment) and validate minimum solvency.';
    case 'Emission Cap':
      return 'Revisit emission policy bounds (`maxMintWeekly`, `emissionModel`) to improve solvency without churn regression.';
    case 'Churn Sensitivity':
      return 'Audit churn economics (`churnThreshold`, `providerCostPerWeek`, `maxProviderChurnRate`) against provider retention.';
    case 'Hardware CapEx':
      return 'Tune hardware assumptions (`hardwareCost`, `proTierPct`, `proTierEfficiency`) before scale tests.';
    default:
      return 'Run targeted parameter sweep and prioritize factors with largest solvency delta.';
  }
}

function remediationFocus(row: DatasetRow): string[] {
  const actions: string[] = [];

  if (!row.break_even_pass) {
    actions.push('Fix break-even failure first; raise solvency floor at suggested price before other optimizations.');
  }

  if (!row.defense_improved) {
    actions.push('Rework retention-defense search (`findRetentionAPY`) because optimized emissions did not reduce churn.');
  }

  const factors = unique(
    [
      row.sensitivity_1_parameter,
      row.sensitivity_2_parameter,
      row.sensitivity_3_parameter,
    ].filter(Boolean)
  );

  for (const factor of factors) {
    actions.push(actionForFactor(factor));
  }

  return unique(actions);
}

function buildRemediationRows(rows: DatasetRow[], top: number): RemediationRow[] {
  const candidates = rows
    .filter((row) => !row.gate_pass)
    .sort((a, b) => {
      if (a.baseline_min_solvency !== b.baseline_min_solvency) {
        return a.baseline_min_solvency - b.baseline_min_solvency;
      }
      if (a.flag_count !== b.flag_count) {
        return b.flag_count - a.flag_count;
      }
      return a.protocol_name.localeCompare(b.protocol_name);
    })
    .slice(0, top);

  return candidates.map((row, index) => {
    const focus = remediationFocus(row);
    return {
      rank: index + 1,
      protocol_id: row.protocol_id,
      protocol_name: row.protocol_name,
      chain: row.chain,
      baseline_min_solvency: round(row.baseline_min_solvency),
      priority: priorityBand(row.baseline_min_solvency),
      primary_focus: focus[0] || 'Run protocol-level diagnostics and inspect top sensitivity factor.',
      secondary_focus: focus[1] || 'Validate with quick diagnostics and update profile calibration assumptions.',
      validation_command: `npm run skill:optimizer:quick -- --profile ${row.protocol_id}`,
      flags_text: row.flags_text,
    };
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

function toCsv(rows: RemediationRow[]): string {
  if (rows.length === 0) {
    return '';
  }
  const headers = Object.keys(rows[0]) as Array<keyof RemediationRow>;
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function toMarkdown(mode: Mode, rows: RemediationRow[]): string {
  const lines: string[] = [];
  lines.push('# Priority Remediation List');
  lines.push('');
  lines.push(`Mode: ${mode}`);
  lines.push('');
  lines.push('| Rank | Protocol | Chain | Min Solvency | Priority | Primary Focus | Validation Command |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');

  if (rows.length === 0) {
    lines.push('| - | none | - | - | - | - | - |');
    return `${lines.join('\n')}\n`;
  }

  for (const row of rows) {
    lines.push(
      `| ${row.rank} | ${row.protocol_name} (${row.protocol_id}) | ${row.chain} | ${row.baseline_min_solvency} | ${row.priority} | ${row.primary_focus} | \`${row.validation_command}\` |`
    );
  }

  lines.push('');
  lines.push('## Secondary Focus');
  for (const row of rows) {
    lines.push(`${row.rank}. ${row.protocol_name} (${row.protocol_id}): ${row.secondary_focus}`);
  }

  return `${lines.join('\n')}\n`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const dataset = readDataset(options.datasetPath!);
  const rows = buildRemediationRows(dataset, options.top);

  ensureDir(options.outputDir);

  const baseName = `depin_optimizer_${options.mode}_priority_remediation`;
  const mdPath = path.join(options.outputDir, `${baseName}.md`);
  const jsonPath = path.join(options.outputDir, `${baseName}.json`);
  const csvPath = path.join(options.outputDir, `${baseName}.csv`);

  fs.writeFileSync(mdPath, toMarkdown(options.mode, rows), 'utf-8');
  fs.writeFileSync(jsonPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(csvPath, toCsv(rows), 'utf-8');

  console.log(`Priority remediation list generated for ${rows.length} protocols.`);
  console.log(`Markdown: ${mdPath}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);
}

main();
