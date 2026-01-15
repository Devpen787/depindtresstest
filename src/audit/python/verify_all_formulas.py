"""
Full Dashboard Math Verification Script
Verifies all key formulas from simulation.ts

Run: python3 src/audit/python/verify_all_formulas.py
"""

import math

# ============================================================================
# MODULE 1: SOLVENCY METRICS
# ============================================================================

def verify_solvency_score(burned_macro: float, minted_macro: float, token_price: float) -> dict:
    """
    TypeScript: solvencyScore: ((burnedMacro / 7) * tokenPrice) / (((mintedMacro / 7) * tokenPrice) || 1) * (mintedMacro > 0 ? 1 : 10)
    
    This is the "Burn-and-Mint Equilibrium" ratio.
    - Solvency > 1.0 = Deflationary (burns exceed emissions)
    - Solvency < 1.0 = Inflationary (emissions exceed burns)
    """
    daily_burn_usd = (burned_macro / 7) * token_price
    daily_mint_usd = (minted_macro / 7) * token_price
    
    # Avoid division by zero
    if daily_mint_usd == 0:
        multiplier = 10 if minted_macro > 0 else 10
        solvency = (daily_burn_usd / 1) * multiplier
    else:
        multiplier = 1 if minted_macro > 0 else 10
        solvency = (daily_burn_usd / daily_mint_usd) * multiplier
    
    net_daily_loss = daily_burn_usd - daily_mint_usd
    
    return {
        'solvency_score': solvency,
        'daily_burn_usd': daily_burn_usd,
        'daily_mint_usd': daily_mint_usd,
        'net_daily_loss': net_daily_loss,
        'status': 'DEFLATIONARY' if solvency > 1 else 'INFLATIONARY'
    }

# ============================================================================
# MODULE 2: CAPITULATION METRICS
# ============================================================================

def verify_churn_decision(
    weekly_reward: float,
    operational_cost: float,
    consecutive_loss_weeks: int,
    patience_weeks: int
) -> dict:
    """
    TypeScript: Provider churns when consecutiveLossWeeks > patienceWeeks
    Loss defined as: weeklyReward < operationalCost
    """
    is_profitable = weekly_reward >= operational_cost
    profit = weekly_reward - operational_cost
    
    # Update consecutive loss tracking
    if is_profitable:
        new_consecutive_loss = 0
    else:
        new_consecutive_loss = consecutive_loss_weeks + 1
    
    will_churn = new_consecutive_loss > patience_weeks
    
    return {
        'is_profitable': is_profitable,
        'profit': profit,
        'consecutive_loss_weeks': new_consecutive_loss,
        'will_churn': will_churn,
        'reason': 'PROFITABLE' if is_profitable else f'LOSS_WEEK_{new_consecutive_loss}'
    }

# ============================================================================
# MODULE 3: LIQUIDITY/PRICE IMPACT
# ============================================================================

def verify_price_update(
    token_price: float,
    buy_pressure: float,
    sell_pressure: float,
    demand_growth_rate: float,
    minted: float,
    burned: float,
    supply: float,
    mu: float = 0.0,
    sigma: float = 0.05,
    k_demand: float = 0.1,
    k_mint_price: float = 0.3,
    k_burn_price: float = 0.2,
    random_shock: float = 0.0
) -> dict:
    """
    TypeScript price update formula (simplified):
    logReturn = mu + buyPressure - sellPressure + demandPressure + dilution + deflation + noise
    nextPrice = price * exp(clamp(logReturn, -1, 1))
    """
    # Pressure effects
    buy_effect = 0.01 * math.log1p(buy_pressure) if buy_pressure > 0 else 0
    sell_effect = -0.01 * math.log1p(sell_pressure) if sell_pressure > 0 else 0
    
    # Demand pressure
    demand_pressure = k_demand * demand_growth_rate
    
    # Dilution from minting
    dilution = -k_mint_price * (minted / max(supply, 1))
    
    # Deflation from burning
    deflation = k_burn_price * (burned / max(supply, 1))
    
    # Total log return
    log_return = mu + buy_effect + sell_effect + demand_pressure + dilution + deflation + sigma * random_shock
    
    # Circuit breaker clamp
    clamped_log_return = max(-1.0, min(1.0, log_return))
    
    next_price = max(0.0001, token_price * math.exp(clamped_log_return))
    
    # Safety cap
    if next_price > 1_000_000:
        next_price = 1_000_000
    
    return {
        'log_return': log_return,
        'clamped_log_return': clamped_log_return,
        'next_price': next_price,
        'price_change_pct': (next_price - token_price) / token_price * 100,
        'components': {
            'buy_effect': buy_effect,
            'sell_effect': sell_effect,
            'demand_pressure': demand_pressure,
            'dilution': dilution,
            'deflation': deflation
        }
    }

# ============================================================================
# MODULE 4: TREASURY/VAMPIRE METRICS
# ============================================================================

