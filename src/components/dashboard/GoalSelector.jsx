import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Target, Sparkles, Edit3 } from 'lucide-react';

const GoalSelector = () => {
    const { profile, updateProfile } = useScopedWealth();
    const [isEditing, setIsEditing] = useState(false);
    const [objective, setObjective] = useState(profile.goals?.objective || '');

    const handleSave = () => {
        updateProfile({
            ...profile,
            goals: {
                ...profile.goals,
                objective: objective
            }
        });
        setIsEditing(false);
    };

    const currentObjective = profile.goals?.objective || '';
    const hasObjective = currentObjective.trim().length > 0;

    // Example objectives for inspiration
    const examples = [
        "Retire by age 50 with $5M net worth",
        "Generate $10k/month passive income from dividends",
        "Pay off all debt and build 12-month emergency fund",
        "Minimize taxes and maximize Roth conversions",
        "Leave $10M estate to children tax-efficiently",
        "Achieve financial independence in 10 years",
        "Build rental property portfolio generating $100k/year"
    ];

    return (
        <div className="glass-panel anim-fade-up" style={{
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-4)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Target size={16} className="text-gold" />
                    <h3 style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'hsl(var(--text-muted))',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        Strategic Objective
                    </h3>
                </div>
                {!isEditing && hasObjective && (
                    <button
                        onClick={() => {
                            setObjective(currentObjective);
                            setIsEditing(true);
                        }}
                        style={{
                            padding: '6px 12px',
                            background: 'hsla(var(--gold-primary) / 0.1)',
                            border: '1px solid hsla(var(--gold-primary) / 0.2)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'hsl(var(--gold-primary))',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Edit3 size={12} />
                        Edit
                    </button>
                )}
            </div>

            {isEditing || !hasObjective ? (
                <div>
                    <textarea
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="Describe your financial goal in your own words..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: 'var(--space-3)',
                            background: 'hsla(var(--bg-void) / 0.3)',
                            border: '1px solid hsla(var(--gold-primary) / 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            marginBottom: 'var(--space-3)'
                        }}
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, hsl(var(--gold-primary)), hsl(var(--gold-secondary)))',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                color: 'hsl(var(--bg-primary))',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Save & Generate Plan
                        </button>
                        {hasObjective && (
                            <button
                                onClick={() => {
                                    setObjective(currentObjective);
                                    setIsEditing(false);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    background: 'transparent',
                                    border: '1px solid hsla(var(--text-primary) / 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'hsl(var(--text-muted))',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <div style={{
                        padding: 'var(--space-3)',
                        background: 'hsla(var(--gold-primary) / 0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsla(var(--gold-primary) / 0.1)'
                    }}>
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', marginBottom: 'var(--space-2)', fontWeight: 600 }}>
                            💡 Example Objectives:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {examples.map((example, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setObjective(example)}
                                    style={{
                                        padding: '6px 10px',
                                        background: 'hsla(var(--bg-void) / 0.2)',
                                        border: '1px solid hsla(var(--text-primary) / 0.05)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'hsl(var(--text-dim))',
                                        fontSize: '0.65rem',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'hsla(var(--gold-primary) / 0.1)';
                                        e.target.style.borderColor = 'hsla(var(--gold-primary) / 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'hsla(var(--bg-void) / 0.2)';
                                        e.target.style.borderColor = 'hsla(var(--text-primary) / 0.05)';
                                    }}
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.15), hsla(var(--gold-primary) / 0.05))',
                    border: '1px solid hsla(var(--gold-primary) / 0.3)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid hsl(var(--gold-primary))'
                }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                        <Sparkles size={20} className="text-gold" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--gold-primary))', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                                Your Goal
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'white', lineHeight: 1.6, fontWeight: 500 }}>
                                {currentObjective}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalSelector;
