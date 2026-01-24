import { useScopedWealth } from '../../hooks/useScopedWealth';
import { WEALTH_GOALS } from '../../utils/engine/financeEngine';
import { Target, Trophy, Landmark, TrendingUp, Check } from 'lucide-react';

const ICONS = {
    max_wealth: TrendingUp,
    tax_min: Landmark,
    estate_transfer: Trophy,
    income_gen: Target
};

const GoalSelector = () => {
    const { profile, updateGoal } = useScopedWealth();
    const currentGoal = profile.goals?.primary || 'max_wealth';

    return (
        <div className="glass-panel anim-fade-up" style={{
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-4)'
        }}>
            <h3 style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'hsl(var(--text-muted))',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-4)'
            }}>
                Strategic Objective
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {WEALTH_GOALS.map(goal => {
                    const isActive = currentGoal === goal.id;
                    const Icon = ICONS[goal.id] || Target;

                    return (
                        <button
                            key={goal.id}
                            onClick={() => updateGoal(goal.id)}
                            style={{
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                background: isActive
                                    ? 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.15), hsla(var(--gold-primary) / 0.05))'
                                    : 'hsla(var(--bg-surface) / 0.3)',
                                border: isActive
                                    ? '1px solid hsla(var(--gold-primary) / 0.3)'
                                    : '1px solid hsla(var(--text-primary) / 0.04)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-4)',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-sm)',
                                background: isActive ? 'hsla(var(--gold-primary) / 0.1)' : 'hsla(var(--text-primary) / 0.03)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Icon
                                    size={18}
                                    style={{
                                        color: isActive ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-muted))'
                                    }}
                                />
                            </div>

                            <div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    color: isActive ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
                                    marginBottom: '2px'
                                }}>
                                    {goal.name}
                                </div>
                                <p style={{
                                    fontSize: '0.7rem',
                                    color: 'hsl(var(--text-muted))',
                                    lineHeight: '1.3',
                                    margin: 0
                                }}>
                                    {goal.description}
                                </p>
                            </div>

                            {isActive && (
                                <div style={{
                                    marginLeft: 'auto',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'hsl(var(--gold-primary))'
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalSelector;
