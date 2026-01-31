import React from 'react';
import { TrendingDown, DollarSign, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
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
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)'
        }}>
            <div>
                <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: 'var(--space-2)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: 'hsl(var(--text-primary))'
                }}>
                    Fiscal Impact Analysis
                </h3>
                <p style={{
                    fontSize: '0.85rem',
                    color: 'hsl(var(--text-secondary))',
                    maxWidth: '90%'
                }}>
                    Projected wealth erosion due to tax liabilities at Year 25 transfer event
                </p>
            </div>

            {/* Waterfall Visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {waterfallData.map((item, idx) => {
                    const Icon = item.icon;
                    const barWidth = Math.abs((item.value / maxValue) * 100);
                    const isLast = idx === waterfallData.length - 1;
                    const isNegative = !item.isPositive;

                    return (
                        <div key={idx} style={{ position: 'relative' }}>
                            {/* Connector Line */}
                            {!isLast && (
                                <div style={{
                                    position: 'absolute',
                                    left: '19px',
                                    top: '32px',
                                    bottom: '-24px',
                                    width: '2px',
                                    background: 'hsla(var(--text-primary)/0.05)',
                                    zIndex: 0
                                }} />
                            )}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: isNegative ? 'hsla(var(--danger)/0.1)' : 'hsla(var(--success)/0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `1px solid ${isNegative ? 'hsla(var(--danger)/0.2)' : 'hsla(var(--success)/0.2)'}`
                                    }}>
                                        <Icon size={18} style={{ color: item.color }} />
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'hsl(var(--text-primary))',
                                            fontWeight: 600,
                                            fontFamily: 'Space Grotesk, sans-serif'
                                        }}>
                                            {item.label}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                                            {(item.value / maxValue * 100).toFixed(1)}% of Gross
                                        </div>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    fontFamily: 'Space Grotesk, sans-serif',
                                    color: item.isPositive ? 'hsl(var(--text-primary))' : item.color
                                }}>
                                    {item.isPositive ? '' : '-'}{formatCurrency(Math.abs(item.value), { notation: 'compact', maximumFractionDigits: 1 })}
                                </span>
                            </div>

                            {/* Bar Visual */}
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: 'hsla(var(--bg-void) / 0.6)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden',
                                padding: '2px' // inner padding
                            }}>
                                <div style={{
                                    width: `${barWidth}%`,
                                    height: '100%',
                                    background: item.color,
                                    borderRadius: 'var(--radius-full)',
                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: `0 0 12px ${item.color}`
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-2)'
            }}>
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--bg-void)/0.3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--text-primary)/0.05)'
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        Effective Tax Rate
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: effectiveTaxRate > 40 ? 'hsl(var(--danger))' : 'hsl(var(--success))' }}>
                        {effectiveTaxRate.toFixed(1)}%
                    </div>
                </div>

                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--bg-void)/0.3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--text-primary)/0.05)'
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        Total Leakage
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Space Grotesk', color: 'hsl(var(--danger))' }}>
                        {formatCurrency(totalTaxDrag, { notation: 'compact' })}
                    </div>
                </div>
            </div>

            {/* Strategic Advice */}
            {taxableEstate > 0 && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'linear-gradient(135deg, hsla(var(--danger)/0.05), transparent)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--danger) / 0.2)',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <AlertTriangle size={20} className="text-danger" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'hsl(var(--danger))',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                        }}>
                            Estate Tax Exposure
                        </div>
                        <p style={{
                            fontSize: '0.8rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5,
                            margin: 0
                        }}>
                            Projected estate exceeds federal exemption by <strong style={{ color: 'hsl(var(--text-primary))' }}>{formatCurrency(taxableEstate)}</strong>.
                            Heirs face a <strong style={{ color: 'hsl(var(--danger))' }}>{formatCurrency(federalEstateTax)}</strong> liquidity event.
                            Urgent: Consider SLAT or IDGT structures.
                        </p>
                    </div>
                </div>
            )}

            {effectiveTaxRate < 25 && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'linear-gradient(135deg, hsla(var(--success)/0.05), transparent)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--success) / 0.2)',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <CheckCircle size={20} className="text-success" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'hsl(var(--success))',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                        }}>
                            Optimal Efficiency
                        </div>
                        <p style={{
                            fontSize: '0.8rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5,
                            margin: 0
                        }}>
                            Effective rate of <strong>{effectiveTaxRate.toFixed(1)}%</strong> indicates top-tier tax efficiency.
                            Current trust structures and asset location strategies are performing optimally.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxWaterfall;
