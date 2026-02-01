import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Layers, CheckCircle, Sparkles, Zap } from 'lucide-react';
import React from 'react';

const StrategySelector = () => {
    const { recommendations, applyAIStrategies, isAnalyzing } = useScopedWealth();

    if (isAnalyzing) {
        return (
            <div className="glass-panel anim-fade-up anim-delay-1" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <div className="anim-pulse" style={{ fontSize: '0.85rem', color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>
                    AI IS ARCHITECTING STRATEGIES...
                </div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null; // Don't show if no AI picks
    }

    return (
        <div className="glass-panel anim-fade-up anim-delay-1" style={{
            padding: 'var(--space-5)',
            marginTop: 'var(--space-4)',
            flex: 1,
            display: 'flex',
            border: '1px solid hsla(var(--gold-primary) / 0.2)',
            flexDirection: 'column'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)'
            }}>
                <h3 style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'hsl(var(--gold-primary))',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <Sparkles size={14} className="text-gold" />
                    AI Optimization Picks
                </h3>

                <button
                    onClick={() => applyAIStrategies({ active_strategies: recommendations })}
                    className="btn btn-primary pulse-gold"
                    style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.7rem' }}
                >
                    <Zap size={12} /> Deploy All
                </button>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                overflowY: 'auto',
                flex: 1
            }}>
                {recommendations.map((strategy) => (
                    <div
                        key={strategy.id}
                        style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsla(var(--bg-surface) / 0.4)',
                            border: '1px solid hsla(var(--text-primary) / 0.04)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            marginBottom: '4px'
                        }}>
                            <span style={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: 'hsl(var(--text-primary))'
                            }}>
                                {strategy.name}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--success))', fontWeight: 700, marginBottom: '6px' }}>
                            {strategy.impact || '+0%'}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'hsl(var(--text-muted))',
                            lineHeight: 1.4
                        }}>
                            {strategy.reason}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StrategySelector;