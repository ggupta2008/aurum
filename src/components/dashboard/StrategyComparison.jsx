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
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Target size={24} style={{ color: 'var(--gold-primary)' }} />
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Strategy Comparison</h2>
            </div>

            {/* Scenarios Grid */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid hsla(0, 0%, 100%, 0.1)'
            }}>
                <BarChart3 size={20} style={{ color: 'var(--gold-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                    {scenarios.length} Scenarios
                </h3>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {scenarios.map((scenario) => (
                    <div
                        key={scenario.id}
                        onClick={() => applyScenario(scenario)}
                        style={{
                            background: selectedScenario === scenario.id
                                ? 'hsla(43, 74%, 66%, 0.15)'
                                : 'hsla(220, 13%, 18%, 0.4)',
                            border: selectedScenario === scenario.id
                                ? '2px solid var(--gold-primary)'
                                : '1px solid hsla(0, 0%, 100%, 0.1)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedScenario !== scenario.id) {
                                e.currentTarget.style.borderColor = scenario.color;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedScenario !== scenario.id) {
                                e.currentTarget.style.borderColor = 'hsla(0, 0%, 100%, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {/* Color accent bar */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: scenario.color
                        }} />

                        {/* Scenario header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: scenario.color }}>
                                {scenario.name}
                            </h4>
                            {selectedScenario === scenario.id && (
                                <CheckCircle size={20} style={{ color: 'var(--gold-primary)' }} />
                            )}
                        </div>

                        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>
                            {scenario.description}
                        </p>

                        {/* Metrics */}
                        <div style={{
                            display: 'grid',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: 'hsla(0, 0%, 0%, 0.2)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Final Wealth:</span>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: scenario.color }}>
                                    ${(scenario.finalWealth / 1000000).toFixed(2)}M
                                </span>
                            </div>

                            {scenario.id !== 'baseline' && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>vs. Baseline:</span>
                                        <span style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: scenario.wealthAlpha > 0 ? 'hsl(120, 60%, 50%)' : 'hsl(0, 60%, 50%)'
                                        }}>
                                            {scenario.wealthAlpha > 0 ? '+' : ''}${(scenario.wealthAlpha / 1000000).toFixed(2)}M
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Gain:</span>
                                        <span style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: scenario.percentageGain > 0 ? 'hsl(120, 60%, 50%)' : 'hsl(0, 60%, 50%)'
                                        }}>
                                            {scenario.percentageGain > 0 ? '+' : ''}{scenario.percentageGain.toFixed(1)}%
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Active strategies count */}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.6 }}>
                            {Object.keys(scenario.strategies).length} {Object.keys(scenario.strategies).length === 1 ? 'strategy' : 'strategies'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison Chart */}
            {scenarios.length > 1 && (
                <div style={{
                    background: 'hsla(220, 13%, 18%, 0.4)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid hsla(0, 0%, 100%, 0.1)'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', opacity: 0.9 }}>
                        25-Year Wealth Trajectory
                    </h4>

                    <div style={{ position: 'relative', height: '300px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <line
                                    key={i}
                                    x1="0"
                                    y1={i * 75}
                                    x2="800"
                                    y2={i * 75}
                                    stroke="hsla(0, 0%, 100%, 0.05)"
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Scenario lines */}
                            {scenarios.map((scenario) => {
                                const data = scenario.projection.data;
                                const maxWealth = Math.max(...scenarios.flatMap(s => s.projection.data.map(d => d.optimized || d.baseline)));

                                const points = data.map((point, i) => {
                                    const x = (i / (data.length - 1)) * 800;
                                    const wealth = point.optimized || point.baseline;
                                    const y = 300 - ((wealth / maxWealth) * 280);
                                    return `${x},${y}`;
                                }).join(' ');

                                return (
                                    <polyline
                                        key={scenario.id}
                                        points={points}
                                        fill="none"
                                        stroke={scenario.color}
                                        strokeWidth={selectedScenario === scenario.id ? "3" : "2"}
                                        opacity={selectedScenario === scenario.id ? "1" : "0.6"}
                                        style={{ transition: 'all 0.3s ease' }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Legend */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            marginTop: '1rem',
                            justifyContent: 'center'
                        }}>
                            {scenarios.map(scenario => (
                                <div key={scenario.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '16px',
                                        height: '3px',
                                        background: scenario.color,
                                        opacity: selectedScenario === scenario.id ? 1 : 0.6
                                    }} />
                                    <span style={{
                                        fontSize: '0.85rem',
                                        opacity: selectedScenario === scenario.id ? 1 : 0.6
                                    }}>
                                        {scenario.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
