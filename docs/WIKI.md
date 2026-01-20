# DePIN Stress Test Simulator - Wiki

> A comprehensive stress-testing framework for Decentralized Physical Infrastructure Network (DePIN) tokenomics

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [User Guide](#user-guide)
4. [Modules Reference](#modules-reference)
5. [Benchmark Reference](#benchmark-reference)
6. [Diagnostic Reference](#diagnostic-reference)
7. [Chart Index](#chart-index)
8. [Parameters Reference](#parameters-reference)
9. [Calculations & Formulas](#calculations--formulas)
10. [Glossary](#glossary)

---

## Getting Started

### What is this tool?

The DePIN Stress Test Simulator is an interactive dashboard that stress-tests DePIN protocol tokenomics against adverse market conditions. It answers the critical question:

> **"Will this protocol survive a bear market, or will it enter a death spiral?"**

### Who is this for?

| User Type | Use Case |
|-----------|----------|
| **Thesis Defenders** | Demonstrate protocol resilience for academic work |
| **Protocol Researchers** | Compare tokenomics across multiple DePIN protocols |
| **Investors** | Identify risk factors before investment decisions |
| **Developers** | Understand and extend the simulation models |

### Quick Start

1. **Select a Tab**:
   - **Simulator**: Full sandbox with all controls and sub-views
   - **Benchmark**: Peer-based scorecards and scenario comparisons
   - **Thesis**: Simplified view with 4 key charts
   - **Diagnostic**: Engineering audit of structural fragility
   - **Case Study**: Narrative walkthroughs and curated reports

2. **Choose a Protocol or Peer Set**: Select a profile in the sidebar (Simulator) or a peer group in Benchmark

3. **Adjust Stress Parameters**: Use the sidebar sliders (Simulator) or the scenario manager (Benchmark)

4. **Click "Run Matrix"**: Run the simulation when you're in the Simulator tab

5. **Scroll through Modules**: Each module tests a specific failure mode

---

## Core Concepts

### The Death Spiral

A death spiral occurs when falling token prices trigger miner churn, which reduces network capacity, which reduces demand, which further crashes the token price.

```
Token Price Falls
      ↓
Miner Rewards Drop (USD value)
      ↓
ROI Becomes Unattractive
      ↓
Miners Shut Down Hardware
      ↓
Network Capacity Drops
      ↓
Service Quality Degrades
      ↓
Demand Decreases
      ↓
Token Price Falls Further
      ↓
(Repeat until collapse)
```

### The Solvency Ratio

The most important metric. It measures whether the protocol is "in the red" or "in the black":

```
Solvency Ratio = Daily Burn (USD) / Daily Mint (USD)
```

| Value | Interpretation |
|-------|----------------|
| > 1.0 | **Healthy**: More value burned than minted |
| 0.5 - 1.0 | **Caution**: Approaching sustainability issues |
| < 0.5 | **Critical**: Heavy inflation, possible death spiral |

### Monte Carlo Simulation

Instead of running one scenario, we run 100+ simulations with random variations to understand the range of possible outcomes. Results show:

- **Mean** (solid line): Average outcome
- **p10/p90** (shaded area): 80% of outcomes fall within this band

---

## User Guide

### Views Explained

#### Simulator View
The full sandbox with all controls and modules. Three sub-views:

| View | Purpose |
|------|---------|
| **Explorer** | Browse and compare protocol profiles |
| **Comparison** | Side-by-side multi-protocol analysis |
| **Sandbox** | Deep-dive single-protocol stress testing |

#### Benchmark View
A peer-based benchmarking console with two tabs:
- **Dashboard**: Key metrics, peer matrices, radar scores, and sensitivity levers
- **Research**: Monte Carlo evidence and empirical backtesting overlays

Best for: **Due diligence, head-to-head scoring**

#### Thesis View
A simplified dashboard focused on the narrative. Contains 4 key charts:
- The Capitulation Curve
- Solvency Mechanics
- The Vanity Trap
- Geospatial Resilience

Best for: **Presentations, thesis defense**

#### Diagnostic View
An engineering audit of structural insolvency. Stress responses are shown under fixed assumptions.
- Signals of Death scorecard
- Failure mode charts (Subsidy Trap, Density Trap, Hex Degradation)
- Strategic action recommendations

Best for: **Risk audits and protocol engineering**

#### Case Study View
Curated reports that explain *why* a design works, with narrative structure.

### Sidebar Controls

#### Scenarios & Stress
Control external market conditions:

| Control | What it does |
|---------|--------------|
| **Macro Condition** | Bearish (-1%/week), Neutral, Bullish (+1.5%/week) |
| **Demand Type** | How demand grows: Linear, Exponential, Seasonal, Shock |
| **Time Horizon** | How many weeks to simulate (default: 52) |

#### Competitive Resilience (Module 4)
Test competitive and treasury dynamics:

| Control | What it does |
|---------|--------------|
| **Competitor Yield** | Simulates a competitor offering higher APY (0-200%) |
| **Emission Model** | Fixed schedule vs KPI-based (demand-responsive) |
| **Revenue Strategy** | Buy & Burn vs Sinking Fund (treasury building) |

#### Provider Economics
Hardware and operational costs:

| Control | What it does |
|---------|--------------|
| **Hardware Cost** | CAPEX per miner ($400-$5000) |
| **Weekly OpEx** | Electricity, maintenance costs |
| **Churn Threshold** | Profit level below which miners leave |

#### Simulation
Monte Carlo settings:

| Control | What it does |
|---------|--------------|
| **Monte Carlo Runs** | Number of simulations (20-500) |
| **Random Seed** | Fixed seed for reproducible results |

### Header Buttons

| Button | What it does |
|--------|--------------|
| **Run Matrix** | Execute simulation with current parameters |
| **Methodology** | Opens detailed methodology documentation |
| **Settings** | Advanced configuration options |
| **Export** | Download data as JSON/CSV |
| **Math Spec** | View all mathematical formulas |
| **System Wiki** | Open in-app documentation and tutorials |
| **V1/V2** | Toggle between legacy and new simulation model |
| **Fetch Live** | Pull real-time token prices from CoinGecko |
| **DePIN** | Browse all DePIN tokens |

---

## Modules Reference

### Module 1: The Solvency Test

**Question**: Is the protocol burning more value than it mints?

**Key Chart**: Cumulative Network Subsidy
- Shows accumulated inflation debt
- Rising line = unsustainable inflation

**Key Metrics**:
- Solvency Score (Burn/Mint ratio)
- Net Daily Loss

**Red Flags**:
- Solvency Score < 0.5 for sustained period
- Cumulative subsidy growing exponentially

---

### Module 2: The Capitulation Test

**Question**: Are miners profitable enough to stay?

**Key Chart**: Urban vs Rural Miner Count
- Tracks miner populations separately
- Rural miners have higher costs, churn first

**Key Metrics**:
- Payback Period (Hardware Cost / Monthly Earnings)
- Churn Rate

**Red Flags**:
- Payback Period > 24 months
- Rural miners dropping > 15%/week

---

### Module 3: The Liquidity Shock

**Question**: Can the protocol survive a token dump?

**Key Chart**: Price Impact from Investor Unlock
- Shows price trajectory around unlock events
- Uses AMM constant product formula

**Key Metrics**:
- Liquidity depth
- Price slippage percentage

**Red Flags**:
- Price drops > 50% on unlock
- Panic churn triggers after shock

---

### Module 4: The Vampire & Reserve Test

**Question**: Can competitors steal your miners? Is your treasury strategy sound?

**Key Chart**: Treasury Health & Vampire Churn
- Dual-axis: Treasury balance + Competitor-induced churn

**Key Metrics**:
- Competitor Threat Level (LOW/MODERATE/CRITICAL)
- Treasury Balance
- Strategy comparison (Burn vs Reserve)

**Red Flags**:
- Competitor yield > 100% → Critical threat
- No reserves + bear market → Price crashes hard

---

## Benchmark Reference

### Dashboard Tab

**Key Metrics Cards**:
- **Payback Period**: Hardware cost divided by monthly revenue per node
- **Coverage Efficiency**: Coverage score normalized to %
- **Sustainability Ratio**: Burn / Mint ratio in x
- **Retention (Weekly)**: Modeled node retention baseline

**Charts & Panels**:
- **Health Metrics Bar Chart**: Onocoy vs peer median for the four core metrics
- **Solvency Projection (24 Months)**: Scenario runway with baseline and critical thresholds
- **Comparative Matrix**: Head-to-head deltas across standardized metrics
- **Strategic Edge Radar**: Tech Stack, Solvency, Coverage, Community, Ease of Use
- **Sensitivity Summary**: Ranked sustainability levers by impact
- **AI Insights**: Scenario narrative + recommendation
- **Export Data**: CSV download of benchmark metrics

### Research Tab
- **Empirical Resilience Scorecard**: Backtest vs historical stress events
- **Monte Carlo Cone**: Mean + P05/P95 for Price, Nodes, or Revenue
- **Scenario Mapping**: Bear/Neutral/Bull/Hyper selected from active parameters

### Data Notes
- Uses simulated outputs; anchored with live and on-chain data when available
- Scenario pill + engine label shown in the header

---

## Diagnostic Reference

### Inputs (Archetype Controls)
- **Miner Profile**: Professional vs Mercenary
- **Emission Schedule**: Fixed vs Dynamic
- **Growth Coordination**: Managed vs Uncoordinated
- **Demand Lag**: Low vs High
- **Price Shock**: None / Moderate / Severe
- **Insider Overhang**: Low vs High

### Scorecard Metrics
- **R_BE**: Burn-to-Emission Ratio
- **NRR**: Node Retention Rate
- **CPV**: CapEx Payback Velocity (months)
- **LUR**: Liquidity Utilization Rate
- **GovScore**: Governance coordination score
- **Resilience Score** + **Verdict**: Robust / Fragile / Zombie / Insolvent

### Charts & Panels
- **Signals of Death**: Latent Capacity Degradation, Validation Overhead, Equilibrium Gap, Churn Elasticity
- **Subsidy Trap**: Emissions vs burn with LUR indicator
- **Density Trap**: ROI decay under uncoordinated growth
- **Hex Degradation Map**: Profitable vs Zombie vs Latent nodes
- **Strategic Actions**: Recommended engineering interventions

---

## Chart Index

### Simulator: Explorer
- **7d Trend Sparkline**: 7-day price series (CoinGecko sparkline)
- **Table Columns**: Rank, Protocol, Price, 24h Change, Market Cap, Risk Level, Payback Period, Stress Score

### Simulator: Comparison
- **Comparative Metrics Heatmap**: Token Price (End), Inflation (APY), Max Drawdown, Active Nodes (End), Churn Rate, Utilization, Monthly Earnings, Payback Period, Real Rev / Emissions

### Simulator: Sandbox
- **Solvency Ratio**: Burn/Mint ratio
- **Weekly Retention Rate**: provider retention %
- **Urban vs Rural Density**: node counts by cohort
- **Payback Period**: months to recoup hardware cost
- **Network Coverage Score**: weighted coverage score
- **Effective Capacity**: capacity vs demand served
- **Geo Coverage View**: total nodes plus rural/urban/balanced distribution
- **Quality Distribution**: Pro vs Basic node counts
- **Supply Trajectory**: total token supply over time
- **Network Utilization**: demand/capacity %
- **Scenario Comparison Panel**: Welch t-test on selected metric (mean, p-value, effect size)
- **Verified Flywheel**: nodes, utilization %, monthly revenue, incentive %

### Benchmark: Dashboard
- **Key Metric Cards**: Payback Period, Coverage Efficiency, Sustainability Ratio, Retention (Weekly)
- **Health Metrics Bar Chart**: normalized Payback, Efficiency, Sustainability, Retention scores
- **Solvency Projection**: Solvency Index over time plus runway status
- **Comparative Matrix**: Payback, Coverage Efficiency, Sustain Ratio, Retention
- **Strategic Edge Radar**: Tech Stack, Solvency, Coverage, Community, Ease of Use
- **Sensitivity Summary**: impact score per lever

### Benchmark: Research
- **Empirical Resilience Scorecard**: normalized simulation price/nodes vs historical price/nodes
- **Monte Carlo Cone**: mean plus P05/P95 for Price, Nodes, or Revenue

### Thesis
- **Network Stability**: token price vs active nodes
- **Grid Composition**: urban vs rural node counts
- **Protocol Health (Reserves)**: treasury value (or burn proxy)
- **Miner ROI Status**: payback months on a 0-36 month scale

### Diagnostic
- **Signals of Death**: Latent Capacity Degradation, Validation Overhead, Equilibrium Gap, Churn Elasticity
- **Subsidy Trap**: emissions vs burn plus LUR
- **Density Trap**: individual ROI decay
- **Hex Degradation Map**: node status mix (profitable/zombie/latent)

### Case Study
- **Projected Token Value**: coupled vs speculative price paths
- **Solvency Matrix**: emissions vs usage grid (solvency score)
- **Payback Scenarios**: months to ROI
- **Resilience Radar**: risk vector scores

---

## Parameters Reference

### Input Parameters

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| `T` | number | 12-260 | 52 | Simulation weeks |
| `initialSupply` | number | 1M-1B | - | Token supply at start |
| `initialPrice` | number | 0.001-100 | - | Token price in USD |
| `maxMintWeekly` | number | 1K-10M | - | Max tokens minted per week |
| `burnPct` | number | 0-1 | - | % of spending burned |
| `macro` | enum | bearish/neutral/bullish | bearish | Market condition |
| `demandType` | enum | linear/exp/seasonal/shock | - | Demand growth pattern |
| `nSims` | number | 20-500 | 100 | Monte Carlo runs |
| `hardwareCost` | number | 100-10000 | 800 | Miner hardware cost USD |
| `providerCostPerWeek` | number | 1-100 | - | Weekly operating cost |
| `competitorYield` | number | 0-2 | 0 | Competitor yield advantage |
| `emissionModel` | enum | fixed/kpi | fixed | Emission schedule type |
| `revenueStrategy` | enum | burn/reserve | burn | Revenue allocation |

### Output Metrics

| Metric | Formula | Healthy Range |
|--------|---------|---------------|
| `solvencyScore` | `dailyBurnUsd / dailyMintUsd` | > 1.0 |
| `paybackMonths` | `hardwareCost / (weeklyReward * 4.33)` | < 18 |
| `utilization` | `demandServed / capacity * 100` | 60-85% |
| `incentive` | `(reward - opex) / opex` | > 0.2 |
| `treasuryBalance` | Cumulative 10% of emissions | Growing |

---

## Calculations & Formulas

### Price Dynamics

```
logReturn = μ + demandPressure + dilutionPressure + σ * noise

where:
  μ = base drift (-0.01 bearish, +0.015 bullish)
  demandPressure = k_demand * tanh(scarcity)
  dilutionPressure = -k_mint * (minted / supply) * 100
  σ = volatility (0.05-0.06)
```

### Churn Logic

```
baseChurn = 0.02 (2% natural)

if profit < churnThreshold for 2 weeks:
  churnMultiplier = 1.8
if profit < churnThreshold for 5 weeks:
  churnMultiplier = 4.0

vampireChurn = providers * competitorYield * 0.025

if paybackMonths > 24:
  roiChurn += providers * 0.0125
if paybackMonths > 36:
  roiChurn += providers * 0.025

totalChurn = (baseChurn * churnMultiplier) + vampireChurn + roiChurn
```

### Emissions (KPI-Based)

```
baseEmissionFactor = 0.6 + 0.4 * tanh(demand / 15000) - 0.2 * saturation

if emissionModel == 'kpi':
  emissionFactor *= max(0.3, utilizationRatio)
  if price < initialPrice * 0.8:
    emissionFactor *= 0.6  // 40% cut in bear market

minted = min(maxMintWeekly, maxMintWeekly * emissionFactor)
```

### Sinking Fund

```
if revenueStrategy == 'reserve':
  treasuryBalance += minted * price * 0.10  // 10% to reserve
  
  if nextPrice < currentPrice:
    priceDrop = currentPrice - nextPrice
    nextPrice = currentPrice - (priceDrop * 0.5)  // 50% dampening
else:
  nextPrice *= 1.001  // 0.1% burn bonus
```

### Liquidity Shock (AMM)

```
k = poolUsd * poolTokens  // Constant product

// On unlock event:
unlockAmount = supply * investorSellPct
newPoolTokens = poolTokens + unlockAmount
newPoolUsd = k / newPoolTokens
priceImpact = 1 - (newPoolUsd / newPoolTokens) / currentPrice
```

---

## Glossary

| Term | Definition |
|------|------------|
| **BME** | Burn-Mint Equilibrium - sustainable state where burning equals minting |
| **Capitulation** | When miners give up due to unprofitability |
| **Death Spiral** | Self-reinforcing loop of price crashes and miner churn |
| **DePIN** | Decentralized Physical Infrastructure Network |
| **KPI-Based Emissions** | Token minting scaled to actual network usage |
| **Monte Carlo** | Statistical simulation running many random scenarios |
| **Payback Period** | Time to recoup hardware investment |
| **Sinking Fund** | Treasury reserve for market stabilization |
| **Solvency Ratio** | Burn/Mint ratio; >1 is healthy |
| **Vampire Attack** | Competitor attracting your providers with higher yields |

---

*Last updated: 2026-01-20*
