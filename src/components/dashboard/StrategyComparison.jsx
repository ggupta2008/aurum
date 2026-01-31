import React, { useState, useEffect, useMemo } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Target, CheckCircle, BarChart3 } from 'lucide-react';
import { calculateProjection } from '../../utils/engine/financeEngine';

/**
 * AI-Driven Strategy Comparison
 * Auto-generates and compares strategy scenarios based on profile analysis
 */
export default function StrategyComparison() {
    const { profile, updateProfile } = useWealth();
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [hoveredData, setHoveredData] = useState(null);

    // Auto-generate scenarios based on profile analysis
    const scenarios = useMemo(() => {
        const scenarios = [];
        const financials = profile?.financials || {};
        const family = profile?.family || [];

        // Calculate key metrics
        const totalAssets = (financials.assets?.taxable || 0) +
            (financials.assets?.taxDeferred || 0) +
            (financials.assets?.taxFree || 0);
        const taxDeferredRatio = (financials.assets?.taxDeferred || 0) / (totalAssets || 1);
        const primaryMember = family.find(m => m.relation === 'Self') || family[0] || {};
        const age = primaryMember.age || 45;

        // Scenario 1: Baseline (Do Nothing)
        scenarios.push({
            id: 'baseline',
            name: 'Do Nothing',
            description: 'Keep everything as-is, no changes',
            strategies: {},
            color: 'hsl(0, 0%, 50%)'
        });

        // Scenario 2: Tax Minimization (if high tax-deferred)
        if (taxDeferredRatio > 0.4) {
            scenarios.push({
                id: 'tax_min',
                name: 'Pay Less Tax',
                description: 'Convert retirement accounts to tax-free over time',
                strategies: {
                    roth_conversion: { active: true, inputs: { annualAmount: 50000 } },
                    direct_indexing: { active: true, inputs: { allocation: 60 } }
                },
                color: 'hsl(43, 74%, 66%)'
            });
        }

        // Scenario 3: Aggressive Growth (if younger than 60)
        if (age < 60) {
            scenarios.push({
                id: 'aggressive',
                name: 'Maximize Growth',
                description: 'Focus on long-term wealth building',
                strategies: {
                    simple_path: { active: true, inputs: { allocation: 100 } },
                    roth_conversion: { active: true, inputs: { annualAmount: 75000 } },
                    social_security: { active: true, inputs: { claimAge: 70, estimatedPIA: 3000 } }
                },
                color: 'hsl(120, 60%, 50%)'
            });
        }

        // Scenario 4: Balanced (always include)
        scenarios.push({
            id: 'balanced',
            name: 'Balanced Approach',
            description: 'Mix of tax savings and growth',
            strategies: {
                simple_path: { active: true, inputs: { allocation: 80 } },
                roth_conversion: { active: true, inputs: { annualAmount: 35000 } }
            },
            color: 'hsl(280, 60%, 60%)'
        });

        // Calculate projections for each scenario
        return scenarios.map(scenario => {
            const testProfile = { ...profile, strategies: scenario.strategies };
            const projection = calculateProjection(testProfile);
            const baselineProjection = calculateProjection({ ...profile, strategies: {} });

            const finalWealth = projection.data[projection.data.length - 1]?.optimized || 0;
            const baselineWealth = baselineProjection.data[baselineProjection.data.length - 1]?.baseline || 0;
            const wealthAlpha = finalWealth - baselineWealth;

            return {
                ...scenario,
                projection,
                finalWealth,
                wealthAlpha,
                percentageGain: baselineWealth > 0 ? ((wealthAlpha / baselineWealth) * 100) : 0
            };
        }).sort((a, b) => b.wealthAlpha - a.wealthAlpha);
    }, [profile]);

    // Apply selected scenario
    const applyScenario = (scenario) => {
        updateProfile({ strategies: scenario.strategies });
        setSelectedScenario(scenario.id);
    };

    return (
        <div className="glass-panel anim-fade-up anim-delay-3" style={{ marginBottom: '2rem', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, hsl(var(--gold-primary)), hsl(var(--gold-warm)))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px hsla(var(--gold-primary)/0.3)'
                    }}>
                        <Target size={20} color="hsl(var(--text-on-gold))" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Space Grotesk, sans-serif' }}>Strategy Simulator</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                            <BarChart3 size={14} />
                            <span>{scenarios.length} SCENARIOS GENERATED</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {scenarios.map((scenario) => (
                    <div
                        key={scenario.id}
                        onClick={() => applyScenario(scenario)}
                        className={selectedScenario === scenario.id ? "glass-panel-interactive active-scenario" : "glass-panel-interactive"}
                        style={{
                            background: selectedScenario === scenario.id
                                ? 'hsla(var(--gold-primary) / 0.08)'
                                : 'hsla(var(--bg-elevated) / 0.4)',
                            border: selectedScenario === scenario.id
                                ? '1px solid hsl(var(--gold-primary))'
                                : '1px solid hsla(var(--text-primary) / 0.08)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Status Light */}
                        <div style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: selectedScenario === scenario.id ? 'hsl(var(--gold-primary))' : 'transparent',
                            boxShadow: selectedScenario === scenario.id ? '0 0 10px hsl(var(--gold-primary))' : 'none',
                            border: `1px solid ${selectedScenario === scenario.id ? 'transparent' : 'hsla(var(--text-primary)/0.2)'}`
                        }} />

                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontFamily: 'Space Grotesk, sans-serif', color: 'hsl(var(--text-primary))' }}>
                            {scenario.name}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginBottom: '1.25rem', minHeight: '2.5em' }}>
                            {scenario.description}
                        </p>

                        {/* Micro Metrics Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            padding: '12px',
                            background: 'hsla(var(--bg-void) / 0.4)',
                            borderRadius: '8px',
                            border: '1px solid hsla(var(--text-primary) / 0.04)'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legacy</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'hsl(var(--text-primary))' }}>
                                    ${(scenario.finalWealth / 1000000).toFixed(1)}M
                                </div>
                            </div>

                            {scenario.id !== 'baseline' ? (
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alpha</div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        fontFamily: 'Space Grotesk, sans-serif',
                                        color: scenario.wealthAlpha > 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'
                                    }}>
                                        {scenario.wealthAlpha > 0 ? '+' : ''}${(scenario.wealthAlpha / 1000000).toFixed(1)}M
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>Baseline</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison Chart Visualization */}
            {scenarios.length > 1 && (() => {
                const activeScenarioObj = scenarios.find(s => s.id === selectedScenario) || scenarios[0];
                const activeData = activeScenarioObj.projection.data;
                const maxWealth = Math.max(...scenarios.flatMap(s => s.projection.data.map(d => d.optimized || d.baseline)));

                return (
                    <div
                        style={{
                            position: 'relative',
                            height: '250px',
                            marginTop: '2rem',
                            padding: '2rem 1rem 0 1rem',
                            background: 'linear-gradient(to bottom, hsla(var(--bg-elevated)/0.3), transparent)',
                            borderRadius: '12px'
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                    >
                        {/* Lifetime Alpha Overlay */}
                        {(() => {
                            const maxAlphaScenario = scenarios[0]; // Sorted by alpha desc
                            const isBaseline = activeScenarioObj.id === 'baseline';
                            const showPotential = isBaseline && maxAlphaScenario.wealthAlpha > 0;
                            const showRealized = !isBaseline && activeScenarioObj.wealthAlpha > 0;

                            if (showPotential) {
                                return (
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        background: 'hsla(var(--bg-surface) / 0.6)',
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid hsla(var(--gold-primary) / 0.3)', // Gold border for potential
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        zIndex: 5,
                                        cursor: 'pointer'
                                    }} onClick={() => applyScenario(maxAlphaScenario)}>
                                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                            POTENTIAL ALPHA
                                        </div>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: 'hsl(var(--text-primary))',
                                            fontFamily: 'Space Grotesk, sans-serif'
                                        }}>
                                            +${(maxAlphaScenario.wealthAlpha / 1000000).toFixed(2)}M
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
                                            with {maxAlphaScenario.name}
                                        </div>
                                    </div>
                                );
                            }

                            if (showRealized) {
                                return (
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        background: 'hsla(var(--bg-surface) / 0.6)',
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid hsla(var(--success) / 0.3)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        zIndex: 5
                                    }}>
                                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--success))', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                                            STRATEGY ALPHA
                                        </div>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: 'hsl(var(--success))',
                                            fontFamily: 'Space Grotesk, sans-serif'
                                        }}>
                                            +${(activeScenarioObj.wealthAlpha / 1000000).toFixed(2)}M
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Tooltip Overlay */}
                        {hoveredData && (
                            <div style={{
                                position: 'absolute',
                                left: hoveredData.x,
                                top: 0,
                                transform: `translateX(${hoveredData.x > 400 ? '-105%' : '5%'})`,
                                background: 'hsla(var(--bg-surface) / 0.95)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid hsla(var(--gold-primary) / 0.3)',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: '0 12px 24px -8px hsla(0,0%,0%,0.5)',
                                minWidth: '240px',
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
                                    YEAR {hoveredData.year}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Baseline</span>
                                    <span style={{ fontSize: '0.9rem', fontFamily: 'Space Mono, monospace' }}>${(hoveredData.baseline / 1000000).toFixed(2)}M</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '0.9rem', color: activeScenarioObj.color, fontWeight: 600 }}>Optimized</span>
                                    <span style={{ fontSize: '0.9rem', fontFamily: 'Space Mono, monospace', color: activeScenarioObj.color, fontWeight: 600 }}>${(hoveredData.optimized / 1000000).toFixed(2)}M</span>
                                </div>

                                {/* Delta Pill */}
                                <div style={{
                                    background: 'hsla(var(--success) / 0.1)',
                                    border: '1px solid hsla(var(--success) / 0.2)',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: hoveredData.events?.length > 0 ? '12px' : '0'
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 600 }}>AURUM ALPHA</span>
                                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--success))', fontFamily: 'Space Mono, monospace' }}>
                                        +${((hoveredData.optimized - hoveredData.baseline) / 1000).toFixed(0)}k
                                    </span>
                                </div>

                                {/* Asset Breakdown */}
                                {hoveredData.breakdown && (
                                    <div style={{
                                        marginTop: '12px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid hsla(var(--text-primary)/0.1)',
                                        fontSize: '0.75rem'
                                    }}>
                                        <div style={{ color: 'hsl(var(--text-muted))', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Composition</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ color: 'hsl(var(--text-secondary))' }}>Tax-Free (Roth)</span>
                                            <span style={{ fontFamily: 'Space Mono', color: 'hsl(var(--text-primary))' }}>${(hoveredData.breakdown.taxFree / 1000).toFixed(0)}k</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ color: 'hsl(var(--text-secondary))' }}>Tax-Deferred</span>
                                            <span style={{ fontFamily: 'Space Mono', color: 'hsl(var(--text-primary))' }}>${(hoveredData.breakdown.deferred / 1000).toFixed(0)}k</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'hsl(var(--text-secondary))' }}>Taxable</span>
                                            <span style={{ fontFamily: 'Space Mono', color: 'hsl(var(--text-primary))' }}>${(hoveredData.breakdown.taxable / 1000).toFixed(0)}k</span>
                                        </div>
                                    </div>
                                )}


                                {/* Annotated Events */}
                                {hoveredData.events?.length > 0 && (
                                    <div style={{ borderTop: '1px solid hsla(var(--text-primary)/0.1)', paddingTop: '10px', marginTop: '10px' }}>
                                        {hoveredData.events.map((ev, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                                                <div style={{ marginTop: '4px', width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--gold-primary))', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-primary))', fontWeight: 600 }}>{ev.label}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{ev.impact}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <svg width="100%" height="100%" viewBox="0 0 800 250" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="0" y1={i * 70} x2="800" y2={i * 70} stroke="hsla(var(--text-primary) / 0.04)" strokeWidth="1" strokeDasharray="4 4" />
                            ))}

                            {/* Scenario lines */}
                            {scenarios.map((scenario) => {
                                const data = scenario.projection.data;
                                // Generate SVG path command
                                const pathD = data.map((point, i) => {
                                    const x = (i / (data.length - 1)) * 800;
                                    const wealth = point.optimized || point.baseline;
                                    const y = 250 - ((wealth / maxWealth) * 220); // Scale to fit
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ');

                                return (
                                    <g key={scenario.id} style={{ opacity: selectedScenario === scenario.id ? 1 : 0.2, transition: 'opacity 0.3s' }}>
                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke={scenario.color}
                                            strokeWidth={selectedScenario === scenario.id ? "3" : "2"}
                                            strokeLinecap="round"
                                            style={{ filter: selectedScenario === scenario.id ? `drop-shadow(0 4px 8px ${scenario.color})` : 'none' }}
                                        />
                                    </g>
                                );
                            })}

                            {/* Interactive Zones - Rendered ON TOP */}
                            {activeData.map((d, i) => {
                                const x = (i / (activeData.length - 1)) * 800;
                                return (
                                    <g key={i}>
                                        <rect
                                            x={x - (800 / activeData.length) / 2}
                                            y="0"
                                            width={800 / activeData.length}
                                            height="250"
                                            fill="transparent"
                                            style={{ cursor: 'crosshair' }}
                                            onMouseEnter={() => setHoveredData({ ...d, x })}
                                        />
                                        {/* Hover Line */}
                                        {hoveredData && hoveredData.year === d.year && (
                                            <line x1={x} y1="0" x2={x} y2="250" stroke="hsla(var(--text-primary)/0.2)" strokeDasharray="4 4" />
                                        )}
                                        {/* Event Dots on Line */}
                                        {d.events?.length > 0 && selectedScenario !== 'baseline' && (
                                            <circle
                                                cx={x}
                                                cy={250 - (((d.optimized || d.baseline) / maxWealth) * 220)}
                                                r="4"
                                                fill="hsl(var(--bg-surface))"
                                                stroke="hsl(var(--gold-primary))"
                                                strokeWidth="2"
                                            />
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                );
            })()}
        </div>
    );
}
