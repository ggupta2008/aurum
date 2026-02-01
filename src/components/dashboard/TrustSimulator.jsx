import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, Lock, ArrowRight, TrendingUp, AlertCircle, Info, X } from 'lucide-react';

const TrustSimulator = () => {
    const {
        targetMembers,
        scopedCurrentWealth
    } = useScopedWealth();
    const [showMethodology, setShowMethodology] = useState(false);

    // Strategy State
    const [slatFunding, setSlatFunding] = useState(0); // Spousal Lifetime Access Trust
    const [ilitBenefit, setIlitBenefit] = useState(0); // Irrevocable Life Insurance Trust

    const formatCurrency = (v) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: 'compact'
    }).format(v);

    // Values from hook
    const currentAssets = scopedCurrentWealth;
    const YEARS = 25;
    const GROWTH_RATE = 0.06; // Conservative 6%
    const ESTATE_TAX_RATE = 0.40;
    const EXEMPTION_2024 = 13610000;

    // Calculate Projected Future Estate (Deterministic)
    const futureEstateValue = currentAssets * Math.pow(1 + GROWTH_RATE, YEARS);

    // Exemption Logic
    const hasSpouse = targetMembers.some(m => m.relation === 'Spouse');
    const totalExemption = hasSpouse ? EXEMPTION_2024 * 2 : EXEMPTION_2024;

    // Growth Exemption (Indexed for inflation? Let's assume exemption grows at 2.5%)
    const futureExemption = totalExemption * Math.pow(1.025, YEARS);

    // SCENARIO 1: DO NOTHING (Baseline)
    const taxableEstateBaseline = Math.max(0, futureEstateValue - futureExemption);
    const taxBaseline = taxableEstateBaseline * ESTATE_TAX_RATE;
    const netToHeirsBaseline = futureEstateValue - taxBaseline;

    // SCENARIO 2: TRUST STRATEGIES (Optimized)
    // 1. SLAT: Remove Principal + Growth from Taxable Estate. Consumes Exemption.
    // Future Value of SLAT assets
    const slatFutureValue = slatFunding * Math.pow(1 + GROWTH_RATE, YEARS);

    // 2. ILIT: Adds Tax-Free Death Benefit. Does not consume exemption (usually funded via annual gifts).
    const ilitFutureValue = ilitBenefit; // Fixed death benefit amount

    // Adjusted Calculation
    // Assets remaining in taxable estate
    const remainingAssets = Math.max(0, currentAssets - slatFunding);
    const futureRemainingEstate = remainingAssets * Math.pow(1 + GROWTH_RATE, YEARS);

    // Exemption remaining usage
    // Moving assets to SLAT uses up lifetime exemption *today*
    const exemptionUsed = slatFunding;

    const remainingExemption = Math.max(0, futureExemption - exemptionUsed);
    const taxableEstateOptimized = Math.max(0, futureRemainingEstate - remainingExemption);
    const taxOptimized = taxableEstateOptimized * ESTATE_TAX_RATE;

    // Total Value to Heirs = (Net Remaining Estate) + (Full SLAT) + (Full ILIT)
    const netToHeirsOptimized = (futureRemainingEstate - taxOptimized) + slatFutureValue + ilitFutureValue;

    const efficiencyGain = netToHeirsOptimized - netToHeirsBaseline;

    const data = [
        { name: 'Current Path', value: netToHeirsBaseline, tax: taxBaseline, total: futureEstateValue },
        { name: 'With Vault', value: netToHeirsOptimized, tax: taxOptimized, total: futureRemainingEstate + slatFutureValue + ilitFutureValue }
    ];

    // Max funding cap (cannot fund more than current assets or exemption)
    const maxFunding = Math.min(currentAssets, totalExemption);

    return (
        <div className="glass-panel anim-fade-up anim-delay-5" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
            gridColumn: 'span 2' // Wide component
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Shield className="text-gold" size={20} />
                        <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            color: 'white'
                        }}>
                            Trust Structure Planner
                        </h3>
                    </div>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'hsl(var(--text-muted))',
                        marginTop: '4px'
                    }}>
                        Estate Tax Reduction Strategies
                    </p>
                </div>
                <button
                    onClick={() => setShowMethodology(!showMethodology)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'hsl(var(--text-dim))',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <Info size={18} />
                </button>
            </div>

            {/* Methodology Modal */}
            {showMethodology && (
                <div className="glass-panel" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
                    background: 'hsl(var(--bg-void))', padding: 'var(--space-6)',
                    border: '1px solid hsla(var(--gold-primary) / 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', fontSize: '0.8rem' }}>Trust Strategies</h4>
                        <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowMethodology(false)} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        <p><strong>SLAT (Spousal Lifetime Access Trust):</strong> Moves assets out of your taxable estate while allowing your spouse to access them. Growth occurs estate-tax-free.</p>
                        <p style={{ marginTop: '8px' }}><strong>IDGT (Intentionally Defective Grantor Trust):</strong> You pay the income tax on trust assets, allowing them to grow tax-free for heirs. Powerful "burn" strategy.</p>
                        <p style={{ marginTop: '8px' }}><strong>ILIT (Irrevocable Life Insurance Trust):</strong> Holds life insurance outside your estate. The death benefit provides tax-free liquidity to pay estate taxes.</p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                {/* Visualizer */}
                <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: 'hsl(var(--text-secondary))' }} />
                            <Tooltip
                                cursor={{ fill: 'hsla(var(--text-primary)/0.05)' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--bg-elevated))', borderColor: 'hsla(var(--text-primary)/0.1)' }}
                                formatter={(val) => formatCurrency(val)}
                            />
                            <Bar dataKey="value" name="Net to Heirs" stackId="a" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} barSize={40} />
                            <Bar dataKey="tax" name="Estate Tax" stackId="a" fill="hsl(var(--danger))" radius={[0, 4, 4, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.75rem', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: 10, height: 10, background: 'hsl(var(--success))', borderRadius: 2 }} />
                            <span>Net to Heirs</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: 10, height: 10, background: 'hsl(var(--danger))', borderRadius: 2 }} />
                            <span>Estate Tax</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

                    {/* Strategy 1: SLAT */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Fund SLAT (Spousal Access)</label>
                            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--gold-primary))' }}>{formatCurrency(slatFunding)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={maxFunding}
                            step={100000}
                            value={slatFunding}
                            onChange={(e) => setSlatFunding(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'hsl(var(--gold-primary))' }}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                            Freeze growth on this amount. Spouse retains access.
                        </p>
                    </div>

                    {/* Strategy 2: ILIT */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>ILIT Death Benefit</label>
                            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--info))' }}>{formatCurrency(ilitBenefit)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={20000000}
                            step={500000}
                            value={ilitBenefit}
                            onChange={(e) => setIlitBenefit(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'hsl(var(--info))' }}
                        />
                        <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                            Tax-free liquidity to pay estate taxes.
                        </p>
                    </div>

                    {/* Result Card */}
                    {efficiencyGain > 10000 && (
                        <div style={{
                            marginTop: 'auto',
                            padding: 'var(--space-4)',
                            background: 'hsla(var(--success)/0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsla(var(--success)/0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)'
                        }}>
                            <TrendingUp size={24} className="text-success" />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Projected Legacy Increase</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
                                    +{formatCurrency(efficiencyGain)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrustSimulator;
