"""
Generate deterministic Python golden vectors for cross-language math parity tests.

Usage:
  python3 src/audit/python/generate_golden_vectors.py
"""

from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_TOLERANCE = 1e-9


def clamp(value: float, lo: float, hi: float) -> float:
    return min(max(value, lo), hi)


# ---------------------------------------------------------------------------
# Existing parity formulas
# ---------------------------------------------------------------------------

def trap_door_growth(profit: float, barrier: float = 20.0, sensitivity: float = 0.5) -> float:
    if profit <= barrier:
        return 0.0
    return sensitivity * (profit - barrier)


def mercenary_churn(price: float, threshold: float = 1.0, k: float = 5.0) -> float:
    return 1.0 / (1.0 + math.exp(k * (price - threshold)))


def price_impact_function(pressure: float, liquidity: float = 1000.0, k: float = 0.1) -> float:
    return k * math.tanh((pressure / liquidity) * 100.0)


def calculate_r_be(token_price: float, emission: float, cost: float) -> float:
    return (token_price * emission) / cost


def gauntlet_cost_per_gb(
    week: int,
    minted_tokens: float = 200.0,
    initial_price: float = 5.0,
    decay: float = 0.05,
    capacity: float = 1000.0,
) -> float:
    price = initial_price * math.exp(-decay * week)
    return (minted_tokens * price) / capacity


def gauntlet_rev_per_gb(
    week: int,
    demand_gb: float = 200.0,
    service_price_gb: float = 0.5,
    capacity: float = 1000.0,
) -> float:
    _ = week
    return (demand_gb * service_price_gb) / capacity


def first_gauntlet_crossover_week(
    weeks: int = 52,
    minted_tokens: float = 200.0,
    initial_price: float = 5.0,
    decay: float = 0.05,
    capacity: float = 1000.0,
    demand_gb: float = 200.0,
    service_price_gb: float = 0.5,
) -> int | None:
    for week in range(weeks):
        cost = gauntlet_cost_per_gb(week, minted_tokens, initial_price, decay, capacity)
        rev = gauntlet_rev_per_gb(week, demand_gb, service_price_gb, capacity)
        if cost <= rev:
            return week
    return None


def calculate_survival_rate(price_drop_percent: float, capex: float, sensitivity: float) -> float:
    base_threshold = clamp(0.35 + (capex / 1000.0), 0.1, 0.95)
    effective_threshold = clamp(base_threshold - 0.02 * sensitivity, 0.02, 0.95)
    slope = 6.0 + 0.8 * sensitivity
    return 1.0 / (1.0 + math.exp(slope * (price_drop_percent - effective_threshold)))


def binary_search_history(
    low: float = 0.0,
    high: float = 100.0,
    root: float = 5.0,
    iterations: int = 10,
) -> tuple[list[float], float, float]:
    history: list[float] = []
    for _ in range(iterations):
        mid = (low + high) / 2.0
        history.append(mid)
        if mid >= root:
            high = mid
        else:
            low = mid
    return history, low, high


# ---------------------------------------------------------------------------
# Benchmark formulas
# ---------------------------------------------------------------------------

def benchmark_clamp(value: float, lo: float, hi: float) -> float:
    if not math.isfinite(value):
        return lo
    return min(max(value, lo), hi)


def mean(values: list[float]) -> float:
    if len(values) == 0:
        return 0.0
    return sum(values) / len(values)


def safe_percent_delta(a: float, b: float) -> dict[str, Any]:
    if not math.isfinite(a) or not math.isfinite(b) or b == 0:
        return {"delta": 0.0, "is_valid": False}
    return {"delta": ((a - b) / b) * 100.0, "is_valid": True}


def safe_absolute_delta(a: float, b: float) -> dict[str, Any]:
    if not math.isfinite(a) or not math.isfinite(b):
        return {"delta": 0.0, "is_valid": False}
    return {"delta": a - b, "is_valid": True}


def calculate_annual_growth_yoy(start_nodes: float, end_nodes: float, weeks: float) -> float:
    if not math.isfinite(start_nodes) or not math.isfinite(end_nodes) or not math.isfinite(weeks):
        return 0.0
    if weeks <= 0 or start_nodes <= 0:
        return 0.0

    weekly_growth = math.pow(end_nodes / start_nodes, 1.0 / weeks) - 1.0
    if not math.isfinite(weekly_growth):
        return 0.0

    return (math.pow(1.0 + weekly_growth, 52.0) - 1.0) * 100.0


def calculate_annualized_revenue(
    has_live_revenue: bool,
    live_revenue_usd_7d: float,
    demand_served_mean: float,
    service_price_mean: float,
) -> float:
    weekly_revenue = live_revenue_usd_7d if has_live_revenue else (demand_served_mean * service_price_mean)
    return weekly_revenue * 52.0 if math.isfinite(weekly_revenue) else 0.0


def calculate_weekly_burn(has_live_burn: bool, live_burn_7d: float, simulated_burn: float) -> float:
    burn = live_burn_7d if has_live_burn else simulated_burn
    return burn if math.isfinite(burn) else 0.0


def calculate_sustainability_ratio_pct(
    minted_tokens: float,
    simulation_price: float,
    burn_amount: float,
    burn_price: float,
) -> float:
    emissions_val = minted_tokens * simulation_price
    burn_val = burn_amount * burn_price
    if not math.isfinite(emissions_val) or not math.isfinite(burn_val) or emissions_val <= 0:
        return 0.0
    return (burn_val / emissions_val) * 100.0


def calculate_revenue_per_node(annualized_revenue: float, active_nodes: float) -> float:
    if not math.isfinite(annualized_revenue) or not math.isfinite(active_nodes) or active_nodes <= 0:
        return 0.0
    return annualized_revenue / active_nodes


def calculate_hardware_roi_pct(revenue_per_node: float, hardware_cost: float) -> float:
    if not math.isfinite(revenue_per_node) or not math.isfinite(hardware_cost) or hardware_cost <= 0:
        return 0.0
    return (revenue_per_node / hardware_cost) * 100.0


def calculate_payback_months(hardware_cost: float, annualized_revenue: float, active_nodes: float) -> float:
    annual_revenue_per_node = calculate_revenue_per_node(annualized_revenue, active_nodes)
    monthly_revenue_per_node = annual_revenue_per_node / 12.0
    if not math.isfinite(hardware_cost) or hardware_cost <= 0 or monthly_revenue_per_node <= 0:
        return float("inf")
    return hardware_cost / monthly_revenue_per_node


def normalize_payback_months(payback_months: float) -> float:
    if math.isfinite(payback_months):
        return benchmark_clamp(payback_months, 0.0, 60.0)
    return 60.0


def calculate_retention_fallback(final_providers: float, peak_providers: float) -> float:
    if not math.isfinite(final_providers) or not math.isfinite(peak_providers) or peak_providers <= 0:
        return 0.0
    return benchmark_clamp((final_providers / peak_providers) * 100.0, 0.0, 100.0)


def calculate_weekly_retention_estimate(points: list[dict[str, float]], fallback: float) -> float:
    if len(points) < 2:
        return fallback

    trailing = points[-8:]
    weekly_retention: list[float] = []

    for i in range(1, len(trailing)):
        prev_providers = trailing[i - 1].get("providers", 0.0)
        churn = trailing[i].get("churn", 0.0)
        if prev_providers <= 0:
            continue
        weekly_retention.append(benchmark_clamp((1.0 - churn / prev_providers) * 100.0, 0.0, 100.0))

    return mean(weekly_retention) if len(weekly_retention) > 0 else fallback


def calculate_demand_coverage_pct(demand: float, demand_served: float) -> float:
    if not math.isfinite(demand) or not math.isfinite(demand_served) or demand <= 0:
        return 0.0
    return benchmark_clamp((demand_served / demand) * 100.0, 0.0, 100.0)


