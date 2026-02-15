
import json
import os

nb_path = "notebooks/Solvency_Math_Audit.ipynb"

with open(nb_path, "r") as f:
    nb = json.load(f)

new_cells = [
   {
    "cell_type": "markdown",
    "metadata": {},
    "source": [
     "## 7. Subsidy Trap Audit ($R_{BE}$)\n",
     "\n",
     "This section derives and validates the Break-Even Ratio ($R_{BE}$). This metric predicts the precise point of 'Death Spiral' where token incentives fail to cover hardware costs.\n",
     "\n",
     "$$ R_{BE} = \\frac{P_{token} \\cdot E_{mission}}{C_{provider}} $$\n",
     "\n",
     "If $R_{BE} < 1.0$, the node is underwater."
    ]
   },
   {
    "cell_type": "code",
    "execution_count": None,
    "metadata": {},
    "outputs": [],
    "source": [
     "def calculate_r_be(token_price, emission, cost):\n",
     "    return (token_price * emission) / cost\n",
     "\n",
     "def audit_subsidy_trap():\n",
     "    print(\"--- SUBSIDY TRAP AUDIT ---\")\n",
     "    cost = 10.0\n",
     "    emission = 100.0\n",
     "    # Break-Even Price = $0.10\n",
     "    \n",
     "    prices = [0.20, 0.10, 0.05]\n",
     "    print(f\"{'Price':<10} | {'R_BE':<10} | {'Status'}\")\n",
     "    print(\"-\" * 40)\n",
     "    \n",
     "    for p in prices:\n",
     "        r_be = calculate_r_be(p, emission, cost)\n",
     "        status = \"SOLVENT\" if r_be >= 1.0 else \"INSOLVENT\"\n",
     "        print(f\"${p:<9.2f} | {r_be:<10.2f} | {status}\")\n",
     "\n",
     "audit_subsidy_trap()"
    ]
   }
]

nb["cells"].extend(new_cells)

with open(nb_path, "w") as f:
    json.dump(nb, f, indent=1)
    
print("Notebook updated successfully.")
