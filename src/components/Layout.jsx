import React from 'react';
import '../styles/index.css';

const Layout = ({ children, currentView, setView }) => {
    return (
        <div className="app-grid">
            {/* Header */}
            <header style={{
                padding: 'var(--space-4) var(--space-6)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid hsla(var(--text-primary) / 0.06)'
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, hsl(var(--gold-primary)), hsl(var(--gold-warm)))',
                        borderRadius: '10px',
                        boxShadow: '0 4px 16px -4px hsla(var(--gold-primary) / 0.5)'
                    }} />
                    <div>
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px'
                        }}>
                            AURUM
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 400,
                                color: 'hsl(var(--text-muted))',
                                letterSpacing: '0.1em'
                            }}>
                                WEALTH INTELLIGENCE
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    background: 'hsla(var(--bg-surface) / 0.3)',
                    padding: '6px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid hsla(var(--text-primary) / 0.04)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <button
                        onClick={() => setView('dashboard')}
                        className={`nav-btn ${currentView === 'dashboard' ? 'nav-btn-active' : ''}`}
                    >
                        Intelligence
                    </button>
                    <button
                        onClick={() => setView('portfolio')}
                        className={`nav-btn ${currentView === 'portfolio' ? 'nav-btn-active' : ''}`}
                    >
                        Vault
                    </button>
                    <button
                        onClick={() => setView('advisor')}
                        className={`nav-btn ${currentView === 'advisor' ? 'nav-btn-active' : ''}`}
                    >
                        Stratagem
                    </button>
                    <button className="nav-btn" disabled style={{ opacity: 0.5 }}>
                        Alpha
                    </button>
                </nav>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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

            {/* Main Content */}
            <main style={{
                padding: 'var(--space-6)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
