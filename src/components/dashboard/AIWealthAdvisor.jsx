import React, { useState, useRef, useEffect } from 'react';
import { useWealth } from '../../context/WealthContext';
import { MessageCircle, Send, Sparkles, TrendingUp, Loader } from 'lucide-react';
import { generateStrategies, interpretStrategy } from '../../utils/ai/geminiClient';
import { calculateProjection } from '../../utils/engine/financeEngine';

/**
 * AI Wealth Advisor - Conversational Strategy Generation
 * 
 * Users chat with AI to explore wealth strategies.
 * Each AI response generates scenarios with live projections.
 */
export default function AIWealthAdvisor() {
    const { profile, updateProfile } = useWealth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [scenarios, setScenarios] = useState([]);
    const [selectedScenario, setSelectedScenario] = useState(null);
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
            content: `Hi! I've analyzed your profile. You have $${(netWorth / 1000000).toFixed(1)}M in total assets. What would you like to optimize today?`,
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
            // Generate strategies from AI
            const strategies = await generateStrategies(profile, userMessage, messages);

            // Convert each strategy to a scenario with projection
            const newScenarios = await Promise.all(
                strategies.map(async (strategy) => {
                    const params = await interpretStrategy(strategy, profile);
                    const projection = calculateProjectionWithAI(profile, params);
                    const baselineProjection = calculateProjection({ ...profile, strategies: {} });

                    const finalWealth = projection.data[projection.data.length - 1]?.optimized || 0;
                    const baselineWealth = baselineProjection.data[baselineProjection.data.length - 1]?.baseline || 0;
                    const wealthAlpha = finalWealth - baselineWealth;

                    return {
                        id: `scenario-${Date.now()}-${Math.random()}`,
                        name: strategy.name,
                        description: strategy.description,
                        projection,
                        finalWealth,
                        wealthAlpha,
                        percentageGain: baselineWealth > 0 ? ((wealthAlpha / baselineWealth) * 100) : 0,
                        riskLevel: strategy.riskLevel,
                        taxSavings: strategy.taxSavings,
                        timeframe: strategy.timeframe,
                        actions: strategy.actions,
                        color: getScenarioColor(strategy.riskLevel)
                    };
                })
            );

            setScenarios(newScenarios);

            // Add AI response
            const responseText = strategies.length > 0
                ? `I've generated ${strategies.length} strategies for you. Each shows the projected wealth impact over 25 years. Click any scenario to see details.`
                : `I understand you want to ${userMessage}. Let me think about the best approaches...`;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
                strategies: strategies.length
            }]);

        } catch (error) {
            console.error('Error generating strategies:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I encountered an error analyzing your request. Please try rephrasing or ask something else.',
                timestamp: new Date()
            }]);
        }

        setIsThinking(false);
    };

    const applyScenario = (scenario) => {
        setSelectedScenario(scenario.id);
        // In the future, this would update the profile with the selected strategy
        console.log('Applied scenario:', scenario.name);
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
            {/* Chat Panel */}
            <div style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                background: 'hsla(220, 13%, 18%, 0.4)',
                borderRadius: '12px',
                border: '1px solid hsla(0, 0%, 100%, 0.1)',
                overflow: 'hidden'
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
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>AI Wealth Advisor</h2>
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
                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    {msg.content}
                                </p>
                                {msg.strategies > 0 && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.85rem',
                                        opacity: 0.7,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <TrendingUp size={14} />
                                        {msg.strategies} scenarios generated
                                    </div>
                                )}
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

            {/* Scenarios Panel */}
            <div style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    padding: '1rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <TrendingUp size={20} style={{ color: 'var(--gold-primary)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                        {scenarios.length > 0 ? `${scenarios.length} Scenarios` : 'Scenarios will appear here'}
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                    {scenarios.map((scenario) => (
                        <div
                            key={scenario.id}
                            onClick={() => applyScenario(scenario)}
                            style={{
                                background: selectedScenario === scenario.id
                                    ? 'hsla(43, 74%, 66%, 0.15)'
                                    : 'hsla(220, 13%, 18%, 0.4)',
                                border: selectedScenario === scenario.id
                                    ? '2px solid var(--gold-primary)'
                                    : '1px solid hsla(0, 0%, 100%, 0.1)',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedScenario !== scenario.id) {
                                    e.currentTarget.style.borderColor = scenario.color;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedScenario !== scenario.id) {
                                    e.currentTarget.style.borderColor = 'hsla(0, 0%, 100%, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {/* Color accent */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: scenario.color
                            }} />

                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: scenario.color }}>
                                {scenario.name}
                            </h4>

                            <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                                {scenario.description}
                            </p>

                            {/* Metrics */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'hsla(0, 0%, 0%, 0.2)',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
                                        Final Wealth
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: scenario.color }}>
                                        ${(scenario.finalWealth / 1000000).toFixed(2)}M
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
                                        vs. Baseline
                                    </div>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: scenario.wealthAlpha > 0 ? 'hsl(120, 60%, 50%)' : 'hsl(0, 60%, 50%)'
                                    }}>
                                        {scenario.wealthAlpha > 0 ? '+' : ''}${(scenario.wealthAlpha / 1000000).toFixed(2)}M
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
                                        Tax Savings/Year
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                        ${(scenario.taxSavings / 1000).toFixed(0)}K
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>
                                        Risk Level
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                        {scenario.riskLevel}/10
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.6 }}>
                                Timeframe: {scenario.timeframe}
                            </div>
                        </div>
                    ))}

                    {scenarios.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem 1rem',
                            opacity: 0.6
                        }}>
                            <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                Start a conversation
                            </p>
                            <p style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
                                Ask me about tax optimization, retirement planning, or wealth strategies
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper: Calculate projection with AI parameters
function calculateProjectionWithAI(profile, params) {
    const data = [];
    const financials = profile?.financials || {};
    let wealth = (financials.assets?.taxable || 0) +
        (financials.assets?.taxDeferred || 0) +
        (financials.assets?.taxFree || 0);

    for (let year = 0; year < 25; year++) {
        // Apply AI-generated actions for this year
        const yearActions = params.actions.filter(a => a.year === year);

        yearActions.forEach(action => {
            switch (action.type) {
                case 'roth_conversion':
                    wealth -= action.amount * (financials.taxRate || 0.35);
                    break;
                case 'sell_asset':
                    wealth -= action.amount * 0.15; // Long-term cap gains
                    break;
                case 'charitable_gift':
                    wealth -= action.amount;
                    wealth += action.amount * (financials.taxRate || 0.35); // Tax deduction
                    break;
                case 'tax_loss_harvest':
                    wealth += action.amount * 0.15; // Tax savings from harvested losses
                    break;
            }
        });

        // Apply growth
        wealth *= (1 + (params.assumptions.growthRate || 0.08));

        // Add tax savings
        wealth += params.assumptions.taxSavings || 0;

        // Subtract costs
        wealth -= params.assumptions.costs || 0;

        data.push({ year, optimized: wealth, baseline: wealth });
    }

    // Apply impact multiplier to final result
    const multiplier = params.assumptions.impactMultiplier || 1.0;
    data.forEach(d => d.optimized *= multiplier);

    return { data };
}

// Helper: Get color based on risk level
function getScenarioColor(riskLevel) {
    if (riskLevel <= 3) return 'hsl(120, 60%, 50%)'; // Green (safe)
    if (riskLevel <= 6) return 'hsl(43, 74%, 66%)';  // Gold (moderate)
    return 'hsl(0, 60%, 50%)';                        // Red (risky)
}
