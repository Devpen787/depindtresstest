import fs from 'node:fs';
import path from 'node:path';

interface CliOptions {
  outputDir: string;
  answersPath?: string;
  summaryPath?: string;
  summaryOutPath: string;
  allowedNIds: Set<string>;
  blockAnyN: boolean;
  blockCriticalP: boolean;
  criticalPVerdicts: Set<string>;
  criticalPMinConfidence: number;
  allowedCriticalPIds: Set<string>;
  requireSectionPass: boolean;
  excludedSections: Set<string>;
}

interface AnswersRow {
  id: string;
  section: string;
  question: string;
  answerable_now: 'Y' | 'P' | 'N';
  verdict: string;
  confidence: number | null;
}

interface SummaryRow {
  section: string;
  questions: number;
  y: number;
  p: number;
  n: number;
  practicalCoveragePct: number;
  pass80Practical: boolean;
}

interface Criterion {
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const ANSWERS_FILE_PATTERN = /^dashboard_acceptance_answers_snapshot_\d{4}-\d{2}-\d{2}\.tsv$/;
const SUMMARY_FILE_PATTERN = /^dashboard_acceptance_coverage_summary_\d{4}-\d{2}-\d{2}\.tsv$/;

function parseArgs(argv: string[]): CliOptions {
  const allowedRaw = process.env.DASHBOARD_ACCEPTANCE_ALLOWED_N_IDS || 'M1,M2,M3';
  const allowedCriticalPRaw = process.env.DASHBOARD_ACCEPTANCE_ALLOWED_CRITICAL_P_IDS || '';
  const criticalVerdictsRaw = process.env.DASHBOARD_ACCEPTANCE_CRITICAL_P_VERDICTS || 'at_risk';
  const configuredMinConfidence = Number(process.env.DASHBOARD_ACCEPTANCE_CRITICAL_P_MIN_CONFIDENCE || '0.85');
  const options: CliOptions = {
    outputDir: process.env.DASHBOARD_ACCEPTANCE_OUTPUT_DIR || path.join(process.cwd(), 'output', 'spreadsheet'),
    answersPath: process.env.DASHBOARD_ACCEPTANCE_ANSWERS_PATH,
    summaryPath: process.env.DASHBOARD_ACCEPTANCE_SUMMARY_PATH,
    summaryOutPath:
      process.env.DASHBOARD_ACCEPTANCE_GATE_SUMMARY_PATH ||
      path.join(process.cwd(), 'output', 'skill_reports', 'dashboard_acceptance_gate.md'),
    allowedNIds: new Set(
      allowedRaw
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    ),
    blockAnyN: process.env.DASHBOARD_ACCEPTANCE_BLOCK_ANY_N === '1',
    blockCriticalP: process.env.DASHBOARD_ACCEPTANCE_BLOCK_CRITICAL_P === '1',
    criticalPVerdicts: new Set(
      criticalVerdictsRaw
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 0)
    ),
    criticalPMinConfidence: Number.isFinite(configuredMinConfidence) ? configuredMinConfidence : 0.85,
    allowedCriticalPIds: new Set(
      allowedCriticalPRaw
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    ),
    requireSectionPass: process.env.DASHBOARD_ACCEPTANCE_REQUIRE_SECTION_PASS === '1',
    excludedSections: new Set(
      (process.env.DASHBOARD_ACCEPTANCE_SECTION_EXCLUDE || '')
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    ),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--output-dir') {
      options.outputDir = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--answers-path') {
      options.answersPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--summary-path') {
      options.summaryPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--summary-out-path') {
      options.summaryOutPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--allowed-n-ids') {
      const values = argv[i + 1]
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      options.allowedNIds = new Set(values);
      i += 1;
      continue;
    }
    if (arg === '--block-any-n') {
      options.blockAnyN = true;
      continue;
    }
    if (arg === '--block-critical-p') {
      options.blockCriticalP = true;
      continue;
    }
    if (arg === '--critical-p-verdicts') {
      options.criticalPVerdicts = new Set(
        argv[i + 1]
          .split(',')
          .map((item) => item.trim().toLowerCase())
          .filter((item) => item.length > 0)
      );
      i += 1;
      continue;
    }
    if (arg === '--critical-p-min-confidence') {
      const parsed = Number(argv[i + 1]);
      options.criticalPMinConfidence = Number.isFinite(parsed) ? parsed : options.criticalPMinConfidence;
      i += 1;
      continue;
    }
    if (arg === '--allowed-critical-p-ids') {
      options.allowedCriticalPIds = new Set(
        argv[i + 1]
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      );
      i += 1;
      continue;
    }
    if (arg === '--require-section-pass') {
      options.requireSectionPass = true;
      continue;
    }
    if (arg === '--exclude-sections') {
      options.excludedSections = new Set(
        argv[i + 1]
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      );
      i += 1;
      continue;
    }
  }

  return options;
}

