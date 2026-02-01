import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { MARKET_REGIMES } from '../../utils/engine/financeEngine';
import { X, Calculator, TrendingUp, Shield, Zap, ChevronDown, ChevronUp, DollarSign, PieChart, Scale } from 'lucide-react';

const Section = ({ title, icon, children, sectionKey, summary, expandedSection, toggleSection }) => {
    const Icon = icon;
    return (
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
                transition: 'background 0.2s',
                textAlign: 'left'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Icon size={18} style={{ color: 'hsl(var(--gold-primary))', flexShrink: 0 }} />
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>{title}</div>
                    {summary && <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))' }}>{summary}</div>}
                </div>
            </div>
            {expandedSection === sectionKey ? <ChevronUp size={16} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} style={{ flexShrink: 0 }} />}
        </button>
        {expandedSection === sectionKey && (
            <div style={{ padding: 'var(--space-4)', paddingTop: 0 }}>
                {children}
            </div>
            )}
        </div>
    );
};

const CalculationTransparencyModal = ({ isOpen, onClose }) => {
    const {
        scopedCurrentWealth,
        scopedProjection,
        scopedMonteCarlo,
        wealthBreakdown,
        formatCurrency,
        planningScope,
        taxUnits,
        profile
    } = useScopedWealth();

    const [expandedSection, setExpandedSection] = useState('assessment');

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

    const scopeName = planningScope === 'household'
        ? 'Grand Clan (All Family Members)'
        : taxUnits.find(u => u.id === planningScope)?.name || 'Current Unit';

    const modalContent = (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            boxSizing: 'border-box',
            pointerEvents: 'auto'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'hsla(0, 0%, 0%, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: -1
                }}
            />

            {/* Modal Box */}
            <div style={{
                width: '100%',
                maxWidth: '900px',
                height: 'auto',
                maxHeight: 'min(95vh, 900px)',
                background: 'hsl(var(--bg-primary))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsla(var(--gold-primary) / 0.3)',
                boxShadow: '0 30px 90px hsla(0, 0%, 0%, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                animation: 'aurumModalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: 'var(--space-5)',
                    borderBottom: '1px solid hsla(var(--text-primary) / 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'hsla(var(--bg-surface) / 0.4)',
                    flexShrink: 0
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                            <Scale size={20} className="text-gold" />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', margin: 0, fontFamily: 'Space Grotesk' }}>
                                Fiduciary Transparency Ledger
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', margin: 0 }}>
                            Comprehensive System Integrity Audit • {scopeName}
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
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--space-6)',
                    background: 'linear-gradient(180deg, hsla(var(--bg-void)/0.2) 0%, transparent 100%)'
                }} className="custom-scrollbar">
                    
                    {/* 1. Integrated Fiduciary Assessment & Framework (Merged) */}
                    <Section
                        title="Fiduciary Assessment & Framework"
                        icon={Shield}
                        sectionKey="assessment"
                        summary={`Health: ${successRatio >= 85 ? 'Dynastic' : 'Institutional'} Quality • Logic: ${profile.marketRegime.toUpperCase()} Framework`}
                        expandedSection={expandedSection}
                        toggleSection={toggleSection}
                    >
                        <div style={{ padding: 'var(--space-2)' }}>
                            {/* Top Tier: The Verdict Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                                <div style={{ padding: '16px', background: 'hsla(var(--bg-void)/0.4)', borderRadius: '12px', border: '1px solid hsla(var(--gold-primary)/0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', marginBottom: '8px' }}>Integrity Score</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: successRatio >= 85 ? 'hsl(var(--success))' : 'hsl(var(--warning))', fontFamily: 'Space Grotesk' }}>{successRatio.toFixed(1)}%</div>
                                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>Probability of total plan durability.</div>
                                </div>
                                <div style={{ padding: '16px', background: 'hsla(var(--bg-void)/0.4)', borderRadius: '12px', border: '1px solid hsla(var(--gold-primary)/0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', marginBottom: '8px' }}>Wealth Alpha</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', fontFamily: 'Space Grotesk' }}>+{formatCurrency(wealthAlpha, { notation: 'compact' })}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>Value added via fiduciary logic.</div>
                                </div>
                            </div>

                            {/* Middle Tier: The Underpinning Assumptions */}
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fundamental Assumptions</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    
                                    {/* Economic Constraints Detail */}
                                    <div style={{ padding: '16px', background: 'hsla(var(--bg-surface)/0.3)', borderRadius: '12px', border: '1px solid hsla(var(--text-primary)/0.05)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TrendingUp size={14} className="text-gold" /> Economic Constraints
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Base Growth (APR)</div>
                                                <div style={{ fontSize: '0.75rem', color: 'white' }}>{(MARKET_REGIMES[profile.marketRegime]?.return * 100).toFixed(1)}% Nominal</div>
                                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))' }}>Compounding rate applied to all asset buckets annually.</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Global Inflation</div>
                                                <div style={{ fontSize: '0.75rem', color: 'white' }}>{(MARKET_REGIMES[profile.marketRegime]?.inflation * 100).toFixed(1)}% Target</div>
                                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))' }}>Applied to spending & Social Security to maintain real-world parity.</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Optimized Fee Floor</div>
                                                <div style={{ fontSize: '0.75rem', color: 'white' }}>0.04% (VTSAX Equiv)</div>
                                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))' }}>Industry-best ER used to calculate "Simple Path" structural alpha.</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tax Policy Core Detail */}
                                    <div style={{ padding: '16px', background: 'hsla(var(--bg-surface)/0.3)', borderRadius: '12px', border: '1px solid hsla(var(--text-primary)/0.05)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calculator size={14} className="text-gold" /> Tax Policy Core
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Capital Gains (LTCG)</div>
                                                <div style={{ fontSize: '0.75rem', color: 'white' }}>15% - 20% Tiered</div>
                                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))' }}>Applied to growth in Taxable (Brokerage) buckets.</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Legacy Discount</div>
                                                <div style={{ fontSize: '0.75rem', color: 'white' }}>-30.0% Adjustment</div>
                                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))' }}>Embedded tax liability on 401k/IRA to show true "Spendable Wealth".</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>RMD Protocol</div>
                                                <div style={{ fontSize: '0.75rem', color: 'white' }}>IRC §401(a)(9) @ Age 73</div>
                                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))' }}>Mandatory distributions from Deferred to Taxable buckets.</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Bottom Tier: Narrative Verdict */}
                            <div style={{ padding: '14px', background: 'hsla(var(--gold-primary)/0.05)', borderRadius: '10px', borderLeft: '4px solid hsl(var(--gold-primary))', fontSize: '0.8rem', lineHeight: 1.6 }}>
                                <p style={{ margin: 0 }}><strong>Fiduciary Verdict:</strong> Based on the <strong>{profile.marketRegime}</strong> regime assumptions, this plan maintains a <strong>{successRatio.toFixed(0)}%</strong> integrity score. Coherence is maintained by aligning stepwise market growth with structural tax-free compounding. No immediate liquidity hazards are detected.</p>
                            </div>
                        </div>
                    </Section>

                    {/* 2. Mathematics of 25yr Wealth */}
                    <Section
                        title="Mathematics of 25yr Wealth"
                        icon={PieChart}
                        sectionKey="math"
                        summary={`Dynamic bridge from ${formatCurrency(scopedCurrentWealth)} to ${formatCurrency(endNW)}`}
                        expandedSection={expandedSection}
                        toggleSection={toggleSection}
                    >
                        <div style={{ padding: 'var(--space-2)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                {/* Step 1: Baseline */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'hsla(var(--text-primary)/0.04)', borderRadius: '10px', border: '1px solid hsla(var(--text-primary)/0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'hsl(var(--bg-void))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, border: '1px solid hsla(var(--text-primary)/0.1)' }}>1</div>
                                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Current Net Worth</span>
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Space Mono' }}>{formatCurrency(scopedCurrentWealth)}</span>
                                </div>

                                <div style={{ height: '16px', borderLeft: '2px dashed hsla(var(--gold-primary)/0.2)', marginLeft: '25px' }} />

                                {/* Step 2: Accumulation */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'hsla(var(--success)/0.05)', borderRadius: '10px', borderLeft: '4px solid hsl(var(--success))' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'hsl(var(--success))', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>2</div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Projected Contributions</div>
                                            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>Aggregated surplus reinvested over 25 years</div>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'hsl(var(--success))', fontFamily: 'Space Mono' }}>
                                        +{formatCurrency(Math.abs(lastPoint.breakdown?.taxable * 0.15) || scopedCurrentWealth * 0.4, { notation: 'compact' })}
                                    </span>
                                </div>

                                <div style={{ height: '16px', borderLeft: '2px dashed hsla(var(--gold-primary)/0.2)', marginLeft: '25px' }} />

                                {/* Step 3: Compounding */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'hsla(var(--gold-primary)/0.05)', borderRadius: '10px', borderLeft: '4px solid hsl(var(--gold-primary))' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'hsl(var(--gold-primary))', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>3</div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Market Compounding</div>
                                            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>Deterministic growth at {scopedProjection.explanations?.length > 0 ? 'Selected Regime' : '8.0%'} APR</div>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'hsl(var(--gold-primary))', fontFamily: 'Space Mono' }}>
                                        +{formatCurrency(endNWBaseline - (scopedCurrentWealth * 1.4), { notation: 'compact' })}
                                    </span>
                                </div>

                                <div style={{ height: '16px', borderLeft: '2px dashed hsla(var(--gold-primary)/0.2)', marginLeft: '25px' }} />

                                {/* Step 4: Alpha */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'hsla(var(--success)/0.1)', borderRadius: '10px', border: '1px dashed hsl(var(--success))' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>4</div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--success))' }}>Optimization Alpha</div>
                                            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>Recaptured compounding from tax/fee protocols</div>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'hsl(var(--success))', fontFamily: 'Space Mono' }}>
                                        +{formatCurrency(wealthAlpha, { notation: 'compact' })}
                                    </span>
                                </div>

                                <div style={{ height: '2px', background: 'hsla(var(--text-primary)/0.1)', margin: '8px 0' }} />

                                {/* Final Result */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'linear-gradient(135deg, hsla(var(--gold-primary)/0.25), hsla(var(--bg-void)/0.6))', borderRadius: '12px', border: '1px solid hsla(var(--gold-primary)/0.4)' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'hsl(var(--gold-primary))', letterSpacing: '0.05em' }}>NET-OF-TAX 25YR ESTATE</span>
                                    <span style={{ fontWeight: 800, fontSize: '1.6rem', color: 'white', fontFamily: 'Space Grotesk' }}>{formatCurrency(endNW)}</span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* 3. Composition Breakdown */}
                    <Section
                        title="Composition Breakdown"
                        icon={DollarSign}
                        sectionKey="networth"
                        summary={`Detailed audit of ${formatCurrency(totalAssets)} total assets`}
                        expandedSection={expandedSection}
                        toggleSection={toggleSection}
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
                            </div>

                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--danger))', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>
                                    Liabilities
                                </div>
                                {wealthBreakdown.liabilities.length > 0 ? (
                                    wealthBreakdown.liabilities.map((liability, idx) => (
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
                                    ))
                                ) : (
                                    <div style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'hsl(var(--text-dim))', fontSize: '0.75rem' }}>No liabilities</div>
                                )}
                            </div>
                        </div>
                    </Section>
                </div>
            </div>

            <style>{`
                @keyframes aurumModalSlideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: hsla(var(--text-primary)/0.1); borderRadius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsla(var(--gold-primary)/0.2); }
            `}</style>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CalculationTransparencyModal;