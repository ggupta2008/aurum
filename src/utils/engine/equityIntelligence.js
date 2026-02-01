/**
 * Equity Intelligence Utility
 * Provides ticker-based yield and dividend growth predictions
 */

const TICKER_DATABASE = {
    'VTSAX': { yield: 0.014, growth: 0.05, sector: 'Total Market', expenseRatio: 0.0004 },
    'VTI': { yield: 0.014, growth: 0.05, sector: 'Total Market', expenseRatio: 0.0003 },
    'VOO': { yield: 0.013, growth: 0.06, sector: 'S&P 500', expenseRatio: 0.0003 },
    'IVV': { yield: 0.013, growth: 0.06, sector: 'S&P 500', expenseRatio: 0.0003 },
    'SWTSX': { yield: 0.014, growth: 0.05, sector: 'Total Market', expenseRatio: 0.0003 },
    'FSKAX': { yield: 0.014, growth: 0.05, sector: 'Total Market', expenseRatio: 0.00015 },
    'FXAIX': { yield: 0.013, growth: 0.06, sector: 'S&P 500', expenseRatio: 0.00015 },
    'SCHB': { yield: 0.014, growth: 0.05, sector: 'Total Market', expenseRatio: 0.0003 },
    'SCHD': { yield: 0.034, growth: 0.10, sector: 'Dividend Growth', expenseRatio: 0.0006 },
    'BND': { yield: 0.045, growth: 0.02, sector: 'Bonds', expenseRatio: 0.0003 },
    'VBTLX': { yield: 0.045, growth: 0.02, sector: 'Bonds', expenseRatio: 0.0005 },
    'SPY': { yield: 0.013, growth: 0.06, sector: 'S&P 500', expenseRatio: 0.0009 },
    'AAPL': { yield: 0.005, growth: 0.12, sector: 'Technology', expenseRatio: 0.0 },
    'MSFT': { yield: 0.007, growth: 0.10, sector: 'Technology', expenseRatio: 0.0 },
    'GOOGL': { yield: 0.0, growth: 0.15, sector: 'Technology', expenseRatio: 0.0 },
    'AMZN': { yield: 0.0, growth: 0.12, sector: 'Consumer Discretionary', expenseRatio: 0.0 },
    'TSLA': { yield: 0.0, growth: 0.20, sector: 'Consumer Discretionary', expenseRatio: 0.0 },
    'META': { yield: 0.0, growth: 0.15, sector: 'Technology', expenseRatio: 0.0 },
    'NVDA': { yield: 0.0002, growth: 0.20, sector: 'Technology', expenseRatio: 0.0 },
    'O': { yield: 0.055, growth: 0.04, sector: 'Real Estate', expenseRatio: 0.0 },
    'MO': { yield: 0.088, growth: 0.02, sector: 'Consumer Staples', expenseRatio: 0.0 },
    'JNJ': { yield: 0.031, growth: 0.05, sector: 'Healthcare', expenseRatio: 0.0 },
    'KO': { yield: 0.032, growth: 0.04, sector: 'Consumer Staples', expenseRatio: 0.0 },
    'WM': { yield: 0.014, growth: 0.08, sector: 'Industrials', expenseRatio: 0.0 },
    'BRK.B': { yield: 0.0, growth: 0.0, sector: 'Financials', expenseRatio: 0.0 },
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
