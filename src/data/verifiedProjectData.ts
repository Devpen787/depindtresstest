/**
 * Verified Project Data Reference
 * 
 * This file is the single source of truth for all DePIN project data
 * displayed in the Diagnostic tab. Every data point includes its source
 * and verification date.
 * 
 * IMPORTANT: Update this file when new verified data is available.
 * Mark unverified data with isVerified: false
 */

export interface VerifiedDataPoint {
    value: string;
    source: string;
    sourceUrl?: string;
    verifiedDate: string;
    isVerified: boolean;
}

export interface ProjectHardware {
    type: VerifiedDataPoint;
    priceRange: VerifiedDataPoint;
    specificModel?: VerifiedDataPoint;
}

export interface ProjectEmissions {
    token: VerifiedDataPoint;
    model: VerifiedDataPoint;
    rewardFactors?: VerifiedDataPoint;
}

export interface ProjectValidation {
    method: VerifiedDataPoint;
    description: VerifiedDataPoint;
}

export interface VerifiedProject {
    id: string;
    name: string;
    category: string;
    blockchain: VerifiedDataPoint;
    hardware: ProjectHardware;
    emissions: ProjectEmissions;
    validation: ProjectValidation;
    criticalFlaw?: string;
    riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
}

export const verifiedProjects: Record<string, VerifiedProject> = {
    'onocoy': {
        id: 'onocoy',
        name: 'Onocoy',
        category: 'GNSS Corrections',
        blockchain: {
            value: 'Solana',
            source: 'docs.onocoy.com',
            sourceUrl: 'https://docs.onocoy.com',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'GNSS Receiver + Antenna',
                source: 'docs.onocoy.com',
                sourceUrl: 'https://docs.onocoy.com/documentation/3.-become-a-miner/1.-get-a-station',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$250-900 (varies by tier)',
                source: 'gnss.store',
                sourceUrl: 'https://gnss.store/blogs/elt-rtk-base/tagged/2-choosing-a-gnss-base-station',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            specificModel: {
                value: 'Unicore UM980 (recommended), Septentrio Mosaic X5 (premium)',
                source: 'gnss.store',
                sourceUrl: 'https://gnss.store/blogs/elt-rtk-base/tagged/2-choosing-a-gnss-base-station',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'ONO',
                source: 'docs.onocoy.com',
                sourceUrl: 'https://docs.onocoy.com/documentation/tokenomics',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'Dynamic (quality-based)',
                source: 'docs.onocoy.com',
                sourceUrl: 'https://docs.onocoy.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            rewardFactors: {
                value: 'Quality, Uptime, Location, Usage',
                source: 'docs.onocoy.com',
                sourceUrl: 'https://docs.onocoy.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Decentralized Validator Network',
                source: 'docs.onocoy.com',
                sourceUrl: 'https://docs.onocoy.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'Detects fake/low-quality GNSS signals',
                source: 'docs.onocoy.com',
                sourceUrl: 'https://docs.onocoy.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        riskLevel: 'low'
    },

    'render': {
        id: 'render',
        name: 'Render',
        category: 'GPU Compute',
        blockchain: {
            value: 'Solana (migrated from Ethereum)',
            source: 'know.rendernetwork.com',
            sourceUrl: 'https://know.rendernetwork.com/general-render-network/what-role-am-i/how-to-get-started-1',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'CUDA-enabled NVIDIA GPU (6GB+ VRAM, 8GB preferred)',
                source: 'know.rendernetwork.com',
                sourceUrl: 'https://know.rendernetwork.com/general-render-network/what-role-am-i/how-to-get-started-1',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$500-2000+ (RTX 3050 minimum for Compute Network)',
                source: 'know.rendernetwork.com',
                sourceUrl: 'https://know.rendernetwork.com/general-render-network/what-role-am-i/how-to-get-started-1/render-compute-network-gpu-compute-node-waitlist-faq',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            specificModel: {
                value: 'Basic: 6GB VRAM + 32GB RAM. Compute: RTX 3050+ / 64GB RAM / 2TB SSD',
                source: 'know.rendernetwork.com',
                sourceUrl: 'https://know.rendernetwork.com/general-render-network/what-role-am-i/how-to-get-started-1/render-compute-network-gpu-compute-node-waitlist-faq',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'RENDER',
                source: 'know.rendernetwork.com',
                sourceUrl: 'https://know.rendernetwork.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'BME (Burn-Mint Equilibrium)',
                source: 'know.rendernetwork.com',
                sourceUrl: 'https://know.rendernetwork.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Proof of Render (Octane)',
                source: 'know.rendernetwork.com',
                sourceUrl: 'https://know.rendernetwork.com/general-render-network/what-role-am-i/how-to-get-started-1',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'Cryptographic work verification for GPU rendering jobs',
                source: 'know.rendernetwork.com',
                sourceUrl: 'https://know.rendernetwork.com/general-render-network/what-role-am-i/how-to-get-started-1',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'GPU Market Volatility',
        riskLevel: 'low'
    },

    'ionet': {
        id: 'ionet',
        name: 'io.net',
        category: 'GPU Compute',
        blockchain: {
            value: 'Solana',
            source: 'io.net docs',
            sourceUrl: 'https://io.net/docs/guides/coin/io-tokenomics',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'Consumer to Enterprise GPUs (RTX 3060 to H100/H200)',
                source: 'io.net docs',
                sourceUrl: 'https://io.net/docs/guides/block-rewards/proposed-device-block-reward-multiplier',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: 'Wide range: ~$300 (RTX 3060) to $30,000+ (H100). No fixed standard.',
                source: 'blocmates.com',
                sourceUrl: 'https://www.blocmates.com/articles/io-net-the-largest-decentralized-compute-network',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            specificModel: {
                value: 'Community Pool (5% rewards): RTX 3060-4090. Enterprise Pool (95% rewards): A100/A6000/H100/H200',
                source: 'io.net docs',
                sourceUrl: 'https://io.net/docs/guides/block-rewards/proposed-device-block-reward-multiplier',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: '$IO (800M cap, 500M at launch, 300M over 20 years)',
                source: 'io.net docs',
                sourceUrl: 'https://io.net/docs/guides/coin/io-tokenomics',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'Disinflationary: 8% Y1 inflation, ~1.02% monthly decrease',
                source: 'io.net docs',
                sourceUrl: 'https://io.net/docs/guides/coin/ionet-monthly-token-emission-schedule',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            rewardFactors: {
                value: 'Device multiplier × 200 $IO base stake per processor. H100=10x, RTX4070=0.25x',
                source: 'io.net docs',
                sourceUrl: 'https://io.net/docs/guides/block-rewards/proposed-device-block-reward-multiplier',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Staking + Performance Verification',
                source: 'io.net docs',
                sourceUrl: 'https://io.net/docs/guides/block-rewards/proposed-device-block-reward-multiplier',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: '320k+ registered GPUs, ~2,527 cluster-ready (Jan 2026). Collateral required.',
                source: 'explorer.io.net',
                sourceUrl: 'https://explorer.io.net/explorer/home',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'High staking requirements may limit participation',
        riskLevel: 'moderate'
    },

    'geodnet': {
        id: 'geodnet',
        name: 'Geodnet',
        category: 'GNSS Corrections',
        blockchain: {
            value: 'Polygon',
            source: 'docs.geodnet.com',
            sourceUrl: 'https://docs.geodnet.com',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'MobileCM Triple-Band GNSS Base Station (MGW200)',
                source: 'heliumdeploy.com',
                sourceUrl: 'https://heliumdeploy.com/products/geodnet-mobilecm-triple-band',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$690-695 USD (MobileCM base). MGW310 with ADS-B: €875-919. Geo-Pulse: $149',
                source: 'heliumdeploy.com, novyx.tech, moken.io',
                sourceUrl: 'https://moken.io/depins/geodnet/geodnet-mobilecm-triple-band',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            specificModel: {
                value: 'MobileCM (MGW200): $690-695. MGW310 (multi-platform): €875-919. Geo-Pulse receiver: $149',
                source: 'Multiple vendors (HeliumDeploy, Novyx, Depinhouse)',
                sourceUrl: 'https://heliumdeploy.com/products/geodnet-mobilecm-triple-band',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'GEOD',
                source: 'docs.geodnet.com',
                sourceUrl: 'https://docs.geodnet.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'Location-based rewards',
                source: 'docs.geodnet.com',
                sourceUrl: 'https://docs.geodnet.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Correction Streaming',
                source: 'docs.geodnet.com',
                sourceUrl: 'https://docs.geodnet.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'RTK accuracy for centimeter-level positioning',
                source: 'docs.geodnet.com',
                sourceUrl: 'https://docs.geodnet.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'Direct Onocoy Competition',
        riskLevel: 'low'
    },

    'hivemapper': {
        id: 'hivemapper',
        name: 'Hivemapper',
        category: 'Mapping',
        blockchain: {
            value: 'Solana',
            source: 'hivemapper.com',
            sourceUrl: 'https://hivemapper.com',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'Bee Dashcam (LTE+WiFi or WiFi-only)',
                source: 'shop.beemaps.com',
                sourceUrl: 'https://shop.beemaps.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$489 (WiFi) / $589 (LTE+WiFi)',
                source: 'shop.beemaps.com',
                sourceUrl: 'https://shop.beemaps.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            specificModel: {
                value: 'Bee Dashcam (replaced original Hivemapper Dashcam)',
                source: 'shop.beemaps.com',
                sourceUrl: 'https://shop.beemaps.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'HONEY',
                source: 'hivemapper.com',
                sourceUrl: 'https://hivemapper.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'BME (75% burn rate)',
                source: 'hivemapper.com',
                sourceUrl: 'https://hivemapper.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Map Coverage + Freshness',
                source: 'hivemapper.com',
                sourceUrl: 'https://hivemapper.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'AI verification of imagery quality',
                source: 'hivemapper.com',
                sourceUrl: 'https://hivemapper.com',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'Density Trap Vulnerability',
        riskLevel: 'high'
    },

    'grass': {
        id: 'grass',
        name: 'Grass',
        category: 'AI Data / Bandwidth',
        blockchain: {
            value: 'Solana',
            source: 'grass-foundation.gitbook.io',
            sourceUrl: 'https://grass-foundation.gitbook.io/grass-docs/architecture/grass-node',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'Desktop/Mobile App (Grass Node)',
                source: 'grass-foundation.gitbook.io',
                sourceUrl: 'https://grass-foundation.gitbook.io/grass-docs/architecture/grass-node',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$0 (Zero CapEx - free to run)',
                source: 'grass-foundation.gitbook.io',
                sourceUrl: 'https://grass-foundation.gitbook.io/grass-docs/architecture/grass-node',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'GRASS (via Grass Points currently)',
                source: 'grass.io',
                sourceUrl: 'https://www.grass.io/',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'Points-based (Uptime + Network Points)',
                source: 'grass.io',
                sourceUrl: 'https://www.grass.io/',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            rewardFactors: {
                value: 'Bandwidth (B), Latency (Ln + Lv), Reputation (S)',
                source: 'grass-foundation.gitbook.io',
                sourceUrl: 'https://grass-foundation.gitbook.io/grass-docs/architecture/router',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Validator Network + ZK Proofs',
                source: 'grass-foundation.gitbook.io',
                sourceUrl: 'https://grass-foundation.gitbook.io/grass-docs/architecture/validator',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'Reputation scoring: Completeness, Consistency, Timeliness, Availability',
                source: 'grass-foundation.gitbook.io',
                sourceUrl: 'https://grass-foundation.gitbook.io/grass-docs/architecture/grass-reputation-scoring',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'Zero Friction = Zero Loyalty',
        riskLevel: 'extreme'
    },

    'dimo': {
        id: 'dimo',
        name: 'DIMO',
        category: 'Vehicle Data',
        blockchain: {
            value: 'Polygon',
            source: 'docs.dimo.org',
            sourceUrl: 'https://docs.dimo.org',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'OBD-II Device (DIMO LTE R1)',
                source: 'dimo.co',
                sourceUrl: 'https://dimo.co/pages/dimo-lte',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$99.99',
                source: 'dimo.co',
                sourceUrl: 'https://dimo.co/pages/dimo-lte',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'DIMO',
                source: 'docs.dimo.org',
                sourceUrl: 'https://docs.dimo.org',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'Usage-based rewards',
                source: 'docs.dimo.org',
                sourceUrl: 'https://docs.dimo.org',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Vehicle Telemetry',
                source: 'docs.dimo.org',
                sourceUrl: 'https://docs.dimo.org',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'Fuel, location, distance, speed data',
                source: 'docs.dimo.org',
                sourceUrl: 'https://docs.dimo.org',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'Partnership Dependency',
        riskLevel: 'moderate'
    },

    'helium_mobile': {
        id: 'helium_mobile',
        name: 'Helium Mobile',
        category: '5G Wireless',
        blockchain: {
            value: 'Solana',
            source: 'mappingnetwork.us',
            sourceUrl: 'https://mappingnetwork.us/blogs/news/back-to-hnt-what-you-need-to-know',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'FreedomFi Gateway + CBRS Small Cell Radio',
                source: 'fierce-network.com',
                sourceUrl: 'https://www.fierce-network.com/private-wireless/freedomfi-sees-demand-for-cbrs-offload-gear-outpacing-private-wireless',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$1,500-6,000 (Gateway ~$1,000 + CBRS radio $500-5,000)',
                source: 'fierce-network.com',
                sourceUrl: 'https://www.fierce-network.com/private-wireless/freedomfi-sees-demand-for-cbrs-offload-gear-outpacing-private-wireless',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            specificModel: {
                value: '108,855 mobile hotspots online, 2M daily active users (Aug 2025)',
                source: 'coinmarketcap.com',
                sourceUrl: 'https://coinmarketcap.com/cmc-ai/helium-mobile/latest-updates/',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'HNT (MOBILE token emissions ceased Jan 2025)',
                source: 'mappingnetwork.us',
                sourceUrl: 'https://mappingnetwork.us/blogs/news/back-to-hnt-what-you-need-to-know',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'HNT halving schedule (Back to HNT - HIP-138)',
                source: 'mappingnetwork.us',
                sourceUrl: 'https://mappingnetwork.us/blogs/news/back-to-hnt-what-you-need-to-know',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            rewardFactors: {
                value: '5,451+ TB offloaded by Q3 2025, 461,500+ Helium Mobile accounts',
                source: 'sarsonfunds.com',
                sourceUrl: 'https://sarsonfunds.com/heliums-exceptional-growth-in-2025-sustaining-leadership-in-decentralized-wireless/',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Proof of Coverage + Data Offload',
                source: 'reflexivityresearch.com',
                sourceUrl: 'https://www.reflexivityresearch.com/all-reports/helium-overview',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'NO formal T-Mobile offload agreement - third-party partnership only',
                source: 'lightreading.com',
                sourceUrl: 'https://www.lightreading.com/oss-bss-cx/helium-teases-offload-from-t-mobile-but-there-s-no-formal-deal',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'No formal carrier offload deal despite marketing claims',
        riskLevel: 'moderate'
    },

    'helium_legacy': {
        id: 'helium_legacy',
        name: 'Helium Legacy (IoT)',
        category: 'IoT Wireless',
        blockchain: {
            value: 'Solana (migrated)',
            source: 'helium.foundation',
            sourceUrl: 'https://www.helium.foundation/protocol-report',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'LoRa Hotspot',
                source: 'helium.foundation',
                sourceUrl: 'https://www.helium.foundation/protocol-report',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$300-500 (historical)',
                source: 'helium.foundation',
                sourceUrl: 'https://www.helium.foundation/protocol-report',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'HNT/IOT',
                source: 'helium.foundation',
                sourceUrl: 'https://www.helium.foundation/protocol-report',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'Fixed emissions (halving schedule)',
                source: 'helium.foundation',
                sourceUrl: 'https://www.helium.foundation/protocol-report',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'Proof of Coverage',
                source: 'helium.foundation',
                sourceUrl: 'https://www.helium.foundation/protocol-report',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: '80% hotspots operational. Note: "80% churn" claim is UNFOUNDED per official reports',
                source: 'helium.foundation + blog.syndica.io',
                sourceUrl: 'https://blog.syndica.io/deep-dive-solana-depin/',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'Fixed Emission Model (not mass churn as previously claimed)',
        riskLevel: 'moderate'
    },

    'nosana': {
        id: 'nosana',
        name: 'Nosana',
        category: 'AI Inference Compute',
        blockchain: {
            value: 'Solana',
            source: 'docs.nosana.com',
            sourceUrl: 'https://docs.nosana.com/protocols/token.html',
            verifiedDate: '2026-01-20',
            isVerified: true
        },
        hardware: {
            type: {
                value: 'Linux (Ubuntu 20.04+) + NVIDIA GPU (RTX 3060 to H100)',
                source: 'docs.nosana.com',
                sourceUrl: 'https://docs.nosana.com/hosts/grid.html',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            priceRange: {
                value: '$300+ (varies: RTX 3060 to H100). Min 12GB RAM, 256GB NVMe, 100Mb/s internet',
                source: 'docs.nosana.com',
                sourceUrl: 'https://docs.nosana.com/hosts/grid.html',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            specificModel: {
                value: 'One GPU per PC, one Solana key per GPU. WSL2 deprecated.',
                source: 'docs.nosana.com',
                sourceUrl: 'https://docs.nosana.com/hosts/grid.html',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        emissions: {
            token: {
                value: 'NOS (100M fixed supply)',
                source: 'docs.nosana.com',
                sourceUrl: 'https://docs.nosana.com/protocols/token.html',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            model: {
                value: 'Mining: 20% (20M) linear over 24 months. Team vesting 9-48 months.',
                source: 'docs.nosana.com',
                sourceUrl: 'https://docs.nosana.com/protocols/token.html',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            rewardFactors: {
                value: 'PoS staking with 14-365 day lockups. Higher APY for longer duration.',
                source: 'nosana.com',
                sourceUrl: 'https://nosana.com/token/',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        validation: {
            method: {
                value: 'AI Inference Job Execution',
                source: 'nosana.com',
                sourceUrl: 'https://nosana.com/blog/wrapped_2025/',
                verifiedDate: '2026-01-20',
                isVerified: true
            },
            description: {
                value: 'Mainnet Jan 2025. Partnerships: Folding@Home, Exabits, Piknik, Shipyard NL',
                source: 'nosana.com',
                sourceUrl: 'https://nosana.com/blog/wrapped_2025/',
                verifiedDate: '2026-01-20',
                isVerified: true
            }
        },
        criticalFlaw: 'Niche market expanding to AI inference (reduced risk)',
        riskLevel: 'low'
    }
};

// Helper to get project by ID
export const getVerifiedProject = (id: string): VerifiedProject | undefined => {
    return verifiedProjects[id];
};

// Helper to check if a project has all verified data
export const isFullyVerified = (project: VerifiedProject): boolean => {
    return (
        project.blockchain.isVerified &&
        project.hardware.type.isVerified &&
        project.hardware.priceRange.isVerified &&
        project.emissions.token.isVerified &&
        project.emissions.model.isVerified &&
        project.validation.method.isVerified
    );
};

// Get all verified projects
export const getVerifiedProjects = (): VerifiedProject[] => {
    return Object.values(verifiedProjects);
};

// Get projects grouped by verification status
export const getProjectsByVerificationStatus = () => {
    const all = getVerifiedProjects();
    return {
        fullyVerified: all.filter(isFullyVerified),
        partiallyVerified: all.filter(p => !isFullyVerified(p))
    };
};
