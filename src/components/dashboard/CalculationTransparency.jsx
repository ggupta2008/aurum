import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Info, ChevronDown, ChevronUp, Calculator, TrendingUp, Shield, Zap } from 'lucide-react';

const CalculationTransparency = () => {
    const {
        scopedCurrentWealth,
        scopedProjection,
        scopedMonteCarlo,
        wealthBreakdown,
        formatCurrency,
        planningScope,
        taxUnits
    } = useScopedWealth();

    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const data = scopedProjection.data || [];
    const lastPoint = data[data.length - 1] || {};
    const endNWBaseline = lastPoint.baseline || 0;
    const endNW = lastPoint.optimized || 0;
    const wealthAlpha = endNW - endNWBaseline;
    const successRatio = (scopedMonteCarlo && scopedMonteCarlo.length > 0) ? (scopedMonteCarlo[0].successRate ?? 100) : 100;

    const totalAssets = wealthBreakdown.assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = wealthBreakdown.liabilities.reduce((sum, l) => sum + l.value, 0);

    const scopeName = planningScope === 'household'
        ? 'Grand Clan (All Family Members)'
        : taxUnits.find(u => u.id === planningScope)?.name || 'Current Unit';

    const Section = ({ title, icon: Icon, children, sectionKey, summary }) => (
        <div className="glass-panel" style={{ marginBottom: 'var(--space-4)' }}>
            <button
                onClick={() => toggleSection(sectionKey)}
                style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'white'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        background: 'hsla(var(--gold-primary) / 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={16} className="text-gold" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))' }}>{summary}</div>
                    </div>
                </div>
                {expandedSection === sectionKey ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSection === sectionKey && (
                <div style={{
                    padding: 'var(--space-4)',
                    borderTop: '1px solid hsla(var(--gold-primary) / 0.1)',
                    fontSize: '0.8rem',
                    color: 'hsl(var(--text-secondary))'
                }}>
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)'
            }}>
                <Info size={20} className="text-gold" />
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'hsl(var(--gold-primary))',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Calculation Transparency
                </h3>
            </div>
            <div style={{
                fontSize: '0.75rem',
                color: 'hsl(var(--text-dim))',
                marginBottom: 'var(--space-4)',
                padding: 'var(--space-3)',
                background: 'hsla(var(--gold-primary) / 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsla(var(--gold-primary) / 0.1)'
            }}>
                <strong>Active Scope:</strong> {scopeName}
                <br />
                All calculations below reflect this planning scope. Click each section to see detailed breakdowns.
            </div>

            <Section
                title="Current Net Worth"
                icon={Calculator}
                sectionKey="networth"
                summary={formatCurrency(scopedCurrentWealth)}
            >
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p style={{ marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                        <strong>Formula:</strong> Total Assets - Total Liabilities
                    </p>
                    <p style={{ marginBottom: 'var(--space-3)', lineHeight: 1.6, color: 'hsl(var(--text-dim))' }}>
                        <strong>Hierarchy of Truth:</strong> We prioritize granular data over aggregates to prevent double-counting:
                        <br />1. Individual positions (stocks/ETFs) → 2. Aggregate tallies (Stocks, Retirement) → 3. Legacy tax buckets
                    </p>
                    <div style={{
                        padding: 'var(--space-3)',
                        background: 'hsla(var(--gold-primary) / 0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsla(var(--gold-primary) / 0.1)',
                        marginBottom: 'var(--space-4)',
                        fontSize: '0.7rem',
                        lineHeight: 1.5
                    }}>
                        <strong style={{ color: 'hsl(var(--gold-primary))' }}>📊 Two-Tier Structure:</strong>
                        <br />
                        <strong>Clan Level:</strong> Shared family assets (real estate, joint accounts, tax buckets) that belong to the household as a whole.
                        <br />
                        <strong>Member Level:</strong> Individual assets owned by specific family members (personal portfolios, individual cash, debts).
                        <br /><br />
                        <em>Note: Cash amounts under $10 are hidden to reduce clutter.</em>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                        <h4 style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>
                            Assets ({formatCurrency(totalAssets)})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {wealthBreakdown.assets.map((asset, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-2)',
                                    background: 'hsla(var(--success) / 0.05)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem'
                                }}>
                                    <span style={{ color: 'hsl(var(--text-secondary))' }}>{asset.name}</span>
                                    <span style={{ fontWeight: 600, color: 'hsl(var(--success))' }}>
                                        {formatCurrency(asset.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.75rem', color: 'hsl(var(--danger))', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>
                            Liabilities ({formatCurrency(totalLiabilities)})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {wealthBreakdown.liabilities.length > 0 ? (
                                wealthBreakdown.liabilities.map((liability, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: 'var(--space-2)',
                                        background: 'hsla(var(--danger) / 0.05)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.75rem'
                                    }}>
                                        <span style={{ color: 'hsl(var(--text-secondary))' }}>{liability.name}</span>
                                        <span style={{ fontWeight: 600, color: 'hsl(var(--danger))' }}>
                                            {formatCurrency(liability.value)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: 'hsl(var(--text-dim))', fontSize: '0.7rem', fontStyle: 'italic' }}>
                                    No liabilities in this scope
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    background: 'hsla(var(--gold-primary) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid hsl(var(--gold-primary))'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                        <span>Net Worth</span>
                        <span className="text-gold">{formatCurrency(scopedCurrentWealth)}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>
                        = {formatCurrency(totalAssets)} - {formatCurrency(totalLiabilities)}
                    </div>
                </div>
            </Section>

            <Section
                title="25-Year Wealth Projection"
                icon={TrendingUp}
                sectionKey="projection"
                summary={`${formatCurrency(endNW)} (Optimized) | ${formatCurrency(endNWBaseline)} (Baseline)`}
            >
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p style={{ marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                        <strong>Methodology:</strong> Deterministic year-by-year simulation modeling asset growth, income, spending, taxes, and debt amortization.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div style={{
                        padding: 'var(--space-3)',
                        background: 'hsla(var(--text-dim) / 0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsla(var(--text-dim) / 0.1)'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>BASELINE PATH</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-secondary))' }}>
                            {formatCurrency(endNWBaseline)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>
                            Status quo with 1.2% fee drag
                        </div>
                    </div>

                    <div style={{
                        padding: 'var(--space-3)',
                        background: 'hsla(var(--gold-primary) / 0.1)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--gold-primary))', marginBottom: '4px' }}>OPTIMIZED PATH</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>
                            {formatCurrency(endNW)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>
                            With active strategies (0.15% drag)
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: '0.75rem', lineHeight: 1.6, color: 'hsl(var(--text-secondary))' }}>
                    <strong>Key Assumptions:</strong>
                    <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
                        <li>Market returns based on selected regime (Goldilocks, Stagflation, etc.)</li>
                        <li>Annual inflation adjustment on spending and rental income</li>
                        <li>2% wage growth on earned income until retirement</li>
                        <li>Social Security benefits starting at age 67</li>
                        <li>RMDs (Required Minimum Distributions) starting at age 73</li>
                        <li>Full debt amortization with P&I calculations</li>
                        <li>Tax-efficient bucket optimization (Roth conversions, tax-loss harvesting)</li>
                    </ul>
                </div>
            </Section>

            <Section
                title="Safety Score (Monte Carlo)"
                icon={Shield}
                sectionKey="safety"
                summary={`${successRatio}% success rate`}
            >
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p style={{ marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                        <strong>Methodology:</strong> We run 250 parallel simulations of your financial future, each with randomized market returns (mean + volatility).
                    </p>
                    <p style={{ marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                        The Safety Score represents the percentage of simulations where you never run out of money over 25 years.
                    </p>
                </div>

                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--gold-primary) / 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--gold-primary) / 0.1)',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>SUCCESS RATE</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: successRatio >= 90 ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>
                            {successRatio}%
                        </span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>
                        {successRatio >= 90
                            ? '✓ Excellent - Your plan is highly resilient to market volatility'
                            : '⚠ Consider increasing savings or reducing spending to improve resilience'}
                    </div>
                </div>

                <div style={{ fontSize: '0.75rem', lineHeight: 1.6, color: 'hsl(var(--text-secondary))' }}>
                    <strong>Simulation Parameters:</strong>
                    <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
                        <li>250 iterations with Box-Muller normal distribution</li>
                        <li>15% annual volatility (standard deviation)</li>
                        <li>Mean return adjusted by selected market regime</li>
                        <li>Same cash flow assumptions as deterministic projection</li>
                        <li>Results shown as P10, P50, P90 percentiles</li>
                    </ul>
                </div>
            </Section>

            <Section
                title="Wealth Alpha"
                icon={Zap}
                sectionKey="alpha"
                summary={wealthAlpha > 0 ? formatCurrency(wealthAlpha) : 'Enable strategies to generate alpha'}
            >
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p style={{ marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                        <strong>Definition:</strong> Wealth Alpha is the projected dollar advantage of the Aurum Optimized plan over your baseline "Status Quo" path.
                    </p>
                    <p style={{ marginBottom: 'var(--space-3)', lineHeight: 1.6 }}>
                        <strong>Formula:</strong> 25-Year Optimized Wealth - 25-Year Baseline Wealth
                    </p>
                </div>

                <div style={{
                    padding: 'var(--space-4)',
                    background: wealthAlpha > 0 ? 'hsla(var(--success) / 0.1)' : 'hsla(var(--text-dim) / 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${wealthAlpha > 0 ? 'hsla(var(--success) / 0.2)' : 'hsla(var(--text-dim) / 0.1)'}`,
                    marginBottom: 'var(--space-4)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>TOTAL ALPHA</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: wealthAlpha > 0 ? 'hsl(var(--success))' : 'hsl(var(--text-dim))' }}>
                            {wealthAlpha > 0 ? `+${formatCurrency(wealthAlpha)}` : '$0'}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>
                        = {formatCurrency(endNW)} (Optimized) - {formatCurrency(endNWBaseline)} (Baseline)
                    </div>
                </div>

                <div style={{ fontSize: '0.75rem', lineHeight: 1.6, color: 'hsl(var(--text-secondary))' }}>
                    <strong>Alpha Sources:</strong>
                    <ul style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-4)' }}>
                        <li><strong>Fee Reduction:</strong> 1.2% → 0.15% (Simple Path / Index investing)</li>
                        <li><strong>Tax Bucket Optimization:</strong> Roth conversions, tax-loss harvesting</li>
                        <li><strong>Asset Location:</strong> Tax-efficient placement (stocks in Roth, bonds in Traditional IRA)</li>
                        <li><strong>Social Security Timing:</strong> Delayed claiming for 8% annual benefit increase</li>
                        <li><strong>Debt Optimization:</strong> Strategic paydown of high-interest liabilities</li>
                    </ul>
                </div>

                {wealthAlpha <= 0 && (
                    <div style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-3)',
                        background: 'hsla(var(--warning) / 0.1)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsla(var(--warning) / 0.2)',
                        fontSize: '0.75rem',
                        color: 'hsl(var(--text-secondary))'
                    }}>
                        <strong>💡 Tip:</strong> Enable strategies in the Strategy Stack to generate Wealth Alpha. Start with "Simple Path" for immediate fee savings.
                    </div>
                )}
            </Section>
        </div>
    );
};

export default CalculationTransparency;
