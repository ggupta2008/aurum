import React from 'react';
import '../styles/index.css';
import AISettings from './AISettings';
import { LayoutDashboard, Castle, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useWealth } from '../context/WealthContext';

const Layout = ({ children, currentView, setView }) => {
    const { privacyMode, togglePrivacyMode, theme, toggleTheme } = useWealth();

    return (
        <div className="app-grid" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                padding: 'var(--space-3) var(--space-6)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid hsla(var(--text-primary) / 0.08)',
                background: 'hsl(var(--bg-void))',
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
                    background: 'hsla(var(--bg-surface) / 0.5)',
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
                </nav>

                {/* Copilot & Profile Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {/* AI Settings */}
                    <AISettings />

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'hsl(var(--text-dim))',
                            cursor: 'pointer',
                            padding: 'var(--space-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

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
            </div>
        </div >
    );
};

export default Layout;