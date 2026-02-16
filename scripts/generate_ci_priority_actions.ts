import fs from 'node:fs';
import path from 'node:path';

type StringMap = Record<string, string>;

interface OptimizerReport {
  generatedAt?: string;
  profile?: {
    id?: string;
    name?: string;
  };
  mode?: string;
  flags?: string[];
}

interface CliOptions {
  profile?: string;
  mode?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--profile') {
      options.profile = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--mode') {
      options.mode = argv[i + 1];
      i += 1;
    }
  }
  return options;
}

function getLatestFile(dirPath: string, matcher: (name: string) => boolean): string | undefined {
  if (!fs.existsSync(dirPath)) {
    return undefined;
  }
  const files = fs
    .readdirSync(dirPath)
    .filter((name) => matcher(name))
    .map((name) => ({
      name,
      fullPath: path.join(dirPath, name),
      mtimeMs: fs.statSync(path.join(dirPath, name)).mtimeMs
    }))
    .sort((left, right) => right.mtimeMs - left.mtimeMs);

  return files.length > 0 ? files[0].fullPath : undefined;
}

function parseTsv(filePath: string | undefined): StringMap[] {
  if (!filePath || !fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) return [];

  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].split('\t').map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split('\t');
    const out: StringMap = {};
    headers.forEach((header, index) => {
      out[header] = (cells[index] || '').trim();
    });
    return out;
  });
}

function extractPendingCriteria(doneMarkerPath: string | undefined): Array<{ criterion: string; details: string }> {
  if (!doneMarkerPath || !fs.existsSync(doneMarkerPath)) {
    return [];
  }
  const lines = fs.readFileSync(doneMarkerPath, 'utf8').split(/\r?\n/);
  const pending: Array<{ criterion: string; details: string }> = [];

  lines.forEach((line) => {
    if (!line.startsWith('|')) return;
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length < 5) return;
    if (parts[3] !== 'PENDING') return;
    pending.push({
      criterion: parts[1],
      details: parts[4]
    });
  });

  return pending;
}

function toNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateStamp(iso: string): string {
  return iso.slice(0, 10);
}

function readableExplanation(row: StringMap): string {
  const gap = row.gap_note && row.gap_note !== 'None' ? row.gap_note : '';
  if (gap) return gap;
  const derived = row.how_derived && row.how_derived !== 'None' ? row.how_derived : '';
  if (derived) return derived;
  return row.verdict || 'n/a';
}

function isInformationalOptimizerFlag(flag: string): boolean {
  return /no immediate optimizer regressions detected/i.test(flag);
}

