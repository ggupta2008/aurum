import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { PieChart, TrendingUp, Shield, AlertCircle, Info, X } from 'lucide-react';

const AssetAllocationOptimizer = () => {
    const {
        profile,
        planningScope,
        targetMembers,
        scopedAge,
        scopedTaxBuckets,
        scopedCurrentWealth
    } = useScopedWealth();
    const [showMethodology, setShowMethodology] = useState(false);

    const formatCurrency = (v) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: 'compact'
    }).format(v);

    const formatPercent = (v) => `${Math.round(v * 100)}% `;

    // Values from hook
    const age = scopedAge;
    const scopeLabel = planningScope === 'household' ? 'Grand Clan' : (targetMembers[0]?.name || 'Current Unit');

    // Calculate portfolio for the selected scope from hook values
    const taxable = scopedTaxBuckets.taxable;
    const taxDeferred = scopedTaxBuckets.taxDeferred;
    const taxFree = scopedTaxBuckets.taxFree;
    const totalPortfolio = scopedCurrentWealth;

    if (totalPortfolio === 0) {
        return (
            <div className="glass-panel anim-fade-up anim-delay-6" style={{
                padding: 'var(--space-5)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                    Enter your assets to see allocation recommendations.
                </p>
            </div>
        );
    }

    // Risk tolerance (could be from profile, defaulting to moderate)
    const riskTolerance = profile.riskTolerance || 'moderate';

    // Age-based glide path (Vanguard/Fidelity style)
    // Rule: "110 - Age" for stocks, with adjustments for risk tolerance
    let baseStockAllocation = (110 - age) / 100;

    // Risk tolerance adjustments
    const riskAdjustments = {
        'conservative': -0.15,  // -15% stocks
        'moderate': 0,
        'aggressive': +0.15     // +15% stocks
    };

    const stockAllocation = Math.max(0.2, Math.min(0.9, baseStockAllocation + (riskAdjustments[riskTolerance] || 0)));
    const bondAllocation = Math.max(0.05, Math.min(0.7, 1 - stockAllocation - 0.05)); // Reserve 5% for cash
    const cashAllocation = Math.max(0.05, 1 - stockAllocation - bondAllocation);

    const recommendedAmounts = {
        stocks: totalPortfolio * stockAllocation,
        bonds: totalPortfolio * bondAllocation,
        cash: totalPortfolio * cashAllocation
    };

    // Asset Location Optimization (Tax-Efficient Placement)
    // Rule: Stocks in Roth (tax-free growth), Bonds in IRA (tax-inefficient), Cash in taxable
    const locationGuidance = {
        stocks: {
            primary: 'Tax-Free (Roth IRA)',
            secondary: 'Taxable',
            avoid: 'Tax-Deferred',
            reason: 'Stocks generate long-term capital gains (15-20% tax). Best in Roth for tax-free growth.'
        },
        bonds: {
            primary: 'Tax-Deferred (Traditional IRA)',
            secondary: 'Tax-Free',
            avoid: 'Taxable',
            reason: 'Bonds generate ordinary income (up to 37% tax). Shield in IRA to defer taxes.'
        },
        cash: {
            primary: 'Taxable',
            secondary: 'Tax-Free',
            avoid: 'Tax-Deferred',
            reason: 'Cash is low-return and liquid. Keep in taxable for emergency access.'
        }
    };

    // Calculate "drift" from recommended allocation
    // For simplicity, assume current allocation is proportional to bucket sizes
    const currentStockPct = taxable / totalPortfolio; // Simplified assumption
    const currentBondPct = taxDeferred / totalPortfolio;
    const currentCashPct = taxFree / totalPortfolio;

    const drift = Math.abs(currentStockPct - stockAllocation) +
        Math.abs(currentBondPct - bondAllocation) +
        Math.abs(currentCashPct - cashAllocation);

    const needsRebalancing = drift > 0.1; // >10% total drift

    return (
        <div className="glass-panel anim-fade-up anim-delay-6" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            position: 'relative'
        }}>
            {showMethodology && (
                <div
                    className="glass-panel anim-fade-up"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: 'hsl(var(--bg-void))',
                        padding: 'var(--space-6)',
                        border: '1px solid hsla(var(--gold-primary) / 0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h4 style={{ color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                            Allocation Methodology
                        </h4>
                        <button onClick={() => setShowMethodology(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Age-Based Glide Path:</strong> We use the "110 - Age" rule as a baseline. At age {age},
                            this suggests {formatPercent(baseStockAllocation)} in stocks. We then adjust ±15% based on your risk tolerance.
                        </p>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Asset Location:</strong> Tax-efficient placement is critical. Stocks (which generate capital gains)
                            belong in Roth IRAs for tax-free growth. Bonds (which generate ordinary income) belong in Traditional IRAs
                            to defer taxes. Cash stays in taxable accounts for liquidity.
                        </p>
                        <p>
                            <strong>Rebalancing:</strong> If your allocation drifts more than 10% from the target, we recommend rebalancing
                            to maintain your risk profile and tax efficiency.
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: 'var(--space-1)'
                    }}>
                        Asset Allocation Optimizer
                    </h3>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'hsl(var(--text-muted))'
                    }}>
                        {scopeLabel} · Age-based glide path with tax-efficient placement
                    </p>
                </div>
                <button
                    onClick={() => setShowMethodology(true)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'hsl(var(--text-dim))',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Recommended Allocation */}
            <div style={{
                padding: 'var(--space-5)',
                background: 'hsla(var(--gold-primary) / 0.05)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsla(var(--gold-primary) / 0.2)'
            }}>
                <div style={{
                    fontSize: '0.7rem',
                    color: 'hsl(var(--text-muted))',
                    marginBottom: 'var(--space-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Recommended Allocation (Age {age}, {riskTolerance.charAt(0).toUpperCase() + riskTolerance.slice(1)} Risk)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {/* Stocks */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                                📈 Stocks (Equities)
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--success))' }}>
                                {formatPercent(stockAllocation)} ({formatCurrency(recommendedAmounts.stocks)})
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'hsla(var(--bg-void) / 0.3)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: formatPercent(stockAllocation),
                                height: '100%',
                                background: 'hsl(var(--success))',
                                borderRadius: 'var(--radius-full)'
                            }} />
                        </div>
                    </div>

                    {/* Bonds */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                                🏦 Bonds (Fixed Income)
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--info))' }}>
                                {formatPercent(bondAllocation)} ({formatCurrency(recommendedAmounts.bonds)})
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'hsla(var(--bg-void) / 0.3)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: formatPercent(bondAllocation),
                                height: '100%',
                                background: 'hsl(var(--info))',
                                borderRadius: 'var(--radius-full)'
                            }} />
                        </div>
                    </div>

                    {/* Cash */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                                💵 Cash (Emergency Fund)
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--warning))' }}>
                                {formatPercent(cashAllocation)} ({formatCurrency(recommendedAmounts.cash)})
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'hsla(var(--bg-void) / 0.3)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: formatPercent(cashAllocation),
                                height: '100%',
                                background: 'hsl(var(--warning))',
                                borderRadius: 'var(--radius-full)'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Location Guidance */}
            <div>
                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'hsl(var(--gold-primary))',
                    marginBottom: 'var(--space-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Tax-Efficient Placement
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {Object.entries(locationGuidance).map(([asset, guidance]) => (
                        <div key={asset} style={{
                            padding: 'var(--space-3)',
                            background: 'hsla(var(--bg-void) / 0.4)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsla(var(--text-primary) / 0.1)'
                        }}>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'hsl(var(--text-primary))',
                                marginBottom: '4px'
                            }}>
                                {asset.charAt(0).toUpperCase() + asset.slice(1)} → {guidance.primary}
                            </div>
                            <div style={{
                                fontSize: '0.65rem',
                                color: 'hsl(var(--text-secondary))',
                                lineHeight: 1.4
                            }}>
                                {guidance.reason}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rebalancing Alert */}
            {needsRebalancing && (
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
                            ⚠️ Rebalancing Recommended
                        </div>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--text-secondary))',
                            lineHeight: 1.5
                        }}>
                            Your current allocation has drifted {formatPercent(drift)} from the target.
                            Consider rebalancing to maintain your risk profile and tax efficiency.
                            Rebalance within tax-advantaged accounts (IRA/Roth) to avoid triggering capital gains.
                        </p>
                    </div>
                </div>
            )}

            {!needsRebalancing && (
                <div style={{
                    padding: 'var(--space-4)',
                    background: 'hsla(var(--success) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--success) / 0.2)'
                }}>
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'hsl(var(--text-secondary))',
                        lineHeight: 1.5
                    }}>
                        ✅ <strong>Well-balanced portfolio.</strong> Your allocation is within acceptable drift tolerances.
                        Continue monitoring and rebalance annually or when drift exceeds 10%.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AssetAllocationOptimizer;