def calculate_efficiency_score(
    utilization: float,
    demand_coverage: float,
    previous_utilization: float | None = None,
) -> float:
    bounded_utilization = benchmark_clamp(utilization, 0.0, 100.0)
    bounded_demand_coverage = benchmark_clamp(demand_coverage, 0.0, 100.0)

    utilization_balance = benchmark_clamp(100.0 - abs(bounded_utilization - 82.0) * 1.25, 0.0, 100.0)
    utilization_trend_penalty = 0.0

    if previous_utilization is not None and math.isfinite(previous_utilization):
        utilization_trend_penalty = benchmark_clamp(
            abs(bounded_utilization - benchmark_clamp(previous_utilization, 0.0, 100.0)) * 0.4,
            0.0,
            20.0,
        )

    return benchmark_clamp(
        (utilization_balance * 0.6) + (bounded_demand_coverage * 0.4) - utilization_trend_penalty,
        0.0,
        100.0,
    )


def normalize_sustainability_ratio(sustainability_ratio_pct: float) -> float:
    return benchmark_clamp(sustainability_ratio_pct / 100.0, 0.0, 3.0)


def to_payback_score(payback_months: float) -> float:
    return benchmark_clamp(((36.0 - payback_months) / 36.0) * 100.0, 0.0, 100.0)


def calculate_smoothed_solvency_index(series: list[float], index: int) -> float:
    if len(series) == 0:
        return 0.0

    safe_index = max(0, min(index, len(series) - 1))
    smooth_window = [
        value
        for value in series[max(0, safe_index - 2): safe_index + 1]
        if math.isfinite(value) and value >= 0
    ]
    smooth_solvency = mean(smooth_window) if len(smooth_window) > 0 else (series[safe_index] if math.isfinite(series[safe_index]) else 0.0)

    return benchmark_clamp(smooth_solvency * 100.0, 0.0, 220.0)


# ---------------------------------------------------------------------------
# Diagnostics formulas
# ---------------------------------------------------------------------------

def calculate_diagnostic_state(inputs: dict[str, Any]) -> dict[str, Any]:
    r_be = 0.8
    if inputs["emissionSchedule"] == "Fixed":
        r_be -= 0.4
    if inputs["demandLag"] == "High":
        r_be -= 0.3
    if inputs["emissionSchedule"] == "Dynamic":
        r_be += 0.2
    r_be = clamp(r_be, 0.05, 1.5)

    if inputs["minerProfile"] == "Mercenary":
        nrr = 85
        if inputs["priceShock"] == "Moderate":
            nrr = 60
        if inputs["priceShock"] == "Severe":
            nrr = 30
    else:
        nrr = 95
        if inputs["priceShock"] == "Moderate":
            nrr = 92
        if inputs["priceShock"] == "Severe":
            nrr = 85

    cpv = 12
    if inputs["minerProfile"] == "Professional":
        cpv = 18
    if inputs["minerProfile"] == "Mercenary":
        cpv = 6
    if inputs["emissionSchedule"] == "Fixed" and inputs["demandLag"] == "High":
        cpv += 12

    lur = 10
    if inputs["insiderOverhang"] == "High":
        lur += 30
    if inputs["demandLag"] == "High":
        lur += 10

    gov_score = 80
    if inputs["growthCoordination"] == "Uncoordinated":
        gov_score -= 30
    if inputs["emissionSchedule"] == "Fixed":
        gov_score -= 10
    if inputs["sybilResistance"] == "Weak":
        gov_score -= 20

    s_ber = min(100.0, (r_be / 1.0) * 100.0)
    s_nrr = max(0.0, (nrr - 50) * 2)
    s_lur = max(0.0, 100.0 - (lur * 2))

    final_score = (s_ber * 0.4) + (s_nrr * 0.2) + (s_lur * 0.2) + (gov_score * 0.2)
    verdict = "Robust"
    if final_score < 70:
        verdict = "Fragile"
    if final_score < 40:
        verdict = "Zombie"
    if final_score < 20:
        verdict = "Insolvent"

    return {
        "r_be": r_be,
        "lur": lur,
        "nrr": nrr,
        "cpv": cpv,
        "govScore": gov_score,
        "resilienceScore": round(final_score),
        "verdict": verdict,
    }


def calculate_diagnostic_signals(state: dict[str, Any]) -> dict[str, Any]:
    capacity_degradation = 100 - state["nrr"]
    capacity_status = "Safe"
    if capacity_degradation > 10:
        capacity_status = "Warning"
    if capacity_degradation > 30:
        capacity_status = "Critical"

    validation_overhead = max(0.0, 100 - state["govScore"])
    validation_status = "Safe"
    if validation_overhead > 40:
        validation_status = "Warning"
    if validation_overhead > 70:
        validation_status = "Critical"

    return {
        "capacityDegradation": capacity_degradation,
        "capacityStatus": capacity_status,
        "validationOverhead": validation_overhead,
        "validationStatus": validation_status,
    }


def calculate_subsidy_trap_series(
    emission_schedule: str,
    demand_lag: str,
    years: int = 5,
) -> dict[str, list[int]]:
    emissions: list[int] = []
    burn: list[int] = []

    current_emission = 100.0
    current_burn = 10.0

    for _ in range(years):
        if emission_schedule == "Fixed":
            current_emission *= 0.84
        else:
            current_emission = (current_burn * 1.2) + 20

        growth_rate = 1.5 if demand_lag == "Low" else 1.1
        current_burn *= growth_rate

        emissions.append(round(current_emission))
        burn.append(round(current_burn))

    return {"emissions": emissions, "burn": burn}


def calculate_density_trap_series(growth_coordination: str) -> dict[str, list[float]]:
    earnings: list[float] = []
    costs: list[float] = []

    base_cost = 20.0
    for i in range(7):
        costs.append(base_cost + (i * 2))
        if growth_coordination == "Uncoordinated":
            earnings.append(100 / math.pow(1.6, i))
        else:
            val = 60 - (i * 3)
            earnings.append(max(val, 25))

    return {"earnings": earnings, "costs": costs}


def calculate_hex_state_probabilities(price_shock: str, miner_profile: str) -> dict[str, float]:
    p_green = 1.0
    p_grey = 0.0
    p_black = 0.0

    if price_shock == "None":
        p_green = 0.95
        p_grey = 0.05
    elif price_shock == "Moderate":
        if miner_profile == "Mercenary":
            p_green, p_grey, p_black = 0.3, 0.1, 0.6
        else:
            p_green, p_grey, p_black = 0.4, 0.5, 0.1
    else:
        if miner_profile == "Mercenary":
            p_green, p_grey, p_black = 0.0, 0.05, 0.95
        else:
            p_green, p_grey, p_black = 0.1, 0.7, 0.2

    return {
        "pGreen": p_green,
        "pGrey": p_grey,
        "pBlack": p_black,
        "effectiveCapacityPct": round((p_green + p_grey) * 100),
    }


# ---------------------------------------------------------------------------
# Diagnostics (master proof + sensitivity)
# ---------------------------------------------------------------------------

def get_metric_mean_series(series: list[dict[str, Any]], key: str) -> list[float]:
    return [float(step.get(key, {}).get("mean", 0.0)) for step in series]


def calculate_strategic_proof(series: list[dict[str, Any]]) -> dict[str, Any]:
    mercenary_raw = get_metric_mean_series(series, "mercenaryCount")
    pro_raw = get_metric_mean_series(series, "proCount")
    total = [mercenary_raw[i] + pro_raw[i] for i in range(len(series))]
    mercenary_share = [(mercenary_raw[i] / (total[i] or 1.0)) * 100 for i in range(len(series))]
    pro_share = [(pro_raw[i] / (total[i] or 1.0)) * 100 for i in range(len(series))]

    panic_index = -1
    max_drop = 0.0
    for i in range(1, len(mercenary_raw)):
        drop = mercenary_raw[i - 1] - mercenary_raw[i]
        if drop > max_drop:
            max_drop = drop
            panic_index = i

    return {
        "mercenaryRaw": mercenary_raw,
        "proRaw": pro_raw,
        "mercenaryShare": mercenary_share,
        "proShare": pro_share,
        "panicIndex": float(panic_index),
        "maxDrop": max_drop,
    }


