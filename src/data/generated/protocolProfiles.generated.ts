/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY.
 *
 * Source: src/data/protocol_master_sheet.tsv
 * Generator: scripts/generate_protocol_artifacts.mjs
 */

export const GENERATED_PROTOCOL_PROFILES = [
    {
        "version": "1.2",
        "metadata": {
            "id": "ono_v3_calibrated",
            "name": "ONOCOY",
            "mechanism": "Fixed Emissions w/ Partial Burn",
            "notes": "Real data from CoinGecko. GPS/GNSS precision network. ~3000 active stations.",
            "model_type": "location_based",
            "source": "CoinGecko + Onocoy Docs",
            "coingeckoId": "onocoy-token",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 410000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 5000000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.65,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 6,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 30,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 10,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 3000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 0.1,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 150,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.4,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "helium_bme_v1",
            "name": "Helium",
            "mechanism": "Burn-and-Mint Equilibrium",
            "notes": "Real Helium Network data. IoT/5G wireless network. 370K+ hotspots.",
            "model_type": "location_based",
            "source": "CoinGecko + Helium Explorer",
            "coingeckoId": "helium",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 180000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 625000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 1,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 0,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "consistent",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 8,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 2,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 370000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 3,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 300,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.2,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "adaptive_elastic_v1",
            "name": "Render",
            "mechanism": "Burn-and-Mint + Work Rewards",
            "notes": "Real Render Network data. Distributed GPU computing. Elastic supply based on work.",
            "model_type": "fungible_resource",
            "source": "CoinGecko + Render Docs",
            "coingeckoId": "render-token",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 520000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 1000000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.5,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 1,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 75,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 25,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 5000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 4.5,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 800,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.8,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "filecoin_v1",
            "name": "Filecoin",
            "mechanism": "Proof-of-Storage + Collateral",
            "notes": "Decentralised storage network. Storage providers stake FIL as collateral.",
            "model_type": "fungible_resource",
            "source": "CoinGecko + Filecoin Docs",
            "coingeckoId": "filecoin",
            "chain": "filecoin"
        },
        "parameters": {
            "supply": {
                "value": 500000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 2000000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.3,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 4,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 150,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 50,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 3500,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 5,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 2500,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.9,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "akash_v1",
            "name": "Akash",
            "mechanism": "Reverse Auction Marketplace",
            "notes": "Decentralised cloud computing. Providers bid for compute jobs.",
            "model_type": "fungible_resource",
            "source": "CoinGecko + Akash Docs",
            "coingeckoId": "akash-network",
            "chain": "cosmos"
        },
        "parameters": {
            "supply": {
                "value": 230000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 500000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.2,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 2,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "volatile",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 40,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 15,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 1000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 2.5,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 500,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.6,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "hivemapper_v1",
            "name": "Hivemapper",
            "mechanism": "Map-to-Earn + Data Sales",
            "notes": "Decentralised mapping using dashcams. Rewards for fresh map coverage.",
            "model_type": "location_based",
            "source": "CoinGecko + Hivemapper Docs",
            "coingeckoId": "hivemapper",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 100000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 3000000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.4,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 1,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 5,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 2,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 60000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 0.15,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 300,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.1,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "dimo_v1",
            "name": "DIMO",
            "mechanism": "Vehicle Data Marketplace",
            "notes": "User-owned vehicle data network. Drivers earn for sharing telemetry.",
            "model_type": "location_based",
            "source": "CoinGecko + DIMO Docs",
            "coingeckoId": "dimo",
            "chain": "polygon"
        },
        "parameters": {
            "supply": {
                "value": 70000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 1500000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.25,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 2,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 2,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 1,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 25000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 0.2,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 300,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.05,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "grass_v1",
            "name": "Grass",
            "mechanism": "Bandwidth Sharing + AI Data",
            "notes": "Residential proxy network for AI training. 2.5M+ nodes. Solana L2.",
            "model_type": "fungible_resource",
            "source": "CoinGecko + Grass Foundation",
            "coingeckoId": "grass",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 244000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 3500000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.1,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 0,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 0.5,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 0.1,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 2500000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 1.5,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 0,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.01,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "ionet_v1",
            "name": "io.net",
            "mechanism": "GPU Marketplace + Staking",
            "notes": "Decentralized GPU cloud. 800M max supply with disinflationary emissions over 20 years.",
            "model_type": "fungible_resource",
            "source": "CoinGecko + io.net Docs",
            "coingeckoId": "io",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 500000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 15000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.9,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 0,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 20,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 0,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 20,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 0.03,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 800,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.5,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "nosana_v1",
            "name": "Nosana",
            "mechanism": "GPU Grid + CI/CD",
            "notes": "Solana-native GPU grid for AI inference. 100M max supply. Mining rewards ending 2025.",
            "model_type": "fungible_resource",
            "source": "CoinGecko + Nosana Docs",
            "coingeckoId": "nosana",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 48000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 190000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 1,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 40,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 15,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 3000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 3.5,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 600,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.7,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "geodnet_v1",
            "name": "Geodnet",
            "mechanism": "RTK Mining + Token Burn",
            "notes": "GNSS/RTK network for precision positioning. 80% revenue burn. Annual emission halving.",
            "model_type": "location_based",
            "source": "CoinGecko + Geodnet Docs",
            "coingeckoId": "geodnet",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 440000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 2500000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.8,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 0,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 20,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 8,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 10000,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 0.15,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 500,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.6,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "aleph_v1",
            "name": "Aleph.im",
            "mechanism": "Staking + Utility Sink",
            "notes": "Decentralized cloud computing. 500M max supply. Staking-based security.",
            "model_type": "fungible_resource",
            "source": "CoinGecko + Aleph Docs",
            "coingeckoId": "aleph",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 244000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 375000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.1,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 2,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 15,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 5,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 500,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 0.3,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 0,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.4,
                "unit": "decimal"
            }
        }
    },
    {
        "version": "1.2",
        "metadata": {
            "id": "xnet_v1",
            "name": "XNET",
            "mechanism": "Wireless + Revitilization Burn",
            "notes": "Mobile network on Solana. 80% revenue buy-and-burn. 2.5M/epoch emissions.",
            "model_type": "location_based",
            "source": "CoinGecko + XNET Docs",
            "coingeckoId": "xnet-mobile",
            "chain": "solana"
        },
        "parameters": {
            "supply": {
                "value": 137000000,
                "unit": "tokens"
            },
            "emissions": {
                "value": 1250000,
                "unit": "tokens/week"
            },
            "burn_fraction": {
                "value": 0.8,
                "unit": "decimal"
            },
            "adjustment_lag": {
                "value": 0,
                "unit": "weeks"
            },
            "demand_regime": {
                "value": "growth",
                "unit": "category"
            },
            "provider_economics": {
                "opex_weekly": {
                    "value": 10,
                    "unit": "usd/week"
                },
                "churn_threshold": {
                    "value": 5,
                    "unit": "usd/week_profit"
                }
            },
            "initial_active_providers": {
                "value": 1200,
                "unit": "nodes"
            },
            "initial_price": {
                "value": 0.04,
                "unit": "usd"
            },
            "hardware_cost": {
                "value": 900,
                "unit": "usd"
            },
            "pro_tier_pct": {
                "value": 0.7,
                "unit": "decimal"
            }
        }
    }
];