function buildTopActions(
  hasAcceptanceArtifacts: boolean,
  hasOptimizerArtifacts: boolean,
  missingRows: StringMap[],
  atRiskRows: StringMap[],
  pendingCriteria: Array<{ criterion: string; details: string }>,
  actionableOptimizerFlags: string[]
): string[] {
  const actions: string[] = [];

  if (!hasAcceptanceArtifacts) {
    actions.push('Generate acceptance artifacts to refresh answerability risk triage: npm run ci:dashboard:acceptance');
  }

  if (!hasOptimizerArtifacts) {
    actions.push('Run optimizer diagnostics to refresh model risk signals: npm run ci:optimizer');
  }

  if (missingRows.length > 0) {
    const top = missingRows.slice(0, 3).map((row) => `${row.id}: ${row.gap_note || row.question}`);
    actions.push(`Close missing primary-input blockers: ${top.join(' | ')}`);
  }

  if (atRiskRows.length > 0) {
    const topRisk = atRiskRows[0];
    actions.push(`Address highest at-risk acceptance item: ${topRisk.id} (${topRisk.question})`);
  }

  if (actionableOptimizerFlags.length > 0) {
    actions.push(`Investigate optimizer regression flags: ${actionableOptimizerFlags.join(' | ')}`);
  }

  if (pendingCriteria.length > 0) {
    actions.push(`Populate pending done-marker evidence: ${pendingCriteria.map((item) => item.criterion).join(' | ')}`);
  }

  if (actions.length === 0) {
    actions.push('No urgent blockers detected; continue scheduled verification runs.');
  }

  return actions;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const spreadsheetDir = path.join(cwd, 'output', 'spreadsheet');
  const reportsDir = path.join(cwd, 'output', 'skill_reports');
  const warnings: string[] = [];

  const answersPath =
    getLatestFile(spreadsheetDir, (name) => /^dashboard_acceptance_answers_snapshot_\d{4}-\d{2}-\d{2}\.tsv$/.test(name)) ||
    (fs.existsSync(path.join(spreadsheetDir, 'dashboard_acceptance_answers_snapshot_latest.tsv'))
      ? path.join(spreadsheetDir, 'dashboard_acceptance_answers_snapshot_latest.tsv')
      : undefined);
  const coveragePath =
    getLatestFile(spreadsheetDir, (name) => /^dashboard_acceptance_coverage_summary_\d{4}-\d{2}-\d{2}\.tsv$/.test(name)) ||
    (fs.existsSync(path.join(spreadsheetDir, 'dashboard_acceptance_coverage_summary_latest.tsv'))
      ? path.join(spreadsheetDir, 'dashboard_acceptance_coverage_summary_latest.tsv')
      : undefined);
  if (!answersPath) {
    warnings.push('Acceptance snapshot not found.');
  }
  if (!coveragePath) {
    warnings.push('Acceptance coverage summary not found.');
  }

  const optimizerPattern = (() => {
    if (!options.profile) return /_quick_report\.json$/;
    const mode = options.mode || 'quick';
    return new RegExp(`^${options.profile}_${mode}_report\\.json$`);
  })();
  const optimizerReportPath = getLatestFile(reportsDir, (name) => optimizerPattern.test(name));
  const doneMarkerPath = getLatestFile(reportsDir, (name) => /_optimizer_done_marker\.md$/.test(name));
  if (!optimizerReportPath) {
    warnings.push('Optimizer report not found.');
  }
  if (!doneMarkerPath) {
    warnings.push('Optimizer done marker not found.');
  }

  const acceptanceRows = parseTsv(answersPath);
  const missingRows = acceptanceRows.filter((row) => row.answerable_now === 'N');
  const atRiskRows = acceptanceRows
    .filter((row) => row.verdict === 'at_risk')
    .sort((left, right) => toNumber(right.confidence) - toNumber(left.confidence));

  const counts = acceptanceRows.reduce(
    (acc, row) => {
      const key = row.answerable_now;
      if (key === 'Y' || key === 'P' || key === 'N') acc[key] += 1;
      return acc;
    },
    { Y: 0, P: 0, N: 0 }
  );

  const coverageRows = parseTsv(coveragePath);
  const failingSections = coverageRows
    .filter((row) => row.pass_80_practical !== 'PASS')
    .map((row) => row.section);

  const optimizerReport =
    optimizerReportPath && fs.existsSync(optimizerReportPath)
      ? (JSON.parse(fs.readFileSync(optimizerReportPath, 'utf8')) as OptimizerReport)
      : undefined;
  const optimizerFlags = Array.isArray(optimizerReport?.flags) ? optimizerReport.flags : [];
  const actionableOptimizerFlags = optimizerFlags.filter((flag) => !isInformationalOptimizerFlag(flag));
  const pendingCriteria = extractPendingCriteria(doneMarkerPath);

  const generatedAt = new Date().toISOString();
  const dateStamp = formatDateStamp(generatedAt);
  const hasAcceptanceArtifacts = Boolean(answersPath && coveragePath);
  const hasOptimizerArtifacts = Boolean(optimizerReportPath && doneMarkerPath);
  const topActions = buildTopActions(
    hasAcceptanceArtifacts,
    hasOptimizerArtifacts,
    missingRows,
    atRiskRows,
    pendingCriteria,
    actionableOptimizerFlags
  );

  const lines: string[] = [];
  lines.push('# CI Priority Action Report');
  lines.push('');
  lines.push(`- Generated: ${generatedAt}`);
  lines.push(`- Acceptance snapshot: ${answersPath ? `\`${answersPath}\`` : 'Unavailable'}`);
  lines.push(`- Coverage summary: ${coveragePath ? `\`${coveragePath}\`` : 'Unavailable'}`);
  lines.push(`- Optimizer report: ${optimizerReportPath ? `\`${optimizerReportPath}\`` : 'Unavailable'}`);
  lines.push(`- Done marker: ${doneMarkerPath ? `\`${doneMarkerPath}\`` : 'Unavailable'}`);
  if (warnings.length > 0) {
    lines.push(`- Missing artifacts: ${warnings.join(' | ')}`);
  }
  lines.push('');
  lines.push('## Status Overview');
  lines.push('');
  lines.push(
    hasAcceptanceArtifacts
      ? `- Acceptance counts: Y=${counts.Y}, P=${counts.P}, N=${counts.N}`
      : '- Acceptance counts: Unavailable (acceptance artifacts missing)'
  );
  lines.push(
    hasAcceptanceArtifacts
      ? `- Failing sections (80% practical): ${failingSections.length > 0 ? failingSections.join(', ') : 'None'}`
      : '- Failing sections (80% practical): Unavailable'
  );
  lines.push(
    hasOptimizerArtifacts
      ? `- Optimizer actionable flags: ${actionableOptimizerFlags.length}`
      : '- Optimizer actionable flags: Unavailable (optimizer artifacts missing)'
  );
  lines.push(
    hasOptimizerArtifacts
      ? `- Pending done-marker criteria: ${pendingCriteria.length}`
      : '- Pending done-marker criteria: Unavailable'
  );
  lines.push('');
  lines.push('## Top Actions');
  lines.push('');
  topActions.forEach((action, index) => {
    lines.push(`${index + 1}. ${action}`);
  });
  lines.push('');
  lines.push('## P0 Missing Inputs (Answerability N)');
  lines.push('');
  if (missingRows.length === 0) {
    lines.push('- None');
  } else {
    missingRows.forEach((row) => {
      lines.push(`- \`${row.id}\` (${row.section}): ${row.question}`);
      lines.push(`  Gap: ${readableExplanation(row)}`);
    });
  }
  lines.push('');
  lines.push('## P1 At-Risk Items');
  lines.push('');
  if (atRiskRows.length === 0) {
    lines.push('- None');
  } else {
    atRiskRows.slice(0, 12).forEach((row) => {
      lines.push(`- \`${row.id}\` (${row.section}, confidence ${row.confidence}): ${row.question}`);
      lines.push(`  Summary: ${readableExplanation(row)}`);
    });
  }
  lines.push('');
  lines.push('## P2 Operational Pending Criteria');
  lines.push('');
  if (pendingCriteria.length === 0) {
    lines.push('- None');
  } else {
    pendingCriteria.forEach((item) => {
      lines.push(`- ${item.criterion}: ${item.details}`);
    });
  }
  lines.push('');
  lines.push('## Optimizer Flags');
  lines.push('');
  if (optimizerFlags.length === 0) {
    lines.push('- None');
  } else {
    optimizerFlags.forEach((flag) => {
      lines.push(`- ${flag}`);
    });
  }

  const reportText = `${lines.join('\n')}\n`;
  const outDaily = path.join(reportsDir, `ci_priority_actions_${dateStamp}.md`);
  const outLatest = path.join(reportsDir, 'ci_priority_actions_latest.md');

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(outDaily, reportText, 'utf8');
  fs.writeFileSync(outLatest, reportText, 'utf8');

  console.log(`Generated CI action report: ${outDaily}`);
  console.log(`Updated latest report: ${outLatest}`);
  console.log(`Top action: ${topActions[0]}`);
}

main();
