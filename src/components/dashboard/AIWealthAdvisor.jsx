import React, { useState, useRef, useEffect } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Send, Sparkles, Loader, ShieldCheck, Info, Wallet } from 'lucide-react';
import { getAdvisorResponse, getSpendingStats, resetSpending } from '../../utils/ai/geminiClient';

/**
 * AI Wealth Advisor - Pure Conversational Interface
 * 
 * Chat with a CFP/CPA fiduciary advisor.
 * No hardcoded strategies - everything is AI-driven.
 */
export default function AIWealthAdvisor() {
    const { profile, applyAIStrategies, scopedCurrentWealth, wealthBreakdown, primaryMember } = useScopedWealth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [stats, setStats] = useState(getSpendingStats());
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initial greeting & Chips
    useEffect(() => {
        setStats(getSpendingStats());
        setMessages([{
            role: 'assistant',
            content: `Aurum Intelligence Online. Fiduciary Protocols Active.\n\nI have secured a connection to your wealth profile (${(scopedCurrentWealth / 1000000).toFixed(2)}M AUM). My algorithms are ready to simulate tax-loss harvesting, estate waterfalls, and Monte Carlo scenarios.\n\nAwaiting your directive.`,
            timestamp: new Date(),
            isWelcome: true
        }]);
    }, [scopedCurrentWealth]);

    const handleChipClick = (text) => {
        setInput(text);
        // Optional: auto-send
        // sendMessage(text);
    };

    const suggestedPrompts = [
        "Optimize my tax efficiency",
        "Stress test for a recession",
        "Analyze estate liquidity",
        "Am I spending too much?"
    ];

    const sendMessage = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message
        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        }]);

        setIsThinking(true);

        try {
            // Get AI advisor response
            // CRITICAL: We pass the scoped wealthBreakdown and primaryMember data
            // This ensures the AI sees exactly what is on the dashboard (scoped + buckets),
            // not a generic "missing assets" profile.
            const aiContext = {
                breakdown: wealthBreakdown, // The scoped assets/liabilities list
                primaryProfile: primaryMember, // The main persona for this scope (age, income, etc)
                totalNetWorth: scopedCurrentWealth // Explicit total verification
            };

            const response = await getAdvisorResponse(userMessage, aiContext);

            if (response.success) {
                // Add AI response
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message,
                    meta: response.meta,
                    timestamp: new Date()
                }]);
            } else {
                // Error response
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message,
                    timestamp: new Date()
                }]);
            }

        } catch (error) {
            console.error('Error getting AI response:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Network anomaly detected. Rerouting inquiry...',
                timestamp: new Date()
            }]);
        }

        setIsThinking(false);
        setStats(getSpendingStats());
    };

    return (
        <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '600px'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid hsla(var(--text-primary) / 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                justifyContent: 'space-between',
                background: 'hsla(var(--bg-void) / 0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, hsl(var(--gold-primary)), hsl(var(--gold-warm)))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px hsla(var(--gold-primary) / 0.3)'
                    }}>
                        <Sparkles size={16} color="hsl(var(--text-on-gold))" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'hsl(var(--text-primary))', letterSpacing: '0.01em' }}>FIDUCIARY CONSOLE</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6rem', color: 'hsl(var(--success))', marginTop: '2px' }}>
                            <ShieldCheck size={10} />
                            <span style={{ opacity: 0.9, letterSpacing: '0.05em', fontWeight: 600 }}>SECURE • FIDUCIARY STD</span>
                        </div>
                    </div>
                </div>

                {/* Budget Meter (System Resource) */}
                <div style={{
                    background: 'hsla(var(--bg-deep) / 0.5)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid hsla(var(--text-primary) / 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    minWidth: '120px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.55rem' }}>
                        <span style={{ opacity: 0.7, textTransform: 'uppercase', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>
                            Compute Budget
                        </span>
                        <span style={{
                            fontWeight: 700,
                            color: stats.remaining < 0.5 ? 'hsl(var(--danger))' : 'hsl(var(--gold-primary))',
                            fontFamily: 'monospace'
                        }}>
                            {((stats.spent / stats.cap) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div style={{
                        height: '3px',
                        background: 'hsla(var(--text-primary) / 0.05)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.min(100, (stats.spent / stats.cap) * 100)}%`,
                            background: stats.remaining < 0.5 ? 'hsl(var(--danger))' : 'hsl(var(--gold-primary))',
                            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
            }}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            gap: '0.5rem',
                            marginBottom: msg.isWelcome ? '0.5rem' : '0'
                        }}
                    >
                        <div style={{
                            maxWidth: '90%',
                            padding: '1rem 1.25rem',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: msg.role === 'user' ? 'hsl(var(--gold-primary))' : 'hsla(var(--bg-elevated) / 0.7)',
                            color: msg.role === 'user' ? 'hsl(var(--text-on-gold))' : 'hsl(var(--text-primary))',
                            border: msg.role === 'assistant' ? '1px solid hsla(var(--text-primary) / 0.08)' : 'none',
                            boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.02)' : '0 4px 12px hsla(var(--gold-primary) / 0.2)',
                            fontWeight: msg.role === 'user' ? 600 : 400,
                            position: 'relative',
                            lineHeight: 1.6
                        }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                {msg.content}
                            </p>

                            {/* Strategy Cards Grid */}
                            {msg.meta && msg.meta.strategy_cards && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    {msg.meta.strategy_cards.map((card, idx) => (
                                        <div
                                            key={idx}
                                            className="strategy-card glass-panel-interactive"
                                            style={{
                                                background: 'hsla(var(--bg-void) / 0.5)',
                                                border: '1px solid hsla(var(--text-primary) / 0.1)',
                                                borderRadius: '8px',
                                                padding: '1rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem',
                                                position: 'relative',
                                                transition: 'all 0.2s ease',
                                                cursor: 'help'
                                            }}
                                            title={`${card.explanation}\n\nTimeline: ${card.timeline}`}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h5 style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'Space Grotesk, sans-serif', color: 'hsl(var(--gold-primary))' }}>{card.title}</h5>
                                                <Info size={12} style={{ opacity: 0.5, color: 'hsl(var(--text-muted))' }} />
                                            </div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>{card.impact}</div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'hsla(var(--text-primary) / 0.05)', borderRadius: '4px', opacity: 0.7 }}>
                                                    {card.timeline}
                                                </span>
                                                <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'hsla(var(--gold-primary) / 0.1)', color: 'hsl(var(--gold-primary))', borderRadius: '4px' }}>
                                                    {card.complexity}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actionable Meta Strategies */}
                            {msg.meta && msg.meta.active_strategies && (
                                <StrategySelector
                                    strategies={msg.meta.active_strategies}
                                    isDeployed={msg.applied}
                                    onDeploy={(selectedStrategies) => {
                                        // Create a new meta object with only the selected strategies
                                        const deployableMeta = {
                                            ...msg.meta,
                                            active_strategies: selectedStrategies
                                        };
                                        applyAIStrategies(deployableMeta);
                                        setMessages(prev => prev.map((m, idx) =>
                                            idx === i ? { ...m, applied: true } : m
                                        ));
                                    }}
                                />
                            )}
                        </div>
                        {msg.isWelcome && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', marginLeft: '4px' }}>
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleChipClick(prompt)}
                                        style={{
                                            background: 'hsla(var(--bg-elevated) / 0.5)',
                                            border: '1px solid hsla(var(--gold-primary) / 0.2)',
                                            borderRadius: '20px',
                                            padding: '6px 14px',
                                            fontSize: '0.75rem',
                                            color: 'hsl(var(--text-secondary))',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: 500,
                                            fontFamily: 'Inter, sans-serif'
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.borderColor = 'hsl(var(--gold-primary))';
                                            e.target.style.color = 'hsl(var(--gold-primary))';
                                            e.target.style.background = 'hsla(var(--gold-primary) / 0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.borderColor = 'hsla(var(--gold-primary) / 0.2)';
                                            e.target.style.color = 'hsl(var(--text-secondary))';
                                            e.target.style.background = 'hsla(var(--bg-elevated) / 0.5)';
                                        }}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {isThinking && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 18px',
                        background: 'hsla(var(--gold-primary) / 0.05)',
                        borderRadius: '12px',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)',
                        width: 'fit-content'
                    }}>
                        <Loader className="anim-spin" size={16} color="hsl(var(--gold-primary))" />
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--gold-primary))', fontWeight: 600, letterSpacing: '0.05em' }}>
                            PROCESSING...
                        </span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid hsla(var(--text-primary) / 0.06)',
                display: 'flex',
                gap: '0.75rem',
                background: 'hsla(var(--bg-void) / 0.3)'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Enter command..."
                    disabled={isThinking}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        background: 'hsl(var(--bg-input))',
                        border: '1px solid hsl(var(--border-muted))',
                        borderRadius: '8px',
                        color: 'hsl(var(--text-primary))',
                        fontSize: '0.9rem',
                        fontFamily: 'Space Grotesk, sans-serif',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'hsl(var(--gold-primary))'}
                    onBlur={(e) => e.target.style.borderColor = 'hsl(var(--border-muted))'}
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isThinking}
                    style={{
                        padding: '0 1.25rem',
                        background: input.trim() && !isThinking ? 'hsl(var(--gold-primary))' : 'hsla(var(--text-muted) / 0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        color: input.trim() && !isThinking ? 'hsl(var(--text-on-gold))' : 'hsl(var(--text-muted))',
                        cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        width: '48px'
                    }}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}

