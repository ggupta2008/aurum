import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { X, Calculator, TrendingUp, Shield, Zap, ChevronDown, ChevronUp, DollarSign, PieChart } from 'lucide-react';

const CalculationTransparencyModal = ({ isOpen, onClose }) => {
    const {
        scopedCurrentWealth,
        scopedProjection,
        scopedMonteCarlo,
        wealthBreakdown,
        formatCurrency,
        planningScope,
        taxUnits
    } = useScopedWealth();

    const [expandedSection, setExpandedSection] = useState('networth');

    if (!isOpen) return null;

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
        <div style={{
            background: 'hsla(var(--bg-surface) / 0.5)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsla(var(--text-primary) / 0.05)',
            marginBottom: 'var(--space-3)',
            overflow: 'hidden'
        }}>
            <button
                onClick={() => toggleSection(sectionKey)}
                style={{
                    width: '100%',
                    background: expandedSection === sectionKey ? 'hsla(var(--gold-primary) / 0.05)' : 'transparent',
                    border: 'none',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'background 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Icon size={18} style={{ color: 'hsl(var(--gold-primary))' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>{title}</div>
                        {summary && <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))' }}>{summary}</div>}
                    </div>
                </div>
                {expandedSection === sectionKey ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSection === sectionKey && (
                <div style={{ padding: 'var(--space-4)', paddingTop: 0 }}>
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'hsla(0, 0%, 0%, 0.8)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                background: 'hsl(var(--bg-primary))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsla(var(--gold-primary) / 0.2)',
                boxShadow: '0 20px 60px hsla(0, 0%, 0%, 0.5)',
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: 'var(--space-5)',
                    borderBottom: '1px solid hsla(var(--text-primary) / 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                            <Calculator size={20} className="text-gold" />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>
                                Calculation Transparency
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                            Understanding how your numbers are calculated • {scopeName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'hsla(var(--text-primary) / 0.05)',
                            border: '1px solid hsla(var(--text-primary) / 0.1)',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'hsl(var(--text-muted))',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'hsla(var(--text-primary) / 0.1)';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'hsla(var(--text-primary) / 0.05)';
                            e.target.style.color = 'hsl(var(--text-muted))';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--space-5)'
                }}>
                    {/* Net Worth Calculation */}
                    <Section
                        title="Net Worth Calculation"
                        icon={DollarSign}
                        sectionKey="networth"
                        summary={`${formatCurrency(totalAssets)} assets - ${formatCurrency(totalLiabilities)} liabilities = ${formatCurrency(scopedCurrentWealth)}`}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--success))', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>
                                    Assets
                                </div>
                                {wealthBreakdown.assets.map((asset, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: 'var(--space-2)',
                                        background: 'hsla(var(--success) / 0.05)',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: '4px',
                                        fontSize: '0.75rem'
                                    }}>
                                        <span style={{ color: 'hsl(var(--text-secondary))' }}>{asset.name}</span>
                                        <span style={{ fontWeight: 600, color: 'hsl(var(--success))' }}>{formatCurrency(asset.value)}</span>
                                    </div>
                                ))}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-2)',
                                    borderTop: '1px solid hsla(var(--success) / 0.2)',
                                    marginTop: 'var(--space-2)',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                }}>
                                    <span>Total Assets</span>
                                    <span style={{ color: 'hsl(var(--success))' }}>{formatCurrency(totalAssets)}</span>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--danger))', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>
                                    Liabilities
                                </div>
                                {wealthBreakdown.liabilities.length > 0 ? (
                                    <>
                                        {wealthBreakdown.liabilities.map((liability, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: 'var(--space-2)',
                                                background: 'hsla(var(--danger) / 0.05)',
                                                borderRadius: 'var(--radius-sm)',
                                                marginBottom: '4px',
                                                fontSize: '0.75rem'
                                            }}>
                                                <span style={{ color: 'hsl(var(--text-secondary))' }}>{liability.name}</span>
                                                <span style={{ fontWeight: 600, color: 'hsl(var(--danger))' }}>-{formatCurrency(liability.value)}</span>
                                            </div>
                                        ))}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: 'var(--space-2)',
                                            borderTop: '1px solid hsla(var(--danger) / 0.2)',
                                            marginTop: 'var(--space-2)',
                                            fontSize: '0.8rem',
                                            fontWeight: 700
                                        }}>
                                            <span>Total Liabilities</span>
                                            <span style={{ color: 'hsl(var(--danger))' }}>-{formatCurrency(totalLiabilities)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{
                                        padding: 'var(--space-3)',
                                        textAlign: 'center',
                                        color: 'hsl(var(--text-dim))',
                                        fontSize: '0.75rem'
                                    }}>
                                        No liabilities
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            marginTop: 'var(--space-4)',
                            padding: 'var(--space-3)',
                            background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.1), hsla(var(--gold-primary) / 0.05))',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsla(var(--gold-primary) / 0.2)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>
                                Current Net Worth
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>
                                {formatCurrency(scopedCurrentWealth)}
                            </div>
                        </div>
                    </Section>

                    {/* Projection Methodology */}
                    <Section
                        title="25-Year Projection"
                        icon={TrendingUp}
                        sectionKey="projection"
                        summary={`Baseline: ${formatCurrency(endNWBaseline)} → Optimized: ${formatCurrency(endNW)}`}
                    >
                        <div style={{ fontSize: '0.75rem', lineHeight: 1.6, color: 'hsl(var(--text-secondary))' }}>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <strong style={{ color: 'white' }}>Baseline Scenario:</strong> Assumes current allocation with no strategic changes.
                                Uses historical market returns adjusted for current regime.
                            </div>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <strong style={{ color: 'white' }}>Optimized Scenario:</strong> Incorporates active strategies (Roth conversions,
                                tax-loss harvesting, asset location optimization) to maximize after-tax wealth.
                            </div>
                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'hsla(var(--success) / 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid hsla(var(--success) / 0.2)'
                            }}>
                                <div style={{ fontWeight: 600, color: 'hsl(var(--success))', marginBottom: '4px' }}>
                                    Wealth Alpha (Strategy Value)
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--success))' }}>
                                    +{formatCurrency(wealthAlpha)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>
                                    Additional wealth generated through strategic optimization over 25 years
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Monte Carlo Analysis */}
                    <Section
                        title="Risk Assessment (Monte Carlo)"
                        icon={Shield}
                        sectionKey="montecarlo"
                        summary={`${successRatio.toFixed(0)}% success rate across 1,000 simulations`}
                    >
                        <div style={{ fontSize: '0.75rem', lineHeight: 1.6, color: 'hsl(var(--text-secondary))' }}>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <strong style={{ color: 'white' }}>Simulation Method:</strong> Runs 1,000 different market scenarios
                                using historical volatility and return distributions. Each simulation tests whether your portfolio
                                can sustain your spending throughout retirement.
                            </div>
                            <div style={{
                                padding: 'var(--space-3)',
                                background: successRatio >= 90 ? 'hsla(var(--success) / 0.1)' : successRatio >= 75 ? 'hsla(var(--warning) / 0.1)' : 'hsla(var(--danger) / 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                border: `1px solid hsla(var(--${successRatio >= 90 ? 'success' : successRatio >= 75 ? 'warning' : 'danger'}) / 0.2)`
                            }}>
                                <div style={{ fontWeight: 600, color: `hsl(var(--${successRatio >= 90 ? 'success' : successRatio >= 75 ? 'warning' : 'danger'}))`, marginBottom: '4px' }}>
                                    Success Rate
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: `hsl(var(--${successRatio >= 90 ? 'success' : successRatio >= 75 ? 'warning' : 'danger'}))` }}>
                                    {successRatio.toFixed(1)}%
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>
                                    {successRatio >= 90 ? 'Excellent - Very low risk of running out of money' :
                                        successRatio >= 75 ? 'Good - Moderate risk, consider increasing savings' :
                                            'Concerning - High risk, review spending and savings'}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Assumptions */}
                    <Section
                        title="Key Assumptions"
                        icon={Zap}
                        sectionKey="assumptions"
                        summary="Market returns, inflation, tax rates"
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', fontSize: '0.75rem' }}>
                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'hsla(var(--bg-void) / 0.3)',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                <div style={{ fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '8px' }}>
                                    Market Returns
                                </div>
                                <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                                    • Stocks: 10% nominal, 7% real<br />
                                    • Bonds: 5% nominal, 2% real<br />
                                    • Real Estate: 8% nominal, 5% real<br />
                                    • Cash: 3% nominal, 0% real
                                </div>
                            </div>

                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'hsla(var(--bg-void) / 0.3)',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                <div style={{ fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '8px' }}>
                                    Tax & Inflation
                                </div>
                                <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                                    • Inflation: 3% annually<br />
                                    • Federal Tax: Progressive brackets<br />
                                    • State Tax: Based on residence<br />
                                    • Capital Gains: 15-20%
                                </div>
                            </div>

                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'hsla(var(--bg-void) / 0.3)',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                <div style={{ fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '8px' }}>
                                    Retirement
                                </div>
                                <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                                    • Safe Withdrawal: 4% annually<br />
                                    • RMDs: Start at age 73<br />
                                    • Social Security: Age 67+<br />
                                    • Healthcare: Medicare at 65
                                </div>
                            </div>

                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'hsla(var(--bg-void) / 0.3)',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                <div style={{ fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '8px' }}>
                                    Strategies
                                </div>
                                <div style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                                    • Roth Conversions: $25-50k/year<br />
                                    • Tax-Loss Harvesting: $3k/year<br />
                                    • Asset Location: 0.3-0.5% boost<br />
                                    • Fee Reduction: 1.05% savings
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -45%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
        </>
    );
};

export default CalculationTransparencyModal;
