import { useScopedWealth } from '../../hooks/useScopedWealth';
import { AVAILABLE_STRATEGIES } from '../../utils/engine/financeEngine';
import { Layers, Settings, CheckCircle, Sparkles, Zap, ChevronRight } from 'lucide-react';

const StrategySelector = () => {
    const { profile, toggleStrategy, updateStrategyInput, recommendations, applyAutopilot } = useScopedWealth();

    return (
        <div className="glass-panel anim-fade-up anim-delay-1" style={{
            padding: 'var(--space-5)',
            marginTop: 'var(--space-4)',
            flex: 1,
            display: 'flex',
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
                    color: 'hsl(var(--text-muted))',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <Layers size={14} className="text-gold" />
                    Strategy Stack
                </h3>

                {recommendations && recommendations.length > 0 && (
                    <button
                        onClick={applyAutopilot}
                        className={`btn btn-primary ${Object.keys(profile.strategies || {}).filter(k => profile.strategies[k].active).length === 0 ? 'pulse-gold' : ''}`}
                        style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.7rem' }}
                    >
                        <Zap size={12} /> Auto-Optimize
                    </button>
                )}
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                overflowY: 'auto',
                flex: 1
            }}>
                {AVAILABLE_STRATEGIES.map((strategy) => {
                    const state = profile.strategies?.[strategy.id] || { active: false, inputs: {} };
                    const isActive = state.active;
                    const rec = recommendations?.find(r => r.id === strategy.id);
                    const isRecommended = rec && rec.score > 70 && !isActive;

                    return (
                        <div
                            key={strategy.id}
                            style={{
                                borderRadius: 'var(--radius-md)',
                                background: isActive
                                    ? 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.08), hsla(var(--gold-primary) / 0.02))'
                                    : 'hsla(var(--bg-surface) / 0.4)',
                                border: isActive
                                    ? '1px solid hsla(var(--gold-primary) / 0.25)'
                                    : isRecommended
                                        ? '1px dashed hsla(var(--gold-primary) / 0.3)'
                                        : '1px solid hsla(var(--text-primary) / 0.04)',
                                overflow: 'hidden',
                                transition: 'all 0.2s'
                            }}
                        >
                            {/* Header / Toggle */}
                            <button
                                onClick={() => toggleStrategy(strategy.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 'var(--space-4)',
                                    cursor: 'pointer',
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{
                                    marginRight: 'var(--space-3)',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: 'var(--radius-full)',
                                    border: isActive
                                        ? '2px solid hsl(var(--gold-primary))'
                                        : '2px solid hsl(var(--text-dim))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isActive ? 'hsl(var(--gold-primary))' : 'transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    {isActive && <CheckCircle size={12} color="black" />}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                        marginBottom: '2px'
                                    }}>
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: isActive ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))'
                                        }}>
                                            {strategy.name}
                                        </span>
                                        {isRecommended && (
                                            <span style={{
                                                fontSize: '0.6rem',
                                                background: 'hsla(var(--gold-primary) / 0.15)',
                                                color: 'hsl(var(--gold-primary))',
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-full)',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                letterSpacing: '0.05em'
                                            }}>
                                                <Sparkles size={8} /> AI PICK
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'hsl(var(--text-muted))',
                                        lineHeight: 1.4
                                    }}>
                                        {isRecommended ? rec.reason : strategy.description}
                                    </div>
                                </div>

                                {isActive && (
                                    <ChevronRight
                                        size={16}
                                        style={{
                                            color: 'hsl(var(--text-dim))',
                                            transform: 'rotate(90deg)'
                                        }}
                                    />
                                )}
                            </button>

                            {/* Inputs */}
                            {isActive && strategy.inputs && (
                                <div style={{
                                    padding: '0 var(--space-4) var(--space-4) var(--space-4)',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                    gap: 'var(--space-3)'
                                }}>
                                    {strategy.inputs.map(input => (
                                        <div key={input.key}>
                                            <label style={{
                                                fontSize: '0.7rem',
                                                color: 'hsl(var(--text-muted))',
                                                display: 'block',
                                                marginBottom: 'var(--space-1)',
                                                fontWeight: 500
                                            }}>
                                                {input.label}
                                            </label>
                                            <input
                                                type="number"
                                                value={state.inputs[input.key] !== undefined ? state.inputs[input.key] : input.default}
                                                onChange={(e) => updateStrategyInput(strategy.id, input.key, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StrategySelector;