/**
 * Internal Component: Strategy Selector
 * Allows user to pick which strategies to deploy from the AI's suggestions.
 */
function StrategySelector({ strategies, isDeployed, onDeploy }) {
    // Default to all selected
    const [selectedIds, setSelectedIds] = useState(strategies.map(s => s.id));

    const toggle = (id) => {
        if (isDeployed) return;
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDeploy = () => {
        const selectedObjects = strategies.filter(s => selectedIds.includes(s.id));
        onDeploy(selectedObjects);
    };

    // Helper to format ID to Title Case
    const formatName = (id) => {
        return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            background: 'hsla(var(--gold-primary) / 0.04)',
            borderRadius: '8px',
            border: '1px solid hsla(var(--gold-primary) / 0.2)'
        }}>
            <h4 style={{ margin: '0 0 10px 0', fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.8rem', color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} />
                Algorithm Synchronization
            </h4>

            <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', opacity: 0.8 }}>
                Select protocols to synchronize with the live financial engine:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {strategies.map(s => {
                    const isChecked = selectedIds.includes(s.id);
                    return (
                        <div
                            key={s.id}
                            onClick={() => toggle(s.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 12px',
                                background: isChecked ? 'hsla(var(--gold-primary) / 0.1)' : 'hsla(var(--bg-card) / 0.5)',
                                borderRadius: '6px',
                                border: isChecked ? '1px solid hsla(var(--gold-primary) / 0.3)' : '1px solid hsla(var(--text-primary) / 0.1)',
                                cursor: isDeployed ? 'default' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                border: isChecked ? 'none' : '2px solid hsla(var(--text-muted) / 0.5)',
                                background: isChecked ? 'hsl(var(--gold-primary))' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {isChecked && <ShieldCheck size={10} color="white" />}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: isChecked ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-secondary))' }}>
                                {formatName(s.id)} {s.annualAmount ? `($${s.annualAmount.toLocaleString()}/yr)` : ''}
                            </span>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleDeploy}
                disabled={isDeployed || selectedIds.length === 0}
                style={{
                    width: '100%',
                    padding: '10px',
                    background: isDeployed ? 'hsla(var(--success) / 0.1)' : (selectedIds.length > 0 ? 'hsl(var(--gold-primary))' : 'hsla(var(--text-muted) / 0.2)'),
                    color: isDeployed ? 'hsl(var(--success))' : (selectedIds.length > 0 ? 'hsl(var(--text-on-gold))' : 'hsl(var(--text-muted))'),
                    border: isDeployed ? '1px solid hsla(var(--success) / 0.3)' : 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: (isDeployed || selectedIds.length === 0) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif'
                }}
            >
                {isDeployed ? (
                    <>
                        <ShieldCheck size={14} />
                        Framework Active
                    </>
                ) : (
                    <>
                        <Sparkles size={14} />
                        Deploy {selectedIds.length} Protocol{selectedIds.length !== 1 ? 's' : ''}
                    </>
                )}
            </button>
        </div>
    );
}
