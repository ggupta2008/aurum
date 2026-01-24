import React from 'react';
import { useWealth } from '../context/WealthContext';
import { Users, Plus, Trash2, Shield, Lock, DollarSign, MapPin, Flag, TrendingUp, CreditCard } from 'lucide-react';

const InputField = ({ label, value, onChange, icon: Icon, type = "number" }) => (
    <div style={{ marginBottom: 'var(--space-3)' }}>
        <label style={{
            display: 'block',
            fontSize: '0.7rem',
            color: 'hsl(var(--text-muted))',
            marginBottom: 'var(--space-1)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            {Icon && (
                <Icon
                    size={14}
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'hsl(var(--text-dim))'
                    }}
                />
            )}
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    paddingLeft: Icon ? '36px' : 'var(--space-3)',
                    background: 'hsla(var(--bg-void) / 0.4)',
                    border: '1px solid hsla(var(--text-primary) / 0.1)'
                }}
            />
        </div>
    </div>
);

const SelectField = ({ label, value, options, onChange }) => (
    <div style={{ marginBottom: 'var(--space-3)' }}>
        <label style={{
            display: 'block',
            fontSize: '0.7rem',
            color: 'hsl(var(--text-muted))',
            marginBottom: 'var(--space-1)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}>{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="glass-panel"
            style={{
                width: '100%',
                padding: 'var(--space-3)',
                background: 'hsla(var(--bg-void) / 0.4)',
                border: '1px solid hsla(var(--text-primary) / 0.1)',
                color: 'white',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)'
            }}
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const PortfolioView = () => {
    const { profile, addFamilyMember, updateFamilyMember, removeFamilyMember } = useWealth();

    // Group members by familyGroupId
    const groups = {};
    profile.family.forEach((m, idx) => {
        const gid = m.familyGroupId || 0;
        if (!groups[gid]) groups[gid] = [];
        groups[gid].push({ ...m, originalIndex: idx });
    });

    const handleMemberUpdate = (idx, field, val) => {
        updateFamilyMember(idx, { [field]: val });
    };

    const handleFinancialUpdate = (idx, field, val) => {
        const member = profile.family[idx];
        const newFinancials = {
            ...(member.financials || { income: 0, stocks: 0, retirement: 0, realEstate: 0, cash: 0, loans: 0 }),
            [field]: parseFloat(val) || 0
        };
        updateFamilyMember(idx, { financials: newFinancials });
    };

    const createNewBranch = () => {
        const maxGid = Math.max(...profile.family.map(m => m.familyGroupId || 0));
        const newGid = maxGid + 1;
        addFamilyMember(newGid, 'Sibling');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            height: '100%',
            overflow: 'auto',
            paddingRight: 'var(--space-2)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Dynastic Portfolio</h2>
                    <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>
                        Manage "The Clan" — Organize core family and sibling branches for cumulative wealth intelligence.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                        onClick={createNewBranch}
                        className="btn btn-ghost gold-border"
                        style={{ padding: 'var(--space-2) var(--space-5)' }}
                    >
                        <Plus size={18} /> Add Sibling Branch
                    </button>
                </div>
            </div>

            {Object.keys(groups).sort((a, b) => a - b).map((gid, gIdx) => (
                <div key={gid} className="anim-fade-up" style={{ animationDelay: `${gIdx * 0.15}s` }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-4)',
                        padding: '0 var(--space-2)'
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: gid == 0 ? 'hsl(var(--gold-primary))' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)'
                        }}>
                            <Users size={18} />
                            {(() => {
                                const groupMembers = groups[gid];
                                const head = groupMembers.find(m => m.relation === 'Self' || m.relation === 'Sibling');
                                const spouse = groupMembers.find(m => m.relation === 'Spouse' || m.relation === 'Sibling Spouse');
                                if (head && spouse) return `${head.name} & ${spouse.name}'s Family`;
                                if (head) return `${head.name}'s Family`;
                                return 'New Family Branch';
                            })()}
                        </h3>
                        <button
                            onClick={() => addFamilyMember(parseInt(gid), gid == 0 ? 'Child' : 'Sibling Child')}
                            className="btn-ghost"
                            style={{ fontSize: '0.75rem', opacity: 0.7 }}
                        >
                            <Plus size={14} /> Add Member to this Branch
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                        gap: 'var(--space-6)'
                    }}>
                        {groups[gid].map((member) => (
                            <div
                                key={member.id}
                                className="glass-panel"
                                style={{
                                    padding: 'var(--space-6)',
                                    position: 'relative',
                                    borderTop: member.relation === 'Self' ? '3px solid hsl(var(--gold-primary))' : '1px solid hsla(var(--text-primary) / 0.06)'
                                }}
                            >
                                {member.relation !== 'Self' && (
                                    <button
                                        onClick={() => removeFamilyMember(member.originalIndex)}
                                        style={{
                                            position: 'absolute',
                                            top: 'var(--space-4)',
                                            right: 'var(--space-4)',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'hsl(var(--text-dim))',
                                            cursor: 'pointer'
                                        }}
                                        className="btn-hover-danger"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: 'var(--radius-md)',
                                        background: member.familyGroupId === 0 ? 'hsla(var(--gold-primary) / 0.1)' : 'hsla(var(--info) / 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Users size={24} style={{ color: member.familyGroupId === 0 ? 'hsl(var(--gold-primary))' : 'hsl(var(--info))' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            value={member.name}
                                            onChange={(e) => handleMemberUpdate(member.originalIndex, 'name', e.target.value)}
                                            style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 700,
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'white',
                                                padding: 0,
                                                width: '100%',
                                                outline: 'none'
                                            }}
                                        />
                                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                                            {member.relation} • Age {member.age}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <h4 style={{ fontSize: '0.8rem', color: 'hsl(var(--gold-primary))', marginBottom: 'var(--space-4)', borderBottom: '1px solid hsla(var(--gold-primary) / 0.1)', paddingBottom: '4px' }}>
                                            Governance & Location
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                            <InputField
                                                label="Age"
                                                value={member.age}
                                                onChange={(v) => handleMemberUpdate(member.originalIndex, 'age', parseInt(v))}
                                            />
                                            <SelectField
                                                label="Relation"
                                                value={member.relation}
                                                onChange={(v) => handleMemberUpdate(member.originalIndex, 'relation', v)}
                                                options={gid == 0 ? [
                                                    { label: 'Self', value: 'Self' },
                                                    { label: 'Spouse', value: 'Spouse' },
                                                    { label: 'Child', value: 'Child' },
                                                    { label: 'Parent', value: 'Parent' },
                                                    { label: 'Other', value: 'Other' }
                                                ] : [
                                                    { label: 'Sibling (Head)', value: 'Sibling' },
                                                    { label: 'Sibling Spouse', value: 'Sibling Spouse' },
                                                    { label: 'Sibling Child', value: 'Sibling Child' },
                                                    { label: 'Other', value: 'Other' }
                                                ]}
                                            />
                                            <SelectField
                                                label="Residency"
                                                value={member.residency}
                                                onChange={(v) => handleMemberUpdate(member.originalIndex, 'residency', v)}
                                                options={[
                                                    { label: 'US Citizen', value: 'US_Citizen' },
                                                    { label: 'Green Card', value: 'Green_Card' },
                                                    { label: 'Non-Resident', value: 'Non_Resident' }
                                                ]}
                                            />
                                            <SelectField
                                                label="State Domicile"
                                                value={member.state}
                                                onChange={(v) => handleMemberUpdate(member.originalIndex, 'state', v)}
                                                options={[
                                                    { label: 'California', value: 'CA' },
                                                    { label: 'New York', value: 'NY' },
                                                    { label: 'Texas', value: 'TX' },
                                                    { label: 'Florida', value: 'FL' },
                                                    { label: 'Washington', value: 'WA' },
                                                    { label: 'Nevada', value: 'NV' }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: 'span 2', marginTop: 'var(--space-2)' }}>
                                        <h4 style={{ fontSize: '0.8rem', color: 'hsl(var(--gold-primary))', marginBottom: 'var(--space-4)', borderBottom: '1px solid hsla(var(--gold-primary) / 0.1)', paddingBottom: '4px' }}>
                                            Individual Financials
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                            <InputField
                                                label="Annual Income"
                                                icon={DollarSign}
                                                value={member.financials?.income}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'income', v)}
                                            />
                                            <InputField
                                                label="Annual Spending"
                                                icon={CreditCard}
                                                value={member.financials?.spending}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'spending', v)}
                                            />
                                            <InputField
                                                label="Liquid Cash"
                                                icon={DollarSign}
                                                value={member.financials?.cash}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'cash', v)}
                                            />
                                            <InputField
                                                label="Stock Portfolio"
                                                icon={TrendingUp}
                                                value={member.financials?.stocks}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'stocks', v)}
                                            />
                                            <InputField
                                                label="Retirement Accounts"
                                                icon={Lock}
                                                value={member.financials?.retirement}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'retirement', v)}
                                            />
                                            <InputField
                                                label="Tax-Free (Roth/HSA)"
                                                icon={Shield}
                                                value={member.financials?.taxFree}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'taxFree', v)}
                                            />
                                            <InputField
                                                label="Real Estate"
                                                icon={MapPin}
                                                value={member.financials?.realEstate}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'realEstate', v)}
                                            />
                                            <InputField
                                                label="Personal Loans / Debt"
                                                icon={Flag}
                                                value={member.financials?.loans}
                                                onChange={(v) => handleFinancialUpdate(member.originalIndex, 'loans', v)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PortfolioView;
