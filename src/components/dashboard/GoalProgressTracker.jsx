import React from 'react';
import { usePlanningMode } from '../../context/PlanningModeContext';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { TrendingUp, Target, Calendar, DollarSign, Percent, AlertCircle } from 'lucide-react';

const GoalProgressTracker = () => {
    const { isPlanningMode, goalAnalysis } = usePlanningMode();
    const { netWorth, passiveIncome, profile } = useScopedWealth();

    if (!isPlanningMode || !goalAnalysis) return null;

    // Calculate progress based on goal type
    let currentValue = 0;
    let targetValue = 0;
    let progressPercent = 0;
    let metric = '';
    let icon = null;
    let timeRemaining = null;

    // Net worth goal
    if (goalAnalysis.targets.netWorth) {
        currentValue = netWorth;
        targetValue = goalAnalysis.targets.netWorth;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        metric = 'Net Worth';
        icon = <DollarSign size={20} />;
    }
    // Passive income goal
    else if (goalAnalysis.targets.passiveIncome) {
        currentValue = passiveIncome * 12; // Annual
        targetValue = goalAnalysis.targets.passiveIncome;
        progressPercent = Math.min((currentValue / targetValue) * 100, 100);
        metric = 'Annual Passive Income';
        icon = <TrendingUp size={20} />;
    }
    // Retirement age goal
    else if (goalAnalysis.targets.retirementAge) {
        const currentAge = profile?.members?.[0]?.age || 40;
        targetValue = goalAnalysis.targets.retirementAge;
        const yearsToGo = Math.max(0, targetValue - currentAge);
        timeRemaining = yearsToGo;
        progressPercent = Math.min(((targetValue - yearsToGo) / targetValue) * 100, 100);
        metric = 'Retirement Age';
        icon = <Calendar size={20} />;
    }
    // Generic goal
    else {
        return (
            <div style={{
                padding: 'var(--space-4)',
                background: 'linear-gradient(135deg, hsl(var(--gold-primary) / 0.05), hsl(var(--gold-secondary) / 0.05))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--gold-primary) / 0.2)',
                marginBottom: 'var(--space-6)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Target size={18} color="hsl(var(--gold-primary))" />
                    <span style={{
                        fontSize: '0.85rem',
                        color: 'hsl(var(--text-muted))'
                    }}>
                        Tracking progress for your goal...
                    </span>
                </div>
            </div>
        );
    }

    const formatCurrency = (value) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
        return `$${value.toFixed(0)}`;
    };

    const getStatusColor = () => {
        if (progressPercent >= 75) return 'hsl(120, 60%, 50%)';
        if (progressPercent >= 50) return 'hsl(45, 90%, 55%)';
        if (progressPercent >= 25) return 'hsl(30, 90%, 55%)';
        return 'hsl(var(--gold-primary))';
    };

    const getStatusMessage = () => {
        if (progressPercent >= 100) return 'Goal achieved! 🎉';
        if (progressPercent >= 75) return 'Excellent progress';
        if (progressPercent >= 50) return 'On track';
        if (progressPercent >= 25) return 'Making progress';
        return 'Getting started';
    };

    return (
        <div style={{
            padding: 'var(--space-5)',
            background: 'linear-gradient(135deg, hsl(var(--surface-elevated)), hsl(var(--surface-base)))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid hsl(var(--border-muted))',
            marginBottom: 'var(--space-6)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${getStatusColor()}15 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            background: `${getStatusColor()}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getStatusColor()
                        }}>
                            {icon}
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'hsl(var(--text-muted))',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Goal Progress
                            </div>
                            <div style={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: 'hsl(var(--text-primary))'
                            }}>
                                {metric}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        padding: '6px 12px',
                        background: `${getStatusColor()}15`,
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: getStatusColor()
                    }}>
                        {getStatusMessage()}
                    </div>
                </div>

                {/* Progress metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: timeRemaining !== null ? '1fr 1fr 1fr' : '1fr 1fr',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-muted))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Current
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'hsl(var(--text-primary))'
                        }}>
                            {timeRemaining !== null
                                ? `Age ${(profile?.members?.[0]?.age || 40)}`
                                : formatCurrency(currentValue)
                            }
                        </div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-muted))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Target
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: getStatusColor()
                        }}>
                            {timeRemaining !== null
                                ? `Age ${targetValue}`
                                : formatCurrency(targetValue)
                            }
                        </div>
                    </div>
                    {timeRemaining !== null && (
                        <div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'hsl(var(--text-muted))',
                                marginBottom: 'var(--space-1)'
                            }}>
                                Time Remaining
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'hsl(var(--text-primary))'
                            }}>
                                {timeRemaining} years
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-2)'
                    }}>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'hsl(var(--text-muted))'
                        }}>
                            Progress
                        </span>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: getStatusColor()
                        }}>
                            {progressPercent.toFixed(1)}%
                        </span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '12px',
                        background: 'hsl(var(--surface-base))',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                        border: '1px solid hsl(var(--border-muted))'
                    }}>
                        <div style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}dd)`,
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.5s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Animated shine effect */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                animation: 'shine 2s infinite'
                            }} />
                        </div>
                    </div>
                </div>

                {/* Gap to goal */}
                {progressPercent < 100 && timeRemaining === null && (
                    <div style={{
                        padding: 'var(--space-3)',
                        background: 'hsl(var(--surface-base))',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--border-muted))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                    }}>
                        <AlertCircle size={16} color="hsl(var(--text-muted))" />
                        <div>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'hsl(var(--text-muted))'
                            }}>
                                Gap to goal:{' '}
                            </span>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'hsl(var(--text-primary))'
                            }}>
                                {formatCurrency(targetValue - currentValue)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes shine {
                        0% { left: -100%; }
                        100% { left: 100%; }
                    }
                `}
            </style>
        </div>
    );
};

export default GoalProgressTracker;