def calculate_architectural_proof(series: list[dict[str, Any]]) -> dict[str, Any]:
    revenue = [float(step.get("dailyBurnUsd", {}).get("mean", 0.0)) * 7 for step in series]
    cost = [float(step.get("dailyMintUsd", {}).get("mean", 0.0)) * 7 for step in series]
    deficit = [cost[i] - revenue[i] for i in range(len(series))]

    max_gap = 0.0
    max_gap_index = 0
    for i, value in enumerate(deficit):
        if value > max_gap:
            max_gap = value
            max_gap_index = i

    return {
        "revenue": revenue,
        "cost": cost,
        "deficit": deficit,
        "maxGap": max_gap,
        "maxGapIndex": float(max_gap_index),
    }


def calculate_methodological_proof(series: list[dict[str, Any]]) -> dict[str, Any]:
    real_price = get_metric_mean_series(series, "price")
    initial_price = real_price[0] if real_price and real_price[0] != 0 else 1.0
    excel_forecast = [initial_price * math.pow(1.01, i) for i in range(len(series))]
    diff_pct = [
        ((real_price[i] - (excel_forecast[i] or 1.0)) / (excel_forecast[i] or 1.0)) * 100
        for i in range(len(series))
    ]
    mid_index = len(real_price) // 2

    return {
        "realPrice": real_price,
        "excelForecast": excel_forecast,
        "diffPct": diff_pct,
        "midIndex": float(mid_index),
    }


def calculate_solution_proof(series: list[dict[str, Any]]) -> dict[str, Any]:
    dynamic_price = get_metric_mean_series(series, "price")
    supply_dynamic = get_metric_mean_series(series, "supply")
    burn_dynamic = get_metric_mean_series(series, "burned")
    minted = get_metric_mean_series(series, "minted")

    s0 = supply_dynamic[0] if supply_dynamic and supply_dynamic[0] != 0 else 100_000.0
    e0 = minted[0] if minted and minted[0] != 0 else 1_000.0
    current_static_supply = s0

    supply_static: list[float] = []
    for i in range(len(series)):
        static_emission = e0 * 5
        current_static_supply = current_static_supply + static_emission - (burn_dynamic[i] if i < len(burn_dynamic) else 0.0)
        supply_static.append(current_static_supply)

    static_shadow_price = []
    for i in range(len(series)):
        s_dyn = supply_dynamic[i] if i < len(supply_dynamic) and supply_dynamic[i] != 0 else 1.0
        s_stat = supply_static[i] if i < len(supply_static) and supply_static[i] != 0 else 1.0
        static_shadow_price.append(dynamic_price[i] * (s_dyn / s_stat))

    saved_value = [dynamic_price[i] - static_shadow_price[i] for i in range(len(series))]

    return {
        "dynamicPrice": dynamic_price,
        "staticShadowPrice": static_shadow_price,
        "supplyStatic": supply_static,
        "supplyDynamic": supply_dynamic,
        "savedValue": saved_value,
    }


def calculate_burn_pct_step(index: int, x_steps: int) -> float:
    if x_steps <= 1:
        return 0.0
    return index / (x_steps - 1)


def calculate_mint_step(index: int, y_steps: int, min_mint: float, max_mint: float) -> float:
    if y_steps <= 1:
        return min_mint
    return min_mint + (index * ((max_mint - min_mint) / (y_steps - 1)))


def calculate_display_mint_for_row(row: int, y_steps: int, min_mint: float, max_mint: float) -> float:
    y_index = (y_steps - 1) - row
    return calculate_mint_step(y_index, y_steps, min_mint, max_mint)


def build_sensitivity_sweep_grid(
    x_steps: int = 5,
    y_steps: int = 5,
    min_mint: float = 1_000_000.0,
    max_mint: float = 10_000_000.0,
) -> list[dict[str, float]]:
    points: list[dict[str, float]] = []
    for i in range(x_steps):
        for j in range(y_steps):
            points.append(
                {
                    "burnPct": calculate_burn_pct_step(i, x_steps),
                    "maxMintWeekly": calculate_mint_step(j, y_steps, min_mint, max_mint),
                }
            )
    return points


def classify_sensitivity_heatmap_band(score: float) -> str:
    if score < 40:
        return "red"
    if score < 70:
        return "yellow"
    return "green"


def sensitivity_band_code(score: float) -> float:
    band = classify_sensitivity_heatmap_band(score)
    if band == "red":
        return 0.0
    if band == "yellow":
        return 1.0
    return 2.0


# ---------------------------------------------------------------------------
# Decision tree formulas
# ---------------------------------------------------------------------------

def calculate_volatility(price_series: list[dict[str, float]]) -> float:
    if len(price_series) < 2:
        return 0.0

    returns: list[float] = []
    for i in range(1, len(price_series)):
        prev_price = price_series[i - 1].get("mean", 0.0)
        curr_price = price_series[i].get("mean", 0.0)
        if prev_price > 0:
            returns.append(math.log(curr_price / prev_price))

    if not returns:
        return 0.0

    mean_val = sum(returns) / len(returns)
    variance = sum((r - mean_val) ** 2 for r in returns) / len(returns)
    weekly_vol = math.sqrt(variance)
    return weekly_vol * math.sqrt(52) * 100


def calculate_max_drawdown_from_means(mean_prices: list[float]) -> float:
    valid_prices = [p for p in mean_prices if math.isfinite(p) and p > 0]
    if not valid_prices:
        return 0.0
    peak = max(valid_prices)
    peak_idx = valid_prices.index(peak)
    trough_after_peak = min(valid_prices[max(0, peak_idx):])
    return ((peak - trough_after_peak) / peak) * 100 if peak > 0 else 0.0


def calculate_wizard_metrics(series: list[dict[str, Any]], hardware_cost: float) -> dict[str, float]:
    if not series:
        return {
            "solvencyScore": 0.0,
            "solvencyFloor": 0.0,
            "paybackMonths": 0.0,
            "networkUtilization": 0.0,
            "resilienceScore": 0.0,
            "maxDrawdown": 0.0,
            "avgChurnRate": 0.0,
            "insolvencyWeeks": 0.0,
        }

    last_step = series[-1]
    solvency_score = float(last_step.get("solvencyScore", {}).get("mean", 0.0))
    min_solvency = min(float(step.get("solvencyScore", {}).get("mean", 0.0)) for step in series)

    weekly_profit = float(last_step.get("profit", {}).get("mean", 0.0))
    payback_weeks = (hardware_cost / weekly_profit) if weekly_profit > 0.01 else 520.0
    payback_months = payback_weeks / 4.33

    network_utilization = float(last_step.get("utilisation", {}).get("mean", 0.0))

    mean_prices = [float(step.get("price", {}).get("mean", 0.0)) for step in series]
    max_drawdown = calculate_max_drawdown_from_means(mean_prices)

    trailing = series[-12:]
    churn_rates: list[float] = []
    for idx, step in enumerate(trailing):
        prior = trailing[max(0, idx - 1)]
        providers = float(prior.get("providers", {}).get("mean", step.get("providers", {}).get("mean", 0.0)))
        churn = float(step.get("churnCount", {}).get("mean", 0.0))
        churn_rates.append((churn / providers) * 100 if providers > 0 else 0.0)

    avg_churn_rate = sum(churn_rates) / len(churn_rates) if churn_rates else 0.0
    insolvency_weeks = sum(1 for step in series if float(step.get("solvencyScore", {}).get("mean", 0.0)) < 1.0)
    insolvency_rate = insolvency_weeks / len(series) if series else 0.0
    annualized_volatility = calculate_volatility([step.get("price", {}) for step in series])

    solvency_floor_score = clamp((min_solvency / 1.2) * 20, 0, 20)
    final_solvency_score = clamp((solvency_score / 1.5) * 30, 0, 30)
    utilization_score = clamp((network_utilization / 80) * 20, 0, 20)
    insolvency_score = clamp((1 - insolvency_rate) * 20, 0, 20)
    volatility_score = clamp((1 - (annualized_volatility / 1200)) * 10, 0, 10)
    churn_score = clamp((1 - (avg_churn_rate / 8)) * 10, 0, 10)

    resilience_score = round(
        solvency_floor_score
        + final_solvency_score
        + utilization_score
        + insolvency_score
        + volatility_score
        + churn_score
    )

    return {
        "solvencyScore": solvency_score,
        "solvencyFloor": min_solvency,
        "paybackMonths": payback_months,
        "networkUtilization": network_utilization,
        "resilienceScore": resilience_score,
        "maxDrawdown": max_drawdown,
        "avgChurnRate": avg_churn_rate,
        "insolvencyWeeks": float(insolvency_weeks),
    }


