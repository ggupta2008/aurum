import React, { useMemo } from 'react';
import { useWealth } from '../../context/WealthContext';
import { CheckCircle, Sliders, Info, Trash2, Zap, Shield, DollarSign } from 'lucide-react';
import { calculateProjection } from '../../utils/engine/financeEngine';

/**
 * Strategy Control Panel - Dynamic AI Stack
 * Renders strategies extracted from Gemini in real-time.
 */
export default function StrategyComparison() {
    const { profile, removeStrategy, formatCurrency, isAnalyzing } = useWealth();

    // 1. Calculate Alpha for the Badge
    const { alpha, alphaPercent, activeStrategies } = useMemo(() => {
        const baseline = calculateProjection({ ...profile, strategies: {} });
        const optimized = calculateProjection(profile);

        const baseWealth = baseline.data[baseline.data.length - 1]?.baseline || 0;
        const optWealth = optimized.data[optimized.data.length - 1]?.optimized || 0;
        const alpha = optWealth - baseWealth;
        const alphaPercent = baseWealth > 0 ? (alpha / baseWealth) * 100 : 0;

        const strategies = Object.entries(profile.strategies || {})
            .map(([id, s]) => ({
                id,
                ...s
            }));

        return { alpha, alphaPercent, activeStrategies: strategies };
    }, [profile]);

    const getImpactIcon = (type) => {
        switch (type) {
            case 'return_boost': return <Zap size={14} className="text-gold" />;
            case 'tax_reduction': return <Shield size={14} className="text-success" />;
            case 'cash_flow': return <DollarSign size={14} className="text-info" />;
            default: return <Info size={14} />;
        }
    };

    if (activeStrategies.length === 0) {
        return (
            <div className="glass-panel anim-fade-right" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <Sliders size={24} className="text-dim" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>
                    {isAnalyzing ? "AI is auditing your portfolio..." : "No active strategies in stack. Interact with the AI Advisor to deploy optimizations."}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel anim-fade-right" style={{ 
            padding: 'var(--space-5)', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
        }}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Sliders size={18} className="text-gold" />
                    <h2 style={{ 
                        margin: 0, 
                        fontSize: '1rem', 
                        fontWeight: 700, 
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: 'hsl(var(--text-primary))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Strategy Stack
                    </h2>
                </div>
                
                <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, hsla(var(--success)/0.1), hsla(var(--success)/0.05))',
                    border: '1px solid hsla(var(--success)/0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--success))' }}>TOTAL ALPHA</span>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--success))', fontFamily: 'Space Grotesk' }}>
                            {alpha >= 0 ? '+' : ''}{formatCurrency(alpha, { notation: 'compact' })}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-secondary))' }}>
                            +{alphaPercent.toFixed(1)}% Boost
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {activeStrategies.map((s) => (
                    <div key={s.id} style={{
                        padding: '12px',
                        background: 'hsla(var(--bg-void)/0.4)',
                        border: '1px solid hsla(var(--text-primary)/0.1)',
                        borderRadius: '8px',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: 'hsl(var(--text-primary))', fontSize: '0.85rem', marginBottom: '2px' }}>
                                    {s.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>
                                    {getImpactIcon(s?.impact_type)}
                                    {String(s?.impact_type || 'Custom').replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                            <button 
                                onClick={() => removeStrategy(s.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'hsl(var(--text-dim))',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--danger))'}
                                onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--text-dim))'}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', lineHeight: 1.4 }}>
                            {s.description}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}