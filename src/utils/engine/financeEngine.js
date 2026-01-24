export const INITIAL_PROFILE = {
    financials: {
        income: 0,
        // New "Tax Bucket" Model (McKnight / Choate)
        assets: {
            taxable: 400000, // Brokerage, Savings, Real Estate (Capital Gains)
            taxDeferred: 500000, // 401k, Traditional IRA (Ordinary Income upon withdrawal, RMDs)
            taxFree: 50000, // Roth IRA, HSA, Life Insurance Cash Value (0% Tax)
        },
        liabilities: {
            mortgage: 300000,
            other: 0
        },
        taxRate: 0.35,
        inflationRate: 0.03,
        marketReturn: 0.08
    },
    family: [
        {
            id: 'primary',
            name: 'Husband',
            age: 40,
            relation: 'Self',
            residency: 'US_Citizen',
            state: 'CA',
            familyGroupId: 0,
            financials: {
                income: 250000,
                spending: 120000,
                stocks: 0,
                retirement: 0,
                realEstate: 0,
                cash: 0,
                loans: 0
            }
        }
    ],
    goals: {
        primary: 'max_wealth',
        timeHorizon: 'long_term'
    },
    strategies: {},
    marketRegime: 'goldilocks'
};

export const MARKET_REGIMES = {
    'goldilocks': { name: 'Goldilocks (Standard)', return: 0.08, inflation: 0.03, description: 'Moderate growth, low inflation. Historical US average.' },
    'stagflation': { name: '1970s Stagflation', return: 0.04, inflation: 0.06, description: 'Low real returns, high CPI. High drag on taxable purchasing power.' },
    'lost_decade': { name: 'The Lost Decade', return: 0.01, inflation: 0.02, description: 'Japan-style stagnation. Stress-tests plan survival with zero growth.' },
    'bull_charge': { name: 'Bull Charge', return: 0.12, inflation: 0.03, description: 'Aggressive growth regime. High compounding for Roth strategies.' }
};

// ... (Existing constants STATE_TAX_MAP, WEALTH_GOALS stay same)
const STATE_TAX_MAP = {
    'CA': 0.133, 'NY': 0.109, 'NJ': 0.1075, 'TX': 0.0, 'FL': 0.0, 'WA': 0.0, 'MA': 0.05, 'Other': 0.05
};

export const WEALTH_GOALS = [
    { id: 'max_wealth', name: 'Maximize Net Worth', description: 'Aggressive growth focus. Prioritizes total compounded return.' },
    { id: 'tax_min', name: 'Tax Minimization', description: 'Keep what you earn. Prioritizes harvesting and tax-free structures.' },
    { id: 'estate_transfer', name: 'Generational Transfer', description: 'Dynastic wealth. Prioritizes estate freezing and trust structures.' },
    { id: 'income_gen', name: 'Passive Income', description: 'Cash flow focus. Prioritizes high-yield assets and dividend strategies.' }
];

export const AVAILABLE_STRATEGIES = [
    {
        id: 'roth_conversion',
        name: 'Roth Conversion Strategy',
        description: 'Systematically move assets to the "Tax-Free" bucket (McKnight "Power of Zero"). Pays tax now to avoid higher rates later.',
        inputs: [
            { key: 'annualAmount', label: 'Annual Conversion Amount', type: 'number', default: 25000 }
        ]
    },
    {
        id: 'simple_path',
        name: 'The Simple Path (VTSAX)',
        description: 'JL Collins Style: Low-cost, broad market indexing. Minimizes fees and churn drag.',
        inputs: [
            { key: 'allocation', label: 'Index Allocation (%)', type: 'number', default: 100 }
        ]
    },
    {
        id: 'backdoor_roth',
        name: 'Backdoor Roth IRA',
        description: 'Tax-free growth for high earners exceeding IRS income limits.',
        inputs: [
            { key: 'contribution', label: 'Annual Contribution', type: 'number', default: 7000 }
        ]
    },
    {
        id: 'direct_indexing',
        name: 'Direct Indexing',
        description: 'Tax-loss harvesting to generate ~1.5% tax alpha (Hallman & Rosenbloom).',
        inputs: [
            { key: 'allocation', label: 'Portfolio Allocation (%)', type: 'number', default: 50 }
        ]
    },
    {
        id: 'clat',
        name: 'CLAT (Leimberg Trust)',
        description: 'Transfer assets to heirs tax-free while funding charity. (Tools & Techniques of Trust Planning).',
        inputs: [
            { key: 'principal', label: 'Initial Funding', type: 'number', default: 1000000 },
            { key: 'term', label: 'Trust Term (Years)', type: 'number', default: 15 },
            { key: 'payout', label: 'Annuity Payout (%)', type: 'number', default: 5 }
        ]
    }
];