def calculate_risk_metrics(series: list[dict[str, Any]]) -> dict[str, float]:
    if not series:
        return {
            "drawdown": 0.0,
            "volatility": 0.0,
            "tailRiskScore": 0.0,
            "insolvencyWeeks": 0.0,
            "insolvencyRate": 0.0,
            "p10FloorRatio": 1.0,
            "finalSolvency": 1.0,
        }

    mean_prices = [float(step.get("price", {}).get("mean", 0.0)) for step in series if float(step.get("price", {}).get("mean", 0.0)) > 0]
    initial_price = mean_prices[0] if mean_prices else 1.0
    drawdown = calculate_max_drawdown_from_means(mean_prices)
    volatility = calculate_volatility([step.get("price", {}) for step in series])

    p10_floor = min(float(step.get("price", {}).get("p10", step.get("price", {}).get("mean", initial_price))) for step in series)
    p10_floor_ratio = (p10_floor / initial_price) if initial_price > 0 else 1.0

    last = series[-1]
    last_mean = float(last.get("price", {}).get("mean", 0.0))
    last_p10 = float(last.get("price", {}).get("p10", last_mean))
    downside_spread = ((last_mean - last_p10) / last_mean) if last_mean > 0 else 0.0

    insolvency_weeks = sum(1 for step in series if float(step.get("solvencyScore", {}).get("mean", 0.0)) < 1.0)
    insolvency_rate = insolvency_weeks / len(series) if series else 0.0

    floor_risk = clamp(1 - p10_floor_ratio, 0, 1)
    spread_risk = clamp(downside_spread / 0.6, 0, 1)
    drawdown_risk = clamp(drawdown / 100, 0, 1)

    tail_risk_score = round((insolvency_rate * 0.45 + floor_risk * 0.2 + drawdown_risk * 0.2 + spread_risk * 0.15) * 100)

    return {
        "drawdown": drawdown,
        "volatility": volatility,
        "tailRiskScore": float(tail_risk_score),
        "insolvencyWeeks": float(insolvency_weeks),
        "insolvencyRate": insolvency_rate,
        "p10FloorRatio": p10_floor_ratio,
        "finalSolvency": float(last.get("solvencyScore", {}).get("mean", 0.0)),
    }


def build_miner_chart_data(series: list[dict[str, Any]], hardware_cost: float) -> list[dict[str, float]]:
    points: list[dict[str, float]] = []
    cumulative = 0.0

    for idx, step in enumerate(series):
        weekly_profit = float(step.get("profit", {}).get("mean", 0.0))
        is_unprofitable = weekly_profit <= 0.1
        payback_weeks = 520.0 if is_unprofitable else (hardware_cost / weekly_profit)
        payback_months = payback_weeks / 4.33
        providers = float(step.get("providers", {}).get("mean", 0.0))
        previous_providers = float(series[idx - 1].get("providers", {}).get("mean", providers)) if idx > 0 else providers
        churn_nodes = float(step.get("churnCount", {}).get("mean", 0.0))
        churn_rate_pct = ((churn_nodes / previous_providers) * 100) if previous_providers > 0 else 0.0

        cumulative += weekly_profit

        points.append({
            "t": float(step.get("t", idx)),
            "paybackMonths": clamp(payback_months, 0, 120),
            "actualPayback": payback_months,
            "providers": providers,
            "churnNodes": churn_nodes,
            "churnRatePct": churn_rate_pct,
            "profit": weekly_profit,
            "cumulativeProfit": cumulative,
        })

    return points


def build_utility_chart_data(series: list[dict[str, Any]]) -> list[dict[str, float]]:
    points: list[dict[str, float]] = []
    for step in series:
        demand = float(step.get("demand", {}).get("mean", 0.0))
        demand_served = float(step.get("demandServed", {}).get("mean", 0.0))
        utilization = float(step.get("utilisation", {}).get("mean", 0.0))
        pro_nodes = float(step.get("proCount", {}).get("mean", 0.0))
        merc_nodes = float(step.get("mercenaryCount", {}).get("mean", 0.0))
        providers = float(step.get("providers", {}).get("mean", 0.0))

        fallback_split = providers > 0 and (pro_nodes + merc_nodes == 0)
        resolved_pro = providers * 0.5 if fallback_split else pro_nodes
        resolved_merc = providers * 0.5 if fallback_split else merc_nodes
        total_nodes = max(0.0, resolved_pro + resolved_merc)
        demand_coverage = ((demand_served / demand) * 100) if demand > 0 else 0.0

        points.append({
            "t": float(step.get("t", 0)),
            "demand": demand,
            "demandServed": demand_served,
            "demandCoverage": clamp(demand_coverage, 0, 100),
            "utilization": clamp(utilization, 0, 100),
            "proNodes": max(0.0, resolved_pro),
            "mercenaryNodes": max(0.0, resolved_merc),
            "totalNodes": total_nodes,
        })

    return points


def summarize_utility(points: list[dict[str, float]]) -> dict[str, float]:
    if not points:
        return {
            "utilization": 0.0,
            "demandCoverage": 0.0,
            "proShare": 50.0,
            "lowSample": 1.0,
            "overprovisioned": 0.0,
            "utilityHealthScore": 0.0,
        }

    last = points[-1]
    utilization = float(last["utilization"])
    demand_coverage = float(last["demandCoverage"])
    pro_share = ((last["proNodes"] / last["totalNodes"]) * 100) if last["totalNodes"] > 0 else 50.0
    low_sample = 1.0 if last["totalNodes"] < 50 else 0.0
    overprovisioned = 1.0 if (demand_coverage >= 98 and utilization < 35) else 0.0
    utility_health_score = round((utilization * 0.45) + (demand_coverage * 0.55))

    return {
        "utilization": utilization,
        "demandCoverage": demand_coverage,
        "proShare": pro_share,
        "lowSample": low_sample,
        "overprovisioned": overprovisioned,
        "utilityHealthScore": float(utility_health_score),
    }


def summarize_financial(points: list[dict[str, float]]) -> dict[str, float]:
    last = points[-1] if points else {"balance": 0.0, "cumulativeBurn": 0.0, "netBurnMinusMint": 0.0}
    use_burn_metric = 1.0 if float(last.get("balance", 0.0)) == 0 else 0.0
    current_balance = float(last.get("cumulativeBurn", 0.0)) if use_burn_metric == 1.0 else float(last.get("balance", 0.0))

    recent_window = points[-12:]
    balance_slope = ((recent_window[-1]["balance"] - recent_window[0]["balance"]) / (len(recent_window) - 1)) if len(recent_window) > 1 else 0.0
    is_draining = 1.0 if (use_burn_metric == 0.0 and balance_slope < 0) else 0.0
    weeks_to_empty = (current_balance / abs(balance_slope)) if (is_draining == 1.0 and current_balance > 0) else float("inf")
    current_net_flow = float(last.get("netBurnMinusMint", 0.0))
    net_flow_quality = clamp(current_net_flow / 500_000.0, -1.0, 1.0)

    return {
        "useBurnMetric": use_burn_metric,
        "currentBalance": current_balance,
        "balanceSlope": balance_slope,
        "isDraining": is_draining,
        "weeksToEmpty": weeks_to_empty,
        "currentNetFlow": current_net_flow,
        "netFlowQuality": net_flow_quality,
    }


# ---------------------------------------------------------------------------
# Fixture data for decision-tree parity
# ---------------------------------------------------------------------------

