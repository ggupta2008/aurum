import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BucketVisualizer = () => {
    const { scopedTaxBuckets } = useScopedWealth();

    // Values from hook
    const assets = {
        taxable: scopedTaxBuckets.taxable,
        taxDeferred: scopedTaxBuckets.taxDeferred,
        taxFree: scopedTaxBuckets.taxFree
    };

    const data = [
        { name: 'Taxable', value: assets.taxable || 0, color: '#94a3b8' },
        { name: 'Tax-Deferred', value: assets.taxDeferred || 0, color: '#f87171' },
        { name: 'Tax-Free', value: assets.taxFree || 0, color: '#4ade80' }
    ].filter(d => d.value > 0);

    const total = data.reduce((a, b) => a + b.value, 0);
    const taxDeferredRatio = (assets.taxDeferred || 0) / (total || 1);

    if (total === 0) {
        return (
            <div className="glass-panel anim-fade-up anim-delay-2" style={{
                padding: 'var(--space-5)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                    Enter your assets to see tax bucket distribution.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel anim-fade-up anim-delay-2" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'hsl(var(--text-muted))',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-3)'
            }}>
                Tax Buckets
            </h3>

            <div style={{ height: '120px', marginBottom: 'var(--space-3)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact'
                            }).format(value)}
                            contentStyle={{
                                background: 'hsl(var(--bg-elevated))',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid hsla(var(--text-primary) / 0.1)'
                            }}
                            itemStyle={{ color: 'white' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {data.map(d => (
                    <div key={d.name} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '2px',
                                background: d.color
                            }} />
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'hsl(var(--text-secondary))'
                            }}>
                                {d.name}
                            </span>
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'hsl(var(--text-primary))'
                        }}>
                            {Math.round(d.value / total * 100)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Warning */}
            {taxDeferredRatio > 0.5 && (
                <div style={{
                    marginTop: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: 'hsla(var(--danger) / 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    color: 'hsl(var(--danger))',
                    lineHeight: 1.4
                }}>
                    ⚠️ High tax-deferred exposure. RMDs may push you into top brackets.
                </div>
            )}
        </div>
    );
};

export default BucketVisualizer;
