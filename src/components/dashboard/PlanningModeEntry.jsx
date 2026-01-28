import React, { useState } from 'react';
import { usePlanningMode } from '../../context/PlanningModeContext';
import { Target, X, Edit2, Check, Sparkles } from 'lucide-react';

const PlanningModeEntry = () => {
    const { isPlanningMode, planningGoal, goalAnalysis, enterPlanningMode, exitPlanningMode, updateGoal } = usePlanningMode();
    const [isExpanded, setIsExpanded] = useState(false);
    const [goalInput, setGoalInput] = useState('');

    const exampleGoals = [
        "Retire at 55 with $100k/year",
        "Reach $5M net worth in 10 years",
        "Generate $8k/month dividends by 50",
        "Pay off debt + 12-month emergency fund",
        "Max Roth conversions in 24% bracket"
    ];

    const handleSetGoal = () => {
        if (goalInput.trim()) {
            enterPlanningMode(goalInput);
            setIsExpanded(false);
            setGoalInput('');
        }
    };

    const handleEdit = () => {
        setGoalInput(planningGoal);
        setIsExpanded(true);
    };

    const handleCancel = () => {
        setIsExpanded(false);
        setGoalInput('');
    };

    // Compact inactive state
    if (!isPlanningMode && !isExpanded) {
        return (
            <div style={{
                padding: 'var(--space-3)',
                background: 'linear-gradient(135deg, hsl(var(--gold-primary) / 0.08), hsl(var(--gold-secondary) / 0.08))',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsl(var(--gold-primary) / 0.2)',
                marginBottom: 'var(--space-4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
                onClick={() => setIsExpanded(true)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--gold-primary) / 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--gold-primary) / 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <Sparkles size={16} color="hsl(var(--gold-primary))" />
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'hsl(var(--gold-primary))'
                    }}>
                        Set a Goal
                    </span>
                </div>
                <p style={{
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-muted))',
                    lineHeight: 1.3
                }}>
                    Get AI-powered insights
                </p>
            </div>
        );
    }

    // Expanded input state
    if (isExpanded) {
        return (
            <div style={{
                padding: 'var(--space-3)',
                background: 'hsl(var(--surface-elevated))',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsl(var(--border-muted))',
                marginBottom: 'var(--space-4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <Target size={14} color="hsl(var(--gold-primary))" />
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'hsl(var(--text-primary))'
                        }}>
                            Your Goal
                        </span>
                    </div>
                    <button
                        onClick={handleCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            color: 'hsl(var(--text-muted))',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>

                <textarea
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="e.g., Retire at 55..."
                    style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: 'var(--space-2)',
                        background: 'hsl(var(--surface-base))',
                        border: '1px solid hsl(var(--border-muted))',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'hsl(var(--text-primary))',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        marginBottom: 'var(--space-2)'
                    }}
                    autoFocus
                />

                <button
                    onClick={handleSetGoal}
                    disabled={!goalInput.trim()}
                    style={{
                        width: '100%',
                        padding: '8px',
                        background: goalInput.trim() ? 'hsl(var(--gold-primary))' : 'hsl(var(--surface-muted))',
                        color: goalInput.trim() ? 'hsl(var(--surface-base))' : 'hsl(var(--text-muted))',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: goalInput.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-1)',
                        marginBottom: 'var(--space-2)'
                    }}
                >
                    <Check size={14} />
                    Set Goal
                </button>

                <details style={{ fontSize: '0.7rem' }}>
                    <summary style={{
                        color: 'hsl(var(--text-muted))',
                        cursor: 'pointer',
                        padding: 'var(--space-1)',
                        listStyle: 'none',
                        userSelect: 'none'
                    }}>
                        Examples ↓
                    </summary>
                    <div style={{
                        marginTop: 'var(--space-2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)'
                    }}>
                        {exampleGoals.map((example, idx) => (
                            <button
                                key={idx}
                                onClick={() => setGoalInput(example)}
                                style={{
                                    padding: 'var(--space-1)',
                                    background: 'hsl(var(--surface-base))',
                                    border: '1px solid hsl(var(--border-muted))',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7rem',
                                    color: 'hsl(var(--text-secondary))',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'hsl(var(--gold-primary) / 0.05)';
                                    e.currentTarget.style.borderColor = 'hsl(var(--gold-primary) / 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'hsl(var(--surface-base))';
                                    e.currentTarget.style.borderColor = 'hsl(var(--border-muted))';
                                }}
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </details>
            </div>
        );
    }

    // Active goal state (compact)
    return (
        <div style={{
            padding: 'var(--space-3)',
            background: 'linear-gradient(135deg, hsl(var(--gold-primary) / 0.1), hsl(var(--gold-secondary) / 0.1))',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsl(var(--gold-primary) / 0.3)',
            marginBottom: 'var(--space-4)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-2)'
            }}>
                <Target size={14} color="hsl(var(--gold-primary))" />
                <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: 'hsl(var(--gold-primary))',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Active Goal
                </span>
            </div>
            <p style={{
                fontSize: '0.75rem',
                color: 'hsl(var(--text-primary))',
                lineHeight: 1.4,
                marginBottom: 'var(--space-2)'
            }}>
                {planningGoal}
            </p>
            {goalAnalysis && goalAnalysis.themes.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-1)',
                    flexWrap: 'wrap',
                    marginBottom: 'var(--space-2)'
                }}>
                    {goalAnalysis.themes.slice(0, 2).map((theme, idx) => (
                        <span
                            key={idx}
                            style={{
                                padding: '2px 6px',
                                background: 'hsl(var(--gold-primary) / 0.15)',
                                color: 'hsl(var(--gold-primary))',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.65rem',
                                fontWeight: 500
                            }}
                        >
                            {theme.replace(/_/g, ' ')}
                        </span>
                    ))}
                    {goalAnalysis.themes.length > 2 && (
                        <span style={{
                            padding: '2px 6px',
                            fontSize: '0.65rem',
                            color: 'hsl(var(--text-muted))'
                        }}>
                            +{goalAnalysis.themes.length - 2}
                        </span>
                    )}
                </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                <button
                    onClick={handleEdit}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: 'hsl(var(--surface-elevated))',
                        border: '1px solid hsl(var(--border-muted))',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        color: 'hsl(var(--text-secondary))',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-1)'
                    }}
                >
                    <Edit2 size={12} />
                    Edit
                </button>
                <button
                    onClick={exitPlanningMode}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: 'hsl(var(--surface-elevated))',
                        border: '1px solid hsl(var(--border-muted))',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        color: 'hsl(var(--text-muted))',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-1)'
                    }}
                >
                    <X size={12} />
                    Clear
                </button>
            </div>
        </div>
    );
};

export default PlanningModeEntry;
