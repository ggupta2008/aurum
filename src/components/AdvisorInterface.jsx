import React, { useState, useEffect, useRef } from 'react';
import { aurumPersona, generateAurumResponse } from '../utils/aurumPersona';

const AdvisorInterface = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'aurum',
            text: aurumPersona.initialGreeting
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // User Message
        const userMsg = { id: Date.now(), sender: 'user', text: input };
        // Create a new messages array including the new user message to pass to context
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            // Transform internal message format to history format expected by API if needed, 
            // but generateAurumResponse handles mapping.
            // We exclude the very last message (userMsg) from history in startChat usually, 
            // or we can pass the history excluding the new message and send the new message as prompt.
            // Let's pass the previous messages as history.
            const history = messages.filter(m => m.id !== 1); // Exclude greeting if we want, or keep it.

            const responseText = await generateAurumResponse(input, history);

            const aurumMsg = {
                id: Date.now() + 1,
                sender: 'aurum',
                text: responseText
            };

            setMessages(prev => [...prev, aurumMsg]);
        } catch (error) {
            console.error("Error generating response:", error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%',
            padding: 'var(--space-4)'
        }}>

            {/* Chat Area */}
            <div className="glass-panel" style={{
                flex: 1,
                marginBottom: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-6)'
                }}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            gap: 'var(--space-3)'
                        }}>
                            {msg.sender === 'aurum' && (
                                <div style={{
                                    minWidth: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    marginTop: 'var(--space-1)'
                                }} />
                            )}

                            <div style={{
                                background: msg.sender === 'user' ? 'hsla(var(--accent-gold) / 0.1)' : 'transparent',
                                border: msg.sender === 'user' ? '1px solid hsla(var(--accent-gold) / 0.2)' : 'none',
                                borderRadius: 'var(--radius-md)',
                                padding: msg.sender === 'user' ? 'var(--space-3) var(--space-4)' : '0',
                                color: msg.sender === 'user' ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))'
                            }}>
                                {msg.sender === 'aurum' && (
                                    <div style={{
                                        marginBottom: 'var(--space-2)',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.1em',
                                        fontWeight: 700,
                                        color: 'hsl(var(--accent-gold))'
                                    }}>
                                        AURUM
                                    </div>
                                )}
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.6,
                                    color: msg.sender === 'aurum' ? 'hsl(var(--text-primary))' : 'inherit'
                                }}>
                                    {msg.text.split('\n').map((line, i) => (
                                        <p key={i} style={{ marginBottom: line.trim() === '' ? 'var(--space-2)' : '0' }}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
                                borderRadius: '50%',
                                flexShrink: 0
                            }} />
                            <span className="text-gold" style={{ fontSize: '0.875rem' }}>Analyzing...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Aurum about market trends, portfolio risk, or AI strategies..."
                    className="glass-panel"
                    style={{
                        width: '100%',
                        padding: 'var(--space-4) var(--space-8) var(--space-4) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsla(var(--text-secondary) / 0.2)',
                        background: 'hsla(var(--bg-glass) / 0.8)',
                        color: 'hsl(var(--text-primary))',
                        fontSize: '1rem',
                        outline: 'none',
                        fontFamily: 'Inter, sans-serif'
                    }}
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    style={{
                        position: 'absolute',
                        right: 'var(--space-2)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: input.trim() ? 'hsl(var(--accent-gold))' : 'hsl(var(--text-muted))',
                        cursor: input.trim() ? 'pointer' : 'default',
                        padding: 'var(--space-2)'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default AdvisorInterface;
