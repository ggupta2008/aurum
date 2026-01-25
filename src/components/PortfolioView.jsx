import React from 'react';
import { useWealth } from '../context/WealthContext';
import { Users, Plus, Trash2, Shield, Lock, DollarSign, MapPin, Flag, TrendingUp, CreditCard, Sparkles, Wand2, Home } from 'lucide-react';
import { deriveEquityData } from '../utils/engine/equityIntelligence';

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
                    border: '1px solid hsla(var(--text-primary) / 0.1)',
                    width: '100%',
                    color: 'white',
                    fontSize: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    paddingTop: 'var(--space-2)',
                    paddingBottom: 'var(--space-2)'
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
            style={{
                width: '100%',
                padding: 'var(--space-3)',
                background: 'hsla(var(--bg-void) / 0.4)',
                border: '1px solid hsla(var(--text-primary) / 0.1)',
                color: 'white',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                outline: 'none'
            }}
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const RealEstateManager = ({ assets, onChange }) => {
    const safeAssets = Array.isArray(assets) ? assets : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {safeAssets.map((asset, idx) => (
                <div key={asset.id || idx} className="glass-panel" style={{ padding: 'var(--space-4)', background: 'hsla(var(--bg-void) / 0.3)', border: '1px solid hsla(var(--text-primary) / 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Home size={14} className="text-gold" />
                            <input
                                value={asset.name}
                                onChange={(e) => {
                                    const newAssets = [...safeAssets];
                                    newAssets[idx] = { ...asset, name: e.target.value };
                                    onChange(newAssets);
                                }}
                                style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.85rem', outline: 'none' }}
                                placeholder="Property Name"
                            />
                        </div>
                        <button
                            onClick={() => onChange(safeAssets.filter((_, i) => i !== idx))}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-dim))' }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
                        <SelectField
                            label="Type"
                            value={asset.type}
                            options={[{ label: 'Primary', value: 'primary' }, { label: 'Rental', value: 'rental' }]}
                            onChange={(v) => {
                                const newAssets = [...safeAssets];
                                newAssets[idx] = { ...asset, type: v };
                                onChange(newAssets);
                            }}
                        />
                        <InputField label="Current Value" value={asset.value} onChange={(v) => {
                            const newAssets = [...safeAssets];
                            newAssets[idx] = { ...asset, value: parseFloat(v) || 0 };
                            onChange(newAssets);
                        }} />
                        {asset.type === 'rental' && (
                            <>
                                <InputField label="Annual Gross Income" value={asset.annualIncome} onChange={(v) => {
                                    const newAssets = [...safeAssets];
                                    newAssets[idx] = { ...asset, annualIncome: parseFloat(v) || 0 };
                                    onChange(newAssets);
                                }} />
                                <InputField label="Property Tax (Annual)" value={asset.propertyTax} onChange={(v) => {
                                    const newAssets = [...safeAssets];
                                    newAssets[idx] = { ...asset, propertyTax: parseFloat(v) || 0 };
                                    onChange(newAssets);
                                }} />
                                <InputField label="Mgmt Fees (Annual)" value={asset.managementFee} onChange={(v) => {
                                    const newAssets = [...safeAssets];
                                    newAssets[idx] = { ...asset, managementFee: parseFloat(v) || 0 };
                                    onChange(newAssets);
                                }} />
                            </>
                        )}
                        <InputField label="Mortgage Balance" value={asset.mortgage} onChange={(v) => {
                            const newAssets = [...safeAssets];
                            newAssets[idx] = { ...asset, mortgage: parseFloat(v) || 0 };
                            onChange(newAssets);
                        }} />
                        <InputField label="Rate %" value={asset.rate * 100} onChange={(v) => {
                            const newAssets = [...safeAssets];
                            newAssets[idx] = { ...asset, rate: (parseFloat(v) || 0) / 100 };
                            onChange(newAssets);
                        }} />
                        <InputField label="Remaining Yrs" value={asset.termYears} onChange={(v) => {
                            const newAssets = [...safeAssets];
                            newAssets[idx] = { ...asset, termYears: parseInt(v) || 30 };
                            onChange(newAssets);
                        }} />
                    </div>
                </div>
            ))}
            <button
                onClick={() => onChange([...safeAssets, { id: Date.now(), name: 'New Property', type: 'primary', value: 0, mortgage: 0, rate: 0.04, termYears: 30, annualIncome: 0, propertyTax: 0, managementFee: 0 }])}
                className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
                <Plus size={12} /> Add Real Estate
            </button>
        </div>
    );
};