function findLatestFile(outputDir: string, pattern: RegExp): string | undefined {
  if (!fs.existsSync(outputDir)) {
    return undefined;
  }
  const candidates = fs
    .readdirSync(outputDir)
    .filter((fileName) => pattern.test(fileName))
    .sort()
    .reverse();
  if (candidates.length === 0) {
    return undefined;
  }
  return path.join(outputDir, candidates[0]);
}

function resolveAnswersPath(options: CliOptions): string {
  const explicitPath = options.answersPath ? path.resolve(options.answersPath) : undefined;
  if (explicitPath && fs.existsSync(explicitPath)) {
    return explicitPath;
  }

  const latest = findLatestFile(options.outputDir, ANSWERS_FILE_PATTERN);
  if (latest) {
    return latest;
  }

  const latestAlias = path.join(options.outputDir, 'dashboard_acceptance_answers_snapshot_latest.tsv');
  if (fs.existsSync(latestAlias)) {
    return latestAlias;
  }

  throw new Error('Acceptance answers snapshot not found.');
}

function resolveSummaryPath(options: CliOptions): string {
  const explicitPath = options.summaryPath ? path.resolve(options.summaryPath) : undefined;
  if (explicitPath && fs.existsSync(explicitPath)) {
    return explicitPath;
  }

  const latest = findLatestFile(options.outputDir, SUMMARY_FILE_PATTERN);
  if (latest) {
    return latest;
  }

  const latestAlias = path.join(options.outputDir, 'dashboard_acceptance_coverage_summary_latest.tsv');
  if (fs.existsSync(latestAlias)) {
    return latestAlias;
  }

  throw new Error('Acceptance coverage summary not found.');
}

function readAnswers(filePath: string): AnswersRow[] {
  const lines = fs
    .readFileSync(filePath, 'utf-8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error(`Answers snapshot is empty: ${filePath}`);
  }

  const header = lines[0].split('\t');
  const idIndex = header.indexOf('id');
  const sectionIndex = header.indexOf('section');
  const questionIndex = header.indexOf('question');
  const answerabilityIndex = header.indexOf('answerable_now');
  const verdictIndex = header.indexOf('verdict');
  const confidenceIndex = header.indexOf('confidence');
  if (idIndex === -1 || answerabilityIndex === -1) {
    throw new Error(`Answers snapshot missing required columns (id, answerable_now): ${filePath}`);
  }

  const rows: AnswersRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split('\t');
    if (cells.length <= Math.max(idIndex, answerabilityIndex)) {
      continue;
    }
    const id = cells[idIndex].trim();
    const answerability = cells[answerabilityIndex].trim() as AnswersRow['answerable_now'];
    if (!id) {
      continue;
    }
    if (answerability !== 'Y' && answerability !== 'P' && answerability !== 'N') {
      continue;
    }
    const section = sectionIndex >= 0 ? (cells[sectionIndex] || '').trim() : '';
    const question = questionIndex >= 0 ? (cells[questionIndex] || '').trim() : '';
    const verdict = verdictIndex >= 0 ? (cells[verdictIndex] || '').trim() : '';
    const confidenceRaw = confidenceIndex >= 0 ? (cells[confidenceIndex] || '').trim() : '';
    const parsedConfidence = Number(confidenceRaw);
    rows.push({
      id,
      section,
      question,
      answerable_now: answerability,
      verdict,
      confidence: Number.isFinite(parsedConfidence) ? parsedConfidence : null,
    });
  }
  return rows;
}

