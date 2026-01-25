import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { DollarSign, TrendingUp, ShieldCheck, Activity, Sparkles, Info, X, Calculator } from 'lucide-react';
import CalculationTransparencyModal from './CalculationTransparencyModal';

const MetricCard = ({ label, value, subtext, icon: Icon, trend, delay = 0, onInfoClick }) => {
    const trendColor = trend > 0 ? 'hsl(var(--success))' : trend < 0 ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))';

    return (
        <div
            className={`glass-panel anim-fade-up anim-delay-${delay}`}
            style={{
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Glow effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, hsla(var(--gold-primary) / 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'hsla(var(--gold-primary) / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={18} className="text-gold" />
                </div>
                {onInfoClick && (
                    <button
                        onClick={onInfoClick}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'hsl(var(--text-dim))',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <Info size={14} />
                    </button>
                )}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-muted))',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: '2px',
                    letterSpacing: '-0.02em'
                }}>
                    {value}
                </div>
                <div style={{
                    fontSize: '0.65rem',
                    color: 'hsl(var(--text-dim))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    {subtext}
                    {trend !== undefined && trend !== 0 && (
                        <span style={{
                            color: trendColor,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                        }}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const SummaryCards = () => {
    const {
        scopedProjection,
        scopedMonteCarlo,
        planningScope,
        taxUnits,
        scopedCurrentWealth,
        formatCurrency
    } = useScopedWealth();

    const [showMethodology, setShowMethodology] = useState(false);
    const [showCalculations, setShowCalculations] = useState(false);

    const data = scopedProjection.data || [];
    const lastPoint = data[data.length - 1] || {};

    // Derived values from scoped projection
    const startNW = scopedCurrentWealth;
    const endNWBaseline = lastPoint.baseline || 0;
    const endNW = lastPoint.optimized || 0;

    const successRatio = (scopedMonteCarlo && scopedMonteCarlo.length > 0) ? (scopedMonteCarlo[0].successRate ?? 100) : 100;

    const wealthAlpha = endNW - endNWBaseline;

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
                        background: 'hsl(var(--bg-void))',
                        padding: 'var(--space-6)',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h4 style={{ color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Intelligence Engine Methodology</h4>
                        <button onClick={() => setShowMethodology(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        <div>
                            <p style={{ marginBottom: '12px' }}><strong>Safety Score (Monte Carlo):</strong> We run 250 parallel universes of your life. The score is the % of universes where you never run out of money.</p>
                            <p style={{ marginBottom: '12px' }}><strong>Wealth Alpha:</strong> The "Strategy Value" or projected dollar gain of the Aurum Optimized plan over your baseline Status Quo. This quantifies the mathematical advantage of fee reduction, tax bucket shifting, and asset location.</p>
                            <p><strong>Wealth Projection:</strong> A deterministic 25-year compounding simulation comparing selected strategies vs. a default 'lazy' portfolio.</p>
                        </div>
                        <div>
                            <p style={{ marginBottom: '12px' }}><strong>Scope Awareness:</strong> All metrics are calculated for the selected planning scope ({planningScope === 'household' ? 'Grand Clan' : taxUnits.find(u => u.id === planningScope)?.name || 'Current Unit'}). Values are proportionally allocated based on current asset ownership.</p>
                            <p style={{ marginBottom: '12px' }}><strong>Milestone Triggers:</strong> The engine models Social Security (age 67), forced IRS RMDs (age 73), and Education COA drags automatically based on family dates of birth.</p>
                            <p><strong>Legacy Calculation:</strong> The final figure represents your net-of-tax estate, accounting for debt amortization and strategic "Tax Bucket" optimization.</p>
                        </div>
                    </div>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
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
                    subtext="Projected legacy (optimized)"
                    icon={ShieldCheck}
                    onInfoClick={() => setShowMethodology(true)}
                    delay={2}
                />
                <MetricCard
                    label="Safety Score"
                    value={`${successRatio}%`}
                    subtext="Plan success probability"
                    icon={Sparkles}
                    trend={successRatio > 90 ? 12 : -5}
                    delay={3}
                />
                <MetricCard
                    label="Wealth Alpha"
                    value={wealthAlpha > 0
                        ? formatCurrency(wealthAlpha, { notation: 'compact' })
                        : "Optimization Ready"}
                    subtext={wealthAlpha > 0
                        ? "Geometric gain vs Status Quo"
                        : "Enable strategies to generate Alpha"}
                    icon={TrendingUp}
                    onInfoClick={() => setShowMethodology(true)}
                    delay={4}
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