def verify_vampire_churn(
    our_yield: float,
    competitor_yield: float,
    base_churn_rate: float = 0.01
) -> dict:
    """
    TypeScript: Providers leave if competitor offers better yield
    vampireChurn = churnRate * (competitorYield / ourYield - 1) when competitor > our
    """
    yield_ratio = competitor_yield / max(our_yield, 0.001)
    
    if yield_ratio > 1.0:
        # Competitor is better - accelerated churn
        churn_multiplier = yield_ratio - 1.0
        effective_churn = base_churn_rate * (1 + churn_multiplier)
    else:
        effective_churn = base_churn_rate
    
    return {
        'yield_ratio': yield_ratio,
        'effective_churn_rate': effective_churn,
        'vampire_threat': 'HIGH' if yield_ratio > 2.0 else 'MODERATE' if yield_ratio > 1.0 else 'LOW'
    }

def verify_treasury_strategy(
    burned_tokens: float,
    token_price: float,
    strategy: str,
    current_treasury: float = 0
) -> dict:
    """
    TypeScript: 
    - 'reserve': treasuryTokens += burnedMacro (accumulates)
    - 'burn': tokens are destroyed (no accumulation)
    """
    if strategy == 'reserve':
        new_treasury = current_treasury + burned_tokens
        treasury_value = new_treasury * token_price
    else:
        new_treasury = 0
        treasury_value = 0
    
    return {
        'strategy': strategy,
        'new_treasury_tokens': new_treasury,
        'treasury_value_usd': treasury_value,
        'defensive_runway_weeks': new_treasury / max(burned_tokens, 1) if burned_tokens > 0 else float('inf')
    }

# ============================================================================
# TEST RUNNER
# ============================================================================

def run_all_tests():
    print("=" * 60)
    print("FULL DASHBOARD MATH VERIFICATION")
    print("=" * 60)
    
    # Test 1: Solvency
    print("\n[M1] SOLVENCY SCORE TEST")
    result = verify_solvency_score(
        burned_macro=100000,
        minted_macro=150000,
        token_price=3.0
    )
    print(f"  Burned: 100K tokens, Minted: 150K tokens, Price: $3.00")
    print(f"  Solvency Score: {result['solvency_score']:.4f}")
    print(f"  Status: {result['status']}")
    print(f"  Daily Burn USD: ${result['daily_burn_usd']:.2f}")
    print(f"  Daily Mint USD: ${result['daily_mint_usd']:.2f}")
    assert 0.5 < result['solvency_score'] < 0.8, "Solvency should be ~0.67"
    print("  ✅ PASS")
    
    # Test 2: Churn Decision
    print("\n[M2] CHURN DECISION TEST")
    result = verify_churn_decision(
        weekly_reward=20,
        operational_cost=30,
        consecutive_loss_weeks=3,
        patience_weeks=4
    )
    print(f"  Reward: $20, OpEx: $30, Loss Weeks: 3, Patience: 4")
    print(f"  Will Churn: {result['will_churn']}")
    print(f"  Reason: {result['reason']}")
    assert result['will_churn'] == False, "Should not churn yet"
    print("  ✅ PASS")
    
    # Test 3: Price Update
    print("\n[M3] PRICE UPDATE TEST")
    result = verify_price_update(
        token_price=3.0,
        buy_pressure=50000,
        sell_pressure=100000,
        demand_growth_rate=0.01,
        minted=150000,
        burned=100000,
        supply=400_000_000
    )
    print(f"  Current Price: $3.00")
    print(f"  Buy/Sell Pressure: 50K/100K")
    print(f"  Next Price: ${result['next_price']:.4f}")
    print(f"  Change: {result['price_change_pct']:.2f}%")
    assert result['next_price'] < 3.0, "Price should decrease with more selling"
    print("  ✅ PASS")
    
    # Test 4: Vampire Churn
    print("\n[M4] VAMPIRE CHURN TEST")
    result = verify_vampire_churn(
        our_yield=100,
        competitor_yield=200
    )
    print(f"  Our Yield: $100, Competitor: $200")
    print(f"  Yield Ratio: {result['yield_ratio']:.2f}x")
    print(f"  Vampire Threat: {result['vampire_threat']}")
    assert result['vampire_threat'] == 'MODERATE', "Should be moderate threat"
    print("  ✅ PASS")
    
    # Test 5: Treasury Strategy
    print("\n[M4] TREASURY STRATEGY TEST")
    result = verify_treasury_strategy(
        burned_tokens=10000,
        token_price=3.0,
        strategy='reserve',
        current_treasury=50000
    )
    print(f"  Strategy: {result['strategy']}")
    print(f"  New Treasury: {result['new_treasury_tokens']:.0f} tokens")
    print(f"  Value: ${result['treasury_value_usd']:.2f}")
    assert result['new_treasury_tokens'] == 60000, "Should accumulate"
    print("  ✅ PASS")
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED ✅")
    print("=" * 60)

if __name__ == '__main__':
    run_all_tests()