// --- SOPHISTICATED RECOMMENDATION ENGINE (Updated with Book Wisdom) ---
export const getRecommendedStrategies = (profile) => {
    const recs = [];
    const { financials, family, goals } = profile;
    const safeFamily = Array.isArray(family) ? family : [];
    const primary = safeFamily.find(f => f.relation === 'Self') || safeFamily[0] || {};

    // Aggregates
    const assets = financials.assets;
    const totalAssets = (assets?.taxable || 0) + (assets?.taxDeferred || 0) + (assets?.taxFree || 0);
    const taxDeferredRatio = (assets?.taxDeferred || 0) / (totalAssets || 1);

    const isHighTaxState = ['CA', 'NY', 'NJ', 'OR'].includes(primary.state);

    // 1. "Power of Zero" Rule (McKnight)
    // If >50% of assets are in Tax-Deferred (401k/IRA), retirement tax bomb risk is high.
    if (taxDeferredRatio > 0.5) {
        recs.push({
            id: 'roth_conversion',
            title: 'Roth Conversion Strategy',
            description: 'Convert tax-deferred assets to tax-free Roth accounts',
            score: 95,
            impact: `$${Math.round((assets?.taxDeferred || 0) * 0.15 / 1000)}k potential tax savings`,
            reason: "Power of Zero: Your tax-deferred liability is high (" + (taxDeferredRatio * 100).toFixed(0) + "%). Convert to Tax-Free bucket to avoid future high bracket RMDs."
        });
    }

    // 2. "Simple Path" Rule (JL Collins)
    // If Net Worth < 1M (Accumulation Phase) and Goal is Max Wealth
    // Recommendation: Keep it simple.
    if (totalAssets < 1000000 && goals.primary === 'max_wealth') {
        recs.push({
            id: 'simple_path',
            title: 'The Simple Path (VTSAX)',
            description: 'Low-cost index fund strategy for wealth accumulation',
            score: 90,
            impact: `$${Math.round(totalAssets * 0.01 / 1000)}k annual fee savings`,
            reason: "JL Collins: In accumulation phase, complexity is the enemy. Focus on savings rate and low-cost indexing."
        });
    }

    // 3. Direct Indexing (Hallman) - Remains valid for high tax situations
    if (totalAssets > 500000 && isHighTaxState) {
        recs.push({
            id: 'direct_indexing',
            title: 'Direct Indexing & Tax-Loss Harvesting',
            description: 'Generate tax alpha through systematic loss harvesting',
            score: 85,
            impact: `$${Math.round(totalAssets * 0.015 / 1000)}k annual tax savings`,
            reason: `Offset ${primary.state} taxes with sophisticated loss harvesting.`
        });
    }

    return recs.sort((a, b) => b.score - a.score);
};

