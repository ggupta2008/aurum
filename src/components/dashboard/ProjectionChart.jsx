import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Lightbulb } from 'lucide-react';

const ProjectionChart = () => {
    const { scopedProjection, scopedMonteCarlo } = useScopedWealth();
    const { data, explanations } = scopedProjection;
    const [showStressTest, setShowStressTest] = React.useState(false);

    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);

    // Merge MC data into the main display set (everything is already scoped by the hook)
    const displayData = data.map((d, i) => ({
        ...d,
        p10: scopedMonteCarlo?.[i]?.p10,
        p50: scopedMonteCarlo?.[i]?.p50,
        p90: scopedMonteCarlo?.[i]?.p90
    }));

    return (
        <div className="glass-panel anim-fade-up anim-delay-2" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%',
            minHeight: '450px'
        }}>
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: 'var(--space-1)'
                    }}>
                        Wealth Trajectory
                    </h3>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'hsl(var(--text-muted))'
                    }}>
                        {showStressTest ? 'Monte Carlo stress test: 250 stochastic simulations showing 10th-90th percentile.' : '25-year simulation comparing baseline vs. Aurum-optimized strategies'}
                    </p>
                </div>
                <button
                    onClick={() => setShowStressTest(!showStressTest)}
                    className={`btn-ghost ${showStressTest ? 'btn-active' : ''}`}
                    style={{ fontSize: '0.7rem', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                    {showStressTest ? 'Hide Stress Test' : 'Run Stress Test'}
                </button>
            </div>

            <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--text-muted))" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="hsl(var(--text-muted))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--gold-primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--gold-primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--bull-case))" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="hsl(var(--bull-case))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--bear-case))" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="hsl(var(--bear-case))" stopOpacity={0} />
                            </linearGradient>
                            <filter id="shadow" height="200%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                <feOffset dx="2" dy="2" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.5" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsla(240, 5%, 50%, 0.1)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="year"
                            stroke="hsla(240, 5%, 50%, 0.4)"
                            fontSize={11}
                            tickLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            stroke="hsla(240, 5%, 50%, 0.4)"
                            fontSize={11}
                            tickLine={false}
                            width={55}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--bg-elevated))',
                                border: '1px solid hsla(var(--gold-primary) / 0.1)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(12px)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '0.85rem' }}
                            labelStyle={{ color: 'hsla(0,0%,100%,0.6)', marginBottom: '4px' }}
                            formatter={(value) => formatCurrency(value)}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            formatter={(value) => (
                                <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.75rem' }}>
                                    {value}
                                </span>
                            )}
                        />

                        {showStressTest && (
                            <Area
                                type="monotone"
                                dataKey="p90"
                                name="Bull Case (90th)"
                                stroke="hsl(var(--bull-case))"
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                fill="url(#bullGradient)"
                                fillOpacity={1}
                            />
                        )}
                        {showStressTest && (
                            <Area
                                type="monotone"
                                dataKey="p10"
                                name="Bear Case (10th)"
                                stroke="hsl(var(--bear-case))"
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                fill="url(#bearGradient)"
                                fillOpacity={1}
                            />
                        )}

                        {!showStressTest && (
                            <Area
                                type="monotone"
                                dataKey="baseline"
                                name="Status Quo"
                                stroke="hsl(var(--text-muted))"
                                strokeWidth={2}
                                fill="url(#baselineGradient)"
                                fillOpacity={1}
                            />
                        )}
                        <Area
                            type="monotone"
                            dataKey="optimized"
                            name="Aurum Optimized"
                            stroke="hsl(var(--gold-primary))"
                            strokeWidth={3}
                            fill="url(#optimizedGradient)"
                            fillOpacity={1}
                            filter="url(#shadow)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Insights */}
            {explanations && explanations.length > 0 && (
                <div style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--bg-surface) / 0.5)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--text-primary) / 0.04)'
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
                            fontWeight: 600,
                            color: 'hsl(var(--text-muted))',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            Analysis
                        </span>
                    </div>
                    <ul style={{
                        listStyle: 'none',
                        fontSize: '0.8rem',
                        color: 'hsl(var(--text-secondary))',
                        lineHeight: 1.6
                    }}>
                        {explanations.slice(0, 3).map((expl, i) => (
                            <li key={i} style={{ marginBottom: 'var(--space-1)' }}>
                                • {expl}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProjectionChart;
