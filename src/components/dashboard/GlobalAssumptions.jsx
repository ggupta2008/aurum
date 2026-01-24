import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { MARKET_REGIMES } from '../../utils/engine/financeEngine';
import { TrendingUp, Activity, Percent, ChevronDown, ChevronUp } from 'lucide-react';

const AssumptionInput = ({ label, value, onChange, icon: Icon, suffix = "%" }) => (
    <div style={{ marginBottom: 'var(--space-3)' }}>
        <label style={{
            display: 'block',
            fontSize: 'var(--text-xs)',
            color: 'hsl(var(--text-muted))',
            marginBottom: '4px',
            fontWeight: 500
        }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--text-dim))'
            }}>
                <Icon size={14} />
            </div>
            <input
                type="number"
                step="0.1"
                value={Math.round(value * 100 * 10) / 10}
                onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
                style={{
                    paddingLeft: '34px',
                    paddingRight: '30px',
                    background: 'hsla(var(--bg-void) / 0.4)',
                    border: '1px solid hsla(var(--text-primary) / 0.1)',
                    fontSize: '0.85rem'
                }}
            />
            <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.75rem',
                fontWeight: 600
            }}>
                {suffix}
            </div>
        </div>
    </div>
);

const GlobalAssumptions = () => {
    const { profile, updateMarketRegime } = useScopedWealth();
    const [isOpen, setIsOpen] = useState(true);

    const activeRegime = profile.marketRegime || 'goldilocks';

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-4)' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} className="text-gold" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Market Scenario Stressor
                    </span>
                </div>
                {isOpen ? <ChevronUp size={14} className="text-dim" /> : <ChevronDown size={14} className="text-dim" />}
            </button>

            {isOpen && (
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid hsla(var(--text-primary) / 0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(MARKET_REGIMES).map(([id, regime]) => (
                            <button
                                key={id}
                                onClick={() => updateMarketRegime(id)}
                                style={{
                                    textAlign: 'left',
                                    padding: 'var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    background: activeRegime === id ? 'hsla(var(--gold-primary) / 0.2)' : 'hsla(var(--bg-void) / 0.4)',
                                    border: `1px solid ${activeRegime === id ? 'hsla(var(--gold-primary) / 0.5)' : 'hsla(var(--text-primary) / 0.1)'}`,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activeRegime === id ? 'white' : 'hsl(var(--text-secondary))' }}>
                                        {regime.name}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'hsl(var(--gold-secondary))', fontWeight: 600 }}>
                                        {Math.round(regime.return * 100)}% Ret / {Math.round(regime.inflation * 100)}% Inf
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))', lineHeight: 1.3 }}>
                                    {regime.description}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-3)',
                        background: 'hsla(var(--info) / 0.05)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.65rem',
                        color: 'hsl(var(--text-dim))',
                        lineHeight: 1.4
                    }}>
                        Stressor active: Simulations currently assume <strong>{MARKET_REGIMES[activeRegime].name}</strong> variables.
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalAssumptions;
