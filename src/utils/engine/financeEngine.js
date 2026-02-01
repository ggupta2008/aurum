import { deriveEquityData } from './equityIntelligence';

export const INITIAL_PROFILE = {
    financials: {
        income: 0,
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

const STATE_TAX_MAP = {
    'CA': 0.133, 'NY': 0.109, 'NJ': 0.1075, 'TX': 0.0, 'FL': 0.0, 'WA': 0.0, 'MA': 0.05, 'Other': 0.05
};

export const WEALTH_GOALS = [
    { id: 'max_wealth', name: 'Maximize Net Worth', description: 'Aggressive growth focus. Prioritizes total compounded return.' },
    { id: 'tax_min', name: 'Tax Minimization', description: 'Keep what you earn. Prioritizes harvesting and tax-free structures.' },
    { id: 'estate_transfer', name: 'Generational Transfer', description: 'Dynastic wealth. Prioritizes estate freezing and trust structures.' },
    { id: 'income_gen', name: 'Passive Income', description: 'Cash flow focus. Prioritizes high-yield assets and dividend strategies.' }
];

export const AVAILABLE_STRATEGIES = [];

export const getRecommendedStrategies = () => [];

const VTSAX_ER = 0.0004;

export const calculatePortfolioFees = (profile) => {
    let positionValue = 0;
    let totalAnnualFees = 0;
    let hasPositions = false;

    const scan = (positions) => {
        if (!positions || !Array.isArray(positions)) return;
        positions.forEach(pos => {
            const val = pos.value || 0;
            if (val <= 0) return;
            hasPositions = true;
            positionValue += val;
            const tickerData = deriveEquityData(pos.ticker || '');
            const er = pos.expenseRatio !== undefined ? pos.expenseRatio : (tickerData && tickerData.expenseRatio !== undefined ? tickerData.expenseRatio : VTSAX_ER);
            totalAnnualFees += (val * er);
        });
    };

    if (profile.financials?.assets?.positions) scan(profile.financials.assets.positions);
    if (Array.isArray(profile.family)) profile.family.forEach(m => scan(m.financials?.positions));

    if (!hasPositions || positionValue === 0) return VTSAX_ER;
    return totalAnnualFees / positionValue;
};

const applyAIStrategyImpacts = (strategies, params) => {
    let { marketReturn, taxRate, surplus } = params;
    Object.values(strategies).forEach(strat => {
        if (!strat.active) return;
        const val = parseFloat(strat.impact_value) || 0;
        switch (strat.impact_type) {
            case 'return_boost': marketReturn += val; break;
            case 'tax_reduction': taxRate = Math.max(0, taxRate - val); break;
            case 'cash_flow': surplus += val; break;
        }
    });
    return { marketReturn, taxRate, surplus };
};

const initializeProjectionState = (profile) => {
    const { financials, family } = profile;
    const safeFamily = Array.isArray(family) ? family : [];
    const isPrimaryUnit = safeFamily.some(m => m.relation === 'Self');

    let b_Taxable = 0, b_Deferred = 0, b_Free = 0;
    const clanPropertyDebts = [];

    if (isPrimaryUnit) {
        let clanAssetsAdded = false;
        const clanPOS = financials.assets?.positions || [];
        if (Array.isArray(clanPOS) && clanPOS.length > 0) {
            clanPOS.forEach(pos => {
                const val = parseFloat(pos.value) || 0;
                if (pos.taxStatus === 'taxDeferred') b_Deferred += val;
                else if (pos.taxStatus === 'taxFree') b_Free += val;
                else b_Taxable += val;
            });
            clanAssetsAdded = true;
        }
        if (!clanAssetsAdded) {
            b_Taxable += (parseFloat(financials.assets?.taxable) || 0);
            b_Deferred += (parseFloat(financials.assets?.taxDeferred) || 0);
            b_Free += (parseFloat(financials.assets?.taxFree) || 0);
        }
        b_Taxable += (parseFloat(financials.assets?.cash) || 0);
        const clanRE = financials.assets?.realEstate || [];
        if (Array.isArray(clanRE)) {
            clanRE.forEach(p => {
                const val = Array.isArray(p) ? 0 : (parseFloat(p.value) || 0);
                b_Taxable += val;
                if (p.mortgage) clanPropertyDebts.push({ balance: parseFloat(p.mortgage) || 0, rate: parseFloat(p.rate) || 0.04, term: parseInt(p.termYears) || 30 });
            });
        } else if (typeof clanRE === 'number') {
            b_Taxable += clanRE;
        }
        (financials.liabilities || []).forEach(l => {
            clanPropertyDebts.push({ balance: parseFloat(l.balance) || 0, rate: parseFloat(l.rate) || 0.06, term: parseInt(l.term) || 5 });
        });
    }

    const memberPropertyDebts = [];
    const memberIncomes = [];
    let totalMemberSpending = 0;

    safeFamily.forEach(member => {
        const f = member.financials;
        if (!f) return;
        if (f.income > 0) memberIncomes.push({ name: member.name, income: f.income, yearsUntilRetirement: Math.max(0, (member.retirementAge || 67) - member.age) });
        totalMemberSpending += (parseFloat(f.spending) || 0);
        
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
        if (!memberAssetsAdded) {
            b_Taxable += (parseFloat(f.stocks) || 0);
            b_Deferred += (parseFloat(f.retirement) || 0);
            b_Free += (parseFloat(f.taxFree) || 0);
        }
        b_Taxable += (parseFloat(f.cash) || 0);
        if (Array.isArray(f.realEstate)) {
            f.realEstate.forEach(p => {
                b_Taxable += (parseFloat(p.value) || 0);
                if (p.mortgage) memberPropertyDebts.push({ balance: parseFloat(p.mortgage) || 0, rate: parseFloat(p.rate) || 0.04, term: parseInt(p.termYears) || 30 });
            });
        } else if (typeof f.realEstate === 'number') {
            b_Taxable += f.realEstate;
        }
        if (Array.isArray(f.debts)) {
            f.debts.forEach(d => memberPropertyDebts.push({ balance: parseFloat(d.balance) || 0, rate: parseFloat(d.rate) || 0.05, term: parseInt(d.termYears) || 30 }));
        }
    });

    const primaryMember = safeFamily.find(f => f.relation === 'Self') || safeFamily[0];
    const effectiveTaxRate = (financials.taxRate !== undefined ? financials.taxRate : 0.24) + (STATE_TAX_MAP[primaryMember?.state] || 0);
    const allDebts = [...clanPropertyDebts, ...memberPropertyDebts];

    return {
        b_Taxable, b_Deferred, b_Free,
        allDebts,
        memberIncomes,
        totalMemberSpending,
        effectiveTaxRate,
        financials
    };
};

export const calculateProjection = (profile) => {
    const state = initializeProjectionState(profile);
    let { b_Taxable, b_Deferred, b_Free } = state;
    const { allDebts, memberIncomes, totalMemberSpending, effectiveTaxRate, financials } = state;
    const { strategies } = profile;
    const years = 25;
    const data = [];
    const explanations = [];

    let o_Taxable = b_Taxable, o_Deferred = b_Deferred, o_Free = b_Free;
    const regime = MARKET_REGIMES[profile.marketRegime] || MARKET_REGIMES['goldilocks'];
    const baselineDrag = calculatePortfolioFees(profile);
    const safeStrategies = strategies || {};
    const activeStrategyCount = Object.keys(safeStrategies).filter(k => safeStrategies[k].active).length;

    for (let year = 0; year <= years; year++) {
        const currentYear = new Date().getFullYear() + year;
        const inflationFactor = Math.pow(1 + regime.inflation, year);
        const wageGrowth = Math.pow(1.02, year);
        const currentRemainingDebt = allDebts.reduce((acc, d) => {
            const n = d.term || 30;
            if (year >= n) return acc;
            return acc + d.balance * (Math.pow(1 + d.rate, n) - Math.pow(1 + d.rate, year)) / (Math.pow(1 + d.rate, n) - 1);
        }, 0);

        const b_Total = b_Taxable + (b_Deferred * 0.7) + b_Free;
        const o_Total = o_Taxable + (o_Deferred * 0.7) + o_Free;
        const displayBaseline = Math.round(b_Total - currentRemainingDebt);
        data.push({
            year: currentYear,
            baseline: displayBaseline,
            optimized: activeStrategyCount > 0 ? Math.round(o_Total - currentRemainingDebt) : displayBaseline,
            breakdown: { taxable: Math.round(o_Taxable), deferred: Math.round(o_Deferred), taxFree: Math.round(o_Free) }
        });

        if (year === years) break;
        const yearIncome = (parseFloat(financials.income) || 0) * wageGrowth + memberIncomes.reduce((t, m) => year >= m.yearsUntilRetirement ? t : t + (m.income * wageGrowth), 0);
        const currentSpending = (parseFloat(financials.spending) || 0 + totalMemberSpending) * inflationFactor;
        const b_res = applyAIStrategyImpacts({}, { marketReturn: regime.return - baselineDrag, taxRate: effectiveTaxRate, surplus: 0 });
        const o_res = applyAIStrategyImpacts(safeStrategies, { marketReturn: regime.return - baselineDrag, taxRate: effectiveTaxRate, surplus: 0 });

        b_Taxable *= (1 + b_res.marketReturn * (1 - b_res.taxRate)); b_Deferred *= (1 + b_res.marketReturn); b_Free *= (1 + b_res.marketReturn);
        b_Taxable += yearIncome * (1 - b_res.taxRate) - currentSpending;

        o_Taxable *= (1 + o_res.marketReturn * (1 - o_res.taxRate)); o_Deferred *= (1 + o_res.marketReturn); o_Free *= (1 + o_res.marketReturn);
        o_Taxable += yearIncome * (1 - o_res.taxRate) - currentSpending + o_res.surplus;
    }
    return { data, explanations };
};

const boxMullerRandom = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const calculateMonteCarlo = (profile, iterations = 250) => {
    const years = 25;
    const allIterationResults = [];
    const baselineDrag = calculatePortfolioFees(profile);
    const regime = MARKET_REGIMES[profile.marketRegime] || MARKET_REGIMES['goldilocks'];
    const volatility = 0.15; // 15% annual volatility

    for (let i = 0; i < iterations; i++) {
        const state = initializeProjectionState(profile);
        let { b_Taxable, b_Deferred, b_Free } = state;
        const { allDebts, memberIncomes, totalMemberSpending, effectiveTaxRate, financials } = state;
        const yearWealths = [];
        let failed = false;

        for (let year = 0; year <= years; year++) {
            const inflationFactor = Math.pow(1 + regime.inflation, year);
            const wageGrowth = Math.pow(1.02, year);
            const currentRemainingDebt = allDebts.reduce((acc, d) => {
                const n = d.term || 30;
                if (year >= n) return acc;
                return acc + d.balance * (Math.pow(1 + d.rate, n) - Math.pow(1 + d.rate, year)) / (Math.pow(1 + d.rate, n) - 1);
            }, 0);

            const totalWealth = b_Taxable + (b_Deferred * 0.7) + b_Free - currentRemainingDebt;
            yearWealths.push(totalWealth);
            if (totalWealth < 0) failed = true;

            if (year === years) break;

            // Randomize return for this year
            const yearlyReturn = regime.return + boxMullerRandom() * volatility;
            const b_res = applyAIStrategyImpacts({}, { marketReturn: yearlyReturn - baselineDrag, taxRate: effectiveTaxRate, surplus: 0 });

            const yearIncome = (parseFloat(financials.income) || 0) * wageGrowth + memberIncomes.reduce((t, m) => year >= m.yearsUntilRetirement ? t : t + (m.income * wageGrowth), 0);
            const currentSpending = (parseFloat(financials.spending) || 0 + totalMemberSpending) * inflationFactor;

            b_Taxable *= (1 + b_res.marketReturn * (1 - b_res.taxRate)); b_Deferred *= (1 + b_res.marketReturn); b_Free *= (1 + b_res.marketReturn);
            b_Taxable += yearIncome * (1 - b_res.taxRate) - currentSpending;
        }
        allIterationResults.push({ yearWealths, failed });
    }

    const results = [];
    for (let year = 0; year <= years; year++) {
        const yearValues = allIterationResults.map(r => r.yearWealths[year]).sort((a, b) => a - b);
        const p10 = yearValues[Math.floor(iterations * 0.1)];
        const p50 = yearValues[Math.floor(iterations * 0.5)];
        const p90 = yearValues[Math.floor(iterations * 0.9)];
        
        const failuresSoFar = allIterationResults.filter(r => {
            for (let y = 0; y <= year; y++) if (r.yearWealths[y] < 0) return true;
            return false;
        }).length;
        
        results.push({
            year: new Date().getFullYear() + year,
            p10: Math.max(0, p10),
            p50: Math.max(0, p50),
            p90: Math.max(0, p90),
            successRate: Math.round(((iterations - failuresSoFar) / iterations) * 100)
        });
    }
    return results;
};