def sample_aggregate_series() -> list[dict[str, Any]]:
    return [
        {
            "t": 0,
            "price": {"mean": 10.0, "p10": 9.0},
            "solvencyScore": {"mean": 1.2},
            "dailyBurnUsd": {"mean": 100_000.0},
            "dailyMintUsd": {"mean": 120_000.0},
            "supply": {"mean": 1_000_000.0},
            "burned": {"mean": 15_000.0},
            "minted": {"mean": 30_000.0},
            "profit": {"mean": 20.0},
            "utilisation": {"mean": 50.0},
            "providers": {"mean": 1000.0},
            "churnCount": {"mean": 10.0},
            "demand": {"mean": 1000.0},
            "demandServed": {"mean": 900.0},
            "proCount": {"mean": 600.0},
            "mercenaryCount": {"mean": 400.0},
        },
        {
            "t": 1,
            "price": {"mean": 8.0, "p10": 6.5},
            "solvencyScore": {"mean": 0.9},
            "dailyBurnUsd": {"mean": 95_000.0},
            "dailyMintUsd": {"mean": 130_000.0},
            "supply": {"mean": 1_030_000.0},
            "burned": {"mean": 14_000.0},
            "minted": {"mean": 28_000.0},
            "profit": {"mean": 15.0},
            "utilisation": {"mean": 40.0},
            "providers": {"mean": 950.0},
            "churnCount": {"mean": 50.0},
            "demand": {"mean": 1000.0},
            "demandServed": {"mean": 850.0},
            "proCount": {"mean": 570.0},
            "mercenaryCount": {"mean": 380.0},
        },
        {
            "t": 2,
            "price": {"mean": 6.0, "p10": 4.5},
            "solvencyScore": {"mean": 0.8},
            "dailyBurnUsd": {"mean": 90_000.0},
            "dailyMintUsd": {"mean": 140_000.0},
            "supply": {"mean": 1_055_000.0},
            "burned": {"mean": 13_000.0},
            "minted": {"mean": 26_000.0},
            "profit": {"mean": 5.0},
            "utilisation": {"mean": 30.0},
            "providers": {"mean": 900.0},
            "churnCount": {"mean": 80.0},
            "demand": {"mean": 1000.0},
            "demandServed": {"mean": 700.0},
            "proCount": {"mean": 500.0},
            "mercenaryCount": {"mean": 400.0},
        },
        {
            "t": 3,
            "price": {"mean": 7.0, "p10": 5.5},
            "solvencyScore": {"mean": 1.1},
            "dailyBurnUsd": {"mean": 105_000.0},
            "dailyMintUsd": {"mean": 135_000.0},
            "supply": {"mean": 1_080_000.0},
            "burned": {"mean": 12_000.0},
            "minted": {"mean": 25_000.0},
            "profit": {"mean": 12.0},
            "utilisation": {"mean": 35.0},
            "providers": {"mean": 920.0},
            "churnCount": {"mean": 30.0},
            "demand": {"mean": 1000.0},
            "demandServed": {"mean": 800.0},
            "proCount": {"mean": 530.0},
            "mercenaryCount": {"mean": 390.0},
        },
    ]


def sample_treasury_points() -> list[dict[str, float]]:
    return [
        {"t": 0.0, "balance": 1_000_000.0, "cumulativeBurn": 0.0, "burn": 100_000.0, "mint": 150_000.0, "netBurnMinusMint": -50_000.0},
        {"t": 1.0, "balance": 900_000.0, "cumulativeBurn": 0.0, "burn": 95_000.0, "mint": 155_000.0, "netBurnMinusMint": -60_000.0},
        {"t": 2.0, "balance": 800_000.0, "cumulativeBurn": 0.0, "burn": 90_000.0, "mint": 160_000.0, "netBurnMinusMint": -70_000.0},
    ]


# ---------------------------------------------------------------------------
# Payload
# ---------------------------------------------------------------------------

