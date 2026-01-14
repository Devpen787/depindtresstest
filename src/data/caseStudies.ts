export interface CaseStudy {
    id: string;
    meta: {
        title: string;
        subtitle: string;
        color: string; // Tailwind base color name (e.g. 'indigo', 'cyan', 'emerald')
        ticker: string;
        icon: string; // 'database' | 'wifi' | 'map' etc
    };
    narrative: {
        introTitle: string;
        introText: string;
        mechanismTitle: string;
        mechanismText: string;
        steps: Array<{
            title: string;
            desc: string;
            icon: string;
            color: string;
        }>;
        conclusionText: string;
    };
    charts: {
        stability: Array<{ month: string, coupled: number, speculative: number }>;
        solvency: Array<{ score: number, label: string }>; // Flattened 4x4 grid
        payback: Array<{ scenario: string, months: number, fill: string }>;
        radar: Array<{ subject: string, A: number, B: number, fullMark: number }>;
    };
}

export const CASE_STUDIES: CaseStudy[] = [
    {
        id: 'onocoy',
        meta: {
            title: 'Onocoy ($ONO)',
            subtitle: 'Engineering sustainability through stress-tested incentives, burn-and-mint equilibria, and demand coupling.',
            color: 'indigo',
            ticker: '$ONO',
            icon: 'database'
        },
        narrative: {
            introTitle: 'The Sustainability Crisis',
            introText: 'Decentralized Physical Infrastructure Networks (DePIN) face a critical challenge: balancing token emissions to incentivize hardware deployment while preventing hyper-inflation. Preliminary findings from the Onocoy ($ONO) stress-test dashboard indicate that coupling rewards to verifiable demand is the single most effective lever for long-term viability. Without it, networks risk a "death spiral" of selling pressure.',
            mechanismTitle: 'The "Burn-and-Mint" Equilibrium',
            mechanismText: 'A sustainable economy anchors token value in real-world utility. In this model, tokens are not just printed; they are minted in response to verified network usage, creating a circular economy.',
            steps: [
                { title: 'Hardware Deployed', desc: 'Miners set up nodes (e.g., GNSS stations) to build physical coverage.', icon: 'database', color: 'indigo' },
                { title: 'Verified Usage', desc: 'Data is consumed. Smart contracts cryptographically verify service quality.', icon: 'check', color: 'orange' },
                { title: 'Burn & Mint', desc: 'Fees burn tokens. New tokens mint *only* to match verified demand.', icon: 'flame', color: 'emerald' }
            ],
            conclusionText: 'The future of DePIN on Solana relies on moving from speculative growth to utility-driven value. By rigorously stress-testing payback periods and coupling emissions to verifiable demand, networks can withstand market volatility and ensure long-term solvency.'
        },
        charts: {
            stability: [
                { month: 'M0', coupled: 1.0, speculative: 1.0 },
                { month: 'M6', coupled: 1.2, speculative: 1.8 },
                { month: 'M12', coupled: 1.5, speculative: 2.5 },
                { month: 'M18', coupled: 1.8, speculative: 1.2 },
                { month: 'M24', coupled: 2.2, speculative: 0.8 },
                { month: 'M30', coupled: 2.7, speculative: 0.6 },
                { month: 'M36', coupled: 3.5, speculative: 0.5 },
            ],
            solvency: [
                // Row 1: Max Emissions
                { score: 10, label: 'Danger' }, { score: 25, label: 'Risk' }, { score: 40, label: 'Warning' }, { score: 55, label: 'Warning' },
                // Row 2: High Emissions
                { score: 20, label: 'Risk' }, { score: 45, label: 'Warning' }, { score: 65, label: 'Healthy' }, { score: 80, label: 'Good' },
                // Row 3: Med Emissions
                { score: 40, label: 'Warning' }, { score: 70, label: 'Healthy' }, { score: 85, label: 'Good' }, { score: 95, label: 'Secure' },
                // Row 4: Low Emissions
                { score: 60, label: 'Healthy' }, { score: 85, label: 'Good' }, { score: 95, label: 'Secure' }, { score: 100, label: 'Secure' },
            ],
            payback: [
                { scenario: 'Optimistic', months: 9, fill: '#10b981' }, // Green
                { scenario: 'Balanced', months: 14, fill: '#f59e0b' }, // Amber
                { scenario: 'Stressed (Crash)', months: 42, fill: '#ef4444' }, // Red
            ],
            radar: [
                { subject: 'Vampire Resist', A: 85, B: 40, fullMark: 100 },
                { subject: 'Crash Survival', A: 90, B: 35, fullMark: 100 },
                { subject: 'Retention', A: 88, B: 45, fullMark: 100 },
                { subject: 'Inflation Ctrl', A: 92, B: 30, fullMark: 100 },
                { subject: 'Liquidity', A: 75, B: 50, fullMark: 100 },
            ]
        }
    },
    {
        id: 'helium_iot',
        meta: {
            title: 'Helium IoT (Assessment)',
            subtitle: 'Analyzing the shift from maximal coverage incentives to usage-based sub-DAO economics.',
            color: 'cyan',
            ticker: '$IOT',
            icon: 'wifi'
        },
        narrative: {
            introTitle: 'The Saturation Challenge',
            introText: 'Helium IoT faces a different challenge: market saturation. With over 900k hotspots, the primary stressor is no longer coverage bootstrap but maintaining miner profitability amidst diminishing rewards and low data transfer fees.',
            mechanismTitle: 'Sub-DAO Treasury Model',
            mechanismText: 'The transition to Helium 5G and IOT sub-DAOs introduces a treasury swap mechanic. Usage revenue dictates the treasury size, directly impacting the token value floor.',
            steps: [
                { title: 'Coverage Saturation', desc: 'Network reaches density threshold. Proof-of-Coverage rewards decay.', icon: 'wifi', color: 'cyan' },
                { title: 'Data Transfer', desc: 'IoT sensors transmit small packets. DC credits burn to pay fees.', icon: 'up-down', color: 'sky' },
                { title: 'Treasury Swap', desc: 'Usage fees flow to sub-DAO treasury, supporting the token floor price.', icon: 'wallet', color: 'green' }
            ],
            conclusionText: 'Helium demonstrates that aggressive early inflation works for bootstrapping, but the pivot to a demand-driven treasury model is essential for survival post-saturation.'
        },
        charts: {
            stability: [
                { month: 'M0', coupled: 1.0, speculative: 1.0 },
                { month: 'M6', coupled: 0.9, speculative: 3.5 }, // Peak hype
                { month: 'M12', coupled: 0.95, speculative: 2.0 },
                { month: 'M18', coupled: 1.1, speculative: 0.8 }, // Crash
                { month: 'M24', coupled: 1.3, speculative: 0.6 },
                { month: 'M30', coupled: 1.5, speculative: 0.5 },
                { month: 'M36', coupled: 1.8, speculative: 0.4 },
            ],
            solvency: [
                // Slightly different profile: High Emissions are riskier here due to saturation
                { score: 5, label: 'Danger' }, { score: 15, label: 'Danger' }, { score: 30, label: 'Warning' }, { score: 50, label: 'Warning' },
                { score: 10, label: 'Danger' }, { score: 35, label: 'Warning' }, { score: 60, label: 'Healthy' }, { score: 75, label: 'Good' },
                { score: 30, label: 'Warning' }, { score: 65, label: 'Healthy' }, { score: 80, label: 'Good' }, { score: 90, label: 'Secure' },
                { score: 55, label: 'Warning' }, { score: 80, label: 'Good' }, { score: 90, label: 'Secure' }, { score: 100, label: 'Secure' },
            ],
            payback: [
                { scenario: 'Hype Phase', months: 3, fill: '#10b981' },
                { scenario: 'Mature Phase', months: 24, fill: '#f59e0b' },
                { scenario: 'Bear Market', months: 65, fill: '#ef4444' },
            ],
            radar: [
                { subject: 'Vampire Resist', A: 95, B: 40, fullMark: 100 }, // High stickiness due to specialized hardware
                { subject: 'Crash Survival', A: 80, B: 35, fullMark: 100 },
                { subject: 'Retention', A: 90, B: 45, fullMark: 100 }, // Sunk cost fallacy high
                { subject: 'Inflation Ctrl', A: 70, B: 30, fullMark: 100 }, // Halvings help
                { subject: 'Liquidity', A: 85, B: 50, fullMark: 100 },
            ]
        }
    },
    {
        id: 'hivemapper',
        meta: {
            title: 'Hivemapper ($HONEY)',
            subtitle: 'Combating data decay through a Net Emissions Model (Burn & Recycle) for perpetual map freshness.',
            color: 'amber',
            ticker: '$HONEY',
            icon: 'map'
        },
        narrative: {
            introTitle: 'The Freshness Dilemma',
            introText: 'Unlike wireless coverage (Helium), map data decays rapidly. A road mapped today is useless next month if construction changes it. The stress test for Hivemapper is not just coverage, but *re-mapping frequency*.',
            mechanismTitle: 'Net Emissions (Burn & Recycle)',
            mechanismText: 'Hivemapper fights inflation with a circular economy. Instead of infinite minting, 75% of tokens burned by data customers are re-minted to rewarding contributors. This creates a non-inflationary incentive loop.',
            steps: [
                { title: 'Drive & Map', desc: 'Drivers unintentionally collect imagery via dashcams. Passive income for verified routes.', icon: 'car', color: 'amber' },
                { title: 'QA Consensus', desc: 'AI and human reviewers verify imagery quality. Fraud detection is critical.', icon: 'layers', color: 'purple' },
                { title: 'Burn & Recycle', desc: 'Customers burn HONEY for data. Tokens are recycled to drivers, stabilizing supply.', icon: 'refresh-cw', color: 'orange' }
            ],
            conclusionText: 'Hivemapper proves that for high-decay assets like maps, a standard "halving" model fails. The Net Emissions model ensures that as long as there is demand for fresh data, there is budget for rewards—without debasing the currency.'
        },
        charts: {
            stability: [
                { month: 'M0', coupled: 1.0, speculative: 1.0 },
                { month: 'M6', coupled: 1.1, speculative: 1.5 },
                { month: 'M12', coupled: 1.3, speculative: 3.0 }, // Speculative pump
                { month: 'M18', coupled: 1.4, speculative: 1.0 }, // Crash
                { month: 'M24', coupled: 1.6, speculative: 0.8 },
                { month: 'M30', coupled: 2.1, speculative: 0.6 },
                { month: 'M36', coupled: 2.8, speculative: 0.5 },
            ],
            solvency: [
                // Risky at low usage because re-mapping is expensive
                { score: 5, label: 'Danger' }, { score: 10, label: 'Danger' }, { score: 25, label: 'Risk' }, { score: 45, label: 'Warning' },
                { score: 15, label: 'Danger' }, { score: 35, label: 'Warning' }, { score: 55, label: 'Warning' }, { score: 75, label: 'Good' },
                { score: 45, label: 'Warning' }, { score: 65, label: 'Healthy' }, { score: 85, label: 'Good' }, { score: 95, label: 'Secure' },
                { score: 70, label: 'Healthy' }, { score: 90, label: 'Secure' }, { score: 100, label: 'Secure' }, { score: 100, label: 'Secure' },
            ],
            payback: [
                { scenario: 'High Demand Area', months: 4, fill: '#10b981' },
                { scenario: 'Rural/Low Demand', months: 18, fill: '#f59e0b' },
                { scenario: 'Hardware Cost Only', months: 3, fill: '#6366f1' },
            ],
            radar: [
                { subject: 'Vampire Resist', A: 70, B: 40, fullMark: 100 }, // Generic clones possible but hardware stickiness
                { subject: 'Crash Survival', A: 85, B: 35, fullMark: 100 }, // Burn/Recycle works in bear market
                { subject: 'Retention', A: 60, B: 45, fullMark: 100 }, // Active driving is harder than passive wifi
                { subject: 'Inflation Ctrl', A: 95, B: 30, fullMark: 100 }, // Net Emissions is strictly deflationary
                { subject: 'Liquidity', A: 80, B: 50, fullMark: 100 },
            ]
        }
    },
    {
        id: 'render',
        meta: {
            title: 'Render Network ($RNDR)',
            subtitle: 'The Burn-Mint Equilibrium (BME) standard for decentralized compute markets.',
            color: 'rose',
            ticker: '$RNDR',
            icon: 'box'
        },
        narrative: {
            introTitle: 'The BME Standard',
            introText: 'Render Network pioneered the Burn-Mint Equilibrium (BME) model. It treats the token not as a stock, but as a commodity credit. By engaging the BME, Render creates a "Synthetic Ceiling" on supply that is mathematically enforced by the dollar-value of rendering jobs.',
            mechanismTitle: 'Synthetic Supply Ceiling',
            mechanismText: 'Users pay in USD (via Credits). The system buys $RNDR from the open market and burns it. This buy-pressure is perfectly correlated with network usage.',
            steps: [
                { title: 'Job Submission', desc: 'Creators upload scenes. Price estimated in USD. Credits purchased.', icon: 'box', color: 'rose' },
                { title: 'Batch Rendering', desc: 'Idle GPUs worldwide process frames. Proof-of-Render verifies output.', icon: 'cpu', color: 'violet' },
                { title: 'BME Execution', desc: 'Credits = Burn. Tokens minted to node operators. Net deflation if Usage > Emissions.', icon: 'flame', color: 'red' }
            ],
            conclusionText: 'Render proves that DePIN can decouple from crypto market cycles. By denominating value in work-units (frames rendered), the token price reflects the growth of the 3D industry, not just Bitcoin correlation.'
        },
        charts: {
            stability: [
                { month: 'M0', coupled: 1.0, speculative: 1.0 },
                { month: 'M6', coupled: 1.05, speculative: 2.0 },
                { month: 'M12', coupled: 1.1, speculative: 1.5 },
                { month: 'M18', coupled: 1.2, speculative: 0.8 },
                { month: 'M24', coupled: 1.4, speculative: 0.7 },
                { month: 'M30', coupled: 1.8, speculative: 0.6 },
                { month: 'M36', coupled: 2.5, speculative: 0.5 },
            ],
            solvency: [
                // BME is very robust. Even at low usage, it just stops burning. No death spiral.
                { score: 40, label: 'Warning' }, { score: 50, label: 'Warning' }, { score: 70, label: 'Healthy' }, { score: 85, label: 'Good' },
                { score: 50, label: 'Warning' }, { score: 65, label: 'Healthy' }, { score: 80, label: 'Good' }, { score: 90, label: 'Secure' },
                { score: 60, label: 'Healthy' }, { score: 80, label: 'Good' }, { score: 95, label: 'Secure' }, { score: 100, label: 'Secure' },
                { score: 80, label: 'Good' }, { score: 95, label: 'Secure' }, { score: 100, label: 'Secure' }, { score: 100, label: 'Secure' },
            ],
            payback: [
                { scenario: 'RTX 4090', months: 10, fill: '#10b981' },
                { scenario: 'Mid-Tier GPU', months: 14, fill: '#f59e0b' },
                { scenario: 'Elec. Cost Only', months: 2, fill: '#6366f1' },
            ],
            radar: [
                { subject: 'Vampire Resist', A: 90, B: 40, fullMark: 100 }, // High moat (software integration)
                { subject: 'Crash Survival', A: 95, B: 35, fullMark: 100 }, // BME is best-in-class for stability
                { subject: 'Retention', A: 85, B: 45, fullMark: 100 },
                { subject: 'Inflation Ctrl', A: 90, B: 30, fullMark: 100 },
                { subject: 'Liquidity', A: 95, B: 50, fullMark: 100 },
            ]
        }
    },
    {
        id: 'ionet',
        meta: {
            title: 'io.net ($IO)',
            subtitle: 'The "Incentive Dynamic Engine" (IDE) - Algorithmic supply coupling for AI compute clusters.',
            color: 'sky',
            ticker: '$IO',
            icon: 'brain'
        },
        narrative: {
            introTitle: 'The Idle Compute Arbitrage',
            introText: 'io.net aggregates 1M+ GPUs from independent datacenters and crypto miners into "clusters" for AI/ML training. The challenge: Unlike mapping or wifi, AI demand is bursty. Static inflation kills token price during lulls.',
            mechanismTitle: 'Incentive Dynamic Engine (IDE)',
            mechanismText: 'A programmatic supply regulator. It monitors the "Sustainability Ratio" (Network Revenue / Block Rewards). If revenue drops, emissions throttle down. If revenue spikes, the protocol initiates buy-and-burn.',
            steps: [
                { title: 'Cluster Formation', desc: 'GPUs are grouped into clusters. Renters deploy containers on the cluster.', icon: 'layers', color: 'blue' },
                { title: 'Dynamic Rewards', desc: 'Emissions are NOT fixed. They fluctuate based on the "Sustainability Ratio".', icon: 'zap', color: 'yellow' },
                { title: 'Programmatic Burn', desc: 'Network revenue automatically buys and burns $IO, enforcing deflation.', icon: 'flame', color: 'red' }
            ],
            conclusionText: 'io.net represents the "Gen 3" DePIN model: Algorithmic Central Banking. Instead of relying on governance to adjust rewards (too slow), the code automatically re-prices supply based on millisecond-level demand signals.'
        },
        charts: {
            stability: [
                { month: 'M0', coupled: 1.0, speculative: 1.0 },
                { month: 'M6', coupled: 1.2, speculative: 4.0 }, // Massive AI Hype
                { month: 'M12', coupled: 1.5, speculative: 2.0 }, // Correction
                { month: 'M18', coupled: 1.8, speculative: 1.5 }, // Stabilization via IDE
                { month: 'M24', coupled: 2.5, speculative: 1.4 },
                { month: 'M30', coupled: 3.5, speculative: 1.2 },
                { month: 'M36', coupled: 5.0, speculative: 1.0 },
            ],
            solvency: [
                // IDE prevents the red zone effectively by cutting emissions
                { score: 30, label: 'Warning' }, { score: 60, label: 'Healthy' }, { score: 80, label: 'Good' }, { score: 90, label: 'Secure' },
                { score: 40, label: 'Warning' }, { score: 65, label: 'Healthy' }, { score: 85, label: 'Good' }, { score: 95, label: 'Secure' },
                { score: 55, label: 'Warning' }, { score: 75, label: 'Good' }, { score: 90, label: 'Secure' }, { score: 100, label: 'Secure' },
                { score: 70, label: 'Healthy' }, { score: 85, label: 'Good' }, { score: 95, label: 'Secure' }, { score: 100, label: 'Secure' },
            ],
            payback: [
                { scenario: 'H100 (AI)', months: 6, fill: '#10b981' },
                { scenario: 'RTX 4090 (Render)', months: 14, fill: '#f59e0b' },
                { scenario: 'M2 Mac (Inf.)', months: 22, fill: '#6366f1' },
            ],
            radar: [
                { subject: 'Vampire Resist', A: 60, B: 40, fullMark: 100 }, // Aggregators are forkable
                { subject: 'Crash Survival', A: 85, B: 35, fullMark: 100 }, // IDE protects well
                { subject: 'Retention', A: 75, B: 45, fullMark: 100 },
                { subject: 'Inflation Ctrl', A: 95, B: 30, fullMark: 100 }, // Best in class
                { subject: 'Liquidity', A: 90, B: 50, fullMark: 100 },
            ]
        }
    },
    {
        id: 'shdw',
        meta: {
            title: 'Shdw Drive ($SHDW)',
            subtitle: 'The Storage Utility - Fixed supply staking and "Audit-based" rewards for permanent data.',
            color: 'slate',
            ticker: '$SHDW',
            icon: 'hard-drive'
        },
        narrative: {
            introTitle: 'The Hard Drive of Solana',
            introText: 'Shdw Drive creates decentralized object storage on bare metal servers. Unlike IPFS (which is ephemeral), Shdw guarantees permanence via "Proof of Storage" audits. The tokenomics are unique: Fixed Supply + Utility Staking.',
            mechanismTitle: 'Utility-Based Staking',
            mechanismText: 'Operators must stake $SHDW to host data. Users pay in $SHDW. This locks huge portions of supply as network usage grows, creating a "Supply Shock" rather than an emission spiral.',
            steps: [
                { title: 'Stake to Store', desc: 'Operators stake collateral. Slashing risks ensure high uptime and performance.', icon: 'lock', color: 'slate' },
                { title: 'Auditable Storage', desc: 'Proof-of-Storage constantly challenges nodes. "Show me the data or get slashed."', icon: 'hard-drive', color: 'blue' },
                { title: 'Supply Shock', desc: 'Fixed Max Supply. As data grows -> Staked Collateral grows -> Circulating Supply shrinks.', icon: 'trending-down', color: 'green' }
            ],
            conclusionText: 'Shdw Drive proves the "Utility Sink" thesis. Instead of minting tokens to subsidize storage, it forces providers to BUY and LOCK tokens to access the revenue stream. A true supply-shock model.'
        },
        charts: {
            stability: [
                { month: 'M0', coupled: 1.0, speculative: 1.0 },
                { month: 'M6', coupled: 1.0, speculative: 1.2 },
                { month: 'M12', coupled: 1.1, speculative: 1.1 },
                { month: 'M18', coupled: 1.3, speculative: 1.0 },
                { month: 'M24', coupled: 1.8, speculative: 0.9 }, // Storage demand kicks in
                { month: 'M30', coupled: 2.5, speculative: 0.9 },
                { month: 'M36', coupled: 4.0, speculative: 0.9 }, // Supply shock effect
            ],
            solvency: [
                { score: 50, label: 'Warning' }, { score: 60, label: 'Healthy' }, { score: 80, label: 'Good' }, { score: 90, label: 'Secure' },
                { score: 60, label: 'Healthy' }, { score: 70, label: 'Healthy' }, { score: 85, label: 'Good' }, { score: 95, label: 'Secure' },
                { score: 70, label: 'Healthy' }, { score: 85, label: 'Good' }, { score: 95, label: 'Secure' }, { score: 100, label: 'Secure' },
                { score: 80, label: 'Good' }, { score: 90, label: 'Secure' }, { score: 100, label: 'Secure' }, { score: 100, label: 'Secure' },
            ],
            payback: [
                { scenario: 'Enterprise Node', months: 8, fill: '#10b981' },
                { scenario: 'Home Server', months: 16, fill: '#64748b' },
                { scenario: 'Elec. Cost Only', months: 4, fill: '#ef4444' },
            ],
            radar: [
                { subject: 'Vampire Resist', A: 95, B: 40, fullMark: 100 }, // Hard to migrate petabytes of data
                { subject: 'Crash Survival', A: 90, B: 35, fullMark: 100 }, // Fixed supply, no inflation pressure
                { subject: 'Retention', A: 95, B: 45, fullMark: 100 }, // Data gravity is real
                { subject: 'Inflation Ctrl', A: 100, B: 30, fullMark: 100 }, // NO INFLATION
                { subject: 'Liquidity', A: 60, B: 50, fullMark: 100 }, // Supply shock might hurt liquidity
            ]
        }
    }
];
