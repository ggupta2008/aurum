import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Lightbulb, TrendingUp, Activity } from 'lucide-react';

const ProjectionChart = () => {
    const { scopedProjection, scopedMonteCarlo, profile } = useScopedWealth();
    const { data, explanations } = scopedProjection;
    const [viewMode, setViewMode] = useState('growth'); // 'growth' | 'risk'

    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);

    // Merge MC data
    const displayData = data.map((d, i) => ({
        ...d,
        p10: scopedMonteCarlo?.[i]?.p10,
        p50: scopedMonteCarlo?.[i]?.p50,
        p90: scopedMonteCarlo?.[i]?.p90
    }));

    // Calculate Lifetime Alpha
    const finalData = data[data.length - 1] || {};
    const wealthAlpha = (finalData.optimized || 0) - (finalData.baseline || 0);

    // Identify Active Strategies (Logic only, no UI display as requested)
    Object.entries(profile.strategies || {})
        .filter(([, s]) => s.active)
        .map(([id]) => id);

    return (
        <div className="glass-panel anim-fade-up anim-delay-2" style={{
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%',
            minHeight: '600px',
            position: 'relative'
        }}>
            {/* Header Row: Title + Mode Switcher */}
            <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        fontFamily: 'Space Grotesk, sans-serif',
                        letterSpacing: '-0.02em',
                        color: 'hsl(var(--text-primary))',
                        marginBottom: '4px'
                    }}>
                        Wealth Trajectory
                    </h3>
                    {/* Dynamic Subtitle */}
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {viewMode === 'growth' ? (
                            <>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--text-muted))', opacity: 0.5 }}></div>
                                    Status Quo
                                </span>
                                <span style={{ color: 'hsl(var(--text-muted))' }}>vs</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--gold-primary))' }}></div>
                                    AI Optimized
                                </span>
                            </>
                        ) : (
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>
                                Monte Carlo Simulation (250 runs)
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Side: Mode Switcher + Alpha */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* View Mode Switcher */}
                    <div style={{
                        background: 'hsla(var(--bg-void)/0.5)',
                        border: '1px solid hsla(var(--text-primary)/0.1)',
                        borderRadius: '8px',
                        padding: '3px',
                        display: 'flex'
                    }}>
                        <button
                            onClick={() => setViewMode('growth')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: viewMode === 'growth' ? 'hsla(var(--text-primary)/0.1)' : 'transparent',
                                color: viewMode === 'growth' ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))'
                            }}
                        >
                            <TrendingUp size={14} />
                            Growth
                        </button>
                        <button
                            onClick={() => setViewMode('risk')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: viewMode === 'risk' ? 'hsla(var(--text-primary)/0.1)' : 'transparent',
                                color: viewMode === 'risk' ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))'
                            }}
                        >
                            <Activity size={14} />
                            Risk
                        </button>
                    </div>

                    {/* Alpha Badge (Only in Growth Mode or if positive) */}
                    {wealthAlpha > 0 && (
                        <div style={{
                            textAlign: 'right',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            paddingLeft: '16px',
                            borderLeft: '1px solid hsla(var(--text-primary)/0.1)'
                        }}>
                            <div style={{
                                fontSize: '0.65rem',
                                color: 'hsl(var(--success))',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Alpha
                            </div>
                            <div style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                fontFamily: 'Space Grotesk, sans-serif',
                                color: 'hsl(var(--success))'
                            }}>
                                +{formatCurrency(wealthAlpha)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ flex: 1, minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--text-muted))" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="hsl(var(--text-muted))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--gold-primary))" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="hsl(var(--gold-primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsla(var(--text-primary) / 0.04)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="year"
                            stroke="hsla(var(--text-primary) / 0.3)"
                            fontSize={11}
                            tickLine={false}
                            tickMargin={12}
                            axisLine={false}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            stroke="hsla(var(--text-primary) / 0.3)"
                            fontSize={11}
                            tickLine={false}
                            width={60}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ stroke: 'hsla(var(--text-primary)/0.1)', strokeWidth: 1 }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="glass-panel" style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid hsla(var(--gold-primary)/0.2)',
                                            boxShadow: '0 8px 32px hsla(0,0,0,0.2)'
                                        }}>
                                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 600 }}>
                                                Year {label}
                                            </div>
                                            {payload.map((p, idx) => {
                                                if (p.name === 'hidden') return null;
                                                return (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.stroke }} />
                                                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', flex: 1 }}>{p.name}:</span>
                                                        <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
                                                            {formatCurrency(p.value)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {/* RENDER LOGIC BASED ON VIEW MODE */}
                        {viewMode === 'risk' && (
                            <>
                                <Area
                                    type="monotone"
                                    dataKey="p90"
                                    name="Bull Case (90th)"
                                    stroke="hsl(var(--bull-case))"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                    fillOpacity={0.1}
                                    fill="hsl(var(--bull-case))"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="p10"
                                    name="Bear Case (10th)"
                                    stroke="hsl(var(--bear-case))"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                    fillOpacity={0.1}
                                    fill="hsl(var(--bear-case))"
                                />
                                {/* Overlay Median for context */}
                                <Area
                                    type="monotone"
                                    dataKey="p50"
                                    name="Median"
                                    stroke="hsl(var(--text-secondary))"
                                    strokeWidth={2}
                                    fillOpacity={0}
                                />
                            </>
                        )}

                        {viewMode === 'growth' && (
                            <>
                                <Area
                                    type="monotone"
                                    dataKey="baseline"
                                    name="Status Quo"
                                    stroke="hsl(var(--text-muted))"
                                    strokeWidth={2}
                                    strokeDasharray="6 6"
                                    strokeOpacity={0.7}
                                    fill="url(#baselineGradient)"
                                    fillOpacity={1}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="optimized"
                                    name="Aurum Optimized"
                                    stroke="hsl(var(--gold-primary))"
                                    strokeWidth={3}
                                    fill="url(#optimizedGradient)"
                                    fillOpacity={1}
                                />
                            </>
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Insights Footer */}
            {explanations && explanations.length > 0 && viewMode === 'growth' && (
                <div style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid hsla(var(--text-primary) / 0.06)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginBottom: 'var(--space-2)'
                    }}>
                        <Lightbulb size={14} className="text-gold" />
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'hsl(var(--text-muted))',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                        }}>
                            Tactical Analysis
                        </span>
                    </div>
                    <ul style={{
                        listStyle: 'none',
                        fontSize: '0.85rem',
                        color: 'hsl(var(--text-secondary))',
                        lineHeight: 1.6,
                        margin: 0,
                        padding: 0
                    }}>
                        {explanations.slice(0, 2).map((expl, i) => (
                            <li key={i} style={{ marginBottom: 'var(--space-1)', display: 'flex', gap: '8px' }}>
                                <span style={{ color: 'hsl(var(--gold-primary))', opacity: 0.6 }}>•</span>
                                {expl}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProjectionChart;