-- MindsDB Query Pack for DePIN optimizer dataset
-- Generated for mode: quick
-- Expected table: depin_optimizer_quick_dataset

-- 1) Top failing protocols by weakest baseline solvency
SELECT protocol_id, protocol_name, chain, baseline_min_solvency, break_even_pass, defense_improved, flags_text
FROM depin_optimizer_quick_dataset
WHERE mode = 'quick' AND gate_pass = false
ORDER BY baseline_min_solvency ASC, protocol_name ASC
LIMIT 3;

-- 2) Sensitivity hotspots (all protocols)
WITH sensitivity AS (
  SELECT chain, protocol_id, sensitivity_1_parameter AS factor, sensitivity_1_delta AS delta FROM depin_optimizer_quick_dataset WHERE mode = 'quick' AND sensitivity_1_parameter <> ''
  UNION ALL
  SELECT chain, protocol_id, sensitivity_2_parameter AS factor, sensitivity_2_delta AS delta FROM depin_optimizer_quick_dataset WHERE mode = 'quick' AND sensitivity_2_parameter <> ''
  UNION ALL
  SELECT chain, protocol_id, sensitivity_3_parameter AS factor, sensitivity_3_delta AS delta FROM depin_optimizer_quick_dataset WHERE mode = 'quick' AND sensitivity_3_parameter <> ''
)
SELECT factor, COUNT(*) AS mentions, AVG(delta) AS avg_delta, MAX(delta) AS max_delta
FROM sensitivity
GROUP BY factor
ORDER BY mentions DESC, avg_delta DESC;

-- 3) Sensitivity hotspots in failing protocols only
WITH failing AS (
  SELECT * FROM depin_optimizer_quick_dataset WHERE mode = 'quick' AND gate_pass = false
), sensitivity AS (
  SELECT chain, protocol_id, sensitivity_1_parameter AS factor, sensitivity_1_delta AS delta FROM failing WHERE sensitivity_1_parameter <> ''
  UNION ALL
  SELECT chain, protocol_id, sensitivity_2_parameter AS factor, sensitivity_2_delta AS delta FROM failing WHERE sensitivity_2_parameter <> ''
  UNION ALL
  SELECT chain, protocol_id, sensitivity_3_parameter AS factor, sensitivity_3_delta AS delta FROM failing WHERE sensitivity_3_parameter <> ''
)
SELECT factor, COUNT(*) AS failing_mentions, AVG(delta) AS failing_avg_delta
FROM sensitivity
GROUP BY factor
ORDER BY failing_mentions DESC, failing_avg_delta DESC;

-- 4) Chain-level comparison
SELECT
  chain,
  COUNT(*) AS protocols,
  AVG(CASE WHEN gate_pass THEN 1 ELSE 0 END) AS gate_pass_rate,
  AVG(CASE WHEN break_even_pass THEN 1 ELSE 0 END) AS break_even_pass_rate,
  AVG(CASE WHEN defense_improved THEN 1 ELSE 0 END) AS defense_improved_rate,
  AVG(baseline_min_solvency) AS avg_baseline_min_solvency,
  AVG(scale_max_providers) AS avg_scale_max_providers
FROM depin_optimizer_quick_dataset
WHERE mode = 'quick'
GROUP BY chain
ORDER BY gate_pass_rate DESC, avg_scale_max_providers DESC;
