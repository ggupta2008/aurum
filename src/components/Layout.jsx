import React, { useState } from 'react';
import '../styles/index.css';
import AdvisorInterface from './AdvisorInterface';
import AISettings from './AISettings';
import { Sparkles, X, LayoutDashboard, Castle, Eye, EyeOff } from 'lucide-react';
import { useWealth } from '../context/WealthContext';

const Layout = ({ children, currentView, setView }) => {
    const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
    const { privacyMode, togglePrivacyMode } = useWealth();

    return (
        <div className="app-grid" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                padding: 'var(--space-3) var(--space-6)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid hsla(var(--text-primary) / 0.08)',
                background: 'var(--bg-void)',
                zIndex: 100
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, hsl(var(--gold-primary)), hsl(var(--gold-warm)))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px -4px hsla(var(--gold-primary) / 0.5)'
                    }} />
                    <h1 style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px'
                    }}>
                        AURUM
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 400,
                            color: 'hsl(var(--text-muted))',
                            letterSpacing: '0.1em'
                        }}>
                            INTELLIGENCE
                        </span>
                    </h1>
                </div>

                {/* Main Tab Navigation */}
                <nav style={{
                    display: 'flex',
                    gap: 'var(--space-1)',
                    background: 'hsla(var(--bg-surface) / 0.2)',
                    padding: '4px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid hsla(var(--text-primary) / 0.04)'
                }}>
                    <button
                        onClick={() => setView('dashboard')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-4)',
                            background: currentView === 'dashboard' ? 'hsla(var(--gold-primary) / 0.1)' : 'transparent',
                            color: currentView === 'dashboard' ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-secondary))',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LayoutDashboard size={14} />
                        Intelligence
                    </button>
                    <button
                        onClick={() => setView('portfolio')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-2) var(--space-4)',
                            background: currentView === 'portfolio' ? 'hsla(var(--gold-primary) / 0.1)' : 'transparent',
                            color: currentView === 'portfolio' ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-secondary))',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Castle size={14} />
                        The Vault
                    </button>
                    <button className="nav-btn" disabled style={{ opacity: 0.3, padding: 'var(--space-2) var(--space-4)', fontSize: '0.8rem' }}>
                        Alpha
                    </button>
                </nav>

                {/* Copilot & Profile Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {/* AI Settings */}
                    <AISettings />

                    {/* Privacy Toggle */}
                    <button
                        onClick={togglePrivacyMode}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: privacyMode ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-dim))',
                            cursor: 'pointer',
                            padding: 'var(--space-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        title={privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
                    >
                        {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    <button
                        onClick={() => setIsAdvisorOpen(!isAdvisorOpen)}
                        className={`anim-pulse-slow ${isAdvisorOpen ? 'text-gold' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            background: isAdvisorOpen ? 'hsla(var(--gold-primary) / 0.15)' : 'hsla(var(--gold-primary) / 0.05)',
                            border: `1px solid ${isAdvisorOpen ? 'hsla(var(--gold-primary) / 0.3)' : 'hsla(var(--gold-primary) / 0.1)'}`,
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-full)',
                            color: 'hsl(var(--gold-primary))',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <Sparkles size={14} />
                        {isAdvisorOpen ? 'ANALYZING...' : 'ASK STRATAGEM'}
                    </button>

                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, hsl(var(--bg-surface)), hsl(var(--bg-elevated)))',
                        border: '1px solid hsla(var(--text-primary) / 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'hsl(var(--text-muted))'
                    }}>
                        GG
                    </div>
                </div>
            </header>


            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Main Content */}
                <main style={{
                    flex: 1,
                    padding: 'var(--space-6)',
                    overflowY: 'auto',
                    transition: 'all 0.3s ease'
                }}>
                    {children}
                </main>

                {/* Slide-out Copilot - True Overlay Appearance */}
                <aside style={{
                    width: isAdvisorOpen ? '420px' : '0',
                    borderLeft: isAdvisorOpen ? '1px solid hsla(var(--text-primary) / 0.15)' : 'none',
                    background: 'hsla(var(--bg-void) / 0.4)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isAdvisorOpen ? '-20px 0 50px -10px hsla(0,0%,0%,0.5)' : 'none'
                }}>
                    <div style={{
                        minWidth: '420px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: 'var(--space-5) var(--space-6)',
                            borderBottom: '1px solid hsla(var(--text-primary) / 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'hsla(var(--gold-primary) / 0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <Sparkles size={16} className="text-gold" />
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'hsl(var(--text-primary))' }}>
                                    Stratagem Copilot
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsAdvisorOpen(false)}
                                style={{
                                    background: 'hsla(var(--text-primary) / 0.05)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <AdvisorInterface />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Layout;
