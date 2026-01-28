import React, { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle, XCircle } from 'lucide-react';
import { initializeGemini } from '../utils/ai/geminiClient';

/**
 * AI Settings Component
 * Allows users to configure their Gemini API key
 */
export default function AISettings() {
    const [apiKey, setApiKey] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // Check if API key is already stored
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
            const success = initializeGemini(storedKey);
            setIsConfigured(success);
        }
    }, []);

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
                                flex: 1,
                                padding: '0.75rem',
                                background: apiKey.trim() ? 'var(--gold-primary)' : 'hsla(0, 0%, 50%, 0.3)',
                                border: 'none',
                                borderRadius: '8px',
                                color: apiKey.trim() ? 'black' : 'hsla(255, 255%, 255%, 0.5)',
                                cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 600
                            }}
                        >
                            Save
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
                </div>
            )}
        </div>
    );
}
