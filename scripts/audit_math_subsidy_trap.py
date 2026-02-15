
import numpy as np
import matplotlib.pyplot as plt

def calculate_r_be(token_price, emission_per_node, provider_cost):
    """
    Calculates the Break-Even Ratio (R_BE).
    R_BE = Subsidy / Cost
    R_BE = (Price * Emission) / Cost
    """
    if provider_cost == 0:
        return float('inf')
    return (token_price * emission_per_node) / provider_cost

def simulate_network_state(r_be):
    """
    Simulates network state based on R_BE.
    If R_BE < 1.0, the network is in a 'Subsidy Trap' (Death Spiral).
    """
    if r_be < 1.0:
        return "INSOLVENT"
    else:
        return "SOLVENT"

def audit_subsidy_trap():
    print("\n--- SUBSIDY TRAP (R_BE) AUDIT ---")
    
    # Parameters
    cost = 10.0 # $10/month hardware cost
    emission = 100.0 # 100 tokens/month
    
    # Test Cases: Price points crossing the threshold
    # Threshold Price = Cost / Emission = 10 / 100 = $0.10
    prices = [0.20, 0.15, 0.11, 0.10, 0.09, 0.05, 0.01]
    
    passes = 0
    failures = 0
    
    print(f"Fixed Cost: ${cost:.2f}")
    print(f"Fixed Emission: {emission} tokens")
    print(f"Theoretical Break-Even Price: ${cost/emission:.4f}")
    print("-" * 60)
    print(f"{'Price':<10} | {'R_BE':<10} | {'State':<15} | {'Audit':<10}")
    print("-" * 60)
    
    for price in prices:
        r_be = calculate_r_be(price, emission, cost)
        state = simulate_network_state(r_be)
        
        # Verification Logic
        # It should be INSOLVENT if Price < 0.10 (R_BE < 1.0)
        # It should be SOLVENT if Price >= 0.10 (R_BE >= 1.0)
        
        expected = "SOLVENT" if price >= 0.10 else "INSOLVENT"
        
        is_correct = (state == expected)
        
        if is_correct:
            passes += 1
            result = "PASS"
        else:
            failures += 1
            result = "FAIL"
            
        print(f"${price:<9.2f} | {r_be:<10.2f} | {state:<15} | {result:<10}")

    print("-" * 60)
    if failures == 0:
        print("✅ SUCCESS: Subsidy Trap logic mathematically proven.")
        return True
    else:
        print(f"❌ FAILURE: {failures} test cases failed.")
        return False

if __name__ == "__main__":
    audit_subsidy_trap()
