/**
 * Equity Intelligence Utility
 * Provides ticker-based yield and dividend growth predictions
 */

const TICKER_DATABASE = {
    'VTSAX': { yield: 0.014, growth: 0.05, sector: 'Total Market' },
    'VTI': { yield: 0.014, growth: 0.05, sector: 'Total Market' },
    'VOO': { yield: 0.013, growth: 0.06, sector: 'S&P 500' },
    'SCHD': { yield: 0.034, growth: 0.10, sector: 'Dividend Growth' },
    'AAPL': { yield: 0.005, growth: 0.12, sector: 'Technology' },
    'MSFT': { yield: 0.007, growth: 0.10, sector: 'Technology' },
    'NVDA': { yield: 0.0002, growth: 0.20, sector: 'Technology' },
    'O': { yield: 0.055, growth: 0.04, sector: 'Real Estate' },
    'MO': { yield: 0.088, growth: 0.02, sector: 'Consumer Staples' },
    'JNJ': { yield: 0.031, growth: 0.05, sector: 'Healthcare' },
    'KO': { yield: 0.032, growth: 0.04, sector: 'Consumer Staples' },
    'WM': { yield: 0.014, growth: 0.08, sector: 'Industrials' },
    'BRK.B': { yield: 0.0, growth: 0.0, sector: 'Financials' },
};

/**
 * Derives yield and growth for a ticker.
 * If ticker not found, defaults based on regime.
 */
export const deriveEquityData = (ticker, regime = 'goldilocks') => {
    const symbol = ticker.toUpperCase().trim();
    if (TICKER_DATABASE[symbol]) {
        return TICKER_DATABASE[symbol];
    }

    // Default fallback logic based on market regime
    const defaults = {
        'goldilocks': { yield: 0.018, growth: 0.06 },
        'stagflation': { yield: 0.03, growth: 0.02 },
        'lost_decade': { yield: 0.025, growth: 0.01 },
        'bull_charge': { yield: 0.012, growth: 0.10 }
    };

    return {
        ...(defaults[regime] || defaults.goldilocks),
        sector: 'Unknown',
        isDefault: true
    };
};

/**
 * Predicts dividend increase based on market projections.
 * @param {number} baseYield 
 * @param {string} regime 
 * @returns {number} Projected annual dividend growth rate
 */
export const predictDividendGrowth = (baseYield, regime) => {
    const regimeFactors = {
        'goldilocks': 1.0,
        'stagflation': 0.4,
        'lost_decade': 0.2,
        'bull_charge': 1.5
    };

    // High yields often have lower growth caps
    const yieldCapFactor = baseYield > 0.05 ? 0.6 : 1.0;

    return 0.06 * (regimeFactors[regime] || 1.0) * yieldCapFactor;
};
