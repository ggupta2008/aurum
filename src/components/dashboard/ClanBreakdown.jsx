import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { Users, PieChart as PieIcon, ArrowRight } from 'lucide-react';

const formatCurrency = (v) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: 'compact'
}).format(v);

const ClanBreakdown = ({ onShowReport }) => {
    const { profile, targetMembers } = useScopedWealth();

    // Group net worth by familyGroupId (only for members in scope)
    const branchTotals = {};
    let grandTotal = 0;

    // First pass: collect members per group to build proper names
    const groupMembers = {};
    targetMembers.forEach(m => {
        const gid = m.familyGroupId || 0;
        if (!groupMembers[gid]) groupMembers[gid] = [];
        groupMembers[gid].push(m);
    });

    // Build branch names based on actual members
    const getBranchName = (gid) => {
        const members = groupMembers[gid] || [];
        if (members.length === 0) return 'Unknown';

        // For the primary household (gid 0), use Self + Spouse names
        if (gid === 0) {
            const self = members.find(m => m.relation === 'Self');
            const spouse = members.find(m => m.relation === 'Spouse');
            if (self && spouse) return `${self.name} & ${spouse.name} `;
            if (self) return self.name;
            if (spouse) return spouse.name;
            return members[0].name;
        }

        // For other branches, use the primary member's name (or all if multiple)
        if (members.length === 1) return members[0].name;

        // If there's a couple in this branch (Sibling + Sibling Spouse)
        const primary = members.find(m => m.relation === 'Sibling' || m.relation === 'Child');
        const partner = members.find(m => (m.relation === 'Spouse' || m.relation === 'Sibling Spouse') && m !== primary);
        if (primary && partner) return `${primary.name} & ${partner.name} `;

        // Otherwise just use the first member's name
        return members[0].name;
    };

    targetMembers.forEach(m => {
        const gid = m.familyGroupId || 0;
        if (!branchTotals[gid]) {
            branchTotals[gid] = {
                name: getBranchName(gid),
                amount: 0
            };
        }

        const f = m.financials || {};
        const nw = (f.stocks || 0) + (f.retirement || 0) + (f.realEstate || 0) + (f.cash || 0) - (f.loans || 0);
        branchTotals[gid].amount += nw;
    });

    // Add household base financials to Group 0 if primary unit is in scope
    const isPrimaryUnitIncluded = targetMembers.some(m => m.relation === 'Self');
    if (isPrimaryUnitIncluded) {
        const h = profile.financials || {};
        const baseNW = (h.assets?.taxable || 0) + (h.assets?.taxDeferred || 0) + (h.assets?.taxFree || 0)
            - ((h.liabilities?.mortgage || 0) + (h.liabilities?.other || 0));

        if (!branchTotals[0]) {
            branchTotals[0] = { name: getBranchName(0), amount: 0 };
        }
        branchTotals[0].amount += baseNW;
    }

    // Calculate Grand Total from branchTotals
    Object.values(branchTotals).forEach(b => grandTotal += b.amount);

    const branches = Object.values(branchTotals).sort((a, b) => b.amount - a.amount);

    return (
        <div className="glass-panel anim-fade-up anim-delay-3" style={{ padding: 'var(--space-6)' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-6)'
            }}>
                <h3 style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'hsl(var(--gold-primary))',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                }}>
                    <PieIcon size={14} />
                    Clan Asset Distribution
                </h3>
                <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'white',
                    background: 'hsla(var(--gold-primary) / 0.1)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid hsla(var(--gold-primary) / 0.2)'
                }}>
                    {formatCurrency(grandTotal)} Total
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {branches.map((branch, idx) => {
                    const percentage = grandTotal > 0 ? (branch.amount / grandTotal) * 100 : 0;
                    return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: 'var(--radius-full)',
                                        background: idx === 0 ? 'hsl(var(--gold-primary))' : 'hsl(var(--text-dim))'
                                    }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{branch.name}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{formatCurrency(branch.amount)}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{percentage.toFixed(1)}% of Clan wealth</div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{
                                height: '6px',
                                background: 'hsla(var(--text-primary) / 0.05)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${percentage}% `,
                                    background: idx === 0
                                        ? 'linear-gradient(90deg, hsl(var(--gold-primary)), hsl(var(--gold-warm)))'
                                        : 'hsla(var(--text-primary) / 0.2)',
                                    borderRadius: 'var(--radius-full)',
                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid hsla(var(--text-primary) / 0.05)',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <button
                    onClick={onShowReport}
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem', color: 'hsl(var(--gold-primary))', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                >
                    Detailed Estate Report <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default ClanBreakdown;
