import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { calculateBenefitFactor, findBreakevenAge } from '../../utils/engine/socialSecurityRules';
import { TrendingUp, Landmark, ShieldCheck, Calendar, Info, Target, AlertCircle } from 'lucide-react';

const SocialSecurityOptimizer = () => {
    const { profile, formatCurrency, updateStrategyInput } = useScopedWealth();
    const [showInfo, setShowInfo] = useState(false);

    const ssStrategy = profile.strategies?.['social_security'] || { active: false, inputs: { claimAge: 67, estimatedPIA: 3000 } };
    const { claimAge = 67, estimatedPIA = 3000 } = ssStrategy.inputs || {};

    const ages = [62, 63, 64, 65, 66, 67, 68, 69, 70];
    const data = ages.map(age => ({
        age,
        monthly: estimatedPIA * calculateBenefitFactor(age),
        annual: estimatedPIA * 12 * calculateBenefitFactor(age)
    }));

    const currentMonthly = estimatedPIA * calculateBenefitFactor(claimAge);

    // Compare selected age vs early (62) and vs FRA (67)
    const vs62 = findBreakevenAge(estimatedPIA, 62, claimAge);
    const vs67 = findBreakevenAge(estimatedPIA, 67, claimAge);

    return (
        <div className="glass-panel anim-fade-up anim-delay-3" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Landmark size={18} className="text-gold" />
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>
                        Social Security Optimizer
                    </h3>
                </div>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="nav-btn"
                    style={{ padding: '4px', borderRadius: '6px' }}
                >
                    <Info size={14} />
                </button>
            </div>

            {showInfo && (
                <div className="anim-fade-up" style={{
                    background: 'hsla(var(--gold-primary) / 0.05)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--gold-primary) / 0.1)',
                    marginBottom: 'var(--space-4)',
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-secondary))',
                    lineHeight: 1.5
                }}>
                    <p style={{ marginBottom: '8px' }}><strong>Longevity Insurance:</strong> Social Security is one of the only guaranteed, inflation-indexed income streams available.</p>
                    <p style={{ marginBottom: '4px' }}>• <strong>Early (62):</strong> Lifetime reduction of ~30% in monthly benefits.</p>
                    <p style={{ marginBottom: '4px' }}>• <strong>Delayed (70):</strong> Guaranteed 8% increase per year delayed after 67.</p>
                    <p>• <strong>Strategy:</strong> High earners often benefit from delaying to 70 to maximize survivor benefits and hedge against living past 80.</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-6)' }}>
                {/* Controls & Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="glass-panel" style={{ padding: 'var(--space-3)', background: 'hsla(var(--bg-void) / 0.4)' }}>
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>Claiming Age</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="range"
                                    min="62"
                                    max="70"
                                    step="1"
                                    value={claimAge}
                                    onChange={(e) => updateStrategyInput('social_security', 'claimAge', e.target.value)}
                                    style={{ flex: 1, accentColor: 'hsl(var(--gold-primary))' }}
                                />
                                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{claimAge}</span>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: 'var(--space-3)', background: 'hsla(var(--bg-void) / 0.4)' }}>
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>PIA (at 67)</div>
                            <input
                                type="number"
                                value={estimatedPIA}
                                onChange={(e) => updateStrategyInput('social_security', 'estimatedPIA', e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid hsla(var(--text-primary) / 0.1)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Monthly Benefit</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--gold-primary))' }}>
                                {formatCurrency(currentMonthly)}
                            </span>
                        </div>
                        <div style={{ height: '4px', background: 'hsla(var(--text-primary) / 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${(calculateBenefitFactor(claimAge) / 1.24) * 100}%`,
                                background: 'linear-gradient(90deg, hsl(var(--gold-primary)), hsl(var(--gold-warm)))',
                                borderRadius: '2px'
                            }} />
                        </div>
                    </div>

                    {/* Breakeven Analysis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <h4 style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'hsl(var(--text-dim))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Target size={12} /> Strategy Breakeven
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'hsla(var(--text-primary) / 0.03)', border: '1px solid hsla(var(--text-primary) / 0.05)' }}>
                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>vs Age 62</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{vs62 ? `Age ${vs62}` : 'Immediate'}</div>
                            </div>
                            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'hsla(var(--text-primary) / 0.03)', border: '1px solid hsla(var(--text-primary) / 0.05)' }}>
                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>vs Age 67</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{vs67 ? `Age ${vs67}` : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Visualization */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {data.map(item => (
                            <div key={item.age} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    width: '24px',
                                    color: item.age === claimAge ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-dim))',
                                    fontWeight: item.age === claimAge ? 800 : 400
                                }}>
                                    {item.age}
                                </span>
                                <div style={{
                                    flex: 1,
                                    height: '16px',
                                    background: 'hsla(var(--text-primary) / 0.03)',
                                    borderRadius: '4px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: `${(calculateBenefitFactor(item.age) / 1.24) * 100}%`,
                                        background: item.age === claimAge ? 'hsla(var(--gold-primary) / 0.6)' : 'hsla(var(--text-primary) / 0.1)',
                                        transition: 'all 0.3s ease'
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        color: item.age === claimAge ? 'white' : 'hsl(var(--text-dim))'
                                    }}>
                                        {Math.round(calculateBenefitFactor(item.age) * 100)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background: 'hsla(var(--success) / 0.05)',
                        border: '1px solid hsla(var(--success) / 0.1)',
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <ShieldCheck size={16} className="text-success" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: '0.65rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.4, margin: 0 }}>
                            {claimAge > 67
                                ? `By delaying to ${claimAge}, you gain ${Math.round((calculateBenefitFactor(claimAge) - 1) * 100)}% in guaranteed monthly income compared to your full retirement benefit.`
                                : `Claiming at ${claimAge} provides early cash flow, but your monthly benefit is ${Math.round((1 - calculateBenefitFactor(claimAge)) * 100)}% lower than FRA.`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialSecurityOptimizer;
