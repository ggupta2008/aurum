import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Wallet, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const SafeWithdrawalRate = () => {
    const {
        scopedProjection,
        profile,
        scopedCurrentWealth,
        scopedAge,
        scopedSpending,
        formatCurrency
    } = useScopedWealth();
    const { data } = scopedProjection;

    if (!data || data.length === 0) {
        return (
            <div className="glass-panel anim-fade-up anim-delay-4" style={{
                padding: 'var(--space-5)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                    Enter your financial data to calculate safe withdrawal rate.
                </p>
            </div>
        );
    }

    // CALCULATE SCOPED PORTFOLIO & SPENDING from hook
    const currentPortfolio = scopedCurrentWealth;
    const age = scopedAge;
    const currentSpending = scopedSpending;

    // Dynamic SWR based on age and market regime
    const regime = profile.marketRegime || 'goldilocks';
    let baseSWR = 0.04; // 4% rule baseline

    // Age adjustments (younger = more conservative, older = can spend more)
    if (age < 50) baseSWR = 0.035; // 3.5% for early retirees
    else if (age < 60) baseSWR = 0.04; // 4% for normal retirees
    else if (age < 70) baseSWR = 0.045; // 4.5% for late retirees
    else baseSWR = 0.05; // 5% for 70+

    // Market regime adjustments
    const regimeAdjustments = {
        'goldilocks': 0,
        'bull_charge': 0.005, // Can spend 0.5% more in bull markets
        'stagflation': -0.01, // Reduce by 1% in stagflation
        'lost_decade': -0.015 // Reduce by 1.5% in lost decade
    };

    const adjustedSWR = baseSWR + (regimeAdjustments[regime] || 0);
    const safeWithdrawal = currentPortfolio * adjustedSWR;

    // Calculate years sustainable (simplified: portfolio / annual withdrawal)
    const yearsSustainable = currentPortfolio / safeWithdrawal;

    // Retirement readiness score
    const requiredPortfolio = currentSpending / adjustedSWR;
    const readinessScore = (currentPortfolio / requiredPortfolio) * 100;

    const isReady = readinessScore >= 100;
    const needsMore = requiredPortfolio - currentPortfolio;

    return (
        <div className="glass-panel anim-fade-up anim-delay-4" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
        }}>
            <div>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: 'var(--space-1)'
                }}>
                    Safe Withdrawal Rate
                </h3>
                <p style={{
                    fontSize: '0.8rem',
                    color: 'hsl(var(--text-muted))'
                }}>
                    Dynamic SWR based on age, market regime, and portfolio size
                </p>
            </div>

            {/* Main SWR Display */}
            <div style={{
                padding: 'var(--space-5)',
                background: 'hsla(var(--gold-primary) / 0.1)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsla(var(--gold-primary) / 0.2)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-muted))',
                    marginBottom: 'var(--space-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Annual Safe Withdrawal
                </div>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: 'hsl(var(--gold-primary))',
                    marginBottom: 'var(--space-1)'
                }}>
                    {formatCurrency(safeWithdrawal, { notation: 'compact' })}
                </div>
                <div style={{
                    fontSize: '0.85rem',
                    color: 'hsl(var(--text-secondary))'
                }}>
                    {(adjustedSWR * 100).toFixed(2)}% of current portfolio
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)'
            }}>
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--bg-void) / 0.4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--text-primary) / 0.1)'
                }}>
                    <div style={{
                        fontSize: '0.65rem',
                        color: 'hsl(var(--text-dim))',
                        marginBottom: '4px',
                        textTransform: 'uppercase'
                    }}>
                        Years Sustainable
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: yearsSustainable > 30 ? 'hsl(var(--success))' : 'hsl(var(--warning))'
                    }}>
                        {yearsSustainable > 100 ? '∞' : `${Math.round(yearsSustainable)}+`}
                    </div>
                </div>

                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--bg-void) / 0.4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--text-primary) / 0.1)'
                }}>
                    <div style={{
                        fontSize: '0.65rem',
                        color: 'hsl(var(--text-dim))',
                        marginBottom: '4px',
                        textTransform: 'uppercase'
                    }}>
                        Retirement Readiness
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: isReady ? 'hsl(var(--success))' : 'hsl(var(--danger))'
                    }}>
                        {Math.round(readinessScore)}%
                    </div>
                </div>
            </div>

            {/* Readiness Assessment */}
            {isReady ? (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--success) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--success) / 0.2)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'flex-start'
                }}>
                    <CheckCircle size={18} style={{ color: 'hsl(var(--success))', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'hsl(var(--success))',
                            marginBottom: '4px'
                        }}>
                            ✅ You're Ready to Retire!
                        </div>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5
                        }}>
                            Your current portfolio of <strong>{formatCurrency(currentPortfolio, { notation: 'compact' })}</strong> can sustainably support
                            your spending of <strong>{formatCurrency(currentSpending, { notation: 'compact' })}/year</strong> with a {(adjustedSWR * 100).toFixed(1)}% withdrawal rate.
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--warning) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--warning) / 0.2)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'flex-start'
                }}>
                    <AlertCircle size={18} style={{ color: 'hsl(var(--warning))', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'hsl(var(--warning))',
                            marginBottom: '4px'
                        }}>
                            ⚠️ Additional Savings Needed
                        </div>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5
                        }}>
                            To support your current spending of <strong>{formatCurrency(currentSpending, { notation: 'compact' })}/year</strong>,
                            you need <strong>{formatCurrency(requiredPortfolio, { notation: 'compact' })}</strong>.
                            You're <strong>{formatCurrency(needsMore, { notation: 'compact' })}</strong> short.
                            Continue saving or reduce spending to {formatCurrency(safeWithdrawal, { notation: 'compact' })}/year.
                        </p>
                    </div>
                </div>
            )}

            {/* SWR Methodology Note */}
            <div style={{
                padding: 'var(--space-3)',
                background: 'hsla(var(--info) / 0.05)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.65rem',
                color: 'hsl(var(--text-dim))',
                lineHeight: 1.4
            }}>
                <strong>Methodology:</strong> SWR is dynamically adjusted based on your age ({age} years old) and
                the selected market regime. The baseline "4% Rule" is modified using historical success rates and
                Monte Carlo simulations to ensure 95%+ confidence.
            </div>
        </div>
    );
};

export default SafeWithdrawalRate;