function readSummary(filePath: string): SummaryRow[] {
  const lines = fs
    .readFileSync(filePath, 'utf-8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error(`Coverage summary is empty: ${filePath}`);
  }

  const header = lines[0].split('\t');
  const sectionIndex = header.indexOf('section');
  const questionsIndex = header.indexOf('questions');
  const yIndex = header.indexOf('Y');
  const pIndex = header.indexOf('P');
  const nIndex = header.indexOf('N');
  const practicalIndex = header.indexOf('practical_coverage_pct');
  const passIndex = header.indexOf('pass_80_practical');

  if (
    sectionIndex === -1 ||
    questionsIndex === -1 ||
    yIndex === -1 ||
    pIndex === -1 ||
    nIndex === -1 ||
    practicalIndex === -1 ||
    passIndex === -1
  ) {
    throw new Error(`Coverage summary missing required columns: ${filePath}`);
  }

  const rows: SummaryRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split('\t');
    if (cells.length <= Math.max(sectionIndex, questionsIndex, yIndex, pIndex, nIndex, practicalIndex, passIndex)) {
      continue;
    }

    const section = cells[sectionIndex].trim();
    const questions = Number(cells[questionsIndex]);
    const y = Number(cells[yIndex]);
    const p = Number(cells[pIndex]);
    const n = Number(cells[nIndex]);
    const practicalCoveragePct = Number(cells[practicalIndex]);
    const pass80Practical = cells[passIndex].trim().toUpperCase() === 'PASS';
    if (!section || !Number.isFinite(questions) || !Number.isFinite(practicalCoveragePct)) {
      continue;
    }
    rows.push({
      section,
      questions,
      y,
      p,
      n,
      practicalCoveragePct,
      pass80Practical,
    });
  }

  return rows;
}

function renderMarkdown(
  criteria: Criterion[],
  answersPath: string,
  summaryPath: string,
  counts: { y: number; p: number; n: number },
  nIds: string[],
  failingSections: string[],
  excludedSections: string[]
): string {
  const escapeCell = (value: string): string => value.replace(/\|/g, '\\|');
  const lines = [
    '# Dashboard Acceptance Gate',
    '',
    `- Generated: ${new Date().toISOString()}`,
    `- Answers snapshot: \`${answersPath}\``,
    `- Coverage summary: \`${summaryPath}\``,
    `- Counts: Y=${counts.y}, P=${counts.p}, N=${counts.n}`,
    `- N IDs: ${nIds.length > 0 ? nIds.join(', ') : 'None'}`,
    `- Failing sections (80% practical): ${failingSections.length > 0 ? failingSections.join(', ') : 'None'}`,
    `- Excluded sections: ${excludedSections.length > 0 ? excludedSections.join(', ') : 'None'}`,
    '',
    '| Criterion | Status | Details |',
    '| --- | --- | --- |',
    ...criteria.map((criterion) => {
      return `| ${escapeCell(criterion.name)} | ${criterion.status} | ${escapeCell(criterion.details)} |`;
    }),
    '',
  ];

  const hasFailure = criteria.some((criterion) => criterion.status === 'FAIL');
  lines.push(hasFailure ? '## Final Status: FAIL' : '## Final Status: PASS');
  lines.push('');

  return lines.join('\n');
}

