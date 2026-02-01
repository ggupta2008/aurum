import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { TrendingUp, ArrowRight, Zap, Coffee, Home, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DividendSnowball = () => {
    const { profile, formatCurrency } = useScopedWealth();

    // Calculate current annual dividends
    let annualDividends = 0;
    const safeFamily = profile.family || [];
    safeFamily.forEach(member => {
        if (member.financials?.positions) {
            member.financials.positions.forEach(pos => {
                annualDividends += (pos.value || 0) * (pos.dividendYield || 0);
            });
        }
    });

    const monthlyDividends = annualDividends / 12;

    // Calculate total monthly spending
    let totalAnnualSpending = 0;
    safeFamily.forEach(m => {
        totalAnnualSpending += (m.financials?.spending || 0);
    });
    const monthlySpending = (totalAnnualSpending || 120000) / 12;

    const coveragePercent = (monthlyDividends / monthlySpending) * 100;

    // Milestones
    const milestones = [
        { name: 'Coffee & Subs', cost: 150, icon: Coffee },
        { name: 'Utilities & Core', cost: 800, icon: Zap },
        { name: 'Full Lifestyle', cost: monthlySpending, icon: Home }
    ];

    const data = milestones.map(m => ({
        ...m,
        covered: monthlyDividends >= m.cost,
        percent: Math.min(100, (monthlyDividends / m.cost) * 100)
    }));

    // Future Projections (Aggregated from Engine)
    // We look at the first 10 years of dividend growth
    const snowballPath = [];
    const regime = profile.marketRegime || 'goldilocks';
    const growthRate = regime === 'bull_charge' ? 0.08 : 0.05;

    for (let i = 0; i <= 10; i++) {
        snowballPath.push({
            year: new Date().getFullYear() + i,
            income: annualDividends * Math.pow(1 + growthRate, i)
        });
    }

    return (
        <div className="glass-panel anim-fade-up anim-delay-5" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        <TrendingUp size={18} className="text-gold" />
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>
                            Dividend Snowball
                        </h3>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
                        {formatCurrency(monthlyDividends)}<span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))', fontWeight: 400 }}> / month</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', textTransform: 'uppercase', marginBottom: '4px' }}>Expense Coverage</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: coveragePercent >= 100 ? 'hsl(var(--success))' : 'hsl(var(--gold-primary))' }}>
                        {coveragePercent.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Coverage Milestones */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {data.map((m, idx) => (
                    <div key={idx} className="glass-panel" style={{
                        padding: 'var(--space-4)',
                        background: 'hsla(var(--bg-void) / 0.4)',
                        border: m.covered ? '1px solid hsla(var(--success) / 0.2)' : '1px solid hsla(var(--text-primary) / 0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: m.covered ? 'hsla(var(--success) / 0.1)' : 'hsla(var(--text-primary) / 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: m.covered ? 'hsl(var(--success))' : 'hsl(var(--text-dim))'
                            }}>
                                <m.icon size={16} />
                            </div>
                            {m.covered && <ShieldCheck size={14} className="text-success" />}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{m.name}</div>
                        <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))' }}>{formatCurrency(m.cost)}/mo</div>
                        <div style={{ marginTop: 'var(--space-3)', height: '4px', background: 'hsla(var(--text-primary) / 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${m.percent}%`,
                                background: m.covered ? 'hsl(var(--success))' : 'hsl(var(--gold-primary))',
                                borderRadius: '2px'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 10-Year Trajectory */}
            <div style={{ height: '200px', width: '100%', marginTop: 'var(--space-4)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snowballPath}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--text-primary) / 0.05)" />
                        <XAxis
                            dataKey="year"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--text-dim))' }}
                        />
                        <YAxis
                            hide
                        />
                        <Tooltip
                            cursor={{ fill: 'hsla(var(--text-primary) / 0.02)' }}
                            contentStyle={{ background: 'hsl(var(--bg-card))', border: '1px solid hsla(var(--text-primary) / 0.1)', borderRadius: 'var(--radius-md)' }}
                            labelStyle={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}
                            itemStyle={{ color: 'hsl(var(--gold-primary))', fontSize: '0.75rem' }}
                            formatter={(value) => formatCurrency(value)}
                        />
                        <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                            {snowballPath.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsla(var(--gold-primary) / ${0.3 + (index * 0.07)})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-4)',
                background: 'hsla(var(--gold-primary) / 0.05)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center'
            }}>
                <Zap size={16} className="text-gold" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5, margin: 0 }}>
                    <strong>Compounding Effect:</strong> Based on the {regime} regime, your annual passive income is projected to reach
                    <strong style={{ color: 'white' }}> {formatCurrency(snowballPath[10].income)}</strong> by {snowballPath[10].year} through organic dividend growth alone, without further contributions.
                </p>
            </div>
        </div>
    );
};

export default DividendSnowball;
