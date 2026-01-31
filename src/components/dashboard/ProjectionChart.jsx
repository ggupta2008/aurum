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

    // Calculate Lifetime Alpha
    const finalData = data[data.length - 1] || {};
    const wealthAlpha = (finalData.optimized || 0) - (finalData.baseline || 0);

    return (
        <div className="glass-panel anim-fade-up anim-delay-2" style={{
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '100%',
            minHeight: '500px',
            position: 'relative'
        }}>
            <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: 'var(--space-2)',
                        fontFamily: 'Space Grotesk, sans-serif',
                        letterSpacing: '-0.02em',
                        color: 'hsl(var(--text-primary))'
                    }}>
                        Wealth Trajectory
                    </h3>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'hsl(var(--text-secondary))',
                        maxWidth: '80%'
                    }}>
                        {showStressTest ? 'Monte Carlo stress test: 250 stochastic simulations showing 10th-90th percentile.' : '25-year simulation comparing baseline vs. Aurum-optimized strategies'}
                    </p>

                    {/* Definitions Helper */}
                    {/* Definitions Helper */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', opacity: 0.8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '2px', background: 'hsl(var(--text-muted))', borderTop: '2px dashed hsl(var(--text-muted))' }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>
                                <strong>Status Quo:</strong> Baseline
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--gold-primary))' }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))' }}>
                                <strong>Optimized:</strong> with AI Strategy
                            </span>
                        </div>
                    </div>
                </div>

                {/* Alpha Badge */}
                {wealthAlpha > 0 && (
                    <div className="anim-fade-left" style={{
                        textAlign: 'right',
                        background: 'hsla(var(--success)/0.1)',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        border: '1px solid hsla(var(--success)/0.2)'
                    }}>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--success))',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '2px'
                        }}>
                            Lifetime Alpha
                        </div>
                        <div style={{
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            fontFamily: 'Space Grotesk, sans-serif',
                            color: 'hsl(var(--success))',
                            letterSpacing: '-0.02em'
                        }}>
                            +{formatCurrency(wealthAlpha)}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'none' }}>
                {/* Hidden trigger for alignment if needed later */}
            </div>

            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => setShowStressTest(!showStressTest)}
                    className={`btn-ghost ${showStressTest ? 'btn-active' : ''}`}
                    style={{
                        fontSize: '0.75rem',
                        padding: '6px 12px',
                        border: '1px solid hsla(var(--text-primary)/0.1)',
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer',
                        background: showStressTest ? 'hsla(var(--text-primary)/0.1)' : 'transparent',
                        color: 'hsl(var(--text-secondary))'
                    }}
                >
                    {showStressTest ? 'Hide Stress Test' : 'Run Stress Test'}
                </button>
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
                            <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="0" y2="4" style={{ stroke: 'hsl(var(--bull-case))', strokeWidth: 1, opacity: 0.3 }} />
                            </pattern>
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
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const currentData = payload[0].payload;
                                    const yearIndex = displayData.findIndex(d => d.year === currentData.year);
                                    const prevData = yearIndex > 0 ? displayData[yearIndex - 1] : null;

                                    const currentAlpha = (currentData.optimized || 0) - (currentData.baseline || 0);
                                    const prevAlpha = prevData ? ((prevData.optimized || 0) - (prevData.baseline || 0)) : 0;
                                    const yoyAlpha = currentAlpha - prevAlpha;

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
                                            {payload.map((p, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.stroke }} />
                                                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', flex: 1 }}>{p.name}:</span>
                                                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
                                                        {formatCurrency(p.value)}
                                                    </span>
                                                </div>
                                            ))}

                                            {/* YoY Alpha Section */}
                                            {currentAlpha !== 0 && (
                                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid hsla(var(--text-primary)/0.1)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 600, textTransform: 'uppercase' }}>
                                                            Annual Alpha Gain
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--success))', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
                                                            +{formatCurrency(yoyAlpha > 0 ? yoyAlpha : 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            formatter={(value) => (
                                <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.75rem', fontWeight: 500 }}>
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
                                strokeDasharray="4 4"
                                fillOpacity={0.1}
                                fill="hsl(var(--bull-case))"
                            />
                        )}
                        {showStressTest && (
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
                        )}

                        {!showStressTest && (
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
                        )}
                        <Area
                            type="monotone"
                            dataKey="optimized"
                            name="Aurum Optimized"
                            stroke="hsl(var(--gold-primary))"
                            strokeWidth={3}
                            fill="url(#optimizedGradient)"
                            fillOpacity={1}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Insights */}
            {explanations && explanations.length > 0 && (
                <div style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--bg-void) / 0.4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--text-primary) / 0.06)'
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
                        lineHeight: 1.6
                    }}>
                        {explanations.slice(0, 3).map((expl, i) => (
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