export const calculateProjection = (profile) => {
    const { financials, strategies, family, goals } = profile;
    const years = 25;
    const data = [];
    const explanations = [];

    // Aggregation Logic (Tax Unit Intelligence)
    const safeFamily = Array.isArray(family) ? family : [];
    const isPrimaryUnit = safeFamily.some(m => m.relation === 'Self');

    // Initialize buckets: 
    // Only include household base (financials.assets) if this unit includes the 'Self' primary member.
    let b_Taxable = isPrimaryUnit ? (financials.assets?.taxable || 0) : 0;
    let b_Deferred = isPrimaryUnit ? (financials.assets?.taxDeferred || 0) : 0;
    let b_Free = isPrimaryUnit ? (financials.assets?.taxFree || 0) : 0;

    // Aggregate Initial Family Member Assets and Loans
    let totalMemberLoans = 0;
    safeFamily.forEach(member => {
        if (member.financials) {
            const f = member.financials;
            // Assets mapped to buckets
            b_Taxable += (f.stocks || 0) + (f.realEstate || 0) + (f.cash || 0);
            b_Deferred += (f.retirement || 0);
            b_Free += (f.taxFree || 0);

            // Collect member specific loans
            totalMemberLoans += (f.loans || 0);

            // Backward compatibility for old buckets structure if existing
            if (f.taxBuckets) {
                b_Taxable += (f.taxBuckets.taxable || 0);
                b_Deferred += (f.taxBuckets.taxDeferred || 0);
                b_Free += (f.taxBuckets.taxFree || 0);
            }
        }
    });

    let o_Taxable = b_Taxable;
    let o_Deferred = b_Deferred;
    let o_Free = b_Free;

    const totalLoans = (financials.liabilities?.mortgage || 0) + (financials.liabilities?.other || 0) + totalMemberLoans;

    // Aggregate Total Household Income
    let totalIncome = financials.income || 0;
    safeFamily.forEach(member => {
        totalIncome += (member.financials?.income || 0);
    });

    // State Tax Logic
    const primaryMember = safeFamily.find(f => f.relation === 'Self') || safeFamily[0];
    let stateTaxRate = STATE_TAX_MAP[primaryMember?.state] || 0;
    const effectiveTaxRate = 0.24 + stateTaxRate;

    // --- REGIME PARAMETERS ---
    const regime = MARKET_REGIMES[profile.marketRegime] || MARKET_REGIMES['goldilocks'];
    const baseMarketReturn = regime.return;
    const inflationRate = regime.inflation;

    // --- STRATEGY PARAMETERS ---
    const safeStrategies = strategies || {};
    const isRothStrategy = safeStrategies['roth_conversion']?.active;
    const rothAmount = safeStrategies['roth_conversion']?.inputs?.annualAmount || 25000;

    const isSimplePath = safeStrategies['simple_path']?.active;
    // JL Collins: "VTSAX and Chill" implies lower fee drag
    const baselineDrag = 0.012; // 1.2% avg active fee + churn drag
    const optimizedDrag = isSimplePath ? 0.0015 : 0.012; // 15bps vs 120bps

    const b_netReturn = baseMarketReturn - baselineDrag;
    const o_netReturn = baseMarketReturn - optimizedDrag;

    for (let year = 0; year <= years; year++) {
        const currentYear = new Date().getFullYear() + year;
        const inflationFactor = Math.pow(1 + inflationRate, year);

        // Linear debt payoff (Simplified modeling)
        const debt = Math.max(0, totalLoans - (year * 20000));

        // 1. Calculate Milestone-Adjusted Household Income (Inflation adjusted)
        let yearBaselineIncome = 0;
        let yearOptimizedIncome = 0;

        safeFamily.forEach(member => {
            const currentAge = (member.age || 0) + year;
            const isRetired = currentAge >= 65;

            // Basic Earned Income (Stops at retirement, adjusted for 2% wage inflation)
            if (!isRetired) {
                const wageGrowth = Math.pow(1.02, year);
                yearBaselineIncome += (member.financials?.income || 0) * wageGrowth;
                yearOptimizedIncome += (member.financials?.income || 0) * wageGrowth;
            }

            // Social Security Milestone ($30k/yr base, inflation matched)
            if (currentAge >= 67) {
                const ssBenefit = 30000 * inflationFactor;
                yearBaselineIncome += ssBenefit;
                yearOptimizedIncome += ssBenefit;
                if (year === 1 && currentAge === 67) explanations.push(`${member.name} hits SS benefits milestone (Inflation-adjusted).`);
            }
        });

        // 2. Forced RMD Milestone (IRS Rule: Age 73)
        safeFamily.forEach(member => {
            const currentAge = (member.age || 0) + year;
            if (currentAge >= 73) {
                const rmdFactor = 1 / (26.5);
                const baselineRmd = b_Deferred * rmdFactor;
                const optimizedRmd = o_Deferred * rmdFactor;

                yearBaselineIncome += baselineRmd;
                yearOptimizedIncome += optimizedRmd;

                if (year === 1 && currentAge === 73) explanations.push(`⚠️ RMD Activation: IRS forcing taxable distributions for ${member.name}.`);
            }
        });

        // 3. College Milestone (Education Drag - Inflated COA)
        let yearCollegeDrag = 0;
        safeFamily.forEach(member => {
            const currentAge = (member.age || 0) + year;
            if (member.relation.includes('Child') && currentAge >= 18 && currentAge <= 22) {
                yearCollegeDrag += 50000 * inflationFactor;
                if (year === 1 && currentAge === 18) explanations.push(`🎓 Education Milestone: $${(50000 * inflationFactor / 1000).toFixed(0)}k COA drag starts.`);
            }
        });

        // 4. Baseline Calculation Logic
        b_Taxable *= (1 + (b_netReturn * (1 - 0.2)));
        b_Deferred *= (1 + b_netReturn);
        b_Free *= (1 + b_netReturn);

        // Aggregate total household spending from all members
        let totalYearlySpending = 0;
        safeFamily.forEach(m => {
            totalYearlySpending += (m.financials?.spending || 0);
        });

        const currentSpending = totalYearlySpending * inflationFactor;
        const b_surplus = (yearBaselineIncome * (1 - effectiveTaxRate)) - (currentSpending + yearCollegeDrag);
        b_Taxable += b_surplus;

        // 5. Optimized Calculation Logic (Roth + Wisdom)
        if (isRothStrategy && o_Deferred > rothAmount) {
            o_Deferred -= rothAmount;
            const conversionTax = rothAmount * effectiveTaxRate;
            o_Taxable -= conversionTax;
            o_Free += rothAmount;
        }

        o_Taxable *= (1 + (o_netReturn * (1 - 0.2)));
        o_Deferred *= (1 + o_netReturn);
        o_Free *= (1 + o_netReturn);

        const o_surplus = (yearOptimizedIncome * (1 - effectiveTaxRate)) - (currentSpending + yearCollegeDrag);
        o_Taxable += o_surplus;

        let b_Total = b_Taxable + b_Deferred + b_Free;
        let o_Total = o_Taxable + o_Deferred + o_Free;

        data.push({
            year: currentYear,
            baseline: Math.round(b_Total - debt),
            optimized: Math.round(o_Total - debt)
        });
    }

    // Add Educational Wisdom
    if (isSimplePath) {
        explanations.push("JL Collins: Low-cost indexing strategy is actively reducing fee drag by ~0.75% annually.");
    }

    return { data, explanations };
};

