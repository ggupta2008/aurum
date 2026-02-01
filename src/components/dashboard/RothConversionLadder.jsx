import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { TrendingDown, TrendingUp, Zap, DollarSign, Info, X, Target, Calendar, Percent } from 'lucide-react';

const RothConversionLadder = () => {
    const {
        profile,
        targetMembers,
        scopedAge,
        scopedTaxBuckets,
        scopedIncome,
        formatCurrency
    } = useScopedWealth();
    const [showMethodology, setShowMethodology] = useState(false);
    const [targetBracket, setTargetBracket] = useState(0.24); // Default: Fill to top of 24% bracket
    const [startAge, setStartAge] = useState(60); // When to start conversions
    const [endAge, setEndAge] = useState(72); // When to stop (before RMDs at 73)
    // 2024 Federal Tax Brackets (MFJ)
    const TAX_BRACKETS_MFJ = [
        { rate: 0.10, min: 0, max: 22000, label: '10%' },
        { rate: 0.12, min: 22000, max: 89075, label: '12%' },
        { rate: 0.22, min: 89075, max: 190750, label: '22%' },
        { rate: 0.24, min: 190750, max: 364200, label: '24%' },
        { rate: 0.32, min: 364200, max: 462500, label: '32%' },
        { rate: 0.35, min: 462500, max: 693750, label: '35%' },
        { rate: 0.37, min: 693750, max: Infinity, label: '37%' }
    ];

    const TAX_BRACKETS_SINGLE = [
        { rate: 0.10, min: 0, max: 11000, label: '10%' },
        { rate: 0.12, min: 11000, max: 44725, label: '12%' },
        { rate: 0.22, min: 44725, max: 95375, label: '22%' },
        { rate: 0.24, min: 95375, max: 182100, label: '24%' },
        { rate: 0.32, min: 182100, max: 231250, label: '32%' },
        { rate: 0.35, min: 231250, max: 578125, label: '35%' },
        { rate: 0.37, min: 578125, max: Infinity, label: '37%' }
    ];

    const hasSpouse = targetMembers.some(m => m.relation === 'Spouse' || m.relation === 'Sibling Spouse');
    const brackets = hasSpouse ? TAX_BRACKETS_MFJ : TAX_BRACKETS_SINGLE;
    const standardDeduction = hasSpouse ? 29200 : 14600; // 2024 values

    // Values from hook
    const currentAge = scopedAge;
    const scopedTaxDeferred = scopedTaxBuckets.taxDeferred;

    // Tax rates
    const stateTaxRate = profile.financials?.taxRate || 0.05;
    const combinedRate = (rate) => Math.min(rate + stateTaxRate, 0.50);

    // Find the bracket ceiling for target rate
    const targetBracketInfo = brackets.find(b => b.rate === targetBracket);
    const bracketCeiling = targetBracketInfo ? targetBracketInfo.max : 190750;

    // ========== CALCULATE OPTIMAL CONVERSION LADDER ==========
    const conversionSchedule = [];
    let totalConversions = 0;
    let totalTaxPaid = 0;
    let remainingTaxDeferred = scopedTaxDeferred;

    for (let year = 0; year <= 25; year++) {
        const age = currentAge + year;

        // Only convert during the specified window
        if (age < startAge || age > endAge) {
            conversionSchedule.push({
                year: new Date().getFullYear() + year,
                age,
                baseIncome: 0,
                conversionAmount: 0,
                taxOnConversion: 0,
                remainingBalance: remainingTaxDeferred,
                effectiveRate: 0
            });
            continue;
        }

        // Calculate base income for this year (before conversion)
        let baseIncome = 0;

        // Earned income (stops at 65)
        if (age < 65) {
            const wageGrowth = Math.pow(1.02, year);
            baseIncome += scopedIncome * wageGrowth;
        }

        // Social Security (starts at 67)
        if (age >= 67) {
            const inflationFactor = Math.pow(1.03, year);
            baseIncome += 30000 * inflationFactor;
            if (hasSpouse) baseIncome += 30000 * inflationFactor;
        }

        // Taxable income after standard deduction
        const taxableBaseIncome = Math.max(0, baseIncome - standardDeduction);

        // Calculate room to fill bracket
        const roomInBracket = Math.max(0, bracketCeiling - taxableBaseIncome);

        // Optimal conversion amount (fill to bracket ceiling, but not more than remaining balance)
        const optimalConversion = Math.min(roomInBracket, remainingTaxDeferred * 0.15); // Max 15% per year to spread risk
        const actualConversion = Math.min(optimalConversion, remainingTaxDeferred);

        // Calculate tax on conversion
        // This is simplified - assumes conversion fills bracket from bottom up
        let taxOnConversion = 0;
        let remainingIncome = actualConversion;

        for (const bracket of brackets) {
            if (remainingIncome <= 0) break;

            const incomeInBracket = Math.min(
                remainingIncome,
                Math.max(0, bracket.max - Math.max(bracket.min, taxableBaseIncome))
            );

            if (incomeInBracket > 0) {
                taxOnConversion += incomeInBracket * combinedRate(bracket.rate);
                remainingIncome -= incomeInBracket;
            }
        }

        // Update totals
        totalConversions += actualConversion;
        totalTaxPaid += taxOnConversion;
        remainingTaxDeferred -= actualConversion;

        // Effective rate on this conversion
        const effectiveRate = actualConversion > 0 ? (taxOnConversion / actualConversion) : 0;

        conversionSchedule.push({
            year: new Date().getFullYear() + year,
            age,
            baseIncome,
            conversionAmount: actualConversion,
            taxOnConversion,
            remainingBalance: remainingTaxDeferred,
            effectiveRate
        });

        // Stop if we've converted everything
        if (remainingTaxDeferred < 1000) break;
    }

    // ========== CALCULATE FUTURE TAX SAVINGS ==========
    // Without conversions: Pay RMD taxes at 32-37% for 20+ years
    const avgRMDRate = 0.04; // 4% RMD rate
    const avgRMDTaxRate = combinedRate(0.35); // Assume 35% bracket during RMDs
    const yearsOfRMDs = 20;
    const futureRMDTaxes = scopedTaxDeferred * avgRMDRate * avgRMDTaxRate * yearsOfRMDs;

    // With conversions: Pay lower rates now, zero taxes later
    const futureSavings = futureRMDTaxes - totalTaxPaid;
    const breakEvenAge = currentAge + Math.ceil(totalTaxPaid / (futureRMDTaxes / yearsOfRMDs));

    // ROI calculation
    const roi = totalTaxPaid > 0 ? ((futureSavings / totalTaxPaid) * 100) : 0;

    // Get active conversion years
    const activeYears = conversionSchedule.filter(y => y.conversionAmount > 1000);
    const avgAnnualConversion = activeYears.length > 0
        ? totalConversions / activeYears.length
        : 0;

    return (
        <div className="glass-panel">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid hsla(var(--gold-primary) / 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.2), hsla(var(--info) / 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Zap size={24} style={{ color: 'hsl(var(--gold-primary))' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'hsl(var(--text-primary))' }}>
                            Roth Conversion Ladder
                        </h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                            Optimal year-by-year conversion strategy
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowMethodology(!showMethodology)}
                    style={{
                        background: 'hsla(var(--gold-primary) / 0.1)',
                        border: '1px solid hsla(var(--gold-primary) / 0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        color: 'hsl(var(--gold-primary))',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(var(--gold-primary) / 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'hsla(var(--gold-primary) / 0.1)'}
                >
                    <Info size={16} />
                    {showMethodology ? 'Hide' : 'Show'} Strategy
                </button>
            </div>

            {showMethodology && (
                <div style={{
                    background: 'hsla(var(--info) / 0.05)',
                    border: '1px solid hsla(var(--info) / 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'hsl(var(--info))' }}>Conversion Strategy</h4>
                    <div style={{ display: 'grid', gap: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                        <p style={{ margin: 0, lineHeight: '1.6' }}>
                            <strong style={{ color: 'hsl(var(--text-primary))' }}>The Problem:</strong> When RMDs start at age 73,
                            they often push retirees from the 22-24% bracket into the 32-37% bracket. This "tax bomb" can cost
                            hundreds of thousands in unnecessary taxes.
                        </p>
                        <p style={{ margin: 0, lineHeight: '1.6' }}>
                            <strong style={{ color: 'hsl(var(--text-primary))' }}>The Solution:</strong> Convert tax-deferred assets
                            to Roth during low-income years (typically ages 60-72). By "filling" the {targetBracketInfo?.label} bracket
                            each year, you pay taxes at favorable rates now and avoid the tax bomb later.
                        </p>
                        <p style={{ margin: 0, lineHeight: '1.6' }}>
                            <strong style={{ color: 'hsl(var(--text-primary))' }}>The Math:</strong> This calculator projects your
                            income year-by-year, identifies available "room" in your target bracket, and recommends optimal conversion
                            amounts. The result: pay ~{(targetBracket * 100).toFixed(0)}% now instead of ~35% later.
                        </p>
                    </div>
                </div>
            )}

            {/* CONTROLS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Target Bracket */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                        <Target size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Fill to Bracket
                    </label>
                    <select
                        value={targetBracket}
                        onChange={(e) => setTargetBracket(parseFloat(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'hsla(var(--bg-elevated) / 0.5)',
                            border: '1px solid hsla(var(--text-primary) / 0.1)',
                            borderRadius: '8px',
                            color: 'hsl(var(--text-primary))',
                            fontSize: '0.875rem'
                        }}
                    >
                        <option value={0.12}>12% (Conservative)</option>
                        <option value={0.22}>22% (Moderate)</option>
                        <option value={0.24}>24% (Aggressive)</option>
                        <option value={0.32}>32% (Very Aggressive)</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
                        Up to {formatCurrency(bracketCeiling, { notation: 'compact' })} taxable income
                    </p>
                </div>

                {/* Start Age */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Start Age
                    </label>
                    <input
                        type="range"
                        min={Math.max(currentAge, 55)}
                        max={72}
                        value={startAge}
                        onChange={(e) => setStartAge(parseInt(e.target.value))}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>Age {Math.max(currentAge, 55)}</span>
                        <span style={{ color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>{startAge}</span>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>Age 72</span>
                    </div>
                </div>

                {/* End Age */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        End Age
                    </label>
                    <input
                        type="range"
                        min={startAge + 1}
                        max={73}
                        value={endAge}
                        onChange={(e) => setEndAge(parseInt(e.target.value))}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>Age {startAge + 1}</span>
                        <span style={{ color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>{endAge}</span>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>Age 73</span>
                    </div>
                </div>
            </div>

            {/* SUMMARY METRICS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'hsla(var(--gold-primary) / 0.1)',
                    border: '1px solid hsla(var(--gold-primary) / 0.2)',
                    borderRadius: '12px',
                    padding: '1rem'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                        Total Conversions
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>
                        {formatCurrency(totalConversions, { notation: 'compact' })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                        Over {activeYears.length} years
                    </div>
                </div>

                <div style={{
                    background: 'hsla(var(--danger) / 0.1)',
                    border: '1px solid hsla(var(--danger) / 0.2)',
                    borderRadius: '12px',
                    padding: '1rem'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                        Tax Paid Now
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'hsl(var(--danger))' }}>
                        {formatCurrency(totalTaxPaid, { notation: 'compact' })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                        Avg {(totalTaxPaid / Math.max(totalConversions, 1) * 100).toFixed(1)}% effective rate
                    </div>
                </div>

                <div style={{
                    background: 'hsla(var(--success) / 0.1)',
                    border: '1px solid hsla(var(--success) / 0.2)',
                    borderRadius: '12px',
                    padding: '1rem'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                        Future Savings
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'hsl(var(--success))' }}>
                        {formatCurrency(futureSavings, { notation: 'compact' })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                        {roi.toFixed(0)}% ROI on tax paid
                    </div>
                </div>

                <div style={{
                    background: 'hsla(var(--info) / 0.1)',
                    border: '1px solid hsla(var(--info) / 0.2)',
                    borderRadius: '12px',
                    padding: '1rem'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                        Break-Even Age
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'hsl(var(--info))' }}>
                        {breakEvenAge}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                        {breakEvenAge - currentAge} years from now
                    </div>
                </div>
            </div>

            {/* CONVERSION SCHEDULE TABLE */}
            <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'hsl(var(--text-primary))' }}>
                    📅 Year-by-Year Conversion Schedule
                </h4>
                <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '1px solid hsla(var(--text-primary) / 0.1)',
                    borderRadius: '8px'
                }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                        <thead style={{
                            position: 'sticky',
                            top: 0,
                            background: 'hsl(var(--bg-elevated))',
                            borderBottom: '1px solid hsla(var(--text-primary) / 0.1)'
                        }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', color: 'hsl(var(--text-secondary))' }}>Year</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', color: 'hsl(var(--text-secondary))' }}>Age</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-secondary))' }}>Base Income</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-secondary))' }}>Convert</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-secondary))' }}>Tax</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-secondary))' }}>Rate</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-secondary))' }}>Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conversionSchedule.filter(s => s.age >= startAge && s.age <= endAge + 2).map((schedule, idx) => (
                                <tr
                                    key={idx}
                                    style={{
                                        borderBottom: '1px solid hsla(var(--text-primary) / 0.05)',
                                        background: schedule.conversionAmount > 1000
                                            ? 'hsla(var(--gold-primary) / 0.05)'
                                            : 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '0.75rem', color: 'hsl(var(--text-primary))' }}>{schedule.year}</td>
                                    <td style={{ padding: '0.75rem', color: 'hsl(var(--text-primary))' }}>{schedule.age}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-secondary))' }}>
                                        {formatCurrency(schedule.baseIncome, { notation: 'compact' })}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>
                                        {schedule.conversionAmount > 1000 ? formatCurrency(schedule.conversionAmount, { notation: 'compact' }) : '—'}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--danger))' }}>
                                        {schedule.taxOnConversion > 100 ? formatCurrency(schedule.taxOnConversion, { notation: 'compact' }) : '—'}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-secondary))' }}>
                                        {schedule.effectiveRate > 0 ? `${(schedule.effectiveRate * 100).toFixed(1)}%` : '—'}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'hsl(var(--text-muted))' }}>
                                        {formatCurrency(schedule.remainingBalance, { notation: 'compact' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RECOMMENDATION */}
            {futureSavings > 50000 && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, hsla(var(--success) / 0.1), hsla(var(--gold-primary) / 0.1))',
                    border: '2px solid hsla(var(--success) / 0.3)',
                    borderRadius: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <TrendingUp size={24} style={{ color: 'hsl(var(--success))', flexShrink: 0 }} />
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'hsl(var(--success))', fontSize: '1rem' }}>
                                💎 High-Value Opportunity Detected
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
                                By converting <strong style={{ color: 'hsl(var(--gold-primary))' }}>{formatCurrency(avgAnnualConversion, { notation: 'compact' })}/year</strong> from
                                age {startAge} to {endAge}, you'll pay <strong>{formatCurrency(totalTaxPaid, { notation: 'compact' })}</strong> in taxes now but
                                save <strong style={{ color: 'hsl(var(--success))' }}>{formatCurrency(futureSavings, { notation: 'compact' })}</strong> in future RMD taxes.
                                This strategy breaks even at age {breakEvenAge} and delivers a <strong>{roi.toFixed(0)}% ROI</strong> on
                                every tax dollar paid.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RothConversionLadder;
