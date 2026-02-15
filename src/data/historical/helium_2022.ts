/**
 * Historical Data: Helium Network (2022-2023)
 * Normalized to Index=100 at Start (Jan 2022)
 * Source: CoinGecko (HNT Price) & Dune Analytics (Hotspots)
 * 
 * Thesis Validation:
 * Demonstrates "Sunk Cost" stickiness. Price crashes -95%, but Node Count grows +40%.
 */

export const HELIUM_2022_DATA = {
    // Weekly data points (Jan 2022 - Jan 2023)
    // Format: [Week, Value]
    priceIndex: [
        100, 85, 78, 70, 65, 60, 55, 45, 40, 35, // Q1 Splash
        32, 30, 28, 25, 22, 20, 18, 15, 12, 10,  // Q2 Grind
        9, 8, 7, 6, 5, 5, 4, 4, 3, 3,            // Q3 Bottoming
        3, 2.5, 2.5, 2, 2, 2, 1.8, 1.8, 1.5, 1.5,// Q4 Stagnation
        1.5, 2, 2.5, 3, 3.5, 4, 4, 3.5, 3, 3,    // Q1 '23 Recovery attempt
        3, 3 // End
    ],
    nodeCountIndex: [
        100, 102, 104, 106, 108, 110, 112, 114, 116, 118, // Steadily deploying pre-ordered hardware
        120, 122, 124, 125, 126, 127, 128, 129, 130, 131, // Growth slows but continues
        132, 132, 133, 133, 134, 134, 135, 135, 136, 136, // Saturation
        137, 137, 136, 136, 135, 135, 134, 134, 133, 133, // Slight churn begins (Mercenaries leave)
        132, 132, 131, 131, 130, 130, 129, 129, 128, 128, // Slow BLEED
        127, 127
    ]
};
