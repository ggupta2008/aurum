import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Shield, TrendingDown, Users, Download, X } from 'lucide-react';

const formatCurrency = (v) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
}).format(v);

const EstateReport = ({ onClose }) => {
    const { profile, planningScope, targetMembers, scopedCurrentWealth } = useScopedWealth();

    // Aggregation Logic (Scoped Level)
    let grossEstate = 0;
    const branchBreakdown = [];

    // Clan Members in Scope
    const groupTotals = {};

    targetMembers.forEach(m => {
        const gid = m.familyGroupId || 0;
        if (!groupTotals[gid]) {
            // Build a better name for the branch
            let branchName = gid === 0 ? 'Core Family' : `${m.name}'s Branch`;
            groupTotals[gid] = { name: branchName, amount: 0 };
        }
        const f = m.financials || {};
        groupTotals[gid].amount += (f.stocks || 0) + (f.retirement || 0) + (f.realEstate || 0) + (f.cash || 0) - (f.loans || 0);
    });

    // Add household base financials if primary unit is in scope
    const isPrimaryUnitIncluded = targetMembers.some(m => m.relation === 'Self');
    if (isPrimaryUnitIncluded) {
        const h = profile.financials || {};
        const baseNW = (h.assets?.taxable || 0) + (h.assets?.taxDeferred || 0) + (h.assets?.taxFree || 0)
            - ((h.liabilities?.mortgage || 0) + (h.liabilities?.other || 0));

        if (groupTotals[0]) {
            groupTotals[0].amount += baseNW;
        }
    }

    Object.values(groupTotals).forEach(b => {
        grossEstate += b.amount;
        branchBreakdown.push(b);
    });

    // Estate Tax Logic (2024/2025 Rules)
    const exemption = 13610000; // Federal Exemption (per individual)
    const hasSpouse = targetMembers.some(m => m.relation === 'Spouse' || m.relation === 'Sibling Spouse');
    const totalExemption = hasSpouse ? exemption * 2 : exemption;

    const taxableEstate = Math.max(0, grossEstate - totalExemption);
    const estimatedTax = taxableEstate * 0.40; // 40% Federal rate
    const netEstate = grossEstate - estimatedTax;

    const reportTitle = planningScope === 'household' ? 'Clan Estate Analysis' : 'Unit Estate Analysis';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-10)'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90%',
                overflow: 'auto',
                padding: 'var(--space-10)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)', background: 'transparent', border: 'none', color: 'hsl(var(--text-dim))', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                    <Shield size={48} className="text-gold" style={{ marginBottom: 'var(--space-4)' }} />
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Clan Estate Analysis</h2>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Confidential Wealth Transfer Reporting</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-10)',
                    marginBottom: 'var(--space-10)'
                }}>
                    {/* Valuations */}
                    <div>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', marginBottom: 'var(--space-6)', borderBottom: '1px solid hsla(var(--gold-primary) / 0.1)', paddingBottom: '4px' }}>
                            Executive Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'hsl(var(--text-muted))' }}>Gross Clan Estate Value</span>
                                <span style={{ fontWeight: 700 }}>{formatCurrency(grossEstate)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'hsl(var(--text-muted))' }}>Combined Federal Exemption</span>
                                <span style={{ color: 'hsl(var(--success))' }}>({formatCurrency(totalExemption)})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid hsla(var(--text-primary) / 0.1)', paddingTop: 'var(--space-4)' }}>
                                <span style={{ color: 'hsl(var(--text-muted))' }}>Taxable Estate Exposure</span>
                                <span style={{ color: estimatedTax > 0 ? 'hsl(var(--danger))' : 'white', fontWeight: 700 }}>{formatCurrency(taxableEstate)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'hsla(var(--danger) / 0.05)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color: 'hsl(var(--text-primary))', fontWeight: 600 }}>Est. Federal Liquidity Requirement (40%)</span>
                                <span style={{ color: 'hsl(var(--danger))', fontWeight: 800 }}>{formatCurrency(estimatedTax)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Branch Breakdown */}
                    <div>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--gold-primary))', textTransform: 'uppercase', marginBottom: 'var(--space-6)', borderBottom: '1px solid hsla(var(--gold-primary) / 0.1)', paddingBottom: '4px' }}>
                            Branch Contributions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {branchBreakdown.sort((a, b) => b.amount - a.amount).map(b => (
                                <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Users size={14} style={{ color: 'hsl(var(--text-dim))' }} />
                                        <span>{b.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(b.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Strategy Wisdom */}
                <div className="glass-panel" style={{ padding: 'var(--space-6)', border: '1px solid hsla(var(--gold-primary) / 0.2)', background: 'hsla(var(--gold-primary) / 0.03)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.9rem', color: 'hsl(var(--gold-primary))', marginBottom: 'var(--space-3)' }}>
                        <Shield size={16} />
                        Leimberg Trust Advice
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
                        {grossEstate > totalExemption
                            ? `⚠️ Your Clan Estate exceeds the federal exemption. Without sophisticated freezing strategies (e.g., IDGTs or SLATs), your heirs face an immediate liquidity event requiring ${formatCurrency(estimatedTax)} in cash. Consider funding a CLAT to freeze valuation while satisfying charitable objectives.`
                            : `✅ Your Clan Estate is currently within the combined federal exemption of ${formatCurrency(totalExemption)}. Focus on "Step-Up in Basis" optimization within the core household while using sibling branches to shield market-growth assets.`
                        }
                    </p>
                </div>

                <div style={{ marginTop: 'var(--space-10)', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Download size={18} /> Export Formal PDF Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EstateReport;
