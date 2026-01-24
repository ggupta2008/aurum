import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { ChevronDown, ChevronUp, DollarSign, Wallet, Shield, Lock, Info } from 'lucide-react';

const StatRow = ({ label, value, icon: Icon, colorClass }) => (
    <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={12} className={colorClass || 'text-muted'} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' }).format(value)}
            </span>
        </div>
    </div>
);

const WealthProfile = () => {
    const { scopedTaxBuckets, planningScope } = useScopedWealth();
    const [isOpen, setIsOpen] = useState(true);
    const [showInfo, setShowInfo] = useState(false);

    const totalTaxable = scopedTaxBuckets.taxable || 0;
    const totalDeferred = scopedTaxBuckets.taxDeferred || 0;
    const totalFree = scopedTaxBuckets.taxFree || 0;

    return (
        <div className="glass-panel anim-fade-up anim-delay-1" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOpen ? 'var(--space-4)' : 0 }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    <Wallet size={14} className="text-gold" />
                    <h3 style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'hsl(var(--text-muted))',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        Wealth Buckets
                    </h3>
                    {isOpen ? <ChevronUp size={14} style={{ color: 'hsl(var(--text-dim))' }} /> : <ChevronDown size={14} style={{ color: 'hsl(var(--text-dim))' }} />}
                </button>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className={`nav-btn ${showInfo ? 'nav-btn-active' : ''}`}
                    style={{ padding: '4px', borderRadius: '6px' }}
                >
                    <Info size={14} />
                </button>
            </div>

            {isOpen && (
                <div>
                    {showInfo && (
                        <div className="anim-fade-up" style={{
                            background: 'hsla(var(--gold-primary) / 0.05)',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsla(var(--gold-primary) / 0.1)',
                            marginBottom: 'var(--space-4)',
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5
                        }}>
                            <p style={{ marginBottom: '8px' }}><strong>The Geography of Wealth:</strong> These values are derived in real-time from your <strong>Vault</strong> holdings.</p>
                            <p style={{ marginBottom: '4px' }}>• <strong>Taxable:</strong> Subject to ~20% annual tax drag.</p>
                            <p style={{ marginBottom: '4px' }}>• <strong>Tax-Deferred:</strong> Future RMD liability ("Tax Bomb").</p>
                            <p>• <strong>Tax-Free:</strong> 0% tax drag. Immune to law changes.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <StatRow
                            label="Taxable (Leaky)"
                            value={totalTaxable}
                            icon={DollarSign}
                        />
                        <StatRow
                            label="Deferred (Bomb)"
                            value={totalDeferred}
                            icon={Lock}
                        />
                        <StatRow
                            label="Tax-Free (Safe)"
                            value={totalFree}
                            icon={Shield}
                            colorClass="text-gold"
                        />

                        <div style={{
                            marginTop: 'var(--space-2)',
                            paddingTop: 'var(--space-4)',
                            borderTop: '1px solid hsla(var(--text-primary) / 0.06)',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                fontSize: '0.65rem',
                                color: 'hsl(var(--text-dim))',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontStyle: 'italic'
                            }}>
                                Derived from Vault Operations
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WealthProfile;
