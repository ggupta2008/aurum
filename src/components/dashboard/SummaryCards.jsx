import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { DollarSign, TrendingUp, ShieldCheck, Activity, Sparkles, Info, X, Calculator } from 'lucide-react';
import CalculationTransparencyModal from './CalculationTransparencyModal';

const MetricCard = ({ label, value, subtext, icon, trend, delay = 0, onInfoClick }) => {
    const Icon = icon;
    const isPositive = trend > 0;
    const isNeutral = !trend;

    return (
        <div
            className={`glass-panel glass-panel-interactive anim-fade-up anim-delay-${delay}`}
            style={{
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // stretch to fill
                gap: 'var(--space-3)',
                position: 'relative',
                minHeight: '160px' // Taller, more premium presence
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, hsla(var(--gold-primary)/0.2), hsla(var(--bg-void)/0.5))',
                    border: '1px solid hsla(var(--gold-primary)/0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px hsla(0,0,0,0.1)' // faint shadow for depth
                }}>
                    <Icon size={20} className="text-gold" />
                </div>
                {onInfoClick && (
                    <button
                        onClick={onInfoClick}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'hsl(var(--text-dim))',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.color = 'hsl(var(--gold-primary))'}
                        onMouseLeave={e => e.target.style.color = 'hsl(var(--text-dim))'}
                    >
                        <Info size={16} />
                    </button>
                )}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'hsl(var(--text-secondary))',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif', // Digital readout font
                    color: 'hsl(var(--text-primary))',
                    marginBottom: '8px',
                    letterSpacing: '-0.03em',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                    background: 'linear-gradient(180deg, hsl(var(--text-primary)) 0%, hsl(var(--text-secondary)) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {value}
                    {label === "Net Worth" && <span style={{
                        fontSize: '0.6rem',
                        color: 'hsl(var(--gold-primary))',
                        WebkitTextFillColor: 'initial', // Reset gradient
                        opacity: 1,
                        fontWeight: 700,
                        border: '1px solid hsla(var(--gold-primary)/0.3)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                    }}>LIQUID</span>}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {/* Trend Badge */}
                    {!isNeutral && (
                        <div style={{
                            padding: '4px 8px',
                            borderRadius: '20px',
                            background: isPositive ? 'hsla(var(--success)/0.1)' : 'hsla(var(--danger)/0.1)',
                            border: `1px solid ${isPositive ? 'hsla(var(--success)/0.2)' : 'hsla(var(--danger)/0.2)'}`,
                            color: isPositive ? 'hsl(var(--success))' : 'hsl(var(--danger))',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                        }}>
                            {isPositive ? '↗' : '↘'} {Math.abs(trend)}%
                        </div>
                    )}

                    <div style={{
                        fontSize: '0.7rem',
                        color: 'hsl(var(--text-muted))',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {subtext}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCards = () => {
    const {
        scopedProjection,
        planningScope,
        scopedCurrentWealth,
        formatCurrency
    } = useScopedWealth();

    const [showMethodology, setShowMethodology] = useState(false);
    const [showCalculations, setShowCalculations] = useState(false);

    const data = scopedProjection.data || [];
    const lastPoint = data[data.length - 1] || {};

    // Derived values from scoped projection
    const startNW = scopedCurrentWealth;
    const endNW = lastPoint.optimized || 0;

    return (
        <div style={{ position: 'relative' }}>
            {showMethodology && (
                <div
                    className="glass-panel anim-fade-up"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: 'hsl(var(--bg-elevated))',
                        padding: 'var(--space-6)',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h4 style={{ color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 700 }}>Transparency Ledger • Engine V2</h4>
                        <button onClick={() => setShowMethodology(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        <div>
                            <p style={{ marginBottom: '12px' }}><strong style={{ color: 'white' }}>Deterministic Projection:</strong> A stepwise 25-year compounding model that ingests your income, spending, and asset location. It applies year-by-year inflation and progressive tax drag to reach the final number.</p>
                            <p style={{ marginBottom: '12px' }}><strong style={{ color: 'white' }}>Structural Alpha:</strong> This is the value of your choices. By reducing fees from an industry-average 1.2% to an optimized 0.04% and shifting assets to tax-free buckets, we recapture millions in lost compounding power.</p>
                        </div>
                        <div>
                            <p style={{ marginBottom: '12px' }}><strong style={{ color: 'white' }}>Stress Testing (Risk):</strong> The "Stressed Success" score is derived from 250 stochastic (random) market simulations. If your score is low, your 25yr Wealth projection is "Fragile" and subject to sequence-of-return risk.</p>
                            <p><strong style={{ color: 'white' }}>Legacy Discount:</strong> We apply a 30% embedded tax liability discount to all Tax-Deferred (401k/IRA) assets. This shows you "Spendable Net Worth" rather than the raw account balance, providing a true fiduciary view of your estate.</p>
                        </div>
                    </div>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-4)'
            }}>
                <MetricCard
                    label="Current Portfolio"
                    value={formatCurrency(startNW, { notation: 'compact' })}
                    subtext={planningScope === 'household' ? "Total assets across all units" : "Scoped to selected unit"}
                    icon={DollarSign}
                    delay={1}
                />
                <MetricCard
                    label="Estimated 25yr Wealth"
                    value={formatCurrency(endNW, { notation: 'compact' })}
                    subtext="Projected worth (current scenario)"
                    icon={ShieldCheck}
                    onInfoClick={() => setShowMethodology(true)}
                    delay={2}
                />
            </div>

            {/* Calculation Transparency Button */}
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                <button
                    onClick={() => setShowCalculations(true)}
                    className="glass-panel"
                    style={{
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'hsla(var(--gold-primary) / 0.05)',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'hsl(var(--gold-primary))',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'hsla(var(--gold-primary) / 0.1)';
                        e.target.style.borderColor = 'hsla(var(--gold-primary) / 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'hsla(var(--gold-primary) / 0.05)';
                        e.target.style.borderColor = 'hsla(var(--gold-primary) / 0.2)';
                    }}
                >
                    <Calculator size={16} />
                    View Calculation Details
                </button>
            </div>

            {/* Modals */}
            <CalculationTransparencyModal
                isOpen={showCalculations}
                onClose={() => setShowCalculations(false)}
            />
        </div>
    );
};

export default SummaryCards;
