import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Clock, TrendingUp, DollarSign, AlertCircle, Info, X } from 'lucide-react';

const SocialSecurityOptimizer = () => {
    const { profile, planningScope, scopedAge } = useScopedWealth();
    const [showMethodology, setShowMethodology] = useState(false);

    const formatCurrency = (v) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: 'compact'
    }).format(v);

    // Get primary age from hook
    const currentAge = scopedAge;

    // Base PIA (Primary Insurance Amount) estimate - standard high earner estimate
    // In a real app, this would come from the profile inputs
    const estimatedPIA = 3800; // Monthly benefit at Full Retirement Age (67) in today's dollars

    // Inflation / COLA assumption
    const colaRate = 0.025; // 2.5% annual Cost of Living Adjustment

    // Strategy Logic
    // 1. Early (62): 70% of PIA
    // 2. FRA (67): 100% of PIA
    // 3. Delayed (70): 124% of PIA (8% annual credits)

    const strategies = [
        { id: 'early', age: 62, label: 'Early (62)', pct: 0.70, color: 'hsl(var(--text-muted))' },
        { id: 'fra', age: 67, label: 'Full Age (67)', pct: 1.00, color: 'hsl(var(--info))' },
        { id: 'delayed', age: 70, label: 'Max Delayed (70)', pct: 1.24, color: 'hsl(var(--gold-primary))' }
    ];

    // Calculate projection data
    // We project from age 62 up to age 95
    const data = [];
    const maxAge = 90;

    // Calculate cumulative benefits
    let cumulativeEarly = 0;
    let cumulativeFRA = 0;
    let cumulativeDelayed = 0;

    // Breakeven tracking
    let breakevenFRA = null;     // When FRA beats Early
    let breakevenDelayed = null; // When Delayed beats FRA

    for (let age = 62; age <= maxAge; age++) {
        const yearsFromNow = age - currentAge;
        // Adjust nominal benefit for inflation up to that specific year
        // Note: For simplicity in comparison, we plot "Today's Purchasing Power" 
        // effectively assuming benefits grow with inflation, so we keep standard dollars for the chart Y-axis
        // to make it easier to understand "real" value.

        // Annual benefit amounts (Real value)
        const annualEarly = age >= 62 ? (estimatedPIA * 0.70 * 12) : 0;
        const annualFRA = age >= 67 ? (estimatedPIA * 1.00 * 12) : 0;
        const annualDelayed = age >= 70 ? (estimatedPIA * 1.24 * 12) : 0;

        cumulativeEarly += annualEarly;
        cumulativeFRA += annualFRA;
        cumulativeDelayed += annualDelayed;

        // Detect breakeven points
        if (!breakevenFRA && cumulativeFRA > cumulativeEarly) breakevenFRA = age;
        if (!breakevenDelayed && cumulativeDelayed > cumulativeFRA) breakevenDelayed = age;

        data.push({
            age,
            early: cumulativeEarly,
            fra: cumulativeFRA,
            delayed: cumulativeDelayed
        });
    }

    // Recommendation Logic
    // If user is expected to live past breakevenDelayed (80), recommend delaying
    const longevityExpectancy = 85; // Standard conservative planning age
    const optimalStrategy = longevityExpectancy > (breakevenDelayed || 80) ? strategies[2] : strategies[0];
    const benefitDiff = (data[data.length - 1].delayed - data[data.length - 1].early);

    return (
        <div className="glass-panel anim-fade-up anim-delay-5" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            position: 'relative',
            // Allow this component to span 2 columns if in a grid
            gridColumn: 'span 1'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: 'var(--space-1)'
                    }}>
                        Social Security Optimizer
                    </h3>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'hsl(var(--text-muted))'
                    }}>
                        Claiming strategy comparison & breakeven analysis
                    </p>
                </div>
                <button
                    onClick={() => setShowMethodology(!showMethodology)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'hsl(var(--text-dim))',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Methodology Modal */}
            {showMethodology && (
                <div
                    className="glass-panel"
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
                        <h4 style={{ color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                            Calculation Methodology
                        </h4>
                        <button onClick={() => setShowMethodology(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Benefit Assumptions:</strong> Based on an estimated Primary Insurance Amount (PIA) of {formatCurrency(estimatedPIA)}/mo at Full Retirement Age (67).
                        </p>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Adjustments:</strong>
                            <br />• Claim at 62: 70% of PIA (Permanent penalty)
                            <br />• Claim at 67: 100% of PIA (Full benefit)
                            <br />• Claim at 70: 124% of PIA (8% annual Delayed Retirement Credits)
                        </p>
                        <p>
                            <strong>Breakeven:</strong> The age at which total cumulative benefits from delaying exceed the cumulative benefits of claiming early. If you live past this age, delaying pays off.
                        </p>
                    </div>
                </div>
            )}

            {/* Strategy Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 'var(--space-3)'
            }}>
                {strategies.map((s) => (
                    <div key={s.id} style={{
                        padding: 'var(--space-3)',
                        background: optimalStrategy.id === s.id ? 'hsla(var(--gold-primary) / 0.1)' : 'hsla(var(--bg-void) / 0.4)',
                        border: optimalStrategy.id === s.id ? '1px solid hsla(var(--gold-primary) / 0.3)' : '1px solid hsla(var(--text-primary) / 0.1)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: optimalStrategy.id === s.id ? 'hsl(var(--gold-primary))' : 'white' }}>
                            {formatCurrency(estimatedPIA * s.pct)}
                            <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'hsl(var(--text-dim))' }}>/mo</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Breakeven Chart */}
            <div style={{ height: '200px', width: '100%', marginTop: 'var(--space-2)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="age"
                            stroke="hsla(var(--text-muted) / 0.5)"
                            fontSize={10}
                            tickLine={false}
                            domain={[62, 90]}
                            type="number"
                        />
                        <YAxis
                            hide={true}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--bg-elevated))',
                                border: '1px solid hsla(var(--gold-primary) / 0.1)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.75rem'
                            }}
                            formatter={(value) => formatCurrency(value)}
                            labelFormatter={(label) => `Age ${label} `}
                        />

                        {/* Reference Lines for Breakeven */}
                        {breakevenDelayed && (
                            <ReferenceLine x={breakevenDelayed} stroke="hsl(var(--text-dim))" strokeDasharray="3 3">
                                {/* Label handled by custom legend or context */}
                            </ReferenceLine>
                        )}

                        <Line
                            type="monotone"
                            dataKey="early"
                            stroke={strategies[0].color}
                            strokeWidth={2}
                            dot={false}
                            name="Claim at 62"
                        />
                        <Line
                            type="monotone"
                            dataKey="fra"
                            stroke={strategies[1].color}
                            strokeWidth={2}
                            dot={false}
                            name="Claim at 67"
                        />
                        <Line
                            type="monotone"
                            dataKey="delayed"
                            stroke={strategies[2].color}
                            strokeWidth={3}
                            dot={false}
                            name="Claim at 70"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Insight & Recommendation */}
            <div style={{
                padding: 'var(--space-4)',
                background: 'hsla(var(--gold-primary) / 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsla(var(--gold-primary) / 0.2)',
                marginTop: 'var(--space-2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <Clock size={16} className="text-gold" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', textTransform: 'uppercase' }}>
                        The 8% Guarantee
                    </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                    Strategy: <strong>Delay to 70.</strong>
                    <br />
                    While claiming early gets you money sooner, the "crossover point" is age <strong>{breakevenDelayed}</strong>.
                    If you live to 90, claiming at 70 generates an extra <strong>{formatCurrency(benefitDiff)}</strong> in lifetime wealth—risk free.
                </p>
            </div>
        </div>
    );
};

export default SocialSecurityOptimizer;
