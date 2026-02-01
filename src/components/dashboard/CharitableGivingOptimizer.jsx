import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { TrendingUp, Heart, DollarSign, Info, Gift, Percent, Calendar } from 'lucide-react';

const CharitableGivingOptimizer = () => {
    const {
        profile,
        targetMembers,
        scopedIncome,
        scopedTaxBuckets
    } = useScopedWealth();
    const [showMethodology, setShowMethodology] = useState(false);

    // DAF Strategy Inputs
    const [dafAmount, setDafAmount] = useState(50000);

    // QCD Strategy Inputs
    const [qcdAmount, setQcdAmount] = useState(25000);

    // CRT Strategy Inputs
    const [crtPrincipal, setCrtPrincipal] = useState(500000);
    const [crtPayoutRate, setCrtPayoutRate] = useState(5);
    const [crtYears] = useState(20);

    // Values from hook
    const scopedTaxDeferred = scopedTaxBuckets.taxDeferred;

    // Tax rates (federal + state)
    const stateTaxRate = profile.financials?.taxRate || 0.35;
    const federalRate = 0.37; // Top bracket for HNW
    const combinedRate = Math.min(federalRate + (stateTaxRate * 0.3), 0.50); // Approximate combined marginal

    // ========== DAF CALCULATIONS ==========
    const dafTotalContribution = dafAmount;
    const dafTaxSavings = dafTotalContribution * combinedRate;
    const dafNetCost = dafTotalContribution - dafTaxSavings;
    const dafEffectiveDiscount = (dafTaxSavings / dafTotalContribution) * 100;

    // ========== QCD CALCULATIONS (SCOPE-AWARE) ==========
    // Check all members in scope for QCD eligibility (age 70.5+)
    const qcdEligibleMembers = targetMembers.filter(m => (m.age || 0) >= 70.5);
    const qcdEligible = qcdEligibleMembers.length > 0;
    const qcdMaxAnnual = 105000; // 2024 IRS limit (indexed) - PER PERSON
    const qcdMaxForScope = qcdMaxAnnual * Math.max(1, qcdEligibleMembers.length); // Total max for all eligible members
    const qcdActualAmount = Math.min(qcdAmount, qcdMaxForScope);

    // Generate eligibility message
    let qcdEligibilityMessage = '';
    if (qcdEligible) {
        if (qcdEligibleMembers.length === 1) {
            qcdEligibilityMessage = `Available for ${qcdEligibleMembers[0].name} (age ${qcdEligibleMembers[0].age})`;
        } else {
            const names = qcdEligibleMembers.map(m => `${m.name} (${m.age})`).join(', ');
            qcdEligibilityMessage = `Available for ${names}`;
        }
    } else {
        // Find youngest member and calculate years until eligibility
        const youngestAge = Math.min(...targetMembers.map(m => m.age || 45));
        const yearsUntil = Math.ceil(70.5 - youngestAge);
        if (targetMembers.length === 1) {
            qcdEligibilityMessage = `Available at age 70½ (currently ${youngestAge})`;
        } else {
            qcdEligibilityMessage = `Available in ${yearsUntil} years (youngest member is ${youngestAge})`;
        }
    }

    // QCD avoids income tax + reduces AGI (prevents IRMAA surcharges)
    const qcdIncomeTaxSavings = qcdActualAmount * combinedRate;

    // IRMAA savings (if income is near threshold)
    const estimatedAGI = scopedIncome + (scopedTaxDeferred * 0.04); // Approximate AGI with RMDs
    const irmaaThreshold = 206000; // 2024 IRMAA Bracket 2 threshold (MFJ)
    const nearIRMAAThreshold = estimatedAGI > (irmaaThreshold - 50000) && estimatedAGI < (irmaaThreshold + 50000);
    const irmaaAnnualSavings = nearIRMAAThreshold ? 2000 : 0; // Approximate annual IRMAA surcharge avoided

    const qcdTotalAnnualSavings = qcdIncomeTaxSavings + irmaaAnnualSavings;
    const qcdLifetimeSavings = qcdTotalAnnualSavings * 20; // Assume 20 years of QCDs

    // ========== CRT CALCULATIONS ==========
    const crtAnnualPayout = crtPrincipal * (crtPayoutRate / 100);
    const crtLifetimeIncome = crtAnnualPayout * crtYears;

    // Tax savings: Avoid immediate capital gains tax on appreciated assets
    const assumedAppreciation = 0.5; // Assume 50% appreciation (basis = 50% of FMV)
    const capitalGainsTaxAvoided = crtPrincipal * assumedAppreciation * 0.20; // 20% LTCG rate

    // Charitable deduction (present value of remainder interest, ~40-60% of principal)
    const charitableDeduction = crtPrincipal * 0.45; // Conservative estimate
    const deductionTaxSavings = charitableDeduction * combinedRate;

    const crtTotalTaxBenefit = capitalGainsTaxAvoided + deductionTaxSavings;

    // ========== COMBINED IMPACT ==========
    const totalAnnualGiving = dafAmount + (qcdEligible ? qcdActualAmount : 0);
    const totalTaxSavings = dafTaxSavings + (qcdEligible ? qcdTotalAnnualSavings : 0) + crtTotalTaxBenefit;

    return (
        <div className="glass-panel">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid hsla(var(--gold-primary) / 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, hsla(var(--success) / 0.2), hsla(var(--info) / 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Heart size={24} style={{ color: 'hsl(var(--success))' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'hsl(var(--text-primary))' }}>
                            Charitable Giving Optimizer
                        </h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                            Tax-efficient philanthropy strategies
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowMethodology(!showMethodology)}
                    style={{
                        background: 'hsla(var(--gold-primary) / 0.1)',
                        border: '1px solid hsla(var(--gold-primary) / 0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        color: 'hsl(var(--gold-primary))',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(var(--gold-primary) / 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'hsla(var(--gold-primary) / 0.1)'}
                >
                    <Info size={16} />
                    {showMethodology ? 'Hide' : 'Show'} Methodology
                </button>
            </div>

            {showMethodology && (
                <div style={{
                    background: 'hsla(var(--info) / 0.05)',
                    border: '1px solid hsla(var(--info) / 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'hsl(var(--info))' }}>Calculation Methodology</h4>
                    <div style={{ display: 'grid', gap: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                        <div>
                            <strong style={{ color: 'hsl(var(--text-primary))' }}>Donor-Advised Fund (DAF):</strong>
                            <ul style={{ margin: '0.5rem 0 0 1.5rem', lineHeight: '1.6' }}>
                                <li>Immediate tax deduction at your marginal rate ({(combinedRate * 100).toFixed(1)}%)</li>
                                <li>Donate appreciated stock to avoid capital gains tax</li>
                                <li>Distribute to charities over time while assets grow tax-free</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ color: 'hsl(var(--text-primary))' }}>Qualified Charitable Distribution (QCD):</strong>
                            <ul style={{ margin: '0.5rem 0 0 1.5rem', lineHeight: '1.6' }}>
                                <li>{qcdEligibilityMessage}</li>
                                <li>Direct IRA distribution to charity (up to $105k/year per person)</li>
                                <li>Satisfies RMD requirement without increasing taxable income</li>
                                <li>Reduces AGI → May avoid IRMAA Medicare surcharges (~$2k/year)</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ color: 'hsl(var(--text-primary))' }}>Charitable Remainder Trust (CRT):</strong>
                            <ul style={{ margin: '0.5rem 0 0 1.5rem', lineHeight: '1.6' }}>
                                <li>Transfer appreciated assets (stock, real estate) to irrevocable trust</li>
                                <li>Avoid immediate capital gains tax on appreciation</li>
                                <li>Receive annual income stream ({crtPayoutRate}% payout rate)</li>
                                <li>Remainder goes to charity after term → Immediate charitable deduction</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* STRATEGY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

                {/* DAF CARD */}
                <div style={{
                    background: 'linear-gradient(135deg, hsla(var(--success) / 0.05), hsla(var(--success) / 0.02))',
                    border: '1px solid hsla(var(--success) / 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Gift size={20} style={{ color: 'hsl(var(--success))' }} />
                        <h4 style={{ margin: 0, color: 'hsl(var(--text-primary))' }}>Donor-Advised Fund</h4>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                            Contribution Amount
                        </label>
                        <input
                            type="range"
                            min="10000"
                            max="500000"
                            step="10000"
                            value={dafAmount}
                            onChange={(e) => setDafAmount(parseInt(e.target.value))}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>$10k</span>
                            <span style={{ color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>
                                ${(dafAmount / 1000).toFixed(0)}k
                            </span>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>$500k</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Tax Savings</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--success))' }}>
                                ${(dafTaxSavings / 1000).toFixed(1)}k
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Net Cost</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                                ${(dafNetCost / 1000).toFixed(1)}k
                            </span>
                        </div>
                        <div style={{
                            background: 'hsla(var(--success) / 0.1)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.25rem' }}>
                                Effective Discount
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--success))' }}>
                                {dafEffectiveDiscount.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* QCD CARD */}
                <div style={{
                    background: qcdEligible
                        ? 'linear-gradient(135deg, hsla(var(--info) / 0.05), hsla(var(--info) / 0.02))'
                        : 'linear-gradient(135deg, hsla(var(--text-secondary) / 0.05), hsla(var(--text-secondary) / 0.02))',
                    border: qcdEligible
                        ? '1px solid hsla(var(--info) / 0.2)'
                        : '1px solid hsla(var(--text-secondary) / 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    opacity: qcdEligible ? 1 : 0.6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <TrendingUp size={20} style={{ color: qcdEligible ? 'hsl(var(--info))' : 'hsl(var(--text-secondary))' }} />
                        <h4 style={{ margin: 0, color: 'hsl(var(--text-primary))' }}>Qualified Charitable Distribution</h4>
                    </div>

                    <div style={{
                        background: qcdEligible ? 'hsla(var(--success) / 0.1)' : 'hsla(var(--warning) / 0.1)',
                        border: qcdEligible ? '1px solid hsla(var(--success) / 0.3)' : '1px solid hsla(var(--warning) / 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: qcdEligible ? 'hsl(var(--success))' : 'hsl(var(--warning))'
                    }}>
                        {qcdEligible ? '✓' : '⏳'} {qcdEligibilityMessage}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                            Annual QCD Amount
                            {qcdEligible && qcdEligibleMembers.length > 1 && (
                                <span style={{ marginLeft: '0.5rem', color: 'hsl(var(--info))', fontSize: '0.75rem' }}>
                                    (${(qcdMaxForScope / 1000).toFixed(0)}k max for {qcdEligibleMembers.length} members)
                                </span>
                            )}
                        </label>
                        <input
                            type="range"
                            min="5000"
                            max={qcdMaxForScope}
                            step="5000"
                            value={qcdAmount}
                            onChange={(e) => setQcdAmount(parseInt(e.target.value))}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                            disabled={!qcdEligible}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>$5k</span>
                            <span style={{ color: qcdEligible ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-secondary))', fontWeight: 600 }}>
                                ${(qcdActualAmount / 1000).toFixed(0)}k
                            </span>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>${(qcdMaxForScope / 1000).toFixed(0)}k</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Annual Tax Savings</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: qcdEligible ? 'hsl(var(--info))' : 'hsl(var(--text-secondary))' }}>
                                ${(qcdTotalAnnualSavings / 1000).toFixed(1)}k
                            </span>
                        </div>
                        {nearIRMAAThreshold && qcdEligible && (
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontStyle: 'italic' }}>
                                + Avoids IRMAA surcharge (~$2k/yr)
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>20-Year Savings</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: qcdEligible ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))' }}>
                                ${(qcdLifetimeSavings / 1000).toFixed(0)}k
                            </span>
                        </div>
                    </div>
                </div>

                {/* CRT CARD */}
                <div style={{
                    background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.05), hsla(var(--gold-primary) / 0.02))',
                    border: '1px solid hsla(var(--gold-primary) / 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <DollarSign size={20} style={{ color: 'hsl(var(--gold-primary))' }} />
                        <h4 style={{ margin: 0, color: 'hsl(var(--text-primary))' }}>Charitable Remainder Trust</h4>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                            Principal Amount
                        </label>
                        <input
                            type="range"
                            min="100000"
                            max="5000000"
                            step="100000"
                            value={crtPrincipal}
                            onChange={(e) => setCrtPrincipal(parseInt(e.target.value))}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>$100k</span>
                            <span style={{ color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>
                                ${(crtPrincipal / 1000).toFixed(0)}k
                            </span>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>$5M</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                            Annual Payout Rate
                        </label>
                        <input
                            type="range"
                            min="3"
                            max="8"
                            step="0.5"
                            value={crtPayoutRate}
                            onChange={(e) => setCrtPayoutRate(parseFloat(e.target.value))}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>3%</span>
                            <span style={{ color: 'hsl(var(--gold-primary))', fontWeight: 600 }}>
                                {crtPayoutRate.toFixed(1)}%
                            </span>
                            <span style={{ color: 'hsl(var(--text-secondary))' }}>8%</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Annual Income</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--gold-primary))' }}>
                                ${(crtAnnualPayout / 1000).toFixed(1)}k/yr
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Tax Benefit</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--success))' }}>
                                ${(crtTotalTaxBenefit / 1000).toFixed(0)}k
                            </span>
                        </div>
                        <div style={{
                            background: 'hsla(var(--gold-primary) / 0.1)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.25rem' }}>
                                {crtYears}-Year Income
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>
                                ${(crtLifetimeIncome / 1000).toFixed(0)}k
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COMBINED IMPACT SUMMARY */}
            <div style={{
                background: 'linear-gradient(135deg, hsla(var(--gold-primary) / 0.1), hsla(var(--success) / 0.1))',
                border: '2px solid hsla(var(--gold-primary) / 0.3)',
                borderRadius: '12px',
                padding: '1.5rem'
            }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'hsl(var(--gold-primary))' }}>
                    💎 Combined Charitable Impact
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                            Total Annual Giving
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                            ${(totalAnnualGiving / 1000).toFixed(0)}k
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                            Total Tax Savings
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--success))' }}>
                            ${(totalTaxSavings / 1000).toFixed(0)}k
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                            Effective Cost
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--gold-primary))' }}>
                            {((1 - (totalTaxSavings / totalAnnualGiving)) * 100).toFixed(0)}¢/$
                        </div>
                    </div>
                </div>
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'hsla(var(--info) / 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'hsl(var(--text-secondary))',
                    lineHeight: '1.6'
                }}>
                    <strong style={{ color: 'hsl(var(--info))' }}>💡 Pro Tip:</strong> Combine strategies for maximum impact.
                    Use DAF for large one-time gifts, QCD for annual RMD satisfaction, and CRT for converting highly appreciated assets into income.
                </div>
            </div>
        </div>
    );
};

export default CharitableGivingOptimizer;
