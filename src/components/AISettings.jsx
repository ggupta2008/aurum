import React, { useState } from 'react';
import { Settings, Key, CheckCircle, XCircle, Wallet, RotateCcw, Save } from 'lucide-react';
import { initializeGemini, getSpendingStats, resetSpending } from '../utils/ai/geminiClient';

/**
 * AI Settings Component
 * Allows users to configure their Gemini API key
 */
export default function AISettings() {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [isConfigured, setIsConfigured] = useState(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        return storedKey ? initializeGemini(storedKey) : false;
    });
    const [showSettings, setShowSettings] = useState(false);
    const [stats, setStats] = useState(() => getSpendingStats());
    const [customCap, setCustomCap] = useState(() => getSpendingStats().cap);

    const updateCap = () => {
        localStorage.setItem('aurum_ai_spending_cap', customCap.toString());
        setStats(getSpendingStats());
    };

    const handleResetSpending = () => {
        if (confirm('Are you sure you want to reset your AI spending usage for this session?')) {
            resetSpending();
            setStats(getSpendingStats());
        }
    };

    const saveApiKey = () => {
        if (!apiKey.trim()) return;

        localStorage.setItem('gemini_api_key', apiKey);
        const success = initializeGemini(apiKey);
        setIsConfigured(success);
        setShowSettings(false);
    };

    const clearApiKey = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
        setIsConfigured(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Settings Button */}
            <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: isConfigured ? 'hsla(120, 60%, 50%, 0.2)' : 'hsla(0, 60%, 50%, 0.2)',
                    border: `1px solid ${isConfigured ? 'hsl(120, 60%, 50%)' : 'hsl(0, 60%, 50%)'}`,
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                }}
            >
                {isConfigured ? <CheckCircle size={16} /> : <XCircle size={16} />}
                AI {isConfigured ? 'Active' : 'Inactive'}
                <Settings size={16} />
            </button>

            {/* Settings Panel */}
            {showSettings && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '400px',
                    background: 'hsla(220, 13%, 18%, 0.95)',
                    border: '1px solid hsla(0, 0%, 100%, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    zIndex: 1000,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Key size={20} style={{ color: 'var(--gold-primary)' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Configuration</h3>
                    </div>

                    <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem', lineHeight: 1.5 }}>
                        Enter your Google Gemini API key to enable AI-powered strategy generation.
                        Get your free key at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-primary)' }}>Google AI Studio</a>.
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIza..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'hsla(220, 13%, 18%, 0.6)',
                                border: '1px solid hsla(0, 0%, 100%, 0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={saveApiKey}
                            disabled={!apiKey.trim()}
                            style={{
                                flex: 2,
                                padding: '0.75rem',
                                background: apiKey.trim() ? 'var(--gold-primary)' : 'hsla(0, 0%, 50%, 0.3)',
                                border: 'none',
                                borderRadius: '8px',
                                color: apiKey.trim() ? '#000000' : 'hsla(0, 0%, 100%, 0.5)',
                                cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            Save Key
                        </button>
                        {isConfigured && (
                            <button
                                onClick={clearApiKey}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'hsla(0, 60%, 50%, 0.2)',
                                    border: '1px solid hsl(0, 60%, 50%)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {!isConfigured && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: 'hsla(43, 74%, 66%, 0.1)',
                            border: '1px solid hsla(43, 74%, 66%, 0.3)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            lineHeight: 1.5
                        }}>
                            <strong>Note:</strong> Without an API key, the advisor will use rule-based strategies instead of AI-generated recommendations.
                        </div>
                    )}

                    {/* Spending Controls */}
                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid hsla(0, 0%, 100%, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Wallet size={18} style={{ color: 'var(--success)' }} />
                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Billing & Usage Control</h4>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', opacity: 0.6 }}>
                                    Current Usage
                                </label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                                    ${stats.spent.toFixed(4)}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', opacity: 0.6 }}>
                                    Spending Cap ($)
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="number"
                                        value={customCap}
                                        onChange={(e) => setCustomCap(parseFloat(e.target.value))}
                                        style={{
                                            width: '70px',
                                            padding: '0.4rem',
                                            background: 'hsla(0, 0%, 100%, 0.05)',
                                            border: '1px solid hsla(0, 0%, 100%, 0.1)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            fontSize: '0.85rem'
                                        }}
                                    />
                                    <button
                                        onClick={updateCap}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            background: 'var(--gold-primary)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#000000',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700
                                        }}
                                        title="Save Cap"
                                    >
                                        <Save size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            height: '6px',
                            background: 'hsla(0, 0%, 100%, 0.05)',
                            borderRadius: '3px',
                            marginBottom: '1rem',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(100, (stats.spent / stats.cap) * 100)}%`,
                                background: stats.remaining < 0.5 ? 'hsl(var(--danger))' : 'var(--success)',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>

                        <button
                            onClick={handleResetSpending}
                            style={{
                                width: '100%',
                                padding: '0.6rem',
                                background: 'transparent',
                                border: '1px solid hsla(0, 0%, 100%, 0.1)',
                                borderRadius: '8px',
                                color: 'hsl(var(--text-dim))',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <RotateCcw size={12} /> Reset Cumulative Usage
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
