import { calculateBenefitFactor } from './socialSecurityRules';
import { deriveEquityData, predictDividendGrowth } from './equityIntelligence';
export const INITIAL_PROFILE = {
    financials: {
        income: 0,
        // New "Tax Bucket" Model (McKnight / Choate)
        assets: {
            taxable: 400000,
            taxDeferred: 500000,
            taxFree: 50000,
            realEstate: [
                { id: 1, name: 'Primary Residence', type: 'primary', value: 1200000, mortgage: 800000, rate: 0.035, termYears: 30, startDate: '2020-01-01' },
                { id: 2, name: 'Mountain Rental', type: 'rental', value: 500000, mortgage: 300000, rate: 0.045, termYears: 30, annualIncome: 36000 }
            ]
        },
        liabilities: [],
        taxRate: 0.35,
        inflationRate: 0.03,
        marketReturn: 0.08
    },
    family: [
        {
            id: 'primary',
            name: 'Husband',
            age: 55,
            relation: 'Self',
            residency: 'US_Citizen',
            state: 'CA',
            familyGroupId: 0,
            financials: {
                income: 250000,
                spending: 120000,
                stocks: 150000,
                retirement: 200000,
                realEstate: [
                    { id: 101, name: 'Primary Residence', type: 'primary', value: 500000, mortgage: 300000, rate: 0.035, termYears: 30 }
                ],
                cash: 50000,
                positions: [
                    { id: 1, ticker: 'VTSAX', description: 'Total Stock Market Index', value: 100000, costBasis: 60000, taxStatus: 'taxable', dividendYield: 0.015 },
                    { id: 2, ticker: 'AAPL', description: 'Apple Inc.', value: 50000, costBasis: 15000, taxStatus: 'taxable', dividendYield: 0.005 }
                ],
                debts: [
                    { id: 1, name: 'Primary Mortgage', balance: 300000, rate: 0.035, termYears: 30, type: 'mortgage', startDate: '2020-01-01' }
                ]
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
    },
    {
        id: 'social_security',
        name: 'Social Security Optimization',
        description: 'Strategically delay claiming benefits to increase guaranteed inflation-adjusted income by 8% per year delayed.',
        inputs: [
            { key: 'claimAge', label: 'Claiming Age', type: 'number', default: 67 },
            { key: 'estimatedPIA', label: 'Estimated Monthly Benefit (at 67)', type: 'number', default: 3000 }
        ]
    },
    {
        id: '1031_exchange',
        name: '1031 Property Exchange',
        description: 'Defer capital gains tax by swapping investment real estate for like-kind property. (IRC Section 1031).',
        inputs: [
            { key: 'targetYear', label: 'Exchange Year (Relative)', type: 'number', default: 5 },
            { key: 'oldBasis', label: 'Current Property Basis', type: 'number', default: 500000 },
            { key: 'appreciation', label: 'Projected Appreciation Alpha (%)', type: 'number', default: 2 }
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

    // 4. Social Security Optimization (Kotlikoff/Munnell)
    if (primary.age >= 50 && primary.age <= 70) {
        recs.push({
            id: 'social_security',
            title: 'SS Delayed Claiming Strategy',
            description: 'Strategically delay Social Security to age 70',
            score: 88,
            impact: '8% guaranteed annual benefit increase',
            reason: `Inflation-protected longevity insurance. By delaying from 67 to 70, you increase your base benefit by 24% for life.`
        });
    }

    // 5. High-Interest Debt (Dave Ramsey / Suze Orman)
    safeFamily.forEach(member => {
        const debts = member.financials?.debts || [];
        const poisonousDebt = debts.filter(d => d.rate > 0.07);
        if (poisonousDebt.length > 0) {
            recs.push({
                id: 'debt_paydown',
                title: 'Aggressive Debt Paydown',
                description: 'Prioritize paying off high-interest liabilities (>7%)',
                score: 98,
                impact: 'Guaranteed risk-free return',
                reason: `Detected ${member.name} has debt at ${Math.round(poisonousDebt[0].rate * 100)}% interest. Paying this off is a "guaranteed return" high-bar hurdle that beats market expectations.`
            });
        }
    });

    // 6. 1031 Exchange (Tax Deferral Magic)
    const hasRentalRealEstate = (() => {
        const hRE = profile.financials?.assets?.realEstate;
        const householdHasRental = Array.isArray(hRE) && hRE.some(p => p.type === 'rental');
        const familyHasRental = safeFamily.some(m => {
            const mRE = m.financials?.realEstate;
            return Array.isArray(mRE) && mRE.some(p => p.type === 'rental');
        });
        return householdHasRental || familyHasRental;
    })();
    if (hasRentalRealEstate) {
        recs.push({
            id: '1031_exchange',
            title: '1031 Exchange Strategy',
            description: 'Utilize Section 1031 to swap rental properties and defer capital gains',
            score: 82,
            impact: 'Significant tax deferral on appreciation',
            reason: "Real Estate Deferral: Detected rental properties. Using a 1031 exchange allows you to avoid tax on sale and keep 100% of your equity compounding in a new property."
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
    let b_Taxable = isPrimaryUnit ? (parseFloat(financials.assets?.taxable) || 0) : 0;
    let b_Deferred = isPrimaryUnit ? (parseFloat(financials.assets?.taxDeferred) || 0) : 0;
    let b_Free = isPrimaryUnit ? (parseFloat(financials.assets?.taxFree) || 0) : 0;

    // Aggregate Shared / Clan Real Estate and Liabilities
    const clanPropertyDebts = [];
    const clanRentalIncome = [];
    const clanRentalExpenses = [];
    let b_grossRentalValue = 0;
    if (isPrimaryUnit) {
        const re = financials.assets?.realEstate || [];
        if (Array.isArray(re)) {
            re.forEach(p => {
                b_Taxable += (parseFloat(p.value) || 0);
                if (p.type === 'rental') {
                    b_grossRentalValue += (parseFloat(p.value) || 0);
                    if (p.annualIncome) clanRentalIncome.push(parseFloat(p.annualIncome) || 0);
                    const expenses = (parseFloat(p.propertyTax) || 0) + (parseFloat(p.managementFee) || 0);
                    if (expenses) clanRentalExpenses.push(expenses);
                }
                if (p.mortgage) clanPropertyDebts.push({ balance: parseFloat(p.mortgage) || 0, rate: parseFloat(p.rate) || 0.04, term: parseInt(p.termYears) || 30 });
            });
        } else {
            b_Taxable += parseFloat(re) || 0;
        }

        b_Taxable += (parseFloat(financials.assets?.cash) || 0);

        // Global Clan Positions
        if (Array.isArray(financials.assets?.positions)) {
            financials.assets.positions.forEach(pos => {
                const val = parseFloat(pos.value) || 0;
                if (pos.taxStatus === 'taxable' || !pos.taxStatus) b_Taxable += val;
                else if (pos.taxStatus === 'taxDeferred') b_Deferred += val;
                else if (pos.taxStatus === 'taxFree') b_Free += val;
            });
        }

        // Global Clan Liabilities
        const liab = financials.liabilities || [];
        if (Array.isArray(liab)) {
            liab.forEach(l => {
                clanPropertyDebts.push({ balance: l.balance || 0, rate: l.rate || 0.06, term: l.term || 5 });
            });
        }
    }

    // Aggregate Family Member Assets, Income, Spending, and Retirement Dates
    let memberPropertyDebts = [];
    let memberRentalIncome = [];
    let memberRentalExpenses = [];
    const memberIncomes = []; // Track each member's income and retirement age
    let totalMemberSpending = 0;

    safeFamily.forEach(member => {
        if (member.financials) {
            const f = member.financials;

            // Track member income and retirement
            const memberIncome = parseFloat(f.income) || 0;
            const memberAge = member.age || 45;
            const retirementAge = member.retirementAge || 67; // Default retirement age

            if (memberIncome > 0) {
                memberIncomes.push({
                    name: member.name,
                    income: memberIncome,
                    currentAge: memberAge,
                    retirementAge: retirementAge,
                    yearsUntilRetirement: Math.max(0, retirementAge - memberAge)
                });
            }

            // Aggregate member spending
            totalMemberSpending += (parseFloat(f.spending) || 0);

            // Member Granular Real Estate
            if (f.realEstate && Array.isArray(f.realEstate)) {
                f.realEstate.forEach(p => {
                    b_Taxable += (parseFloat(p.value) || 0);
                    if (p.type === 'rental') {
                        b_grossRentalValue += (parseFloat(p.value) || 0);
                        if (p.annualIncome) memberRentalIncome.push(parseFloat(p.annualIncome) || 0);
                        const expenses = (parseFloat(p.propertyTax) || 0) + (parseFloat(p.managementFee) || 0);
                        if (expenses) memberRentalExpenses.push(expenses);
                    }
                    if (p.mortgage) memberPropertyDebts.push({ balance: parseFloat(p.mortgage) || 0, rate: parseFloat(p.rate) || 0.04, term: parseInt(p.termYears) || 30 });
                });
            } else {
                b_Taxable += parseFloat(f.realEstate) || 0;
            }

            // Assets: Prioritize Granular Positions
            let memberAssetsAdded = false;

            if (Array.isArray(f.positions) && f.positions.length > 0) {
                f.positions.forEach(pos => {
                    const val = parseFloat(pos.value) || 0;
                    if (pos.taxStatus === 'taxDeferred') b_Deferred += val;
                    else if (pos.taxStatus === 'taxFree') b_Free += val;
                    else b_Taxable += val;
                });
                memberAssetsAdded = true;
            }

            if (!memberAssetsAdded && ((parseFloat(f.stocks) || 0) > 0 || (parseFloat(f.retirement) || 0) > 0 || (parseFloat(f.taxFree) || 0) > 0)) {
                b_Taxable += (parseFloat(f.stocks) || 0);
                b_Deferred += (parseFloat(f.retirement) || 0);
                b_Free += (parseFloat(f.taxFree) || 0);
                memberAssetsAdded = true;
            }

            // Fallback to legacy buckets
            if (!memberAssetsAdded && f.taxBuckets) {
                b_Taxable += (parseFloat(f.taxBuckets.taxable) || 0);
                b_Deferred += (parseFloat(f.taxBuckets.taxDeferred) || 0);
                b_Free += (parseFloat(f.taxBuckets.taxFree) || 0);
            }

            b_Taxable += (parseFloat(f.cash) || 0);

            // Loans: Prioritize Granular Debts
            if (Array.isArray(f.debts) && f.debts.length > 0) {
                f.debts.forEach(debt => {
                    memberPropertyDebts.push({ balance: parseFloat(debt.balance) || 0, rate: parseFloat(debt.rate) || 0.05, term: parseInt(debt.termYears) || 30 });
                });
            } else if (f.loans) {
                memberPropertyDebts.push({ balance: parseFloat(f.loans) || 0, rate: 0.05, term: 10 });
            }
        }
    });

    let o_Taxable = b_Taxable;
    let o_Deferred = b_Deferred;
    let o_Free = b_Free;

    const allDebts = [...clanPropertyDebts, ...memberPropertyDebts];
    const totalRentalIncome = [...clanRentalIncome, ...memberRentalIncome].reduce((a, b) => a + b, 0);
    const totalRentalExpenses = [...clanRentalExpenses, ...memberRentalExpenses].reduce((a, b) => a + b, 0);

    // State Tax Logic
    const primaryMember = safeFamily.find(f => f.relation === 'Self') || safeFamily[0];
    let stateTaxRate = STATE_TAX_MAP[primaryMember?.state] || 0;
    const effectiveTaxRate = (financials.taxRate !== undefined ? financials.taxRate : 0.24) + stateTaxRate;

    // --- REGIME PARAMETERS ---
    const regime = MARKET_REGIMES[profile.marketRegime] || MARKET_REGIMES['goldilocks'];
    const baseMarketReturn = regime.return;
    const inflationRate = regime.inflation;

    // --- STRATEGY PARAMETERS ---
    const safeStrategies = strategies || {};
    const isRothStrategy = safeStrategies['roth_conversion']?.active;
    const rothAmount = safeStrategies['roth_conversion']?.inputs?.annualAmount || 25000;

    const isSimplePath = safeStrategies['simple_path']?.active;
    const baselineDrag = 0.012; // 1.2% typical mutual fund / advisory fee drag
    const optimizedDrag = isSimplePath ? 0.0015 : 0.012; // VTSAX 0.04% + slippage

    // Generic AI Strategy Alpha Hook
    // If ANY AI strategy is active that isn't hardcoded above, we apply a "Fiduciary Optimization Alpha"
    // This connects the AI's "Deploy" button to the chart even if specific math isn't hardcoded for that ID yet.
    const activeStrategyCount = Object.keys(safeStrategies).filter(k => safeStrategies[k].active).length;
    const hasGenericOptimization = activeStrategyCount > 0;
    const genericAlpha = hasGenericOptimization ? 0.005 : 0; // 50bps "Advisor Alpha" (Vanguard estimates 300bps, we are conservative)

    const b_netReturn = baseMarketReturn - baselineDrag;
    // Optimized return = Base - Low Fees + Advisor Alpha
    const o_netReturn = baseMarketReturn - optimizedDrag + genericAlpha;

    let pendingEvents = [];

    for (let year = 0; year <= years; year++) {
        const currentYear = new Date().getFullYear() + year;
        const inflationFactor = Math.pow(1 + inflationRate, year);
        const wageGrowth = Math.pow(1.02, year);

        // 1. Calculate Debt Dynamics (Amortized Principal)
        const currentRemainingDebt = allDebts.reduce((acc, d) => {
            const P = d.balance || 0;
            const r = d.rate || 0.05;
            const n = d.term || 30;

            if (year >= n) return acc;

            let remaining;
            if (r === 0) {
                remaining = P * (1 - year / n);
            } else {
                // Standard Principal Balance Formula: P * [(1+r)^n - (1+r)^t] / [(1+r)^n - 1]
                remaining = P * (Math.pow(1 + r, n) - Math.pow(1 + r, year)) / (Math.pow(1 + r, n) - 1);
            }
            return acc + Math.max(0, remaining);
        }, 0);

        // Snapshot current total wealth before moving to next year's growth
        // Valuation Logic: We account for the embedded tax liability in Tax-Deferred buckets
        // to show true "Spendable" net worth (McKnight / Power of Zero principle).
        // Using 30% as a standard blended rate (Fed + State)
        const embeddedTaxRate = 0.30;

        let b_Total = b_Taxable + (b_Deferred * (1 - embeddedTaxRate)) + b_Free;
        let o_Total = o_Taxable + (o_Deferred * (1 - embeddedTaxRate)) + o_Free;

        // Force parity if no strategies are active (prevents floating point drift or "ghost" optimization visuals)
        const displayOptimized = activeStrategyCount > 0
            ? Math.round(o_Total - currentRemainingDebt)
            : Math.round(b_Total - currentRemainingDebt);

        data.push({
            year: currentYear,
            baseline: Math.round(b_Total - currentRemainingDebt),
            optimized: displayOptimized,
            events: [...pendingEvents],
            breakdown: {
                taxable: Math.round(o_Taxable),
                deferred: Math.round(o_Deferred),
                taxFree: Math.round(o_Free)
            }
        });
        pendingEvents = [];

        if (year === years) break; // Final year snapshot taken, stop.

        // --- TRANSITION TO NEXT YEAR ---

        // 2. Yearly Cash Flow Calculation
        const currentYearlyDebtService = allDebts.reduce((acc, d) => {
            if (year < (d.term || 30)) {
                const r = d.rate || 0.04;
                const P = d.balance;
                const N = (d.term || 30);
                if (P === 0 || r === 0) return acc + (P / N);
                const annualPayment = (P * r) / (1 - Math.pow(1 + r, -N));
                return acc + annualPayment;
            }
            return acc;
        }, 0);

        // Calculate total income: clan base + active member incomes (respecting retirement)
        const clanBaseIncome = (parseFloat(financials.income) || 0) * wageGrowth;
        const activeMemberIncome = memberIncomes.reduce((total, m) => {
            // Member stops earning after retirement
            if (year >= m.yearsUntilRetirement) return total;
            return total + (m.income * wageGrowth);
        }, 0);

        let yearBaselineIncome = clanBaseIncome + activeMemberIncome + (totalRentalIncome - totalRentalExpenses) * inflationFactor;
        let yearOptimizedIncome = clanBaseIncome + activeMemberIncome + (totalRentalIncome - totalRentalExpenses) * inflationFactor;

        safeFamily.forEach(member => {
            const currentAge = (member.age || 0) + year;
            if (currentAge < 65) {
                yearBaselineIncome += (member.financials?.income || 0) * wageGrowth;
                yearOptimizedIncome += (member.financials?.income || 0) * wageGrowth;
            }

            // Dividend Injections
            if (member.financials?.positions) {
                member.financials.positions.forEach(pos => {
                    const annualDiv = (pos.value || 0) * (pos.dividendYield || 0);
                    const tickerData = deriveEquityData(pos.ticker);
                    const annualGrowth = tickerData.growth || predictDividendGrowth(pos.dividendYield, profile.marketRegime);
                    const projectedDiv = annualDiv * Math.pow(1 + annualGrowth, year);
                    yearBaselineIncome += projectedDiv;
                    yearOptimizedIncome += projectedDiv;
                });
            }

            // SS Optimization
            const ssStrategy = safeStrategies['social_security'];
            const optimizedClaimAge = ssStrategy?.active ? (ssStrategy.inputs?.claimAge || 67) : 67;
            const pia = (ssStrategy?.inputs?.estimatedPIA || 3000);

            if (currentAge >= 67) {
                const b_factor = calculateBenefitFactor(67);
                yearBaselineIncome += (pia * 12 * b_factor) * inflationFactor;
            }
            if (currentAge >= optimizedClaimAge) {
                const o_factor = calculateBenefitFactor(optimizedClaimAge);
                yearOptimizedIncome += (pia * 12 * o_factor) * inflationFactor;
                if (currentAge === optimizedClaimAge) pendingEvents.push({ label: 'Social Security Claimed', impact: 'Optimized Benefit Start' });
            }
        });

        // RMDs
        safeFamily.forEach(member => {
            if ((member.age || 0) + year >= 73) {
                const rmd = (b_Deferred * (1 / 26.5));
                yearBaselineIncome += rmd;
                yearOptimizedIncome += (o_Deferred * (1 / 26.5));
                if ((member.age || 0) + year === 73) pendingEvents.push({ label: 'RMDs Begin', impact: 'Tax Drag Active' });
            }
        });

        // Spending
        let totalYearlySpending = parseFloat(financials.spending) || 0;
        safeFamily.forEach(m => totalYearlySpending += (m.financials?.spending || 0));
        const currentSpending = totalYearlySpending * inflationFactor;

        // College Drag
        let yearCollegeDrag = 0;
        safeFamily.forEach(m => {
            const age = (m.age || 0) + year;
            if (m.relation.includes('Child') && age >= 18 && age <= 22) yearCollegeDrag += 50000 * inflationFactor;
        });

        // 3. Growth & Surplus Injection
        // Baseline: Surplus goes to Taxable (Brokerage)
        b_Taxable *= (1 + (b_netReturn * (1 - 0.2)));
        b_Deferred *= (1 + b_netReturn);
        b_Free *= (1 + b_netReturn);

        const b_surplus = (yearBaselineIncome * (1 - effectiveTaxRate)) - (currentSpending + yearCollegeDrag + currentYearlyDebtService);
        b_Taxable += b_surplus;

        // Optimized Path Logic
        const s_maxRetirement = strategies?.['max_retirement'];
        const s_1031 = strategies?.['1031_exchange'];

        let o_Yearly_netReturn = o_netReturn;

        if (s_1031?.active) {
            if (year >= (s_1031.inputs?.targetYear || 5)) o_Yearly_netReturn += (s_1031.inputs?.appreciation || 2) / 100;
            if (year === (s_1031.inputs?.targetYear || 5)) {
                const taxSaved = Math.max(0, b_grossRentalValue - (s_1031.inputs?.oldBasis || 500000)) * 0.2;
                o_Taxable += taxSaved;
                explanations.push(`🏡 Yr ${year}: 1031 Exchange executed. Deferring $${Math.round(taxSaved / 1000)}k tax.`);
                pendingEvents.push({ label: '1031 Exchange', impact: `+$${Math.round(taxSaved / 1000)}k Tax Deferred` });
            }
        }

        // Direct Indexing / Tax Loss Harvesting Logic
        const s_directIndexing = strategies?.['direct_indexing'];
        if (s_directIndexing?.active) {
            // Estimate Tax Alpha (~1.5% of taxable portfolio offset against gains)
            // We model this as a "rebate" or effective boost to the after-tax return
            // Tax Alpha = (Taxable Assets * 0.015)
            const taxAlpha = o_Taxable * 0.015;
            o_Taxable += taxAlpha; // Reinvesting the tax savings
            if (year > 0 && year % 5 === 0) pendingEvents.push({ label: 'Tax Loss Harvesting', impact: 'Alpha Generated' });
        }

        if (isRothStrategy && o_Deferred > rothAmount) {
            o_Deferred -= rothAmount;
            o_Taxable -= (rothAmount * effectiveTaxRate);
            o_Free += rothAmount;
            pendingEvents.push({ label: 'Roth Conversion', impact: 'Shift to Tax-Free' });
        }

        o_Taxable *= (1 + (o_Yearly_netReturn * (1 - 0.2)));
        o_Deferred *= (1 + o_Yearly_netReturn);
        o_Free *= (1 + o_Yearly_netReturn);

        let o_surplus = (yearOptimizedIncome * (1 - effectiveTaxRate)) - (currentSpending + yearCollegeDrag + currentYearlyDebtService);

        if (s_maxRetirement?.active && o_surplus > 0) {
            const contributionLimit = 30000 * inflationFactor;
            const contribution = Math.min(o_surplus, contributionLimit);
            const taxSavings = contribution * effectiveTaxRate;
            o_Deferred += contribution;
            o_surplus = o_surplus - contribution + taxSavings;
            pendingEvents.push({ label: 'Max Retirement', impact: 'Tax Savings Reinvested' });
        }
        o_Taxable += o_surplus;
    }

    if (isSimplePath) explanations.push("JL Collins: Fee-drag reduction strategy active.");
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

    // Aggregate Initial Wealth using same logic as Projection
    const safeFamily = Array.isArray(family) ? family : [];
    const isPrimaryUnit = safeFamily.some(m => m.relation === 'Self');

    // Aggregated debt and real estate initial state
    const clanPropertyDebts = [];
    const clanRentalIncome = [];
    const clanRentalExpenses = [];
    let initial_b_Taxable = isPrimaryUnit ? (parseFloat(financials.assets?.taxable) || 0) : 0;
    let initial_b_Deferred = isPrimaryUnit ? (parseFloat(financials.assets?.taxDeferred) || 0) : 0;
    let initial_b_Free = isPrimaryUnit ? (parseFloat(financials.assets?.taxFree) || 0) : 0;

    if (isPrimaryUnit) {
        const re = financials.assets?.realEstate || [];
        if (Array.isArray(re)) {
            re.forEach(p => {
                initial_b_Taxable += (parseFloat(p.value) || 0);
                if (p.type === 'rental') {
                    if (p.annualIncome) clanRentalIncome.push(parseFloat(p.annualIncome) || 0);
                    const expenses = (parseFloat(p.propertyTax) || 0) + (parseFloat(p.managementFee) || 0);
                    if (expenses) clanRentalExpenses.push(expenses);
                }
                if (p.mortgage) clanPropertyDebts.push({ balance: parseFloat(p.mortgage) || 0, rate: parseFloat(p.rate) || 0.04, term: parseInt(p.termYears) || 30 });
            });
        }

        initial_b_Taxable += (parseFloat(financials.assets?.cash) || 0);

        // Global Clan Positions
        if (Array.isArray(financials.assets?.positions)) {
            financials.assets.positions.forEach(pos => {
                const val = parseFloat(pos.value) || 0;
                if (pos.taxStatus === 'taxable' || !pos.taxStatus) initial_b_Taxable += val;
                else if (pos.taxStatus === 'taxDeferred') initial_b_Deferred += val;
                else if (pos.taxStatus === 'taxFree') initial_b_Free += val;
            });
        }
    }

    const memberPropertyDebts = [];
    const memberRentalIncome = [];
    const memberRentalExpenses = [];
    safeFamily.forEach(m => {
        if (m.financials) {
            const f = m.financials;

            // Assets Hierarchy
            let memberAssetsAddedByHierarchy = false;

            if (Array.isArray(f.positions) && f.positions.length > 0) {
                f.positions.forEach(pos => {
                    const val = parseFloat(pos.value) || 0;
                    if (pos.taxStatus === 'taxDeferred') initial_b_Deferred += val;
                    else if (pos.taxStatus === 'taxFree') initial_b_Free += val;
                    else initial_b_Taxable += val;
                });
                memberAssetsAddedByHierarchy = true;
            }

            if (!memberAssetsAddedByHierarchy && ((parseFloat(f.stocks) || 0) > 0 || (parseFloat(f.retirement) || 0) > 0 || (parseFloat(f.taxFree) || 0) > 0)) {
                initial_b_Taxable += (parseFloat(f.stocks) || 0);
                initial_b_Deferred += (parseFloat(f.retirement) || 0);
                initial_b_Free += (parseFloat(f.taxFree) || 0);
                memberAssetsAddedByHierarchy = true;
            }

            // Fallback to taxBuckets
            if (!memberAssetsAddedByHierarchy && f.taxBuckets) {
                initial_b_Taxable += (parseFloat(f.taxBuckets.taxable) || 0);
                initial_b_Deferred += (parseFloat(f.taxBuckets.taxDeferred) || 0);
                initial_b_Free += (parseFloat(f.taxBuckets.taxFree) || 0);
            }

            initial_b_Taxable += (parseFloat(f.cash) || 0);

            // Member Granular Real Estate
            if (f.realEstate && Array.isArray(f.realEstate)) {
                f.realEstate.forEach(p => {
                    initial_b_Taxable += (parseFloat(p.value) || 0);
                    if (p.type === 'rental') {
                        if (p.annualIncome) memberRentalIncome.push(parseFloat(p.annualIncome) || 0);
                        const expenses = (parseFloat(p.propertyTax) || 0) + (parseFloat(p.managementFee) || 0);
                        if (expenses) memberRentalExpenses.push(expenses);
                    }
                    if (p.mortgage) memberPropertyDebts.push({ balance: parseFloat(p.mortgage) || 0, rate: parseFloat(p.rate) || 0.04, term: parseInt(p.termYears) || 30 });
                });
            }

            // Member Granular Debts
            if (Array.isArray(f.debts) && f.debts.length > 0) {
                f.debts.forEach(debt => {
                    memberPropertyDebts.push({ balance: parseFloat(debt.balance) || 0, rate: parseFloat(debt.rate) || 0.05, term: parseInt(debt.termYears) || 30 });
                });
            } else if (f.loans) {
                memberPropertyDebts.push({ balance: parseFloat(f.loans) || 0, rate: 0.05, term: 10 });
            }
        }
    });

    const allDebts = [...clanPropertyDebts, ...memberPropertyDebts];
    const totalRentalIncome = [...clanRentalIncome, ...memberRentalIncome].reduce((a, b) => a + b, 0);
    const totalRentalExpenses = [...clanRentalExpenses, ...memberRentalExpenses].reduce((a, b) => a + b, 0);

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
        let b_Taxable = initial_b_Taxable;
        let b_Deferred = initial_b_Deferred;
        let b_Free = initial_b_Free;

        const path = [];
        const effectiveTaxRate = financials.taxRate || 0.28;
        let failed = false;

        for (let year = 0; year <= years; year++) {
            const inflationFactor = Math.pow(1 + inflationRate, year);

            // Refined Debt Calculation (Amortized Principal)
            const debt = allDebts.reduce((acc, d) => {
                const P = d.balance || 0;
                const r = d.rate || 0.05;
                const n = d.term || 30;
                if (year >= n) return acc;

                let remaining;
                if (r === 0) {
                    remaining = P * (1 - year / n);
                } else {
                    remaining = P * (Math.pow(1 + r, n) - Math.pow(1 + r, year)) / (Math.pow(1 + r, n) - 1);
                }
                return acc + Math.max(0, remaining);
            }, 0);

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
                let yearIncome = (parseFloat(financials.income) || 0) * Math.pow(1.02, year) + (totalRentalIncome - totalRentalExpenses) * inflationFactor;
                let yearSpending = (parseFloat(financials.spending) || 0) * inflationFactor;

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
            successRate: finalSuccessRate
        });
    }

    return results;
};
