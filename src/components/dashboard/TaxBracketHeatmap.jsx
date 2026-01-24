import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Flame, TrendingUp, AlertTriangle, Zap, Info, X } from 'lucide-react';

const TaxBracketHeatmap = () => {
    const {
        profile,
        scopedProjection,
        planningScope,
        targetMembers,
        scopedAge,
        scopedTaxBuckets
    } = useScopedWealth();
    const [showMethodology, setShowMethodology] = useState(false);

    const data = scopedProjection.data || [];

    if (!data || data.length === 0) {
        return (
            <div className="glass-panel anim-fade-up anim-delay-5" style={{
                padding: 'var(--space-5)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                    Enter your financial data to see tax bracket projections.
                </p>
            </div>
        );
    }

    const formatCurrency = (v) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: 'compact'
    }).format(v);

    // 2024 Federal Tax Brackets (MFJ)
    const TAX_BRACKETS_MFJ = [
        { rate: 0.10, min: 0, max: 22000, label: '10%', color: 'hsl(120, 60%, 50%)' },
        { rate: 0.12, min: 22000, max: 89075, label: '12%', color: 'hsl(90, 60%, 50%)' },
        { rate: 0.22, min: 89075, max: 190750, label: '22%', color: 'hsl(60, 70%, 55%)' },
        { rate: 0.24, min: 190750, max: 364200, label: '24%', color: 'hsl(45, 80%, 55%)' },
        { rate: 0.32, min: 364200, max: 462500, label: '32%', color: 'hsl(30, 85%, 55%)' },
        { rate: 0.35, min: 462500, max: 693750, label: '35%', color: 'hsl(15, 90%, 55%)' },
        { rate: 0.37, min: 693750, max: Infinity, label: '37%', color: 'hsl(0, 95%, 55%)' }
    ];

    const TAX_BRACKETS_SINGLE = [
        { rate: 0.10, min: 0, max: 11000, label: '10%', color: 'hsl(120, 60%, 50%)' },
        { rate: 0.12, min: 11000, max: 44725, label: '12%', color: 'hsl(90, 60%, 50%)' },
        { rate: 0.22, min: 44725, max: 95375, label: '22%', color: 'hsl(60, 70%, 55%)' },
        { rate: 0.24, min: 95375, max: 182100, label: '24%', color: 'hsl(45, 80%, 55%)' },
        { rate: 0.32, min: 182100, max: 231250, label: '32%', color: 'hsl(30, 85%, 55%)' },
        { rate: 0.35, min: 231250, max: 578125, label: '35%', color: 'hsl(15, 90%, 55%)' },
        { rate: 0.37, min: 578125, max: Infinity, label: '37%', color: 'hsl(0, 95%, 55%)' }
    ];

    const hasSpouse = targetMembers.some(m => m.relation === 'Spouse');
    const brackets = hasSpouse ? TAX_BRACKETS_MFJ : TAX_BRACKETS_SINGLE;

    // Determine Primary Age for timeline from hook
    const primaryAge = scopedAge;

    // Calculate year-by-year income and tax brackets
    const yearlyData = [];
    const currentYear = new Date().getFullYear();
    const strategies = profile.strategies || {};
    const isRothStrategy = strategies['roth_conversion']?.active;
    const rothAmount = strategies['roth_conversion']?.inputs?.annualAmount || 25000;

    for (let year = 0; year <= 25; year++) {
        const yearNum = currentYear + year;
        const age = primaryAge + year;

        // Calculate total income for this year
        let totalIncome = 0;

        // 1. Earned Income (stops at retirement) - only for scope members
        targetMembers.forEach(member => {
            const memberAge = (member.age || 0) + year;
            if (memberAge < 65) {
                const wageGrowth = Math.pow(1.02, year);
                totalIncome += (member.financials?.income || 0) * wageGrowth;
            }
        });

        // 2. Social Security (starts at 67)
        if (age >= 67) {
            const inflationFactor = Math.pow(1.03, year);
            totalIncome += 28000 * inflationFactor; // SSA Estimate
            if (hasSpouse) totalIncome += 28000 * inflationFactor;
        }

        // 3. RMDs (starts at 73) - Using scoped tax-deferred assets
        let rmdAmount = 0;
        if (age >= 73) {
            const taxDeferred = scopedTaxBuckets.taxDeferred;
            // Simplified: Use 4% RMD rate (actual IRS table varies by age)
            const rmdRate = age < 80 ? 0.04 : age < 90 ? 0.05 : 0.08;
            rmdAmount = taxDeferred * rmdRate * Math.pow(1.06, year); // Assume 6% growth
            totalIncome += rmdAmount;
        }

        // 4. Roth Conversions (if strategy active)
        let conversionAmount = 0;
        if (isRothStrategy && age < 73) {
            conversionAmount = rothAmount;
            totalIncome += conversionAmount;
        }

        // Determine marginal tax bracket
        const bracket = brackets.find(b => totalIncome >= b.min && totalIncome < b.max) || brackets[brackets.length - 1];

        yearlyData.push({
            year: yearNum,
            age,
            totalIncome,
            rmdAmount,
            conversionAmount,
            bracket: bracket.rate,
            bracketLabel: bracket.label,
            color: bracket.color,
            isRMDYear: rmdAmount > 0,
            isConversionYear: conversionAmount > 0
        });
    }

    // Find "Tax Bomb" years (when bracket jumps significantly)
    const taxBombYears = [];
    for (let i = 1; i < yearlyData.length; i++) {
        const prev = yearlyData[i - 1];
        const curr = yearlyData[i];
        if (curr.bracket > prev.bracket && curr.bracket >= 0.32) {
            taxBombYears.push(curr.year);
        }
    }

    // Find optimal Roth conversion windows (low bracket years before RMDs)
    const conversionWindows = [];
    for (let i = 0; i < yearlyData.length; i++) {
        const curr = yearlyData[i];
        if (!curr.isRMDYear && curr.bracket <= 0.22 && curr.age >= 60) {
            conversionWindows.push(curr.year);
        }
    }

    return (
        <div className="glass-panel anim-fade-up anim-delay-5" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            position: 'relative'
        }}>
            {showMethodology && (
                <div
                    className="glass-panel anim-fade-up"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: 'hsl(var(--bg-void))',
                        padding: 'var(--space-6)',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h4 style={{ color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                            Tax Bracket Methodology
                        </h4>
                        <button onClick={() => setShowMethodology(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Income Calculation:</strong> We project your total taxable income each year by combining:
                            (1) Earned income with 2% wage inflation, (2) Social Security benefits starting at age 67,
                            (3) Required Minimum Distributions (RMDs) starting at age 73, and (4) Roth conversions if the strategy is active.
                        </p>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Marginal Tax Bracket:</strong> The color represents your highest marginal federal tax rate for that year
                            based on 2024 IRS brackets. Green = 10-12%, Yellow = 22-24%, Orange = 32-35%, Red = 37%.
                        </p>
                        <p>
                            <strong>RMD Tax Bomb:</strong> When RMDs start at age 73, they often push retirees from the 22% bracket into
                            the 32-37% brackets. The heatmap highlights these "tax bomb" years in red, indicating optimal years for
                            pre-emptive Roth conversions.
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: 'var(--space-1)'
                    }}>
                        Tax Bracket Heatmap
                    </h3>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'hsl(var(--text-muted))'
                    }}>
                        25-year marginal tax rate projection
                    </p>
                </div>
                <button
                    onClick={() => setShowMethodology(true)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'hsl(var(--text-dim))',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Heatmap Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))',
                gap: '4px'
            }}>
                {yearlyData.slice(0, 25).map((data, idx) => {
                    const isTaxBomb = taxBombYears.includes(data.year);
                    const isConversionWindow = conversionWindows.includes(data.year);

                    return (
                        <div
                            key={idx}
                            style={{
                                position: 'relative',
                                paddingTop: '100%',
                                borderRadius: 'var(--radius-sm)',
                                background: data.color,
                                border: isTaxBomb ? '2px solid hsl(var(--danger))' : isConversionWindow ? '2px solid hsl(var(--success))' : 'none',
                                boxShadow: isTaxBomb ? '0 0 12px hsla(var(--danger) / 0.6)' : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            title={`${data.year} (Age ${data.age})\nIncome: ${formatCurrency(data.totalIncome)}\nBracket: ${data.bracketLabel}${data.isRMDYear ? '\n🔥 RMD Year' : ''}${data.isConversionYear ? '\n💎 Roth Conversion' : ''}`}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}>
                                <div style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    color: 'rgba(0,0,0,0.8)',
                                    textShadow: '0 1px 2px rgba(255,255,255,0.3)'
                                }}>
                                    {data.bracketLabel}
                                </div>
                                <div style={{
                                    fontSize: '0.5rem',
                                    color: 'rgba(0,0,0,0.6)',
                                    marginTop: '2px'
                                }}>
                                    {data.year}
                                </div>
                                {data.isRMDYear && (
                                    <Flame size={10} style={{ color: 'rgba(0,0,0,0.7)', marginTop: '2px' }} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-4)',
                fontSize: '0.65rem',
                color: 'hsl(var(--text-secondary))',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'hsl(120, 60%, 50%)' }} />
                    <span>10-12% (Low)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'hsl(60, 70%, 55%)' }} />
                    <span>22-24% (Mid)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'hsl(30, 85%, 55%)' }} />
                    <span>32-35% (High)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'hsl(0, 95%, 55%)' }} />
                    <span>37% (Top)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={12} style={{ color: 'hsl(var(--danger))' }} />
                    <span>RMD Year</span>
                </div>
            </div>

            {/* Insights */}
            {taxBombYears.length > 0 && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--danger) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--danger) / 0.2)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'flex-start'
                }}>
                    <AlertTriangle size={18} style={{ color: 'hsl(var(--danger))', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'hsl(var(--danger))',
                            marginBottom: '4px'
                        }}>
                            🔥 RMD Tax Bomb Detected
                        </div>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5
                        }}>
                            Starting in <strong>{taxBombYears[0]}</strong>, your RMDs will push you into the <strong>32-37% bracket</strong>.
                            This represents a {((0.32 - 0.22) * 100).toFixed(0)}% marginal rate increase.
                            Consider aggressive Roth conversions in the <strong>{conversionWindows.slice(0, 3).join(', ')}</strong> window
                            while you're still in the 22% bracket.
                        </p>
                    </div>
                </div>
            )}

            {conversionWindows.length > 0 && !isRothStrategy && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--success) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--success) / 0.2)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'flex-start'
                }}>
                    <Zap size={18} style={{ color: 'hsl(var(--success))', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'hsl(var(--success))',
                            marginBottom: '4px'
                        }}>
                            💎 Optimal Roth Conversion Window
                        </div>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5
                        }}>
                            Years <strong>{conversionWindows[0]}-{conversionWindows[conversionWindows.length - 1]}</strong> show
                            low tax brackets (22% or less) before RMDs start. This is your golden window to convert
                            tax-deferred assets to Roth at favorable rates. Enable the "Roth Conversion Strategy" to model the impact.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxBracketHeatmap;
