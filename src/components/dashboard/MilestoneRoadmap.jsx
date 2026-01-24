import React from 'react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import { GraduationCap, Landmark, Sun, AlertTriangle, Calendar } from 'lucide-react';

const MilestoneRoadmap = () => {
    const { targetMembers } = useScopedWealth();

    // Calculate upcoming milestones for members in the current scope
    const milestones = [];
    const currentYear = new Date().getFullYear();

    targetMembers.forEach(member => {
        // Retirement
        if (member.age < 65) {
            milestones.push({
                year: currentYear + (65 - member.age),
                name: `${member.name} Retires`,
                icon: Sun,
                color: 'hsl(var(--success))',
                desc: 'Earned income stops; transition to asset drawdown.'
            });
        }

        // Social Security
        if (member.age < 67) {
            milestones.push({
                year: currentYear + (67 - member.age),
                name: `${member.name} SS Benefits`,
                icon: Landmark,
                color: 'hsl(var(--gold-primary))',
                desc: 'Estimated $30k/yr Social Security income begins.'
            });
        }

        // RMDs
        if (member.age < 73) {
            milestones.push({
                year: currentYear + (73 - member.age),
                name: `${member.name} RMDs Hit`,
                icon: AlertTriangle,
                color: 'hsl(var(--danger))',
                desc: 'IRS forces Tax-Deferred withdrawals; peak marginal tax risk.'
            });
        }

        // College
        if (member.relation.includes('Child') && member.age < 18) {
            milestones.push({
                year: currentYear + (18 - member.age),
                name: `${member.name} Higher Ed`,
                icon: GraduationCap,
                color: 'hsl(var(--info))',
                desc: 'Estimated $50k/yr COA drag for 4 years.'
            });
        }
    });

    const sortedMilestones = milestones
        .sort((a, b) => a.year - b.year)
        .slice(0, 5); // Show next 5

    if (sortedMilestones.length === 0) return null;

    return (
        <div className="glass-panel anim-fade-up anim-delay-5" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'hsl(var(--gold-primary))',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
            }}>
                <Calendar size={14} />
                Strategic Milestone Roadmap
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {sortedMilestones.map((ms, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        gap: 'var(--space-4)',
                        paddingBottom: 'var(--space-4)',
                        borderBottom: idx === sortedMilestones.length - 1 ? 'none' : '1px solid hsla(var(--text-primary) / 0.05)'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            background: `hsla(${ms.color.split('(')[1].split(')')[0]} / 0.1)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: ms.color
                        }}>
                            <ms.icon size={16} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{ms.name}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>{ms.year}</span>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))', lineHeight: 1.4 }}>
                                {ms.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MilestoneRoadmap;
