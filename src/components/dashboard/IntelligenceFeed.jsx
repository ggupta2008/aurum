import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Zap, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

const IntelligenceFeed = () => {
    const { recommendations, scopedProjection, profile } = useScopedWealth();

    const insights = [
        ...recommendations.map(r => ({
            type: 'strategy',
            icon: Sparkles,
            color: 'hsl(var(--gold-primary))',
            title: 'Strategy Alpha',
            text: r.reason
        })),
        {
            type: 'risk',
            icon: ShieldAlert,
            color: 'hsl(var(--danger))',
            title: 'Estate Exposure',
            text: (profile.financials?.assets?.taxable || 0) + (profile.financials?.assets?.taxDeferred || 0) > 13000000
                ? 'High probability of federal estate tax liability. Freezing strategies recommended.'
                : 'Estate currently fits within standard lifetime exemption. Focus on step-up in basis.'
        }
    ];

    // Add automated projections insights
    if (scopedProjection && scopedProjection.data && scopedProjection.data.length > 0) {
        const last = scopedProjection.data[scopedProjection.data.length - 1];
        if (last && last.optimized > (last.baseline || 0) * 1.5) {
            insights.unshift({
                type: 'optimization',
                icon: TrendingUp,
                color: 'hsl(var(--success))',
                title: 'Conversion Alpha',
                text: 'Systematic Roth conversions are projected to increase net legacy by >50%.'
            });
        }
    }

    return (
        <div className="glass-panel anim-fade-up anim-delay-4" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            maxHeight: '400px',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Zap size={14} className="text-gold" />
                <h3 style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'hsl(var(--text-muted))',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }}>
                    Intelligence Feed
                </h3>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                overflowY: 'auto',
                paddingRight: 'var(--space-2)'
            }}>
                {insights.map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'hsla(var(--bg-void) / 0.4)',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid hsla(${item.color.split('(')[1].split(')')[0]} / 0.1)`
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: `hsla(${item.color.split('(')[1].split(')')[0]} / 0.1)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: item.color
                        }}>
                            <item.icon size={14} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', marginBottom: '2px' }}>
                                {item.title}
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                                {item.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntelligenceFeed;
