import React, { useState, useRef, useEffect } from 'react';
import { useWealth } from '../../context/WealthContext';
import { Send, Sparkles, Loader } from 'lucide-react';
import { getAdvisorResponse } from '../../utils/ai/geminiClient';

/**
 * AI Wealth Advisor - Pure Conversational Interface
 * 
 * Chat with a CFP/CPA fiduciary advisor.
 * No hardcoded strategies - everything is AI-driven.
 */
export default function AIWealthAdvisor() {
    const { profile } = useWealth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initial greeting
    useEffect(() => {
        const netWorth = (profile?.financials?.assets?.taxable || 0) +
            (profile?.financials?.assets?.taxDeferred || 0) +
            (profile?.financials?.assets?.taxFree || 0);

        setMessages([{
            role: 'assistant',
            content: `Hi! I'm your fiduciary wealth advisor with CFP and CPA certifications. I've analyzed your profile—you have $${(netWorth / 1000000).toFixed(1)}M in total assets.\n\nI specialize in:\n• Tax optimization strategies\n• Estate planning and trusts\n• Wealth accumulation\n• Multi-generational planning\n\nWhat would you like to discuss today?`,
            timestamp: new Date()
        }]);
    }, []);

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
            const response = await getAdvisorResponse(userMessage, profile);

            if (response.success) {
                // Add AI response
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message,
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
                content: 'I encountered an error analyzing your request. Please try rephrasing or ask something else.',
                timestamp: new Date()
            }]);
        }

        setIsThinking(false);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'hsla(220, 13%, 18%, 0.4)',
            borderRadius: '12px',
            border: '1px solid hsla(0, 0%, 100%, 0.1)',
            overflow: 'hidden',
            height: '600px'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid hsla(0, 0%, 100%, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <Sparkles size={24} style={{ color: 'var(--gold-primary)' }} />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AI Wealth Advisor</h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>CFP & CPA Fiduciary</p>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div style={{
                            maxWidth: '80%',
                            padding: '1rem',
                            borderRadius: '12px',
                            background: msg.role === 'user'
                                ? 'var(--gold-primary)'
                                : 'hsla(220, 13%, 18%, 0.6)',
                            color: msg.role === 'user' ? 'black' : 'white',
                            border: msg.role === 'assistant' ? '1px solid hsla(0, 0%, 100%, 0.1)' : 'none'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {msg.content}
                            </p>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'hsla(220, 13%, 18%, 0.6)',
                            border: '1px solid hsla(0, 0%, 100%, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <Loader size={16} className="spin" />
                            <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                                Analyzing your request...
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '1.5rem',
                borderTop: '1px solid hsla(0, 0%, 100%, 0.1)',
                display: 'flex',
                gap: '1rem'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask me anything about your wealth strategy..."
                    disabled={isThinking}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        background: 'hsla(220, 13%, 18%, 0.6)',
                        border: '1px solid hsla(0, 0%, 100%, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isThinking}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: input.trim() && !isThinking ? 'var(--gold-primary)' : 'hsla(0, 0%, 50%, 0.3)',
                        border: 'none',
                        borderRadius: '8px',
                        color: input.trim() && !isThinking ? 'black' : 'hsla(255, 255%, 255%, 0.5)',
                        cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Send size={16} />
                    Send
                </button>
            </div>
        </div>
    );
}