const EquityManager = ({ positions, onChange }) => {
    const safePositions = Array.isArray(positions) ? positions : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {safePositions.map((pos, idx) => (
                <div key={pos.id || idx} className="glass-panel" style={{ padding: 'var(--space-3)', background: 'hsla(var(--bg-void) / 0.2)', display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) minmax(100px, 1.25fr) minmax(80px, 1fr) 30px', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', marginBottom: '2px', textTransform: 'uppercase' }}>Ticker</div>
                        <input
                            value={pos.ticker}
                            onChange={(e) => {
                                const newP = [...safePositions];
                                newP[idx] = { ...pos, ticker: e.target.value.toUpperCase() };
                                onChange(newP);
                            }}
                            placeholder="SPY"
                            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--gold-primary))', fontWeight: 700, fontSize: '0.85rem', outline: 'none', width: '100%' }}
                        />
                    </div>
                    <InputField label="Value" value={pos.value} onChange={(v) => {
                        const newP = [...safePositions];
                        newP[idx] = { ...pos, value: parseFloat(v) || 0 };
                        onChange(newP);
                    }} />
                    <InputField label="Yield %" value={(pos.dividendYield || 0) * 100} onChange={(v) => {
                        const newP = [...safePositions];
                        newP[idx] = { ...pos, dividendYield: (parseFloat(v) || 0) / 100 };
                        onChange(newP);
                    }} />
                    <button onClick={() => {
                        const newP = safePositions.filter((_, i) => i !== idx);
                        onChange(newP);
                    }} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', alignSelf: 'center', marginTop: '12px' }}><Trash2 size={14} /></button>
                </div>
            ))}
            <button onClick={() => {
                onChange([...safePositions, { id: Date.now(), ticker: '', description: '', value: 0, costBasis: 0, taxStatus: 'taxable', dividendYield: 0.015 }]);
            }} className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={12} /> Add Equity
            </button>
        </div>
    );
};

