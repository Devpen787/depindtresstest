# DePIN Stress Test Simulator - Wiki

> A comprehensive stress-testing framework for Decentralized Physical Infrastructure Network (DePIN) tokenomics

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [User Guide](#user-guide)
4. [Modules Reference](#modules-reference)
5. [Parameters Reference](#parameters-reference)
6. [Calculations & Formulas](#calculations--formulas)
7. [Glossary](#glossary)

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
   - **Thesis**: Simplified view with 4 key charts
   - **Simulator**: Full sandbox with all controls

2. **Choose a Protocol**: Click a profile card in the sidebar

3. **Adjust Stress Parameters**: Use the sidebar sliders

4. **Click "Run Matrix"**: Watch the simulation play out

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

#### Thesis View
A simplified dashboard focused on the narrative. Contains 4 key charts:
- The Capitulation Curve
- Solvency Mechanics
- The Vanity Trap
- Geospatial Resilience

Best for: **Presentations, thesis defense**

#### Simulator View
The full sandbox with all controls and modules. Three sub-views:

| View | Purpose |
|------|---------|
| **Explorer** | Browse and compare protocol profiles |
| **Comparison** | Side-by-side multi-protocol analysis |
| **Sandbox** | Deep-dive single-protocol stress testing |

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
| **Audit** | Calibration verification panel |
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

*Last updated: 2026-01-10*
