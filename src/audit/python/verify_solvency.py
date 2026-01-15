import math
import random

# ==========================================
# CONSTANTS (ONOCOY Profile + Defaults)
# ==========================================
T_WEEKS = 52
INITIAL_SUPPLY = 410_000_000
INITIAL_PRICE = 3.0
INITIAL_LIQUIDITY = 50000
INITIAL_PROVIDERS = 3000

# Emissions / Tokenomics
MAX_MINT_WEEKLY = 5_000_000
BURN_FRACTION = 0.65  # 65% of revenue burned

# Demand Logic
BASE_DEMAND = 12000
DEMAND_TYPE = 'growth' # Onocoy default
DEMAND_VOLATILITY = 0.05

# Pricing / Market
K_DEMAND_PRICE = 0.15
K_MINT_PRICE = 0.35
K_BUY_PRESSURE = 0.08
K_SELL_PRESSURE = 0.12

# Provider Logic
BASE_CAPACITY_PER_PROVIDER = 180.0
PROVIDER_COST_PER_WEEK = 30.0

# ==========================================
# HELPER FUNCTIONS (Replicating TS Logic)
# ==========================================

def generate_demand(t, rng_seed):
    # Replicates generateDemandSeries logic roughly
    # In TS: const noise = 1 + (rng.normal() * volatility);
    # In TS: demand = baseDemand * noise;
    # If type == 'growth': demand *= (1 + 0.02)^t
    
    random.seed(rng_seed + t) # Deterministic per step per seed
    noise = 1 + (random.gauss(0, 1) * DEMAND_VOLATILITY)
    
    demand = BASE_DEMAND * noise
    
    if DEMAND_TYPE == 'growth':
         demand *= (1.02 ** t)
         
    return max(0, demand)

def calculate_buy_pressure(demand_served, service_price, token_price):
    usd_spent = demand_served * service_price
    return usd_spent / max(token_price, 0.0001)

def run_python_simulation():
    # State Initialization
    token_supply = INITIAL_SUPPLY
    token_price = INITIAL_PRICE
    service_price = 0.5 # baseServicePrice
    
    # Simple Provider Pool (just count)
    active_providers = INITIAL_PROVIDERS
    
    # Liquidity Pool
    pool_usd = INITIAL_LIQUIDITY
    pool_tokens = pool_usd / token_price
    k_amm = pool_usd * pool_tokens
    
    print(f"{'Week':<5} | {'Price':<8} | {'Mint ($)':<12} | {'Burn ($)':<12} | {'Solvency':<8}")
    print("-" * 60)

    for t in range(T_WEEKS):
        # 1. Demand & Service
        demand = generate_demand(t, 42)
        total_capacity = max(1, active_providers * BASE_CAPACITY_PER_PROVIDER)
        demand_served = min(demand, total_capacity)
        scarcity = (demand - total_capacity) / total_capacity
        
        # Service Price Update
        # servicePrice * (1 + elasticity * scarcity)
        elasticity = 0.6 
        service_price = min(5.0, max(0.05, service_price * (1 + elasticity * scarcity)))
        
        # 2. Token Flows
        # Buy Pressure (Micro)
        buy_pressure_micro = calculate_buy_pressure(demand_served, service_price, token_price)
        buy_pressure_macro = buy_pressure_micro # Scaling factor 1 for now
        
        # Burn
        tokens_spent = buy_pressure_macro
        burned_macro = min(token_supply * 0.95, BURN_FRACTION * tokens_spent)
        
        # 3. Emissions
        # Saturation Logic
        # TS: saturation = Math.min(1.0, scaledProviderCount / 300000.0)
        saturation = min(1.0, active_providers / 300000.0)
        
        # Emission Factor
        # TS: 0.6 + 0.4 * Math.tanh(scaledDemand / 15000.0) - 0.2 * saturation
        emission_factor = 0.6 + 0.4 * math.tanh(demand / 15000.0) - 0.2 * saturation
        
        minted_macro = max(0, min(MAX_MINT_WEEKLY, MAX_MINT_WEEKLY * emission_factor))
        
        # 4. Solvency Score Calculation
        # TS: ((burnedMacro / 7) * tokenPrice) / (((mintedMacro / 7) * tokenPrice) || 1)
        daily_burn_usd = (burned_macro / 7) * token_price
        daily_mint_usd = (minted_macro / 7) * token_price
        
        solvency_score = daily_burn_usd / max(daily_mint_usd, 1.0)
        
        # Print Week 52 (or all for debug)
        if t == T_WEEKS - 1:
             print(f"{t:<5} | ${token_price:<7.2f} | ${daily_mint_usd:<11.2f} | ${daily_burn_usd:<11.2f} | {solvency_score:.4f}")

        # 5. Price Update (Simplified AMM + Organic)
        # Using simple organic logic from TS 'utility' scenario usually
        net_flow_tokens = buy_pressure_macro - burned_macro # Simplified
        
        # In TS comparison, we need to mimic the 'bearish' macro default if we want exact match
        # But Solvency Score itself is a derived metric. 
        # For verification, we just want to ensure the FORMULA produces the expected output given inputs.
        
        # We update price simply to keep the loop moving
        # token_price = token_price # Assuming stable for simple math check? 
        # No, price changes affect the USD value.
        
        # Let's apply a simple price update to keep it dynamic
        token_price = token_price * 0.99 # Slight bearish decay as per default macro

if __name__ == "__main__":
    run_python_simulation()
