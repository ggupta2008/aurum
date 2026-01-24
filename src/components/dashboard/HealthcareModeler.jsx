import React, { useState } from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { HeartPulse, AlertTriangle, TrendingUp, ShieldAlert, Info, X, Users } from 'lucide-react';

const HealthcareModeler = () => {
    const { profile, planningScope, targetMembers, scopedAge, scopedIncome, scopedTaxBuckets } = useScopedWealth();
    const [showMethodology, setShowMethodology] = useState(false);
    const [includeLTC, setIncludeLTC] = useState(false);

    const formatCurrency = (v) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: 'compact'
    }).format(v);

    // Primary Member Age from hook
    const startAge = scopedAge;
    const initialHouseholdIncome = scopedIncome;
    const initialRmdBalance = scopedTaxBuckets.taxDeferred;

    // 2024 Base Rates
    const BASE_PART_B = 174.70;
    const BASE_PART_D = 55.50;
    const HEALTH_INFLATION = 0.055; // 5.5% annual inflation

    // Projection Settings
    const PLANNING_HORIZON = 50; // Project 50 years into the future (cover until ~95)

    // 2024 IRMAA Brackets (MAGI - Modified Adjusted Gross Income)
    const hasSpouse = targetMembers.some(m => m.relation === 'Spouse');
    const getIRMAASurcharge = (magi, year, isMarried) => {
        const inflation = Math.pow(1.03, year); // Brackets creep slower than medical costs
        const brackets = isMarried
            ? [206000, 258000, 322000, 386000, 750000]
            : [103000, 129000, 161000, 193000, 500000];

        if (magi <= brackets[0] * inflation) return 0;
        if (magi <= brackets[1] * inflation) return 69.90 + 12.90; // Part B + D surcharge
        if (magi <= brackets[2] * inflation) return 174.70 + 33.30;
        if (magi <= brackets[3] * inflation) return 279.50 + 53.80;
        if (magi <= brackets[4] * inflation) return 384.30 + 74.20;
        return 419.30 + 81.00; // Max tier
    };

    // Projection Logic
    const data = [];
    let totalLifetimeCost = 0;
    let totalIRMAAPenalty = 0;

    // Track detailed costs per member for breakdown
    const memberCosts = targetMembers.map(m => ({
        id: m.id,
        name: m.name,
        relation: m.relation,
        age: m.age || 45,
        base: 0,
        irmaa: 0,
        ltc: 0,
        total: 0
    }));

    for (let year = 0; year <= PLANNING_HORIZON; year++) {
        const currentPrimaryAge = startAge + year;
        const healthcareInflation = Math.pow(1 + HEALTH_INFLATION, year);
        const baseMonthlyCost = (BASE_PART_B + BASE_PART_D) * healthcareInflation;

        let yearlyBasePremium = 0;
        let yearlyIrmaaCost = 0;
        let yearlyLtcCost = 0;

        let eligibleMembersForIrmaa = 0;

        // 1. Calculate Individual Base Premiums & LTC
        targetMembers.forEach((member, idx) => {
            const memberAge = (member.age || 0) + year;
            let mBase = 0;
            let mLtc = 0;

            if (memberAge >= 65 && memberAge <= 95) { // Medicare Age window
                mBase = baseMonthlyCost * 12;
                eligibleMembersForIrmaa++;
            }

            // LTC Event Logic (Specific to individual age)
            if (includeLTC && memberAge >= 85 && memberAge < 88) { // 3 years of care
                mLtc = 150000 * healthcareInflation;
            }

            // Accumulate per member
            memberCosts[idx].base += mBase;
            memberCosts[idx].ltc += mLtc;

            // Accumulate annual totals for chart
            yearlyBasePremium += mBase;
            yearlyLtcCost += mLtc;
        });

        // Skip years where no one is eligible yet
        if (eligibleMembersForIrmaa === 0 && yearlyLtcCost === 0) {
            data.push({ age: currentPrimaryAge, base: 0, irmaa: 0, ltc: 0, total: 0 });
            continue;
        }

        // 2. Household IRMAA Calculation
        if (eligibleMembersForIrmaa > 0) {
            // Estimate Household MAGI
            let householdIncome = initialHouseholdIncome * Math.pow(1.025, year); // Base wage growth

            // Add RMDs if *anyone* in scope is > 73
            const hasRmdMember = targetMembers.some(m => (m.age || 0) + year >= 73);
            if (hasRmdMember) {
                const rmdBalance = initialRmdBalance * Math.pow(1.06, year);
                householdIncome += rmdBalance * 0.04;
            }

            const monthlyIrmaaPerPerson = getIRMAASurcharge(householdIncome, year, hasSpouse);
            const annualIrmaaPerPerson = monthlyIrmaaPerPerson * 12;

            yearlyIrmaaCost = annualIrmaaPerPerson * eligibleMembersForIrmaa;

            // Distribute IRMAA cost back to eligible members for breakdown
            targetMembers.forEach((member, idx) => {
                const memberAge = (member.age || 0) + year;
                if (memberAge >= 65 && memberAge <= 95) {
                    memberCosts[idx].irmaa += annualIrmaaPerPerson;
                }
            });
        }

        const totalYearly = yearlyBasePremium + yearlyIrmaaCost + yearlyLtcCost;

        totalLifetimeCost += totalYearly;
        totalIRMAAPenalty += yearlyIrmaaCost;

        data.push({
            age: currentPrimaryAge,
            base: Math.round(yearlyBasePremium),
            irmaa: Math.round(yearlyIrmaaCost),
            ltc: Math.round(yearlyLtcCost),
            total: Math.round(totalYearly)
        });
    }

    // Finalize member totals
    memberCosts.forEach(m => {
        m.total = m.base + m.irmaa + m.ltc;
    });

    const finalData = data.filter(d => d.total > 0 || d.age <= startAge + 40);

    return (
        <div className="glass-panel anim-fade-up anim-delay-4" style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            gridColumn: 'span 1'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: 'var(--space-1)'
                    }}>
                        Healthcare & IRMAA
                    </h3>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'hsl(var(--text-muted))'
                    }}>
                        Lifetime Medicare Cost ({targetMembers.length} Members)
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
                    <Info size={16} />
                </button>
            </div>

            {/* Methodology Modal */}
            {showMethodology && (
                <div
                    className="glass-panel"
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
                            Healthcare Assumptions
                        </h4>
                        <button onClick={() => setShowMethodology(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Medical Inflation:</strong> 5.5% annual cost increase. Costs double every ~13 years.
                            Projection runs until Primary Member reaches age 95.
                        </p>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Scope:</strong> Calculates premiums individually for {targetMembers.length} member(s) in the current plan.
                            IRMAA surcharges are applied to all eligible members based on household income.
                        </p>
                        <p>
                            <strong>Long Term Care:</strong> Modeled as a $150k/yr event (inflation adjusted) per person at age 85, lasting 3 years.
                        </p>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div style={{ height: '180px', width: '100%', marginTop: 'var(--space-2)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={finalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorIrmaa" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--danger))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--danger))" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorLtc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="age"
                            stroke="hsla(var(--text-muted) / 0.5)"
                            fontSize={10}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--bg-elevated))',
                                border: '1px solid hsla(var(--gold-primary) / 0.1)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.75rem'
                            }}
                            formatter={(value) => formatCurrency(value)}
                        />
                        <Area
                            type="monotone"
                            dataKey="ltc"
                            stackId="1"
                            stroke="hsl(var(--warning))"
                            fill="url(#colorLtc)"
                            name="Long Term Care"
                        />
                        <Area
                            type="monotone"
                            dataKey="irmaa"
                            stackId="1"
                            stroke="hsl(var(--danger))"
                            fill="url(#colorIrmaa)"
                            name="IRMAA Surcharge"
                        />
                        <Area
                            type="monotone"
                            dataKey="base"
                            stackId="1"
                            stroke="hsl(var(--info))"
                            fill="url(#colorBase)"
                            name="Medicare Base"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Total Cost & Breakdown Toggle */}
            <div style={{
                padding: 'var(--space-3)',
                background: 'hsla(var(--bg-surface) / 0.5)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Total Projected Cost</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                    {formatCurrency(totalLifetimeCost)}
                </span>
            </div>

            {/* Cost Breakdown per Member */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', paddingLeft: '4px' }}>
                    Cost Breakdown by Member
                </div>
                {memberCosts.map(m => (
                    <div key={m.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        padding: '8px',
                        background: 'hsla(var(--bg-void) / 0.3)',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'hsla(var(--text-primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                                {m.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ color: 'hsl(var(--text-primary))' }}>{m.name}</div>
                                <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
                                    {m.relation} · Age {m.age}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>{formatCurrency(m.total)}</div>
                            {m.irmaa > 0 && (
                                <div style={{ fontSize: '0.65rem', color: 'hsl(var(--danger))' }}>
                                    Incl. {formatCurrency(m.irmaa)} IRMAA
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                    onClick={() => setIncludeLTC(!includeLTC)}
                    className={`nav - btn ${includeLTC ? 'nav-btn-active' : ''} `}
                    style={{
                        fontSize: '0.7rem',
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '6px',
                        borderColor: includeLTC ? 'hsl(var(--warning))' : 'hsla(var(--text-primary)/0.1)',
                        color: includeLTC ? 'hsl(var(--warning))' : 'inherit'
                    }}
                >
                    <HeartPulse size={14} />
                    {includeLTC ? 'Disable LTC Stress' : 'Test LTC Event'}
                </button>
            </div>

            {/* Dynamic Alerts based on data */}
            {totalIRMAAPenalty > 100000 && (
                <div style={{
                    padding: 'var(--space-3)',
                    background: 'hsla(var(--danger) / 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(var(--danger) / 0.2)',
                    display: 'flex',
                    gap: 'var(--space-2)',
                    alignItems: 'flex-start'
                }}>
                    <ShieldAlert size={14} style={{ color: 'hsl(var(--danger))', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.4 }}>
                        <strong>Significant Surcharge:</strong> Your RMDs trigger {formatCurrency(totalIRMAAPenalty)} in IRMAA penalties.
                        Roth conversions could eliminate this cost.
                    </p>
                </div>
            )}
        </div>
    );
};

export default HealthcareModeler;
