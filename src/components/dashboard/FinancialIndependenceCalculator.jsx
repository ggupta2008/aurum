import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { calculateAfterTaxIncome } from '../../utils/taxCalculator';

const FinancialIndependenceCalculator = () => {
    const {
        scopedCurrentWealth,
        scopedSpending,
        scopedIncome,
        targetMembers,
        formatCurrency,
        profile
    } = useScopedWealth();

    // Calculate total household debt service (mortgages)
    const financials = profile?.financials || {};
    let totalAnnualDebtService = 0;

    // Clan-level mortgages
    const clanRE = financials.assets?.realEstate || [];
    if (Array.isArray(clanRE)) {
        clanRE.forEach(p => {
            if (p.mortgage && p.rate && p.termYears) {
                const P = parseFloat(p.mortgage) || 0;
                const r = parseFloat(p.rate) || 0.04;
                const N = parseInt(p.termYears) || 30;
                if (P > 0 && r > 0) {
                    const annualPayment = (P * r) / (1 - Math.pow(1 + r, -N));
                    totalAnnualDebtService += annualPayment;
                }
            }
        });
    }

    // Member-level mortgages
    targetMembers.forEach(member => {
        const memberRE = member.financials?.realEstate || [];
        if (Array.isArray(memberRE)) {
            memberRE.forEach(p => {
                if (p.mortgage && p.rate && p.termYears) {
                    const P = parseFloat(p.mortgage) || 0;
                    const r = parseFloat(p.rate) || 0.04;
                    const N = parseInt(p.termYears) || 30;
                    if (P > 0 && r > 0) {
                        const annualPayment = (P * r) / (1 - Math.pow(1 + r, -N));
                        totalAnnualDebtService += annualPayment;
                    }
                }
            });
        }
    });

    // Clan-level baseline spending
    const clanBaselineSpending = parseFloat(financials.spending) || 0;

    // Total household spending (clan + all members)
    const totalHouseholdSpending = scopedSpending;

    // Total household income (GROSS)
    const totalHouseholdGrossIncome = scopedIncome;

    // Number of earning members
    const earningMembers = targetMembers.filter(m => (m.financials?.income || 0) > 0);
    const numEarningMembers = earningMembers.length || 1;

    // Calculate safe withdrawal rate (4% rule)
    const safeWithdrawalAmount = scopedCurrentWealth * 0.04;
    const canRetireNow = safeWithdrawalAmount >= totalHouseholdSpending;

    // Calculate years until FI for each earning member
    const memberFIData = earningMembers.map(member => {
        const memberGrossIncome = parseFloat(member.financials?.income) || 0;
        const memberSpending = parseFloat(member.financials?.spending) || 0;
        const memberAge = member.age || 45;
        const retirementAge = member.retirementAge || 67;
        const memberState = member.state || 'CA';
        const currentYear = new Date().getFullYear();

        // Calculate after-tax income
        const taxResult = calculateAfterTaxIncome(memberGrossIncome, memberState, 'single');
        const memberAfterTaxIncome = taxResult.afterTaxIncome;
        const effectiveTaxRate = taxResult.effectiveTaxRate;

        // Calculate member's portion of net worth (simplified)
        const memberAssets = (parseFloat(member.financials?.stocks) || 0) +
            (parseFloat(member.financials?.retirement) || 0) +
            (parseFloat(member.financials?.taxFree) || 0) +
            (parseFloat(member.financials?.cash) || 0);

        // Allocate clan spending proportionally based on GROSS income contribution
        // (This is fair since taxes are already deducted from after-tax income)
        const incomeShare = totalHouseholdGrossIncome > 0 ? memberGrossIncome / totalHouseholdGrossIncome : 1 / numEarningMembers;
        const allocatedClanSpending = clanBaselineSpending * incomeShare;
        const allocatedDebtService = totalAnnualDebtService * incomeShare;

        // Total spending = member spending + allocated clan spending + allocated debt service
        const totalMemberSpending = memberSpending + allocatedClanSpending + allocatedDebtService;

        // Annual savings (AFTER-TAX income - spending)
        const annualSavings = Math.max(0, memberAfterTaxIncome - totalMemberSpending);
        const savingsRate = memberAfterTaxIncome > 0 ? (annualSavings / memberAfterTaxIncome) * 100 : 0;

        // FI Number (25x annual spending - 4% rule)
        const fiNumber = totalMemberSpending * 25;

        // Years to FI (simplified calculation assuming 7% real returns)
        let yearsToFI = 0;
        if (annualSavings > 0 && memberAssets < fiNumber) {
            let wealth = memberAssets;
            while (wealth < fiNumber && yearsToFI < 50) {
                wealth = wealth * 1.07 + annualSavings;
                yearsToFI++;
            }
        } else if (memberAssets >= fiNumber) {
            yearsToFI = 0; // Already FI
        } else {
            yearsToFI = null; // Cannot reach FI with current savings
        }

        const fiAge = yearsToFI !== null ? memberAge + yearsToFI : null;
        const fiYear = yearsToFI !== null ? currentYear + yearsToFI : null;

        return {
            name: member.name,
            memberAge,
            retirementAge,
            memberGrossIncome,
            memberAfterTaxIncome,
            effectiveTaxRate,
            totalTaxes: taxResult.totalTax,
            taxBreakdown: taxResult.breakdown,
            memberSpending,
            allocatedClanSpending,
            allocatedDebtService,
            totalMemberSpending,
            annualSavings,
            savingsRate,
            memberAssets,
            fiNumber,
            yearsToFI,
            fiAge,
            fiYear,
            canRetireNow: memberAssets >= fiNumber,
            incomeShare: incomeShare * 100,
            state: memberState
        };
    });

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <Calendar size={20} className="text-gold" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Financial Independence Calculator
                </h3>
            </div>

            {/* Household FI Status */}
            <div style={{
                padding: 'var(--space-4)',
                background: canRetireNow ? 'hsla(var(--success) / 0.1)' : 'hsla(var(--warning) / 0.1)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${canRetireNow ? 'hsla(var(--success) / 0.3)' : 'hsla(var(--warning) / 0.3)'}`,
                marginBottom: 'var(--space-5)'
            }}>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Household Status
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: canRetireNow ? 'hsl(var(--success))' : 'hsl(var(--warning))', marginBottom: '8px' }}>
                    {canRetireNow ? '✓ Financially Independent' : '⏳ Working Toward FI'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                    <strong>Safe Withdrawal (4% Rule):</strong> {formatCurrency(safeWithdrawalAmount)}/year
                    <br />
                    <strong>Current Spending:</strong> {formatCurrency(scopedSpending)}/year
                    <br />
                    {canRetireNow ? (
                        <span style={{ color: 'hsl(var(--success))' }}>
                            Your portfolio can sustain current lifestyle indefinitely
                        </span>
                    ) : (
                        <span style={{ color: 'hsl(var(--warning))' }}>
                            Need {formatCurrency(scopedSpending * 25)} for full FI (currently {formatCurrency(scopedCurrentWealth)})
                        </span>
                    )}
                </div>
            </div>

            {/* Individual Member FI Timelines */}
            {memberFIData.length > 0 && (
                <div>
                    <h4 style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>
                        Individual Member Timelines
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {memberFIData.map((m, idx) => (
                            <div key={idx} style={{
                                padding: 'var(--space-4)',
                                background: 'hsla(var(--bg-void) / 0.3)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid hsla(var(--text-primary) / 0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>
                                            Age {m.memberAge} • Planned Retirement: {m.retirementAge}
                                        </div>
                                    </div>
                                    {m.canRetireNow ? (
                                        <div style={{
                                            padding: '4px 12px',
                                            background: 'hsla(var(--success) / 0.2)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            color: 'hsl(var(--success))'
                                        }}>
                                            FI ACHIEVED
                                        </div>
                                    ) : m.yearsToFI !== null ? (
                                        <div style={{
                                            padding: '4px 12px',
                                            background: 'hsla(var(--gold-primary) / 0.1)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            color: 'hsl(var(--gold-primary))'
                                        }}>
                                            FI in {m.yearsToFI} years
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '4px 12px',
                                            background: 'hsla(var(--danger) / 0.1)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            color: 'hsl(var(--danger))'
                                        }}>
                                            INCREASE SAVINGS
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', fontSize: '0.7rem', marginBottom: 'var(--space-3)' }}>
                                    <div>
                                        <div style={{ color: 'hsl(var(--text-muted))', marginBottom: '2px' }}>Gross Income</div>
                                        <div style={{ fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>{formatCurrency(m.memberGrossIncome)}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'hsl(var(--text-muted))', marginBottom: '2px' }}>Taxes ({(m.effectiveTaxRate * 100).toFixed(1)}%)</div>
                                        <div style={{ fontWeight: 600, color: 'hsl(var(--danger))' }}>-{formatCurrency(m.totalTaxes)}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'hsl(var(--text-muted))', marginBottom: '2px' }}>After-Tax Income</div>
                                        <div style={{ fontWeight: 600, color: 'hsl(var(--success))' }}>{formatCurrency(m.memberAfterTaxIncome)}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'hsl(var(--text-muted))', marginBottom: '2px' }}>Savings Rate</div>
                                        <div style={{ fontWeight: 600, color: m.savingsRate >= 20 ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>
                                            {m.savingsRate.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Tax Breakdown */}
                                <div style={{
                                    padding: 'var(--space-2)',
                                    background: 'hsla(var(--bg-void) / 0.2)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.65rem',
                                    color: 'hsl(var(--text-dim))',
                                    marginBottom: 'var(--space-3)'
                                }}>
                                    <div style={{ marginBottom: '4px', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>Tax Breakdown ({m.state}):</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Federal:</span>
                                        <span>{formatCurrency(m.taxBreakdown.federal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>FICA (SS + Medicare):</span>
                                        <span>{formatCurrency(m.taxBreakdown.fica)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>State ({m.state}):</span>
                                        <span>{formatCurrency(m.taxBreakdown.state)}</span>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: 'var(--space-3)',
                                    paddingTop: 'var(--space-3)',
                                    borderTop: '1px solid hsla(var(--text-primary) / 0.05)',
                                    fontSize: '0.7rem',
                                    color: 'hsl(var(--text-dim))',
                                    lineHeight: 1.5
                                }}>
                                    <div style={{ marginBottom: 'var(--space-3)', fontSize: '0.65rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>
                                        Spending Breakdown ({m.incomeShare.toFixed(1)}% of household income)
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Personal Spending:</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(m.memberSpending)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Allocated Clan Spending:</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(m.allocatedClanSpending)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Allocated Mortgage/Debt:</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(m.allocatedDebtService)}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '8px',
                                        paddingTop: '8px',
                                        borderTop: '1px solid hsla(var(--text-primary) / 0.05)',
                                        fontWeight: 700,
                                        color: 'hsl(var(--text-secondary))'
                                    }}>
                                        <span>Total Annual Spending:</span>
                                        <span>{formatCurrency(m.totalMemberSpending)}</span>
                                    </div>

                                    <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid hsla(var(--text-primary) / 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span>Current Assets:</span>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(m.memberAssets)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span>FI Number (25x spending):</span>
                                            <span style={{ fontWeight: 600, color: 'hsl(var(--gold-primary))' }}>{formatCurrency(m.fiNumber)}</span>
                                        </div>
                                        {m.fiYear && !m.canRetireNow && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: 'hsl(var(--gold-primary))' }}>
                                                <span>Can Stop Working:</span>
                                                <span style={{ fontWeight: 700 }}>{m.fiYear} (Age {m.fiAge})</span>
                                            </div>
                                        )}
                                        {m.yearsToFI === null && (
                                            <div style={{ marginTop: '8px', color: 'hsl(var(--danger))', fontSize: '0.65rem' }}>
                                                ⚠️ Current savings insufficient - increase income or reduce spending
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                background: 'hsla(var(--gold-primary) / 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsla(var(--gold-primary) / 0.1)',
                fontSize: '0.65rem',
                color: 'hsl(var(--text-dim))',
                lineHeight: 1.5
            }}>
                <strong style={{ color: 'hsl(var(--gold-primary))' }}>💡 Methodology:</strong> FI calculations use the 4% Safe Withdrawal Rate (25x annual spending). Projections assume 7% real returns and current savings rates.
                <br /><br />
                <strong>Tax Calculations:</strong> Uses 2024 federal tax brackets with standard deduction, FICA taxes (Social Security + Medicare), and state income taxes based on member's residence. Savings rate calculated from after-tax income for accurate cash flow modeling.
                <br /><br />
                <strong>Allocation Logic:</strong> Clan-level spending and mortgage payments are allocated to each earning member proportionally based on their gross income contribution to the household. This ensures fair distribution of shared expenses when calculating individual FI timelines.
                <br /><br />
                Set retirement age in "The Vault" to model income cessation in projections.
            </div>
        </div>
    );
};

export default FinancialIndependenceCalculator;