function writeSummary(summaryPath: string, markdown: string): void {
  const resolved = path.resolve(summaryPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, markdown, 'utf-8');

  const githubSummaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (githubSummaryPath) {
    fs.appendFileSync(githubSummaryPath, `${markdown}\n`, 'utf-8');
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const answersPath = resolveAnswersPath(options);
  const summaryPath = resolveSummaryPath(options);
  const answers = readAnswers(answersPath);
  const summary = readSummary(summaryPath);

  const yCount = answers.filter((row) => row.answerable_now === 'Y').length;
  const pCount = answers.filter((row) => row.answerable_now === 'P').length;
  const nRows = answers.filter((row) => row.answerable_now === 'N');
  const nCount = nRows.length;
  const nIds = nRows.map((row) => row.id).sort();
  const criticalPRows = answers
    .filter((row) => row.answerable_now === 'P')
    .filter((row) => options.criticalPVerdicts.has(row.verdict.trim().toLowerCase()))
    .filter((row) => (row.confidence ?? 0) >= options.criticalPMinConfidence)
    .filter((row) => !options.allowedCriticalPIds.has(row.id));
  const criticalPIds = criticalPRows.map((row) => row.id).sort();

  const criteria: Criterion[] = [];
  if (options.blockAnyN) {
    criteria.push({
      name: 'No unanswered blockers remain (N == 0)',
      status: nCount === 0 ? 'PASS' : 'FAIL',
      details: nCount === 0 ? 'No N rows remain.' : `Remaining N IDs: ${nIds.join(', ')}`,
    });
  } else {
    const unexpectedNIds = nIds.filter((id) => !options.allowedNIds.has(id));
    criteria.push({
      name: 'Only approved temporary hard blockers remain N',
      status: unexpectedNIds.length === 0 ? 'PASS' : 'FAIL',
      details:
        unexpectedNIds.length === 0
          ? `All N IDs are within waiver list: ${Array.from(options.allowedNIds).join(', ') || 'None'}`
          : `Unexpected N IDs: ${unexpectedNIds.join(', ')}`,
    });
  }

  if (options.blockCriticalP) {
    criteria.push({
      name: `No critical at-risk partial answers remain (P with ${Array.from(options.criticalPVerdicts).join(', ') || 'n/a'}, confidence >= ${options.criticalPMinConfidence.toFixed(2)})`,
      status: criticalPRows.length === 0 ? 'PASS' : 'FAIL',
      details:
        criticalPRows.length === 0
          ? 'No critical partial answers remain.'
          : `Critical P IDs: ${criticalPRows
              .slice(0, 10)
              .map((row) => `${row.id}${row.section ? `(${row.section})` : ''}`)
              .join(', ')}${criticalPRows.length > 10 ? ` (+${criticalPRows.length - 10} more)` : ''}`,
    });
  } else {
    criteria.push({
      name: 'Critical P gate is informational (non-blocking)',
      status: 'PASS',
      details:
        criticalPRows.length === 0
          ? `No critical P rows at threshold (>=${options.criticalPMinConfidence.toFixed(2)}).`
          : `Current critical P IDs: ${criticalPIds.join(', ')}`,
    });
  }

  const failingSections = summary
    .filter((row) => !row.pass80Practical)
    .filter((row) => !options.excludedSections.has(row.section))
    .map((row) => row.section);

  if (options.requireSectionPass) {
    criteria.push({
      name: 'All sections pass >=80 practical coverage',
      status: failingSections.length === 0 ? 'PASS' : 'FAIL',
      details:
        failingSections.length === 0
          ? 'All sections passed.'
          : `Failing sections: ${failingSections.join(', ')}${
              options.excludedSections.size > 0
                ? ` (excluded: ${Array.from(options.excludedSections).join(', ')})`
                : ''
            }`,
    });
  } else {
    criteria.push({
      name: 'Section-level 80% coverage is informational (non-blocking)',
      status: 'PASS',
      details:
        failingSections.length === 0
          ? 'All sections currently pass.'
          : `Non-blocking failing sections: ${failingSections.join(', ')}`,
    });
  }

  const markdown = renderMarkdown(
    criteria,
    answersPath,
    summaryPath,
    { y: yCount, p: pCount, n: nCount },
    nIds,
    failingSections,
    Array.from(options.excludedSections)
  );
  writeSummary(options.summaryOutPath, markdown);

  console.log(`Checked answers: ${answersPath}`);
  console.log(`Checked summary: ${summaryPath}`);
  console.log(`N count: ${nCount}`);
  console.log(`N IDs: ${nIds.join(', ') || 'None'}`);
  console.log(
    `Critical P IDs (verdict in [${Array.from(options.criticalPVerdicts).join(', ') || 'n/a'}], confidence >= ${options.criticalPMinConfidence.toFixed(2)}): ${criticalPIds.join(', ') || 'None'}`
  );
  console.log(`Gate summary: ${path.resolve(options.summaryOutPath)}`);

  const hasFailures = criteria.some((criterion) => criterion.status === 'FAIL');
  if (hasFailures) {
    console.error('Dashboard acceptance gate failed.');
    process.exit(1);
  }

  console.log('Dashboard acceptance gate passed.');
}

main();