/**
 * Monte Carlo Stress Test Engine
 * Performs 250 stochastic simulations to determine probability of success.
 */
export const calculateMonteCarlo = (profile, iterations = 250) => {
    const { financials, family, strategies } = profile;
    const years = 25;
    const allPaths = [];
    let successCount = 0;

    const safeFamily = Array.isArray(family) ? family : [];
    const isPrimaryUnit = safeFamily.some(m => m.relation === 'Self');
    const totalLoans = (financials.liabilities?.mortgage || 0) + (financials.liabilities?.other || 0);

    // Box-Muller transform for normal distribution
    const randn = () => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    const regime = MARKET_REGIMES[profile.marketRegime] || MARKET_REGIMES['goldilocks'];
    const baseMarketReturn = regime.return;
    const inflationRate = regime.inflation;
    const stdDev = 0.15; // 15% volatility

    // Strategy impacts in Monte Carlo (Simplified)
    const isSimplePath = strategies?.['simple_path']?.active;
    const isRothStrategy = strategies?.['roth_conversion']?.active;
    const rothAmount = strategies?.['roth_conversion']?.inputs?.annualAmount || 25000;
    const activeFeeDrag = isSimplePath ? 0.0015 : 0.012;
    const netMeanReturn = baseMarketReturn - activeFeeDrag;

    for (let i = 0; i < iterations; i++) {
        let b_Taxable = isPrimaryUnit ? (financials.assets?.taxable || 0) : 0;
        let b_Deferred = isPrimaryUnit ? (financials.assets?.taxDeferred || 0) : 0;
        let b_Free = isPrimaryUnit ? (financials.assets?.taxFree || 0) : 0;

        safeFamily.forEach(member => {
            if (member.financials) {
                const f = member.financials;
                b_Taxable += (f.stocks || 0) + (f.realEstate || 0) + (f.cash || 0);
                b_Deferred += (f.retirement || 0);
                b_Free += (f.taxFree || 0);
            }
        });

        const path = [];
        const effectiveTaxRate = 0.28; // Avg effective tax rate
        let failed = false;

        for (let year = 0; year <= years; year++) {
            const inflationFactor = Math.pow(1 + inflationRate, year);
            const debt = Math.max(0, totalLoans - (year * 15000));

            // Random return each year
            const annualReturn = netMeanReturn + (stdDev * randn());

            if (year > 0) {
                // Growth
                b_Taxable *= (1 + (annualReturn * (1 - 0.2)));
                b_Deferred *= (1 + annualReturn);
                b_Free *= (1 + annualReturn);

                // Simulation: Roth Strategy
                if (isRothStrategy && b_Deferred > rothAmount) {
                    b_Deferred -= rothAmount;
                    b_Taxable -= (rothAmount * effectiveTaxRate);
                    b_Free += rothAmount;
                }

                // Milestones & Cashflow
                let yearIncome = 0;
                let yearSpending = 0;

                safeFamily.forEach(m => {
                    const age = (m.age || 0) + year;
                    yearSpending += (m.financials?.spending || 0) * inflationFactor;

                    if (age < 65) yearIncome += (m.financials?.income || 0) * Math.pow(1.02, year);
                    if (age >= 67) yearIncome += 30000 * inflationFactor; // SS
                });

                const surplus = (yearIncome * (1 - effectiveTaxRate)) - yearSpending;
                b_Taxable += surplus;
            }

            const totalNW = b_Taxable + b_Deferred + b_Free - debt;
            path.push(Math.round(totalNW));
            if (totalNW < 0) failed = true;
        }

        if (!failed) successCount++;
        allPaths.push(path);
    }

    const finalSuccessRate = Math.round((successCount / iterations) * 100);

    // Process percentiles for charting
    const results = [];
    for (let year = 0; year <= years; year++) {
        const yearValues = allPaths.map(p => p[year]).sort((a, b) => a - b);
        results.push({
            year: new Date().getFullYear() + year,
            p10: yearValues[Math.floor(iterations * 0.1)],
            p50: yearValues[Math.floor(iterations * 0.5)],
            p90: yearValues[Math.floor(iterations * 0.9)],
            successRate: finalSuccessRate // Attach success rate to data
        });
    }

    return results;
};
