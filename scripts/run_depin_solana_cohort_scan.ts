import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { GENERATED_PROTOCOL_PROFILES } from '../src/data/generated/protocolProfiles.generated.ts';
import { PEER_GROUPS } from '../src/data/peerGroups.ts';
import { DIAGNOSTIC_ARCHETYPE_TO_PROTOCOL_ID } from '../src/data/diagnosticArchetypes.ts';

type Mode = 'quick' | 'full';

interface CliOptions {
  mode: Mode;
  outputDir: string;
}

interface OptimizerReport {
  profile: { id: string; name: string };
  mode: string;
  optimizer: {
    breakEven: {
      isThresholdMetAtSuggestedPrice: boolean;
    };
    defense: {
      improvedVsBaseline: boolean;
    };
  };
  flags: string[];
}

interface CohortScanRow {
  id: string;
  name: string;
  chain: string;
  inComparison: boolean;
  inBenchmark: boolean;
  inDiagnostic: boolean;
  runOk: boolean;
  breakEvenPass: boolean;
  defensePass: boolean;
  gatePass: boolean;
  flagCount: number;
  flags: string[];
  error?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    mode: 'quick',
    outputDir: path.join(process.cwd(), 'output/skill_reports'),
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
    if (arg === '--output-dir') {
      options.outputDir = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return options;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadCohort() {
  const comparisonIds = new Set(GENERATED_PROTOCOL_PROFILES.map((profile) => profile.metadata.id));
  const benchmarkIds = new Set(PEER_GROUPS.flatMap((group) => group.members));
  const diagnosticIds = new Set(Object.values(DIAGNOSTIC_ARCHETYPE_TO_PROTOCOL_ID));
  const cohortIds = [...new Set([...comparisonIds, ...benchmarkIds, ...diagnosticIds])];

  const profiles = GENERATED_PROTOCOL_PROFILES.filter(
    (profile) => cohortIds.includes(profile.metadata.id) && profile.metadata.chain === 'solana'
  ).sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));

  return { profiles, comparisonIds, benchmarkIds, diagnosticIds };
}

function runDiagnosticsForProfile(profileId: string, mode: Mode): { ok: boolean; error?: string } {
  const diagnosticsScript = path.join(
    process.cwd(),
    'skills/depin-simulation-optimizer/scripts/run_optimizer_diagnostics.ts'
  );

  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', diagnosticsScript, '--mode', mode, '--profile', profileId],
    {
      cwd: process.cwd(),
      encoding: 'utf-8',
    }
  );

  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || 'Unknown diagnostics failure').trim();
    return { ok: false, error: details };
  }

  return { ok: true };
}

function readReport(outputDir: string, profileId: string, mode: Mode): OptimizerReport {
  const reportPath = path.join(outputDir, `${profileId}_${mode}_report.json`);
  const raw = fs.readFileSync(reportPath, 'utf-8');
  return JSON.parse(raw) as OptimizerReport;
}

function toMarkdown(rows: CohortScanRow[], mode: Mode): string {
  const lines: string[] = [];
  lines.push('# DePIN Solana Cohort Scan');
  lines.push('');
  lines.push(`Mode: ${mode}`);
  lines.push(
    'Scope: App protocol cohort used in comparison/benchmark/diagnostic views, filtered to profiles with `metadata.chain === "solana"`.'
  );
  lines.push('');
  lines.push('| Profile ID | Name | Comparison | Benchmark | Diagnostic | Run OK | Break-even | Defense | Gate | Flags |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    lines.push(
      `| ${row.id} | ${row.name} | ${row.inComparison ? 'Y' : 'N'} | ${row.inBenchmark ? 'Y' : 'N'} | ${row.inDiagnostic ? 'Y' : 'N'} | ${row.runOk ? 'Y' : 'N'} | ${row.breakEvenPass ? 'PASS' : 'FAIL'} | ${row.defensePass ? 'PASS' : 'FAIL'} | ${row.gatePass ? 'PASS' : 'FAIL'} | ${row.flagCount} |`
    );
  }

  const failures = rows.filter((row) => !row.gatePass || !row.runOk);
  lines.push('');
  lines.push('## Failures');
  if (failures.length === 0) {
    lines.push('- None');
  } else {
    for (const row of failures) {
      if (!row.runOk) {
        lines.push(`- ${row.id}: diagnostics execution failed (${row.error || 'unknown'})`);
        continue;
      }
      lines.push(`- ${row.id}: ${row.flags.join('; ') || 'gate failure without explicit flags'}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  ensureDir(options.outputDir);

  const { profiles, comparisonIds, benchmarkIds, diagnosticIds } = loadCohort();
  if (profiles.length === 0) {
    throw new Error('No Solana DePIN profiles found in comparison/benchmark/diagnostic cohort.');
  }

  const rows: CohortScanRow[] = [];

  for (const profile of profiles) {
    const run = runDiagnosticsForProfile(profile.metadata.id, options.mode);

    if (!run.ok) {
      rows.push({
        id: profile.metadata.id,
        name: profile.metadata.name,
        chain: profile.metadata.chain,
        inComparison: comparisonIds.has(profile.metadata.id),
        inBenchmark: benchmarkIds.has(profile.metadata.id),
        inDiagnostic: diagnosticIds.has(profile.metadata.id),
        runOk: false,
        breakEvenPass: false,
        defensePass: false,
        gatePass: false,
        flagCount: 0,
        flags: [],
        error: run.error,
      });
      continue;
    }

    const report = readReport(options.outputDir, profile.metadata.id, options.mode);
    const breakEvenPass = report.optimizer.breakEven.isThresholdMetAtSuggestedPrice;
    const defensePass = report.optimizer.defense.improvedVsBaseline;
    const gatePass = breakEvenPass && defensePass;

    rows.push({
      id: profile.metadata.id,
      name: profile.metadata.name,
      chain: profile.metadata.chain,
      inComparison: comparisonIds.has(profile.metadata.id),
      inBenchmark: benchmarkIds.has(profile.metadata.id),
      inDiagnostic: diagnosticIds.has(profile.metadata.id),
      runOk: true,
      breakEvenPass,
      defensePass,
      gatePass,
      flagCount: report.flags.length,
      flags: report.flags,
    });
  }

  const generatedAt = new Date().toISOString();
  const summary = {
    generatedAt,
    mode: options.mode,
    scope: {
      comparisonProfiles: true,
      benchmarkPeerGroups: true,
      diagnosticArchetypes: true,
      chainFilter: 'solana',
    },
    totals: {
      profiles: rows.length,
      runFailures: rows.filter((row) => !row.runOk).length,
      gatePass: rows.filter((row) => row.gatePass).length,
      gateFail: rows.filter((row) => !row.gatePass).length,
    },
    rows,
  };

  const baseName = `depin_solana_cohort_${options.mode}_summary`;
  const jsonPath = path.join(options.outputDir, `${baseName}.json`);
  const mdPath = path.join(options.outputDir, `${baseName}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(mdPath, toMarkdown(rows, options.mode), 'utf-8');

  console.log(`Cohort scan complete for ${rows.length} Solana DePIN profiles.`);
  console.log(`Summary JSON: ${jsonPath}`);
  console.log(`Summary Markdown: ${mdPath}`);
}

main();
