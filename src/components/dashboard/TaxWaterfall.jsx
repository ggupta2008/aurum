import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { TrendingDown, DollarSign, Users, AlertTriangle } from 'lucide-react';

const TaxWaterfall = () => {
    const {
        scopedProjection,
        profile,
        planningScope,
        targetMembers,
        scopedTaxBuckets,
        scopedAge,
        primaryMember,
        formatCurrency
    } = useScopedWealth();
    const { data } = scopedProjection;

    if (!data || data.length === 0) {
        return (
            <div className="glass-panel anim-fade-up anim-delay-3" style={{
                padding: 'var(--space-5)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                    Enter your financial data to see tax waterfall analysis.
                </p>
            </div>
        );
    }

    // Get terminal wealth (Year 25) - Already scoped by hook
    const grossWealth = data[data.length - 1]?.optimized || 0;

    // Calculate Tax Liabilities
    const hasSpouse = targetMembers.some(m => m.relation === 'Spouse');

    // Estate Tax Calculation
    const federalExemption = 13610000; // 2024 exemption
    const totalExemption = hasSpouse ? federalExemption * 2 : federalExemption;
    const taxableEstate = Math.max(0, grossWealth - totalExemption);
    const federalEstateTax = taxableEstate * 0.40;

    // State Estate Tax
    const isHighTaxState = ['NY', 'MA', 'OR', 'MN'].includes(primaryMember.state);
    const stateEstateTax = isHighTaxState ? Math.max(0, (grossWealth - 1000000) * 0.16) : 0;

    // Lifetime Income Tax Calculation using scoped buckets
    const taxDeferredAssets = scopedTaxBuckets.taxDeferred;
    const taxableAssets = scopedTaxBuckets.taxable;

    const strategies = profile.strategies || {};

    let cumulativeIncomeTax = 0;
    const effectiveFederalRate = 0.24; // Average federal marginal rate
    const stateRate = isHighTaxState ? 0.10 : 0.05;
    const combinedRate = effectiveFederalRate + stateRate;

    // Estimate RMD taxes (ages 73+)
    const primaryAge = scopedAge;

    const yearsUntilRMD = Math.max(0, 73 - primaryAge);
    const yearsWithRMD = Math.max(0, 25 - yearsUntilRMD);

    if (yearsWithRMD > 0) {
        // Average RMD is ~4% of tax-deferred balance per year
        const avgAnnualRMD = taxDeferredAssets * 0.04;
        cumulativeIncomeTax += avgAnnualRMD * combinedRate * yearsWithRMD;
    }

    // Add Roth conversion taxes if strategy is active
    if (strategies['roth_conversion']?.active) {
        const annualConversion = strategies['roth_conversion']?.inputs?.annualAmount || 25000;
        const conversionYears = Math.min(25, yearsUntilRMD); // Convert before RMDs start
        cumulativeIncomeTax += annualConversion * combinedRate * conversionYears;
    }

    // Add capital gains taxes (assume 15% of taxable account is realized over 25 years)
    const realizedGains = taxableAssets * 0.15; // 15% turnover
    cumulativeIncomeTax += realizedGains * 0.20; // 20% LTCG rate

    const estimatedLifetimeIncomeTax = cumulativeIncomeTax;

    // Net to Heirs
    const totalTaxDrag = federalEstateTax + stateEstateTax + estimatedLifetimeIncomeTax;
    const netToHeirs = grossWealth - totalTaxDrag;
    const effectiveTaxRate = (totalTaxDrag / grossWealth) * 100;

    // Waterfall bars data
    const waterfallData = [
        { label: 'Gross Terminal Wealth', value: grossWealth, color: 'hsl(var(--gold-primary))', icon: DollarSign, isPositive: true },
        { label: 'Federal Estate Tax (40%)', value: -federalEstateTax, color: 'hsl(var(--danger))', icon: TrendingDown, isPositive: false },
        { label: 'Lifetime Income Tax', value: -estimatedLifetimeIncomeTax, color: 'hsl(var(--warning))', icon: TrendingDown, isPositive: false },
        ...(stateEstateTax > 0 ? [{ label: 'State Estate Tax', value: -stateEstateTax, color: 'hsl(var(--danger-secondary))', icon: AlertTriangle, isPositive: false }] : []),
        { label: 'Net to Heirs', value: netToHeirs, color: 'hsl(var(--success))', icon: Users, isPositive: true }
    ];

    const maxValue = grossWealth;

    return (
        <div className="glass-panel anim-fade-up anim-delay-3" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
        }}>
            <div>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: 'var(--space-1)'
                }}>
                    Tax Waterfall Analysis
                </h3>
                <p style={{
                    fontSize: '0.8rem',
                    color: 'hsl(var(--text-muted))'
                }}>
                    Year 25 wealth distribution showing tax leakage and net legacy
                </p>
            </div>

            {/* Waterfall Visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {waterfallData.map((item, idx) => {
                    const Icon = item.icon;
                    const barWidth = Math.abs((item.value / maxValue) * 100);
                    const isLast = idx === waterfallData.length - 1;

                    return (
                        <div key={idx}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <Icon size={14} style={{ color: item.color }} />
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'hsl(var(--text-secondary))',
                                        fontWeight: isLast ? 700 : 500
                                    }}>
                                        {item.label}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: item.isPositive ? 'white' : item.color
                                }}>
                                    {item.isPositive ? formatCurrency(item.value, { notation: 'compact', maximumFractionDigits: 1 }) : formatCurrency(Math.abs(item.value), { notation: 'compact', maximumFractionDigits: 1 })}
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: isLast ? '32px' : '24px',
                                background: 'hsla(var(--bg-void) / 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: `${barWidth}%`,
                                    height: '100%',
                                    background: item.color,
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isLast ? '0 0 20px hsla(var(--success) / 0.4)' : 'none'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-4)',
                background: effectiveTaxRate > 40
                    ? 'hsla(var(--danger) / 0.1)'
                    : 'hsla(var(--info) / 0.05)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${effectiveTaxRate > 40 ? 'hsla(var(--danger) / 0.2)' : 'hsla(var(--info) / 0.1)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginBottom: '2px' }}>
                        Effective Tax Rate
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: effectiveTaxRate > 40 ? 'hsl(var(--danger))' : 'white' }}>
                        {effectiveTaxRate.toFixed(1)}%
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginBottom: '2px' }}>
                        Total Tax Leakage
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--danger))' }}>
                        {formatCurrency(totalTaxDrag)}
                    </div>
                </div>
            </div>

            {/* Strategic Advice */}
            {taxableEstate > 0 && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--gold-primary) / 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--gold-primary) / 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-2)'
                    }}>
                        <AlertTriangle size={14} className="text-gold" />
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Estate Tax Alert
                        </span>
                    </div>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'hsl(var(--text-secondary))',
                        lineHeight: 1.5
                    }}>
                        Your projected estate exceeds the federal exemption by <strong>{formatCurrency(taxableEstate)}</strong>.
                        Without advanced planning (SLAT, IDGT, or CLAT), your heirs will face a <strong>{formatCurrency(federalEstateTax)}</strong> liquidity
                        event. Consider implementing trust structures to freeze valuation and shield growth.
                    </p>
                </div>
            )}

            {effectiveTaxRate < 25 && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--success) / 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--success) / 0.2)'
                }}>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'hsl(var(--text-secondary))',
                        lineHeight: 1.5
                    }}>
                        ✅ <strong>Excellent tax efficiency.</strong> Your effective rate of {effectiveTaxRate.toFixed(1)}%
                        indicates strong strategic planning. Continue optimizing Roth conversions and asset location to maintain this advantage.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaxWaterfall;