def generate_payload() -> dict[str, Any]:
    history, final_low, final_high = binary_search_history()

    diag_onocoy = {
        "minerProfile": "Professional",
        "emissionSchedule": "Dynamic",
        "growthCoordination": "Managed",
        "demandLag": "Low",
        "priceShock": "None",
        "insiderOverhang": "Low",
        "sybilResistance": "Strong",
    }
    diag_fragile = {
        "minerProfile": "Mercenary",
        "emissionSchedule": "Fixed",
        "growthCoordination": "Uncoordinated",
        "demandLag": "High",
        "priceShock": "Severe",
        "insiderOverhang": "High",
        "sybilResistance": "Weak",
    }

    diag_state_onocoy = calculate_diagnostic_state(diag_onocoy)
    diag_state_fragile = calculate_diagnostic_state(diag_fragile)
    diag_signals = calculate_diagnostic_signals({
        "r_be": 0.6,
        "lur": 30,
        "nrr": 60,
        "cpv": 24,
        "govScore": 45,
        "resilienceScore": 42,
        "verdict": "Fragile",
    })

    subsidy_fixed = calculate_subsidy_trap_series("Fixed", "High", years=5)
    subsidy_dynamic = calculate_subsidy_trap_series("Dynamic", "Low", years=5)
    density_uncoord = calculate_density_trap_series("Uncoordinated")
    density_managed = calculate_density_trap_series("Managed")
    hex_probs = calculate_hex_state_probabilities("Moderate", "Mercenary")
    hex_severe_pro = calculate_hex_state_probabilities("Severe", "Professional")

    series = sample_aggregate_series()
    strategic = calculate_strategic_proof(series)
    architectural = calculate_architectural_proof(series)
    methodological = calculate_methodological_proof(series)
    solution = calculate_solution_proof(series)
    sweep_grid = build_sensitivity_sweep_grid(x_steps=5, y_steps=5, min_mint=1_000_000.0, max_mint=10_000_000.0)
    wizard = calculate_wizard_metrics(series, hardware_cost=1000.0)
    risk = calculate_risk_metrics(series)
    miner_chart = build_miner_chart_data(series, hardware_cost=1000.0)
    utility_summary = summarize_utility(build_utility_chart_data(series))
    financial_summary = summarize_financial(sample_treasury_points())
    benchmark_retention_points = [
        {"providers": 1000.0, "churn": 0.0},
        {"providers": 980.0, "churn": 20.0},
        {"providers": 960.0, "churn": 25.0},
        {"providers": 940.0, "churn": 30.0},
        {"providers": 920.0, "churn": 35.0},
        {"providers": 900.0, "churn": 40.0},
        {"providers": 880.0, "churn": 50.0},
        {"providers": 860.0, "churn": 60.0},
    ]
    benchmark_solvency_series = [1.2, 1.1, 0.9, 0.8]
    benchmark_percent_delta = safe_percent_delta(5000.0, 4000.0)
    benchmark_abs_delta = safe_absolute_delta(10.0, 7.0)
    benchmark_growth = calculate_annual_growth_yoy(1000.0, 5000.0, 52)
    benchmark_revenue_live = calculate_annualized_revenue(True, 1000.0, 0.0, 0.0)
    benchmark_revenue_sim = calculate_annualized_revenue(False, 0.0, 200.0, 0.5)
    benchmark_burn = calculate_weekly_burn(True, 250.0, 100.0)
    benchmark_sustain = calculate_sustainability_ratio_pct(1000.0, 0.5, 500.0, 0.5)
    benchmark_revenue_per_node = calculate_revenue_per_node(52000.0, 5000.0)
    benchmark_roi = calculate_hardware_roi_pct(benchmark_revenue_per_node, 150.0)
    benchmark_payback = calculate_payback_months(150.0, 52000.0, 5000.0)
    benchmark_payback_normalized = normalize_payback_months(benchmark_payback)
    benchmark_retention_fallback = calculate_retention_fallback(900.0, 1000.0)
    benchmark_retention = calculate_weekly_retention_estimate(benchmark_retention_points, benchmark_retention_fallback)
    benchmark_coverage = calculate_demand_coverage_pct(1000.0, 850.0)
    benchmark_efficiency = calculate_efficiency_score(82.0, benchmark_coverage, 80.0)
    benchmark_sustainability_normalized = normalize_sustainability_ratio(benchmark_sustain)
    benchmark_payback_score = to_payback_score(benchmark_payback_normalized)
    benchmark_smoothed_index = calculate_smoothed_solvency_index(benchmark_solvency_series, 2)
    benchmark_smoothed_series = [calculate_smoothed_solvency_index(benchmark_solvency_series, idx) for idx in [0, 1, 2, 3]]

    payload: dict[str, Any] = {
        "metadata": {
            "schema_version": "1.2.0",
            "generator": "src/audit/python/generate_golden_vectors.py",
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        },
        "default_tolerance": DEFAULT_TOLERANCE,
        "scalar_cases": [
            {
                "id": "trap_door_profit_10",
                "formula": "trap_door_growth",
                "inputs": {"profit": 10.0, "barrier": 20.0, "sensitivity": 0.5},
                "expected": trap_door_growth(10.0, 20.0, 0.5),
            },
            {
                "id": "trap_door_profit_20_01",
                "formula": "trap_door_growth",
                "inputs": {"profit": 20.01, "barrier": 20.0, "sensitivity": 0.5},
                "expected": trap_door_growth(20.01, 20.0, 0.5),
            },
            {
                "id": "trap_door_profit_30",
                "formula": "trap_door_growth",
                "inputs": {"profit": 30.0, "barrier": 20.0, "sensitivity": 0.5},
                "expected": trap_door_growth(30.0, 20.0, 0.5),
            },
            {
                "id": "mercenary_churn_price_1_5",
                "formula": "mercenary_churn",
                "inputs": {"price": 1.5, "threshold": 1.0, "k": 5.0},
                "expected": mercenary_churn(1.5, 1.0, 5.0),
            },
            {
                "id": "mercenary_churn_price_1_0",
                "formula": "mercenary_churn",
                "inputs": {"price": 1.0, "threshold": 1.0, "k": 5.0},
                "expected": mercenary_churn(1.0, 1.0, 5.0),
            },
            {
                "id": "mercenary_churn_price_0_5",
                "formula": "mercenary_churn",
                "inputs": {"price": 0.5, "threshold": 1.0, "k": 5.0},
                "expected": mercenary_churn(0.5, 1.0, 5.0),
            },
            {
                "id": "price_impact_50_liq_5000",
                "formula": "price_impact_function",
                "inputs": {"pressure": 50.0, "liquidity": 5000.0, "k": 0.1},
                "expected": price_impact_function(50.0, 5000.0, 0.1),
            },
            {
                "id": "price_impact_50000_liq_5000",
                "formula": "price_impact_function",
                "inputs": {"pressure": 50000.0, "liquidity": 5000.0, "k": 0.1},
                "expected": price_impact_function(50000.0, 5000.0, 0.1),
            },
            {
                "id": "r_be_price_0_2",
                "formula": "calculate_r_be",
                "inputs": {"token_price": 0.2, "emission": 100.0, "cost": 10.0},
                "expected": calculate_r_be(0.2, 100.0, 10.0),
            },
            {
                "id": "r_be_price_0_1",
                "formula": "calculate_r_be",
                "inputs": {"token_price": 0.1, "emission": 100.0, "cost": 10.0},
                "expected": calculate_r_be(0.1, 100.0, 10.0),
            },
            {
                "id": "r_be_price_0_05",
                "formula": "calculate_r_be",
                "inputs": {"token_price": 0.05, "emission": 100.0, "cost": 10.0},
                "expected": calculate_r_be(0.05, 100.0, 10.0),
            },
            {
                "id": "gauntlet_cost_week_0",
                "formula": "gauntlet_cost_per_gb",
                "inputs": {"week": 0, "minted_tokens": 200.0, "initial_price": 5.0, "decay": 0.05, "capacity": 1000.0},
                "expected": gauntlet_cost_per_gb(0, 200.0, 5.0, 0.05, 1000.0),
            },
            {
                "id": "gauntlet_cost_week_47",
                "formula": "gauntlet_cost_per_gb",
                "inputs": {"week": 47, "minted_tokens": 200.0, "initial_price": 5.0, "decay": 0.05, "capacity": 1000.0},
                "expected": gauntlet_cost_per_gb(47, 200.0, 5.0, 0.05, 1000.0),
            },
            {
                "id": "gauntlet_rev_week_47",
                "formula": "gauntlet_rev_per_gb",
                "inputs": {"week": 47, "demand_gb": 200.0, "service_price_gb": 0.5, "capacity": 1000.0},
                "expected": gauntlet_rev_per_gb(47, 200.0, 0.5, 1000.0),
            },
            {
                "id": "gauntlet_first_crossover_52_weeks",
                "formula": "first_gauntlet_crossover_week",
                "inputs": {
                    "weeks": 52,
                    "minted_tokens": 200.0,
                    "initial_price": 5.0,
                    "decay": 0.05,
                    "capacity": 1000.0,
                    "demand_gb": 200.0,
                    "service_price_gb": 0.5,
                },
                "expected": first_gauntlet_crossover_week(weeks=52, minted_tokens=200.0, initial_price=5.0, decay=0.05, capacity=1000.0, demand_gb=200.0, service_price_gb=0.5),
                "tolerance": 0.0,
            },
            {
                "id": "survival_onocoy_drop_0_8",
                "formula": "calculate_survival_rate",
                "inputs": {"price_drop_percent": 0.8, "capex": 500.0, "sensitivity": 1.0},
                "expected": calculate_survival_rate(0.8, 500.0, 1.0),
            },
            {
                "id": "survival_geodnet_drop_0_8",
                "formula": "calculate_survival_rate",
                "inputs": {"price_drop_percent": 0.8, "capex": 700.0, "sensitivity": 1.0},
                "expected": calculate_survival_rate(0.8, 700.0, 1.0),
            },
            {
                "id": "survival_hivemapper_drop_0_8",
                "formula": "calculate_survival_rate",
                "inputs": {"price_drop_percent": 0.8, "capex": 450.0, "sensitivity": 5.0},
                "expected": calculate_survival_rate(0.8, 450.0, 5.0),
            },
            {
                "id": "survival_grass_drop_0_2",
                "formula": "calculate_survival_rate",
                "inputs": {"price_drop_percent": 0.2, "capex": 0.0, "sensitivity": 20.0},
                "expected": calculate_survival_rate(0.2, 0.0, 20.0),
            },
            {
                "id": "binary_search_final_low",
                "formula": "binary_search_final_low",
                "inputs": {"low": 0.0, "high": 100.0, "root": 5.0, "iterations": 10},
                "expected": final_low,
            },
            {
                "id": "binary_search_final_high",
                "formula": "binary_search_final_high",
                "inputs": {"low": 0.0, "high": 100.0, "root": 5.0, "iterations": 10},
                "expected": final_high,
            },

            # Diagnostics
            {
                "id": "diagnostic_onocoy_r_be",
                "formula": "diagnostic_state_field",
                "inputs": {**diag_onocoy, "field": "r_be"},
                "expected": diag_state_onocoy["r_be"],
            },
            {
                "id": "diagnostic_fragile_resilience",
                "formula": "diagnostic_state_field",
                "inputs": {**diag_fragile, "field": "resilienceScore"},
                "expected": diag_state_fragile["resilienceScore"],
            },
            {
                "id": "diagnostic_signal_capacity_degradation",
                "formula": "diagnostic_signal_field",
                "inputs": {
                    "r_be": 0.6,
                    "lur": 30,
                    "nrr": 60,
                    "cpv": 24,
                    "govScore": 45,
                    "resilienceScore": 42,
                    "verdict": "Fragile",
                    "field": "capacityDegradation",
                },
                "expected": diag_signals["capacityDegradation"],
            },
            {
                "id": "diagnostic_signal_validation_status_code",
                "formula": "diagnostic_signal_field",
                "inputs": {
                    "r_be": 0.6,
                    "lur": 30,
                    "nrr": 60,
                    "cpv": 24,
                    "govScore": 45,
                    "resilienceScore": 42,
                    "verdict": "Fragile",
                    "field": "validationStatus",
                },
                "expected": 1,
            },
            {
                "id": "subsidy_fixed_emission_year3",
                "formula": "subsidy_series_value",
                "inputs": {**diag_fragile, "years": 5, "series": "emissions", "index": 2},
                "expected": subsidy_fixed["emissions"][2],
                "tolerance": 0.0,
            },
            {
                "id": "subsidy_dynamic_burn_year5",
                "formula": "subsidy_series_value",
                "inputs": {**diag_onocoy, "years": 5, "series": "burn", "index": 4},
                "expected": subsidy_dynamic["burn"][4],
                "tolerance": 0.0,
            },
            {
                "id": "density_uncoord_earnings_idx3",
                "formula": "density_series_value",
                "inputs": {"growthCoordination": "Uncoordinated", "series": "earnings", "index": 3},
                "expected": density_uncoord["earnings"][3],
            },
            {
                "id": "density_managed_earnings_idx6",
                "formula": "density_series_value",
                "inputs": {"growthCoordination": "Managed", "series": "earnings", "index": 6},
                "expected": density_managed["earnings"][6],
            },
            {
                "id": "hex_moderate_merc_effective_capacity",
                "formula": "hex_probability_field",
                "inputs": {"priceShock": "Moderate", "minerProfile": "Mercenary", "field": "effectiveCapacityPct"},
                "expected": hex_probs["effectiveCapacityPct"],
                "tolerance": 0.0,
            },
            {
                "id": "hex_severe_pro_pgrey",
                "formula": "hex_probability_field",
                "inputs": {"priceShock": "Severe", "minerProfile": "Professional", "field": "pGrey"},
                "expected": hex_severe_pro["pGrey"],
            },

            # Master proof + sensitivity
            {
                "id": "strategic_panic_index",
                "formula": "strategic_proof_field",
                "inputs": {"series": series, "field": "panicIndex"},
                "expected": strategic["panicIndex"],
                "tolerance": 0.0,
            },
            {
                "id": "strategic_merc_share_idx2",
                "formula": "strategic_proof_field",
                "inputs": {"series": series, "field": "mercenaryShare", "index": 2},
                "expected": strategic["mercenaryShare"][2],
            },
            {
                "id": "architectural_max_gap",
                "formula": "architectural_proof_field",
                "inputs": {"series": series, "field": "maxGap"},
                "expected": architectural["maxGap"],
            },
            {
                "id": "architectural_revenue_idx1",
                "formula": "architectural_proof_field",
                "inputs": {"series": series, "field": "revenue", "index": 1},
                "expected": architectural["revenue"][1],
            },
            {
                "id": "methodological_mid_index",
                "formula": "methodological_proof_field",
                "inputs": {"series": series, "field": "midIndex"},
                "expected": methodological["midIndex"],
                "tolerance": 0.0,
            },
            {
                "id": "methodological_diff_idx2",
                "formula": "methodological_proof_field",
                "inputs": {"series": series, "field": "diffPct", "index": 2},
                "expected": methodological["diffPct"][2],
            },
            {
                "id": "solution_saved_value_idx3",
                "formula": "solution_proof_field",
                "inputs": {"series": series, "field": "savedValue", "index": 3},
                "expected": solution["savedValue"][3],
            },
            {
                "id": "solution_shadow_price_idx1",
                "formula": "solution_proof_field",
                "inputs": {"series": series, "field": "staticShadowPrice", "index": 1},
                "expected": solution["staticShadowPrice"][1],
            },
            {
                "id": "sensitivity_burn_step_idx3",
                "formula": "sensitivity_step_value",
                "inputs": {"kind": "burn_step", "index": 3, "steps": 5},
                "expected": calculate_burn_pct_step(3, 5),
            },
            {
                "id": "sensitivity_mint_step_idx2",
                "formula": "sensitivity_step_value",
                "inputs": {"kind": "mint_step", "index": 2, "steps": 5, "minMint": 1_000_000.0, "maxMint": 10_000_000.0},
                "expected": calculate_mint_step(2, 5, 1_000_000.0, 10_000_000.0),
            },
            {
                "id": "sensitivity_display_row0",
                "formula": "sensitivity_step_value",
                "inputs": {"kind": "display_row_mint", "row": 0, "steps": 5, "minMint": 1_000_000.0, "maxMint": 10_000_000.0},
                "expected": calculate_display_mint_for_row(0, 5, 1_000_000.0, 10_000_000.0),
            },
            {
                "id": "sensitivity_band_red",
                "formula": "sensitivity_band_code",
                "inputs": {"score": 35.0},
                "expected": sensitivity_band_code(35.0),
                "tolerance": 0.0,
            },
            {
                "id": "sensitivity_band_yellow",
                "formula": "sensitivity_band_code",
                "inputs": {"score": 65.0},
                "expected": sensitivity_band_code(65.0),
                "tolerance": 0.0,
            },
            {
                "id": "sensitivity_band_green",
                "formula": "sensitivity_band_code",
                "inputs": {"score": 90.0},
                "expected": sensitivity_band_code(90.0),
                "tolerance": 0.0,
            },
            {
                "id": "sweep_grid_cell_6_burn",
                "formula": "sweep_grid_field",
                "inputs": {"xSteps": 5, "ySteps": 5, "minMint": 1_000_000.0, "maxMint": 10_000_000.0, "index": 6, "field": "burnPct"},
                "expected": sweep_grid[6]["burnPct"],
            },
            {
                "id": "sweep_grid_cell_6_mint",
                "formula": "sweep_grid_field",
                "inputs": {"xSteps": 5, "ySteps": 5, "minMint": 1_000_000.0, "maxMint": 10_000_000.0, "index": 6, "field": "maxMintWeekly"},
                "expected": sweep_grid[6]["maxMintWeekly"],
            },

            # Decision tree
            {
                "id": "wizard_resilience_score",
                "formula": "wizard_metric_field",
                "inputs": {"series": series, "hardwareCost": 1000.0, "field": "resilienceScore"},
                "expected": wizard["resilienceScore"],
            },
            {
                "id": "wizard_avg_churn_rate",
                "formula": "wizard_metric_field",
                "inputs": {"series": series, "hardwareCost": 1000.0, "field": "avgChurnRate"},
                "expected": wizard["avgChurnRate"],
            },
            {
                "id": "risk_tail_score",
                "formula": "risk_metric_field",
                "inputs": {"series": series, "field": "tailRiskScore"},
                "expected": risk["tailRiskScore"],
            },
            {
                "id": "risk_p10_floor_ratio",
                "formula": "risk_metric_field",
                "inputs": {"series": series, "field": "p10FloorRatio"},
                "expected": risk["p10FloorRatio"],
            },
            {
                "id": "miner_chart_payback_idx1",
                "formula": "miner_chart_field",
                "inputs": {"series": series, "hardwareCost": 1000.0, "index": 1, "field": "actualPayback"},
                "expected": miner_chart[1]["actualPayback"],
            },
            {
                "id": "miner_chart_churn_idx2",
                "formula": "miner_chart_field",
                "inputs": {"series": series, "hardwareCost": 1000.0, "index": 2, "field": "churnRatePct"},
                "expected": miner_chart[2]["churnRatePct"],
            },
            {
                "id": "utility_summary_health_score",
                "formula": "utility_summary_field",
                "inputs": {"series": series, "field": "utilityHealthScore"},
                "expected": utility_summary["utilityHealthScore"],
            },
            {
                "id": "utility_summary_pro_share",
                "formula": "utility_summary_field",
                "inputs": {"series": series, "field": "proShare"},
                "expected": utility_summary["proShare"],
            },
            {
                "id": "financial_weeks_to_empty",
                "formula": "financial_summary_field",
                "inputs": {"points": sample_treasury_points(), "field": "weeksToEmpty"},
                "expected": financial_summary["weeksToEmpty"],
            },
            {
                "id": "financial_net_flow_quality",
                "formula": "financial_summary_field",
                "inputs": {"points": sample_treasury_points(), "field": "netFlowQuality"},
                "expected": financial_summary["netFlowQuality"],
            },

            # Benchmark
            {
                "id": "benchmark_safe_percent_delta",
                "formula": "benchmark_safe_percent_delta",
                "inputs": {"a": 5000.0, "b": 4000.0},
                "expected": benchmark_percent_delta["delta"],
            },
            {
                "id": "benchmark_safe_percent_is_valid",
                "formula": "benchmark_safe_percent_is_valid",
                "inputs": {"a": 5000.0, "b": 4000.0},
                "expected": 1.0 if benchmark_percent_delta["is_valid"] else 0.0,
                "tolerance": 0.0,
            },
            {
                "id": "benchmark_safe_absolute_delta",
                "formula": "benchmark_safe_absolute_delta",
                "inputs": {"a": 10.0, "b": 7.0},
                "expected": benchmark_abs_delta["delta"],
            },
            {
                "id": "benchmark_safe_absolute_is_valid",
                "formula": "benchmark_safe_absolute_is_valid",
                "inputs": {"a": 10.0, "b": 7.0},
                "expected": 1.0 if benchmark_abs_delta["is_valid"] else 0.0,
                "tolerance": 0.0,
            },
            {
                "id": "benchmark_annual_growth_yoy",
                "formula": "benchmark_annual_growth_yoy",
                "inputs": {"startNodes": 1000.0, "endNodes": 5000.0, "weeks": 52.0},
                "expected": benchmark_growth,
            },
            {
                "id": "benchmark_annualized_revenue_live",
                "formula": "benchmark_annualized_revenue",
                "inputs": {"hasLiveRevenue": True, "liveRevenueUsd7d": 1000.0, "demandServedMean": 0.0, "servicePriceMean": 0.0},
                "expected": benchmark_revenue_live,
            },
            {
                "id": "benchmark_annualized_revenue_sim",
                "formula": "benchmark_annualized_revenue",
                "inputs": {"hasLiveRevenue": False, "liveRevenueUsd7d": 0.0, "demandServedMean": 200.0, "servicePriceMean": 0.5},
                "expected": benchmark_revenue_sim,
            },
            {
                "id": "benchmark_weekly_burn_live",
                "formula": "benchmark_weekly_burn",
                "inputs": {"hasLiveBurn": True, "liveBurn7d": 250.0, "simulatedBurn": 100.0},
                "expected": benchmark_burn,
            },
            {
                "id": "benchmark_sustainability_ratio_pct",
                "formula": "benchmark_sustainability_ratio_pct",
                "inputs": {"mintedTokens": 1000.0, "simulationPrice": 0.5, "burnAmount": 500.0, "burnPrice": 0.5},
                "expected": benchmark_sustain,
            },
            {
                "id": "benchmark_revenue_per_node",
                "formula": "benchmark_revenue_per_node",
                "inputs": {"annualizedRevenue": 52000.0, "activeNodes": 5000.0},
                "expected": benchmark_revenue_per_node,
            },
            {
                "id": "benchmark_hardware_roi_pct",
                "formula": "benchmark_hardware_roi_pct",
                "inputs": {"revenuePerNode": benchmark_revenue_per_node, "hardwareCost": 150.0},
                "expected": benchmark_roi,
            },
            {
                "id": "benchmark_payback_months",
                "formula": "benchmark_payback_months",
                "inputs": {"hardwareCost": 150.0, "annualizedRevenue": 52000.0, "activeNodes": 5000.0},
                "expected": benchmark_payback,
            },
            {
                "id": "benchmark_normalize_payback_months",
                "formula": "benchmark_normalize_payback_months",
                "inputs": {"paybackMonths": benchmark_payback},
                "expected": benchmark_payback_normalized,
            },
            {
                "id": "benchmark_retention_fallback",
                "formula": "benchmark_retention_fallback",
                "inputs": {"finalProviders": 900.0, "peakProviders": 1000.0},
                "expected": benchmark_retention_fallback,
            },
            {
                "id": "benchmark_weekly_retention_estimate",
                "formula": "benchmark_weekly_retention_estimate",
                "inputs": {"retentionPoints": benchmark_retention_points, "fallback": benchmark_retention_fallback},
                "expected": benchmark_retention,
            },
            {
                "id": "benchmark_demand_coverage_pct",
                "formula": "benchmark_demand_coverage_pct",
                "inputs": {"demand": 1000.0, "demandServed": 850.0},
                "expected": benchmark_coverage,
            },
            {
                "id": "benchmark_efficiency_score",
                "formula": "benchmark_efficiency_score",
                "inputs": {"utilization": 82.0, "demandCoverage": 85.0, "previousUtilization": 80.0},
                "expected": benchmark_efficiency,
            },
            {
                "id": "benchmark_normalize_sustainability_ratio",
                "formula": "benchmark_normalize_sustainability_ratio",
                "inputs": {"sustainabilityRatioPct": benchmark_sustain},
                "expected": benchmark_sustainability_normalized,
            },
            {
                "id": "benchmark_payback_score",
                "formula": "benchmark_payback_score",
                "inputs": {"paybackMonths": benchmark_payback_normalized},
                "expected": benchmark_payback_score,
            },
            {
                "id": "benchmark_smoothed_solvency_index",
                "formula": "benchmark_smoothed_solvency_index",
                "inputs": {"series": benchmark_solvency_series, "index": 2},
                "expected": benchmark_smoothed_index,
            },
        ],
        "sequence_cases": [
            {
                "id": "binary_search_history_default",
                "formula": "binary_search_history",
                "inputs": {"low": 0.0, "high": 100.0, "root": 5.0, "iterations": 10},
                "expected": history,
            },
            {
                "id": "survival_curve_points_grass",
                "formula": "survival_curve_points",
                "inputs": {"points": [0.1, 0.2, 0.5, 0.8], "capex": 0.0, "sensitivity": 20.0},
                "expected": [calculate_survival_rate(p, 0.0, 20.0) for p in [0.1, 0.2, 0.5, 0.8]],
            },
            {
                "id": "survival_curve_points_onocoy",
                "formula": "survival_curve_points",
                "inputs": {"points": [0.2, 0.5, 0.8], "capex": 500.0, "sensitivity": 1.0},
                "expected": [calculate_survival_rate(p, 500.0, 1.0) for p in [0.2, 0.5, 0.8]],
            },
            {
                "id": "subsidy_fixed_emissions_series",
                "formula": "subsidy_series",
                "inputs": {**diag_fragile, "years": 5, "series": "emissions"},
                "expected": subsidy_fixed["emissions"],
                "tolerance": 0.0,
            },
            {
                "id": "density_uncoord_earnings_series",
                "formula": "density_series",
                "inputs": {"growthCoordination": "Uncoordinated", "series": "earnings"},
                "expected": density_uncoord["earnings"],
            },
            {
                "id": "strategic_pro_share_series",
                "formula": "strategic_proof_series",
                "inputs": {"series": series, "field": "proShare"},
                "expected": strategic["proShare"],
            },
            {
                "id": "architectural_deficit_series",
                "formula": "architectural_proof_series",
                "inputs": {"series": series, "field": "deficit"},
                "expected": architectural["deficit"],
            },
            {
                "id": "methodological_excel_forecast_series",
                "formula": "methodological_proof_series",
                "inputs": {"series": series, "field": "excelForecast"},
                "expected": methodological["excelForecast"],
            },
            {
                "id": "solution_saved_value_series",
                "formula": "solution_proof_series",
                "inputs": {"series": series, "field": "savedValue"},
                "expected": solution["savedValue"],
            },
            {
                "id": "sweep_grid_burn_series",
                "formula": "sweep_grid_series",
                "inputs": {"xSteps": 5, "ySteps": 5, "minMint": 1_000_000.0, "maxMint": 10_000_000.0, "field": "burnPct"},
                "expected": [point["burnPct"] for point in sweep_grid],
            },
            {
                "id": "benchmark_smoothed_solvency_series",
                "formula": "benchmark_smoothed_solvency_series",
                "inputs": {"series": benchmark_solvency_series, "indexes": [0, 1, 2, 3]},
                "expected": benchmark_smoothed_series,
            },
        ],
    }
    return payload


def main() -> None:
    payload = generate_payload()

    script_dir = Path(__file__).resolve().parent
    out_path = script_dir.parent / "fixtures" / "math_golden_vectors.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")

    print(f"Wrote golden vectors: {out_path}")
    print(f"Scalar cases: {len(payload['scalar_cases'])}")
    print(f"Sequence cases: {len(payload['sequence_cases'])}")


if __name__ == "__main__":
    main()