const LiabilityManager = ({ liabilities, onChange }) => {
    const safeLiab = Array.isArray(liabilities) ? liabilities : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {safeLiab.map((liab, idx) => (
                <div key={liab.id || idx} className="glass-panel" style={{ padding: 'var(--space-3) var(--space-4)', background: 'hsla(var(--bg-void) / 0.3)', display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 30px', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <input
                        value={liab.name}
                        onChange={(e) => {
                            const newLiab = [...safeLiab];
                            newLiab[idx] = { ...liab, name: e.target.value };
                            onChange(newLiab);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.75rem', outline: 'none' }}
                        placeholder="Debt Name"
                    />
                    <InputField label="Balance" value={liab.balance} onChange={(v) => {
                        const newLiab = [...safeLiab];
                        newLiab[idx] = { ...liab, balance: parseFloat(v) || 0 };
                        onChange(newLiab);
                    }} />
                    <InputField label="Rate %" value={liab.rate * 100} onChange={(v) => {
                        const newLiab = [...safeLiab];
                        newLiab[idx] = { ...liab, rate: (parseFloat(v) || 0) / 100 };
                        onChange(newLiab);
                    }} />
                    <InputField label="Years" value={liab.term} onChange={(v) => {
                        const newLiab = [...safeLiab];
                        newLiab[idx] = { ...liab, term: parseInt(v) || 5 };
                        onChange(newLiab);
                    }} />
                    <button
                        onClick={() => onChange(safeLiab.filter((_, i) => i !== idx))}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-dim))' }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            <button
                onClick={() => onChange([...safeLiab, { id: Date.now(), name: 'New Loan', balance: 0, rate: 0.06, term: 5 }])}
                className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
                <Plus size={12} /> Add Clan Debt
            </button>
        </div>
    );
};

const PortfolioView = () => {
    const { profile, addFamilyMember, updateFamilyMember, removeFamilyMember, updateProfile, formatCurrency } = useWealth();

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
            ...(member.financials || {}),
            [field]: Array.isArray(val) ? val : (parseFloat(val) || 0)
        };
        updateFamilyMember(idx, { financials: newFinancials });
    };

    const createNewBranch = () => {
        const maxGid = Math.max(...profile.family.map(m => m.familyGroupId || 0));
        addFamilyMember(maxGid + 1, 'Sibling');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', height: '100%', overflow: 'auto', paddingRight: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Dynastic Portfolio</h2>
                    <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Manage core family and sibling branches.</p>
                </div>
                <button onClick={createNewBranch} className="btn-ghost" style={{ border: '1px solid hsla(var(--gold-primary) / 0.3)', padding: 'var(--space-2) var(--space-4)' }}>
                    <Plus size={18} /> Add Branch
                </button>
            </div>

            {/* --- CLAN LAYER (SHARED) --- */}
            <div className="glass-panel" style={{ padding: 'var(--space-6)', border: '1px solid hsla(var(--gold-primary) / 0.1)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--gold-primary))', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', textTransform: 'uppercase' }}>
                    <Shield size={18} /> Clan Shared Core
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
                    <div>
                        <h4 style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Real Estate (Primary & Rental)</h4>
                        <RealEstateManager
                            assets={profile.financials?.assets?.realEstate}
                            onChange={(vals) => {
                                const newFin = { ...profile.financials };
                                newFin.assets = { ...newFin.assets, realEstate: vals };
                                updateProfile({ financials: newFin });
                            }}
                        />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Consolidated Clan Debt</h4>
                        <LiabilityManager
                            liabilities={profile.financials?.liabilities}
                            onChange={(vals) => {
                                updateProfile({ financials: { ...profile.financials, liabilities: vals } });
                            }}
                        />
                        <div style={{ marginTop: 'var(--space-6)' }}>
                            <InputField label="Household Cash Reserve" icon={DollarSign} value={profile.financials?.assets?.cash} onChange={(v) => {
                                const newFin = { ...profile.financials };
                                newFin.assets = { ...newFin.assets, cash: parseFloat(v) || 0 };
                                updateProfile({ financials: newFin });
                            }} />
                        </div>
                        <div style={{ marginTop: 'var(--space-4)' }}>
                            <InputField label="Household Baseline Spending" icon={CreditCard} value={profile.financials?.spending} onChange={(v) => {
                                updateProfile({ financials: { ...profile.financials, spending: parseFloat(v) || 0 } });
                            }} />
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Equities & Clan Positions</h4>
                        <EquityManager
                            positions={profile.financials?.assets?.positions}
                            onChange={(vals) => {
                                const newFin = { ...profile.financials };
                                newFin.assets = { ...newFin.assets, positions: vals };
                                updateProfile({ financials: newFin });
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* --- SIBLING BRANCHES --- */}
            {Object.keys(groups).sort((a, b) => a - b).map((gid, gIdx) => (
                <div key={gid} className="anim-fade-up" style={{ animationDelay: `${gIdx * 0.1}s` }}>
                    <div style={{ padding: 'var(--space-4) 0', borderBottom: '1px solid hsla(var(--text-primary) / 0.05)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Users size={18} className="text-gold" />
                            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Branch Group {gid === '0' ? '(Primary)' : `#${gid}`}</h3>
                        </div>
                        {(() => {
                            let branchNW = 0;
                            groups[gid].forEach(m => {
                                const f = m.financials || {};
                                branchNW += (f.stocks || 0) + (f.retirement || 0) + (Array.isArray(f.realEstate) ? f.realEstate.reduce((acc, p) => acc + (p.value || 0) - (p.mortgage || 0), 0) : (f.realEstate || 0)) + (f.cash || 0) - (f.loans || 0);
                            });
                            return (
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--success))', background: 'hsla(var(--success) / 0.1)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                                    Branch Wealth: {formatCurrency(branchNW)}
                                </div>
                            );
                        })()}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))', gap: 'var(--space-6)' }}>
                        {groups[gid].map((member) => (
                            <div key={member.name} className="glass-panel" style={{ padding: 'var(--space-6)', position: 'relative' }}>
                                {member.relation !== 'Self' && (
                                    <button onClick={() => removeFamilyMember(member.originalIndex)} style={{ position: 'absolute', top: '16px', right: '16px', color: 'hsl(var(--text-dim))', background: 'transparent', border: 'none' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)' }}>
                                    {/* Governance */}
                                    <div>
                                        <div style={{ marginBottom: 'var(--space-4)' }}>
                                            <input value={member.name} onChange={(e) => handleMemberUpdate(member.originalIndex, 'name', e.target.value)} style={{ fontSize: '1.25rem', fontWeight: 800, background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }} />
                                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))' }}>{member.relation} • Age {member.age}</div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', background: 'hsla(var(--bg-void) / 0.2)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
                                            <div style={{ gridColumn: '1 / -1', fontSize: '0.65rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>Income & Lifestyle</div>
                                            <InputField label="Annual Income" icon={DollarSign} value={member.financials?.income} onChange={(v) => handleFinancialUpdate(member.originalIndex, 'income', v)} />
                                            <InputField label="Annual Spending" icon={CreditCard} value={member.financials?.spending} onChange={(v) => handleFinancialUpdate(member.originalIndex, 'spending', v)} />
                                            <InputField label="Retirement Age" icon={Flag} value={member.retirementAge || 67} onChange={(v) => handleMemberUpdate(member.originalIndex, 'retirementAge', parseInt(v) || 67)} />
                                            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', display: 'flex', alignItems: 'center', paddingTop: '12px' }}>
                                                {member.retirementAge && member.age ? `${Math.max(0, (member.retirementAge || 67) - member.age)} years until retirement` : 'Set retirement age'}
                                            </div>

                                            {/* Employment Questionnaire */}
                                            {(member.financials?.income || 0) > 0 && (
                                                <>
                                                    <div style={{ gridColumn: '1 / -1', marginTop: 'var(--space-2)' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={member.maxing401k || false}
                                                                onChange={(e) => handleMemberUpdate(member.originalIndex, 'maxing401k', e.target.checked)}
                                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                            />
                                                            Maxing out 401(k) contributions ($23k/year)
                                                        </label>
                                                    </div>
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={member.hasEmergencyFund || false}
                                                                onChange={(e) => handleMemberUpdate(member.originalIndex, 'hasEmergencyFund', e.target.checked)}
                                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                            />
                                                            Has 6+ months emergency fund
                                                        </label>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', border: '1px solid hsla(var(--text-primary) / 0.05)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ gridColumn: '1 / -1', fontSize: '0.65rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>Assets (Snapshot)</div>
                                            <div style={{ position: 'relative' }}>
                                                <InputField label="Stock Portfolio" icon={TrendingUp} value={member.financials?.stocks} onChange={(v) => handleFinancialUpdate(member.originalIndex, 'stocks', v)} />
                                                {(() => {
                                                    const sum = (member.financials?.positions || []).reduce((acc, p) => acc + (p.value || 0), 0);
                                                    if (sum > 0 && Math.abs(sum - (member.financials?.stocks || 0)) > 1) {
                                                        return <button onClick={() => handleFinancialUpdate(member.originalIndex, 'stocks', sum)} style={{ position: 'absolute', top: 0, right: 0, fontSize: '0.6rem', color: 'hsl(var(--gold-primary))', background: 'hsla(var(--gold-primary)/0.1)', border: 'none', borderRadius: '4px', padding: '2px 4px' }}>Sync {formatCurrency(sum)}</button>;
                                                    }
                                                })()}
                                            </div>
                                            <InputField label="Retirement (401k/IRA)" icon={Lock} value={member.financials?.retirement} onChange={(v) => handleFinancialUpdate(member.originalIndex, 'retirement', v)} />
                                            <InputField label="Tax-Free (Roth/HSA)" icon={Shield} value={member.financials?.taxFree} onChange={(v) => handleFinancialUpdate(member.originalIndex, 'taxFree', v)} />
                                            <InputField label="Cash & Savings" icon={DollarSign} value={member.financials?.cash} onChange={(v) => handleFinancialUpdate(member.originalIndex, 'cash', v)} />
                                        </div>
                                    </div>

                                    {/* Granular Assets */}
                                    <div>
                                        <h4 style={{ fontSize: '0.7rem', color: 'hsl(var(--gold-primary))', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real Estate (Branch Level)</h4>
                                        <RealEstateManager
                                            assets={member.financials?.realEstate}
                                            onChange={(vals) => handleFinancialUpdate(member.originalIndex, 'realEstate', vals)}
                                        />

                                        <h4 style={{ fontSize: '0.7rem', color: 'hsl(var(--gold-primary))', margin: 'var(--space-6) 0 var(--space-4) 0', textTransform: 'uppercase' }}>Equities & Positions</h4>
                                        <EquityManager
                                            positions={member.financials?.positions}
                                            onChange={(vals) => handleFinancialUpdate(member.originalIndex, 'positions', vals)}
                                        />

                                        <h4 style={{ fontSize: '0.7rem', color: 'hsl(var(--danger))', margin: 'var(--space-6) 0 var(--space-4) 0', textTransform: 'uppercase' }}>Debts & Liabilities</h4>
                                        <LiabilityManager
                                            liabilities={member.financials?.debts}
                                            onChange={(vals) => handleFinancialUpdate(member.originalIndex, 'debts', vals)}
                                        />
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
