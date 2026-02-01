import React, { useState, useRef, useEffect } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Send, Sparkles, Loader, ShieldCheck, Info, Command, ChevronRight, Zap } from 'lucide-react';
import { getAdvisorResponse } from '../../utils/ai/geminiClient';

/**
 * AI Wealth Advisor - Command Stream Interface
 * 
 * Shifted from "Chat App" to "Fiduciary Command Console".
 * Features:
 * - Unboxed Strategy Artifacts
 * - Slash Command Menu
 * - Context Awareness Bar
 */
export default function AIWealthAdvisor() {
    const { applyAIStrategies, scopedCurrentWealth, wealthBreakdown, primaryMember, planningScope } = useScopedWealth();
    const [messages, setMessages] = useState(() => [{
        role: 'assistant',
        content: `Fiduciary protocols active. I have analyzed your scoped profile (${(scopedCurrentWealth / 1000000).toFixed(2)}M). Awaiting commands.`,
        timestamp: new Date(),
        isWelcome: true
    }]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Command Menu Logic
    const commands = [
        { id: 'optimize', label: '/optimize', desc: 'Run tax efficiency audit' },
        { id: 'stress', label: '/stress_test', desc: 'Simulate market crash' },
        { id: 'audit', label: '/audit_fees', desc: 'Analyze expense ratios' },
        { id: 'estate', label: '/estate_check', desc: 'Review trust structures' }
    ];

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInput(val);
        setShowSlashMenu(val.startsWith('/'));
    };

    const handleCommandSelect = (cmd) => {
        setInput(cmd.desc); // Or the command itself if the AI understands it
        setShowSlashMenu(false);
        inputRef.current?.focus();
    };

    const sendMessage = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage = input.trim();
        setInput('');
        setShowSlashMenu(false);

        // Add user message
        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        }]);

        setIsThinking(true);

        try {
            const aiContext = {
                breakdown: wealthBreakdown,
                primaryProfile: primaryMember,
                totalNetWorth: scopedCurrentWealth
            };

            const response = await getAdvisorResponse(userMessage, aiContext);

            if (response.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message,
                    meta: response.meta,
                    timestamp: new Date()
                }]);
            } else {
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
                content: 'System anomaly. Rerouting...',
                timestamp: new Date()
            }]);
        }

        setIsThinking(false);
    };

    return (
        <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: '600px',
            position: 'relative'
        }}>
            {/* Header - Minimalist Command Center */}
            <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid hsla(var(--text-primary) / 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'hsla(var(--bg-void) / 0.8)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, hsl(var(--gold-primary)), hsl(var(--gold-warm)))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px hsla(var(--gold-primary) / 0.4)'
                    }}>
                        <Sparkles size={14} color="hsl(var(--text-on-gold))" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Space Grotesk', letterSpacing: '0.05em', color: 'hsl(var(--text-primary))' }}>
                        AI FIDUCIARY
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="anim-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'hsl(var(--success))' }} />
                    <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>ONLINE</span>
                </div>
            </div>

            {/* Stream */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        
                        {/* Text Bubble */}
                        <div style={{
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                            background: msg.role === 'user' ? 'hsl(var(--gold-primary))' : 'hsla(var(--bg-elevated) / 0.6)',
                            color: msg.role === 'user' ? 'hsl(var(--text-on-gold))' : 'hsl(var(--text-primary))',
                            border: msg.role === 'assistant' ? '1px solid hsla(var(--text-primary) / 0.08)' : 'none',
                            fontSize: '0.9rem',
                            lineHeight: 1.6,
                            boxShadow: msg.role === 'user' ? '0 4px 12px hsla(var(--gold-primary) / 0.3)' : 'none'
                        }}>
                            {msg.content}
                        </div>

                        {/* Artifacts (Strategy Cards & Actions) - Rendered FULL WIDTH outside bubble */}
                        {msg.meta && (
                            <div style={{ width: '100%', paddingLeft: '12px' }}>
                                {/* Strategy Cards */}
                                {msg.meta.strategy_cards && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        {msg.meta.strategy_cards.map((card, idx) => (
                                            <div key={idx} className="glass-panel-interactive" style={{
                                                padding: '16px',
                                                background: 'hsla(var(--bg-void) / 0.6)',
                                                border: '1px solid hsla(var(--text-primary) / 0.1)',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <h5 style={{ fontSize: '0.85rem', color: 'hsl(var(--gold-primary))', margin: 0 }}>{card.title}</h5>
                                                    <Info size={14} className="text-muted" />
                                                </div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>{card.impact}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.4 }}>{card.explanation}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Selector */}
                                {msg.meta.active_strategies && (
                                    <StrategySelector 
                                        strategies={msg.meta.active_strategies} 
                                        isDeployed={msg.applied}
                                        onDeploy={(selected) => {
                                            applyAIStrategies({ ...msg.meta, active_strategies: selected });
                                            setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, applied: true } : m));
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {isThinking && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, paddingLeft: '12px' }}>
                        <Loader size={14} className="anim-spin text-gold" />
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>COMPUTING OPTIMAL PATH...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Context Bar */}
            <div style={{
                padding: '6px 20px',
                background: 'hsla(var(--bg-void) / 0.9)',
                borderTop: '1px solid hsla(var(--text-primary) / 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Active Context:</div>
                <div style={{ fontSize: '0.65rem', color: 'hsl(var(--gold-primary))', background: 'hsla(var(--gold-primary)/0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {planningScope === 'household' ? 'Grand Clan (All Units)' : 'Specific Tax Unit'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'hsl(var(--success))', background: 'hsla(var(--success)/0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {scopedCurrentWealth > 0 ? 'Live Data' : 'Empty Profile'}
                </div>
            </div>

            {/* Input Area */}
            <div style={{
                padding: '12px 20px 20px 20px',
                background: 'hsla(var(--bg-void) / 0.9)',
                position: 'relative'
            }}>
                {/* Slash Menu Overlay */}
                {showSlashMenu && (
                    <div className="anim-fade-up" style={{
                        position: 'absolute',
                        bottom: '70px',
                        left: '20px',
                        width: '250px',
                        background: 'hsl(var(--bg-elevated))',
                        border: '1px solid hsla(var(--text-primary)/0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 30px hsla(0,0%,0%,0.5)',
                        overflow: 'hidden',
                        zIndex: 10
                    }}>
                        <div style={{ padding: '8px 12px', fontSize: '0.65rem', color: 'hsl(var(--text-muted))', background: 'hsla(var(--bg-deep)/0.5)', borderBottom: '1px solid hsla(var(--text-primary)/0.05)' }}>
                            AVAILABLE COMMANDS
                        </div>
                        {commands.map(cmd => (
                            <button
                                key={cmd.id}
                                onClick={() => handleCommandSelect(cmd)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid hsla(var(--text-primary)/0.03)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: 'hsl(var(--text-primary))',
                                    fontSize: '0.8rem'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'hsla(var(--gold-primary)/0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ fontWeight: 600 }}>{cmd.label}</span>
                                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{cmd.desc}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div style={{ position: 'relative' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type / for commands..."
                        disabled={isThinking}
                        style={{
                            width: '100%',
                            padding: '14px 48px 14px 16px',
                            background: 'hsl(var(--bg-input))',
                            border: '1px solid hsl(var(--border-muted))',
                            borderRadius: '12px',
                            color: 'hsl(var(--text-primary))',
                            fontSize: '0.9rem',
                            fontFamily: 'Space Grotesk, sans-serif',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}>
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isThinking}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: input.trim() ? 'hsl(var(--gold-primary))' : 'transparent',
                                border: 'none',
                                color: input.trim() ? 'hsl(var(--text-on-gold))' : 'hsl(var(--text-muted))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: input.trim() ? 'pointer' : 'default',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StrategySelector({ strategies, isDeployed, onDeploy }) {
    const [selectedIds, setSelectedIds] = useState(strategies.map(s => s.id));

    const toggle = (id) => {
        if (isDeployed) return;
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    return (
        <div style={{
            background: 'hsla(var(--bg-surface) / 0.4)',
            border: '1px solid hsla(var(--gold-primary) / 0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            <div style={{ padding: '12px', background: 'hsla(var(--gold-primary)/0.05)', borderBottom: '1px solid hsla(var(--gold-primary)/0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={14} className="text-gold" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Actions</span>
            </div>
            
            <div style={{ padding: '8px' }}>
                {strategies.map(s => {
                    const isChecked = selectedIds.includes(s.id);
                    return (
                        <div key={s.id} onClick={() => toggle(s.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
                            cursor: isDeployed ? 'default' : 'pointer',
                            opacity: isDeployed && !isChecked ? 0.5 : 1,
                            transition: 'background 0.2s',
                            borderRadius: '6px'
                        }}
                        onMouseEnter={e => !isDeployed && (e.currentTarget.style.background = 'hsla(var(--text-primary)/0.03)')}
                        onMouseLeave={e => !isDeployed && (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{
                                width: '18px', height: '18px', borderRadius: '4px',
                                border: isChecked ? 'none' : '2px solid hsla(var(--text-muted)/0.4)',
                                background: isChecked ? 'hsl(var(--gold-primary))' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {isChecked && <ShieldCheck size={12} color="white" />}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>
                                {s.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: '8px', borderTop: '1px solid hsla(var(--text-primary)/0.05)' }}>
                <button
                    onClick={() => onDeploy(strategies.filter(s => selectedIds.includes(s.id)))}
                    disabled={isDeployed || selectedIds.length === 0}
                    style={{
                        width: '100%', padding: '10px',
                        background: isDeployed ? 'hsla(var(--success)/0.1)' : 'hsl(var(--gold-primary))',
                        color: isDeployed ? 'hsl(var(--success))' : 'hsl(var(--text-on-gold))',
                        border: isDeployed ? '1px solid hsla(var(--success)/0.2)' : 'none',
                        borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                        cursor: isDeployed ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    {isDeployed ? <>Protocols Active <ShieldCheck size={14} /></> : <>Initialize Protocols <ChevronRight size={14} /></>}
                </button>
            </div>
        </div>
    );
}
