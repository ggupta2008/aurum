import React, { useState, useMemo } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Sparkles, Target, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock, Zap, ArrowRight } from 'lucide-react';

const FinancialActionPlan = () => {
    const {
        scopedCurrentWealth,
        scopedSpending,
        scopedIncome,
        scopedProjection,
        targetMembers,
        formatCurrency,
        profile,
        toggleStrategy
    } = useScopedWealth();

    const [expandedPhase, setExpandedPhase] = useState('today');

    // Get user's strategic objective (freeform text)
    const strategicObjective = profile?.goals?.objective || '';

    // AI-powered objective interpretation
    const interpretObjective = (objective) => {
        const lower = objective.toLowerCase();
        const analysis = {
            themes: [],
            targets: {},
            urgency: 'medium',
            timeframe: null
        };

        // Detect themes
        if (lower.includes('retire') || lower.includes('financial independence') || lower.includes('fi')) {
            analysis.themes.push('retirement');
        }
        if (lower.includes('tax') || lower.includes('roth') || lower.includes('minimize tax')) {
            analysis.themes.push('tax_optimization');
        }
        if (lower.includes('estate') || lower.includes('legacy') || lower.includes('children') || lower.includes('heirs')) {
            analysis.themes.push('estate_planning');
        }
        if (lower.includes('passive income') || lower.includes('dividend') || lower.includes('cash flow')) {
            analysis.themes.push('passive_income');
        }
        if (lower.includes('debt') || lower.includes('pay off') || lower.includes('loan')) {
            analysis.themes.push('debt_elimination');
        }
        if (lower.includes('emergency') || lower.includes('safety') || lower.includes('buffer')) {
            analysis.themes.push('emergency_fund');
        }
        if (lower.includes('real estate') || lower.includes('rental') || lower.includes('property')) {
            analysis.themes.push('real_estate');
        }

        // Extract numeric targets
        const netWorthMatch = objective.match(/\$?([\d,]+)([km])?.*(?:net worth|wealth|portfolio)/i);
        if (netWorthMatch) {
            let amount = parseInt(netWorthMatch[1].replace(/,/g, ''));
            if (netWorthMatch[2]?.toLowerCase() === 'k') amount *= 1000;
            if (netWorthMatch[2]?.toLowerCase() === 'm') amount *= 1000000;
            analysis.targets.netWorth = amount;
        }

        const incomeMatch = objective.match(/\$?([\d,]+)([km])?.*(?:income|cash flow|passive)/i);
        if (incomeMatch) {
            let amount = parseInt(incomeMatch[1].replace(/,/g, ''));
            if (incomeMatch[2]?.toLowerCase() === 'k') amount *= 1000;
            if (incomeMatch[2]?.toLowerCase() === 'm') amount *= 1000000;
            analysis.targets.passiveIncome = amount;
        }

        // Extract timeframe
        const ageMatch = objective.match(/(?:by|at)?\s*age\s*(\d+)/i);
        if (ageMatch) {
            analysis.targets.retirementAge = parseInt(ageMatch[1]);
        }

        const yearsMatch = objective.match(/(?:in|within)?\s*(\d+)\s*years?/i);
        if (yearsMatch) {
            analysis.timeframe = parseInt(yearsMatch[1]);
        }

        // Determine urgency
        if (lower.includes('asap') || lower.includes('urgent') || lower.includes('immediately') || analysis.timeframe <= 3) {
            analysis.urgency = 'high';
        } else if (analysis.timeframe >= 10) {
            analysis.urgency = 'low';
        }

        return analysis;
    };

    const objectiveAnalysis = useMemo(() => interpretObjective(strategicObjective), [strategicObjective]);

    // Calculate key metrics
    const data = scopedProjection.data || [];
    const lastPoint = data[data.length - 1] || {};
    const currentNW = scopedCurrentWealth;
    const projectedNW = lastPoint.optimized || 0;
    const savingsRate = scopedIncome > 0 ? ((scopedIncome - scopedSpending) / scopedIncome) * 100 : 0;

    // Calculate actual emergency fund from cash on hand
    const financials = profile?.financials || {};
    let totalCash = parseFloat(financials.assets?.cash) || 0;

    // Add member cash
    targetMembers.forEach(member => {
        totalCash += parseFloat(member.financials?.cash) || 0;
    });

    const emergencyFund = totalCash;
    const emergencyFundMonths = scopedSpending > 0 ? (emergencyFund / scopedSpending) * 12 : 0;

    // Calculate debt-to-income ratio
    let totalDebt = 0;
    const clanLiabilities = financials.liabilities || [];
    if (Array.isArray(clanLiabilities)) {
        clanLiabilities.forEach(l => totalDebt += parseFloat(l.balance) || 0);
    }
    targetMembers.forEach(member => {
        const memberDebts = member.financials?.debts || [];
        if (Array.isArray(memberDebts)) {
            memberDebts.forEach(d => totalDebt += parseFloat(d.balance) || 0);
        }
    });
    const debtToIncome = scopedIncome > 0 ? totalDebt / scopedIncome : 0;

    // Analyze current situation
    const situation = useMemo(() => {
        const analysis = {
            netWorth: currentNW,
            savingsRate,
            hasEmergencyFund: emergencyFund >= scopedSpending * 0.5,
            hasDebt: debtToIncome > 0,
            isRetirementFunded: currentNW > scopedSpending * 10,
            taxOptimized: profile?.strategies?.roth_conversion?.active || false,
            estatePlanned: profile?.strategies?.trust_structure?.active || false,
            diversified: true // Analyze portfolio concentration
        };

        // Calculate urgency scores
        analysis.urgencies = {
            emergency: analysis.hasEmergencyFund ? 'low' : 'high',
            debt: debtToIncome > 0.3 ? 'high' : debtToIncome > 0.1 ? 'medium' : 'low',
            retirement: currentNW < scopedSpending * 5 ? 'high' : 'medium',
            tax: !analysis.taxOptimized ? 'medium' : 'low',
            estate: currentNW > 5000000 && !analysis.estatePlanned ? 'high' : 'low'
        };

        return analysis;
    }, [currentNW, savingsRate, emergencyFund, scopedSpending, debtToIncome, profile]);

    // Generate AI-powered recommendations
    const generateRecommendations = () => {
        const recommendations = {
            today: [],
            year1: [],
            year5: [],
            year10: []
        };

        // TODAY - Immediate Actions
        if (emergencyFundMonths < 6) {
            const needed = (scopedSpending * 0.5) - emergencyFund;
            recommendations.today.push({
                priority: emergencyFundMonths < 3 ? 'critical' : 'high',
                action: 'Build Emergency Fund',
                description: `Current: ${emergencyFundMonths.toFixed(1)} months. Target: 6 months (${formatCurrency(scopedSpending * 0.5)})`,
                why: 'Protects against job loss, medical emergencies, and unexpected expenses',
                how: needed > 0
                    ? `Save additional ${formatCurrency(needed)} in high-yield savings account (currently have ${formatCurrency(emergencyFund)})`
                    : 'Move existing cash to high-yield savings account for better returns'
            });
        }

        if (savingsRate < 15) {
            recommendations.today.push({
                priority: 'high',
                action: 'Increase Savings Rate',
                description: `Target 20%+ savings rate (currently ${savingsRate.toFixed(1)}%)`,
                why: 'Every 1% increase in savings rate reduces years to FI by ~1 year',
                how: 'Review subscriptions, negotiate bills, implement 50/30/20 budget rule'
            });
        }

        if (situation.hasDebt && debtToIncome > 0.2) {
            recommendations.today.push({
                priority: 'high',
                action: 'Debt Avalanche Strategy',
                description: 'Pay off high-interest debt (>6% APR) aggressively',
                why: 'Debt interest compounds against you - eliminating it is a guaranteed return',
                how: 'Pay minimums on all debts, throw extra cash at highest interest rate first'
            });
        }

        // Check if any earning member is not maxing 401k
        const earningMembers = targetMembers.filter(m => (m.financials?.income || 0) > 0);
        const notMaxing401k = earningMembers.some(m => !m.maxing401k);

        if (notMaxing401k) {
            const membersNotMaxing = earningMembers.filter(m => !m.maxing401k).map(m => m.name).join(', ');
            recommendations.today.push({
                priority: 'medium',
                action: 'Maximize 401(k) Match',
                description: `${membersNotMaxing}: Contribute enough to get full employer match`,
                why: 'Employer match is free money - instant 50-100% return',
                how: 'Increase 401(k) contribution to at least match threshold (typically 6% of salary)'
            });
        }

        // YEAR 1 - Foundation Building
        // Simple Path
        if (objectiveAnalysis.themes.length === 0 || !objectiveAnalysis.themes.includes('passive_income')) {
            recommendations.year1.push({
                priority: 'high',
                action: 'Implement Simple Path Strategy',
                description: 'Shift to low-cost index funds (VTSAX/VTI)',
                why: 'Reduce fees from 1.2% to 0.15% - saves millions over 25 years',
                how: 'Open Vanguard account, set up automatic monthly investments',
                strategyId: 'simple_path'
            });
        }

        if (objectiveAnalysis.themes.includes('tax_optimization')) {
            recommendations.year1.push({
                priority: 'high',
                action: 'Roth Conversion Ladder',
                description: 'Convert $25k-50k from Traditional IRA to Roth annually',
                why: 'Pay taxes now at lower rates, enjoy tax-free growth forever',
                how: 'Work with CPA to optimize conversion amount based on tax bracket',
                strategyId: 'roth_conversion'
            });
        }

        recommendations.year1.push({
            priority: 'medium',
            action: 'Max Out Tax-Advantaged Accounts',
            description: '401(k): $23k, IRA: $7k, HSA: $4.15k (if eligible)',
            why: 'Reduces taxable income by $34k+, saves ~$10k in taxes annually',
            how: 'Increase payroll deductions, set up automatic IRA contributions',
            strategyId: 'max_retirement'
        });

        recommendations.year1.push({
            priority: 'medium',
            action: 'Optimize Asset Location',
            description: 'Bonds in tax-deferred, stocks in Roth, REITs in taxable',
            why: 'Tax-efficient placement adds 0.3-0.5% annual returns',
            how: 'Rebalance portfolio across account types based on tax efficiency'
        });

        // YEAR 5 - Wealth Acceleration
        if (currentNW > 500000) {
            recommendations.year5.push({
                priority: 'high',
                action: 'Backdoor Roth Mega Contributions',
                description: 'After-tax 401(k) contributions + immediate Roth conversion',
                why: 'Get $40k+ into Roth annually, bypassing income limits',
                how: 'Check if employer plan allows, set up automatic conversions',
                strategyId: 'backdoor_roth'
            });
        }

        if (objectiveAnalysis.themes.includes('passive_income')) {
            recommendations.year5.push({
                priority: 'high',
                action: 'Build Dividend Snowball',
                description: 'Shift 30-40% to dividend aristocrats (VYM, SCHD)',
                why: 'Create passive income stream that grows 5-7% annually',
                how: 'Dollar-cost average into dividend ETFs, reinvest all dividends'
            });
        }

        recommendations.year5.push({
            priority: 'medium',
            action: 'Real Estate Investment',
            description: 'Consider rental property or REIT allocation',
            why: 'Diversification, inflation hedge, potential tax benefits',
            how: 'Research markets, run cash flow analysis, consider turnkey properties'
        });

        if (objectiveAnalysis.themes.includes('estate_planning')) {
            recommendations.year5.push({
                priority: 'medium',
                action: 'Establish Revocable Living Trust',
                description: 'Create trust structure for estate planning',
                why: 'Avoid probate, maintain privacy, control asset distribution',
                how: 'Consult estate attorney, transfer assets to trust'
            });
        }

        // YEAR 10 - Legacy & Optimization
        if (currentNW > 2000000) {
            recommendations.year10.push({
                priority: 'high',
                action: 'Tax-Loss Harvesting System',
                description: 'Implement automated tax-loss harvesting',
                why: 'Generate $3k+ annual tax deductions, defer capital gains',
                how: 'Use robo-advisor with TLH or manual rebalancing',
                strategyId: 'direct_indexing'
            });
        }

        if (objectiveAnalysis.themes.includes('estate_planning') && currentNW > 5000000) {
            recommendations.year10.push({
                priority: 'high',
                action: 'Irrevocable Life Insurance Trust (ILIT)',
                description: 'Move life insurance out of taxable estate',
                why: 'Protect heirs from 40% estate tax on insurance proceeds',
                how: 'Work with estate attorney and insurance specialist'
            });
        }

        recommendations.year10.push({
            priority: 'medium',
            action: 'Qualified Charitable Distribution (QCD)',
            description: 'Direct RMDs to charity (age 70.5+)',
            why: 'Satisfy RMD requirement without increasing taxable income',
            how: 'Coordinate with IRA custodian, choose qualified charities'
        });

        if (objectiveAnalysis.themes.includes('tax_optimization')) {
            recommendations.year10.push({
                priority: 'medium',
                action: 'Geographic Arbitrage',
                description: 'Consider relocating to low/no tax state',
                why: 'Save 5-13% on state taxes - $50k+ annually on $1M income',
                how: 'Research TX, FL, WA, NV - establish domicile properly'
            });
        }

        return recommendations;
    };

    // Calculate financial impact of missing each phase
    const calculateImpact = () => {
        const regime = profile?.marketRegime || 'goldilocks';
        const regimeReturns = {
            'goldilocks': 0.10,
            'stagflation': 0.04,
            'recession': 0.02,
            'boom': 0.14
        };
        const baseReturn = regimeReturns[regime] || 0.10;
        const yearsToProject = 25;

        const impacts = {
            today: { lostNW: 0, percentage: 0, description: '' },
            year1: { lostNW: 0, percentage: 0, description: '' },
            year5: { lostNW: 0, percentage: 0, description: '' },
            year10: { lostNW: 0, percentage: 0, description: '' }
        };

        // TODAY: Missing emergency fund or high savings rate
        if (!situation.hasEmergencyFund || savingsRate < 15) {
            // Cost: Opportunity cost of not investing + potential debt from emergencies
            const missedSavings = (0.20 - (savingsRate / 100)) * scopedIncome; // Gap to 20% savings
            const emergencyCost = !situation.hasEmergencyFund ? 10000 : 0; // Avg emergency debt
            const totalMissed = Math.max(0, missedSavings) + emergencyCost;

            // Compound over 25 years
            impacts.today.lostNW = totalMissed * Math.pow(1 + baseReturn, yearsToProject);
            impacts.today.percentage = (impacts.today.lostNW / projectedNW) * 100;
            impacts.today.description = `Missing ${formatCurrency(totalMissed)}/year in savings compounds to ${formatCurrency(impacts.today.lostNW)} lost over 25 years`;
        }

        // YEAR 1: Fee drag (1.2% vs 0.15%)
        if (!profile?.strategies?.simple_path?.active) {
            const feeDifference = 0.0105; // 1.2% - 0.15%
            const yearsRemaining = yearsToProject - 1;

            // Calculate wealth with high fees vs low fees
            const withHighFees = currentNW * Math.pow(1 + baseReturn - 0.012, yearsRemaining);
            const withLowFees = currentNW * Math.pow(1 + baseReturn - 0.0015, yearsRemaining);

            impacts.year1.lostNW = withLowFees - withHighFees;
            impacts.year1.percentage = (impacts.year1.lostNW / projectedNW) * 100;
            impacts.year1.description = `Fee drag of 1.05% annually costs ${formatCurrency(impacts.year1.lostNW)} over ${yearsRemaining} years`;
        }

        // YEAR 5: Tax inefficiency + missed Roth conversions
        if (objectiveAnalysis.themes.includes('tax_optimization') && !profile?.strategies?.roth_conversion?.active) {
            // Roth conversion saves ~15% in taxes on RMDs in retirement
            const futureRMDs = currentNW * 0.15; // Assume 15% of portfolio in RMDs
            const taxSavings = futureRMDs * 0.15; // 15% tax savings
            const yearsRemaining = yearsToProject - 5;

            impacts.year5.lostNW = taxSavings * Math.pow(1 + baseReturn, yearsRemaining);
            impacts.year5.percentage = (impacts.year5.lostNW / projectedNW) * 100;
            impacts.year5.description = `Tax inefficiency costs ${formatCurrency(impacts.year5.lostNW)} in lost tax-free growth`;
        }

        // YEAR 10: Estate tax (40% on amounts over $13.6M)
        if (objectiveAnalysis.themes.includes('estate_planning') && currentNW > 5000000 && !profile?.strategies?.trust_structure?.active) {
            const estateTaxThreshold = 13600000;
            const projectedEstate = projectedNW;

            if (projectedEstate > estateTaxThreshold) {
                const taxableAmount = projectedEstate - estateTaxThreshold;
                const estateTax = taxableAmount * 0.40;

                impacts.year10.lostNW = estateTax;
                impacts.year10.percentage = (impacts.year10.lostNW / projectedNW) * 100;
                impacts.year10.description = `Estate tax of 40% on ${formatCurrency(taxableAmount)} = ${formatCurrency(estateTax)} lost to taxes`;
            }
        }

        return impacts;
    };

    const recommendations = useMemo(generateRecommendations, [situation, objectiveAnalysis, currentNW, savingsRate]);
    const impacts = useMemo(calculateImpact, [situation, objectiveAnalysis, currentNW, projectedNW, savingsRate, profile]);

    const phases = [
        { id: 'today', label: 'Now', icon: Zap, color: 'danger', timeframe: 'Immediate' },
        { id: 'year1', label: 'Year 1', icon: Target, color: 'warning', timeframe: 'Foundation' },
        { id: 'year5', label: 'Year 5', icon: TrendingUp, color: 'gold-primary', timeframe: 'Growth' },
        { id: 'year10', label: 'Year 10', icon: Sparkles, color: 'success', timeframe: 'Legacy' }
    ];

    const priorityConfig = {
        critical: { color: 'danger', label: 'Critical', icon: '🔴' },
        high: { color: 'warning', label: 'High', icon: '🟠' },
        medium: { color: 'gold-primary', label: 'Medium', icon: '🟡' },
        low: { color: 'success', label: 'Low', icon: '🟢' }
    };

    const totalActions = Object.values(recommendations).reduce((sum, phase) => sum + phase.length, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Header with Objective */}
            {strategicObjective && (
                <div className="glass-panel" style={{
                    padding: 'var(--space-5)',
                    background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.15), hsla(var(--gold-primary) / 0.05))',
                    border: '2px solid hsla(var(--gold-primary) / 0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                        <Target size={28} style={{ color: 'hsl(var(--gold-primary))', flexShrink: 0, marginTop: '4px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Your Strategic Objective
                            </div>
                            <div style={{ fontSize: '1.1rem', color: 'white', lineHeight: 1.6, fontWeight: 500, marginBottom: 'var(--space-3)' }}>
                                {strategicObjective}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>
                                <div>
                                    <span style={{ opacity: 0.7 }}>Current:</span> <strong>{formatCurrency(currentNW)}</strong>
                                </div>
                                <div>
                                    <span style={{ opacity: 0.7 }}>Projected (25yr):</span> <strong>{formatCurrency(projectedNW)}</strong>
                                </div>
                                <div>
                                    <span style={{ opacity: 0.7 }}>Savings Rate:</span> <strong>{savingsRate.toFixed(1)}%</strong>
                                </div>
                                <div>
                                    <span style={{ opacity: 0.7 }}>Actions:</span> <strong>{totalActions} recommended</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Phase Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
                {phases.map(phase => {
                    const Icon = phase.icon;
                    const isActive = expandedPhase === phase.id;
                    const count = recommendations[phase.id]?.length || 0;
                    const impact = impacts[phase.id];

                    return (
                        <button
                            key={phase.id}
                            onClick={() => setExpandedPhase(phase.id)}
                            className="glass-panel"
                            style={{
                                padding: 'var(--space-4)',
                                background: isActive
                                    ? `linear-gradient(135deg, hsla(var(--${phase.color}) / 0.2), hsla(var(--${phase.color}) / 0.05))`
                                    : 'hsla(var(--bg-surface) / 0.3)',
                                border: isActive
                                    ? `2px solid hsla(var(--${phase.color}) / 0.4)`
                                    : '1px solid hsla(var(--text-primary) / 0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: `hsl(var(--${phase.color}))`
                                }} />
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <Icon size={18} style={{ color: `hsl(var(--${phase.color}))` }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? `hsl(var(--${phase.color}))` : 'white' }}>
                                    {phase.label}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginBottom: 'var(--space-2)' }}>
                                {phase.timeframe}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                                    {count} {count === 1 ? 'action' : 'actions'}
                                </span>
                                {impact.lostNW > 0 && (
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '2px 6px',
                                        background: 'hsla(var(--danger) / 0.2)',
                                        borderRadius: 'var(--radius-full)',
                                        color: 'hsl(var(--danger))',
                                        fontWeight: 600
                                    }}>
                                        -{impact.percentage.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Impact Warning */}
            {impacts[expandedPhase].lostNW > 0 && (
                <div className="glass-panel" style={{
                    padding: 'var(--space-4)',
                    background: 'linear-gradient(135deg, hsla(var(--danger) / 0.15), hsla(var(--danger) / 0.05))',
                    border: '1px solid hsla(var(--danger) / 0.3)',
                    borderLeft: '4px solid hsl(var(--danger))'
                }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                        <AlertCircle size={20} style={{ color: 'hsl(var(--danger))', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--danger))', marginBottom: '4px' }}>
                                Cost of Inaction: <span style={{ fontSize: '0.95rem' }}>{formatCurrency(impacts[expandedPhase].lostNW)}</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                                {impacts[expandedPhase].description}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {recommendations[expandedPhase]?.map((rec, idx) => {
                    const config = priorityConfig[rec.priority];
                    const isStrategy = !!rec.strategyId;
                    const isActive = isStrategy && profile.strategies?.[rec.strategyId]?.active;

                    return (
                        <div
                            key={idx}
                            onClick={() => isStrategy && toggleStrategy(rec.strategyId)}
                            className={isStrategy ? "glass-panel-interactive" : "glass-panel"}
                            style={{
                                padding: 'var(--space-4)',
                                background: isActive ? 'hsla(var(--gold-primary) / 0.08)' : 'hsla(var(--bg-surface) / 0.5)',
                                border: isActive
                                    ? '1px solid hsl(var(--gold-primary))'
                                    : `1px solid hsla(var(--${config.color}) / 0.2)`,
                                borderLeft: isActive
                                    ? '4px solid hsl(var(--gold-primary))'
                                    : `4px solid hsl(var(--${config.color}))`,
                                cursor: isStrategy ? 'pointer' : 'default',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-3)' }}>
                                <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                                    {/* Checkbox for strategies */}
                                    {isStrategy && (
                                        <div style={{
                                            flexShrink: 0,
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '4px',
                                            border: isActive ? 'none' : '2px solid hsla(var(--text-muted)/0.5)',
                                            background: isActive ? 'hsl(var(--gold-primary))' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: '2px'
                                        }}>
                                            {isActive && <CheckCircle2 size={14} color="white" />}
                                        </div>
                                    )}

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isActive ? 'hsl(var(--gold-primary))' : 'white' }}>
                                                {rec.action}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                                            {rec.description}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 10px',
                                    background: `hsla(var(--${config.color}) / 0.15)`,
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    color: `hsl(var(--${config.color}))`,
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {config.icon} {config.label}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 'var(--space-3)',
                                padding: 'var(--space-3)',
                                background: 'hsla(var(--bg-void) / 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.7rem',
                                lineHeight: 1.6
                            }}>
                                <div>
                                    <div style={{ color: 'hsl(var(--gold-primary))', fontWeight: 600, marginBottom: '4px' }}>
                                        💡 Why
                                    </div>
                                    <div style={{ color: 'hsl(var(--text-dim))' }}>
                                        {rec.why}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'hsl(var(--success))', fontWeight: 600, marginBottom: '4px' }}>
                                        ✓ How
                                    </div>
                                    <div style={{ color: 'hsl(var(--text-dim))' }}>
                                        {rec.how}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {recommendations[expandedPhase]?.length === 0 && (
                    <div className="glass-panel" style={{
                        padding: 'var(--space-6)',
                        textAlign: 'center',
                        background: 'hsla(var(--success) / 0.05)',
                        border: '1px solid hsla(var(--success) / 0.2)'
                    }}>
                        <CheckCircle2 size={40} style={{ color: 'hsl(var(--success))', marginBottom: 'var(--space-2)', opacity: 0.6 }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--success))', marginBottom: '4px' }}>
                            You're on track!
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))' }}>
                            No critical actions needed for this phase
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Note */}
            <div className="glass-panel" style={{
                padding: 'var(--space-3)',
                background: 'hsla(var(--gold-primary) / 0.05)',
                border: '1px solid hsla(var(--gold-primary) / 0.1)',
                fontSize: '0.65rem',
                color: 'hsl(var(--text-dim))',
                lineHeight: 1.6
            }}>
                <strong style={{ color: 'hsl(var(--gold-primary))' }}>🤖 AI-Powered Analysis:</strong> Recommendations dynamically generated based on your strategic objective, current financial situation ({formatCurrency(currentNW)} net worth, {savingsRate.toFixed(1)}% savings rate), and selected market regime ({profile?.marketRegime || 'goldilocks'}). Update your profile in "The Vault" for personalized advice.
            </div>
        </div>
    );
};

export default FinancialActionPlan;
