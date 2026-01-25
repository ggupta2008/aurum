import { describe, it, expect } from 'vitest';
import { calculateProjection } from './financeEngine';
import { getScopedCurrentWealth, getTargetMembers } from './scopeLogic';

describe('Net Worth Integrity Audit', () => {
    const baseProfile = {
        family: [
            { id: 1, name: 'Head', relation: 'Self', age: 40, financials: { income: 0, stocks: 0, retirement: 0, realEstate: [], cash: 0, loans: 0 } }
        ],
        financials: {
            assets: { taxable: 0, taxDeferred: 0, taxFree: 0, cash: 0, realEstate: [] },
            liabilities: [],
            income: 0,
            spending: 0,
            taxRate: 0.24
        },
        marketRegime: 'goldilocks',
        goals: { primary: 'wealth_preservation' },
        strategies: {}
    };

    it('should correctly sum Mixed Clan and Member assets', () => {
        const profile = {
            ...baseProfile,
            financials: {
                ...baseProfile.financials,
                assets: {
                    ...baseProfile.financials.assets,
                    cash: 500000,
                    realEstate: [{ id: 1, name: 'Clan Rental', type: 'rental', value: 1000000, mortgage: 400000 }]
                }
            },
            family: [
                {
                    ...baseProfile.family[0],
                    financials: {
                        stocks: 200000,
                        retirement: 300000,
                        cash: 100000
                    }
                }
            ]
        };

        // Assets: 500k (Clan Cash) + 1000k (Clan RE) + 200k (Stocks) + 300k (Retirement) + 100k (Member Cash) = 2,100,000
        // Liabilities: 400k (Clan Mortgage)
        // Net Worth: 1,700,000

        const targetMembers = getTargetMembers(profile, 'household');
        const scopeNW = getScopedCurrentWealth(profile, targetMembers);
        expect(scopeNW).toBe(1700000);

        const projectResult = calculateProjection(profile);
        expect(projectResult.data[0].baseline).toBe(1700000);
    });

    it('should handle Consolidation Clan Debt (Unsecured)', () => {
        const profile = {
            ...baseProfile,
            financials: {
                ...baseProfile.financials,
                assets: { cash: 1000000 },
                liabilities: [{ id: 1, name: 'Business Loan', balance: 500000, rate: 0.08, term: 10 }]
            }
        };

        const targetMembers = getTargetMembers(profile, 'household');
        const scopeNW = getScopedCurrentWealth(profile, targetMembers);
        expect(scopeNW).toBe(500000); // 1M - 500k

        const projectResult = calculateProjection(profile);
        expect(projectResult.data[0].baseline).toBe(500000);
    });

    it('should NOT count Clan Real Estate if planning scope excludes Primary Head', () => {
        const profile = {
            ...baseProfile,
            family: [
                { id: 1, name: 'Head', relation: 'Self', age: 40, familyGroupId: 0, financials: { income: 0, stocks: 0 } },
                { id: 2, name: 'Sibling', relation: 'Sibling', age: 38, familyGroupId: 1, financials: { stocks: 100000 } }
            ],
            financials: {
                assets: { cash: 500000, realEstate: [{ id: 1, name: 'Clan House', value: 1000000 }] }
            }
        };

        const taxUnits = [
            { id: 'unit_1', name: 'Head', members: [profile.family[0]], dependents: [], familyGroupId: 0 },
            { id: 'unit_2', name: 'Sibling', members: [profile.family[1]], dependents: [], familyGroupId: 1 }
        ];

        // Scoped to Sibling
        const targetMembers = getTargetMembers(profile, 'unit_2', taxUnits);
        const scopeNW = getScopedCurrentWealth(profile, targetMembers);

        // Should ONLY be Sibling's 100k stocks. Clan house and cash belong to Head unit.
        expect(scopeNW).toBe(100000);
    });

    it('should handle String inputs defensively (Regression Fix)', () => {
        const profile = {
            ...baseProfile,
            family: [
                {
                    ...baseProfile.family[0],
                    financials: { ...baseProfile.family[0].financials, stocks: '100000', cash: '50000' }
                }
            ],
            financials: {
                ...baseProfile.financials,
                assets: { ...baseProfile.financials.assets, cash: '200000' }
            }
        };

        // Total: 100k + 50k + 200k = 350,000
        const scopeNW = getScopedCurrentWealth(profile, getTargetMembers(profile, 'household'));
        expect(scopeNW).toBe(350000);
    });

    it('should correctly sum Clan Layer Equities and Positions', () => {
        const profile = {
            ...baseProfile,
            financials: {
                ...baseProfile.financials,
                assets: {
                    ...baseProfile.financials.assets,
                    positions: [
                        { id: 1, ticker: 'VTI', value: 500000, taxStatus: 'taxable', dividendYield: 0.015 },
                        { id: 2, ticker: 'VXUS', value: 300000, taxStatus: 'taxable', dividendYield: 0.02 }
                    ]
                }
            }
        };

        const targetMembers = getTargetMembers(profile, 'household');
        const scopeNW = getScopedCurrentWealth(profile, targetMembers);
        expect(scopeNW).toBe(800000); // 500k + 300k

        const projectResult = calculateProjection(profile);
        expect(projectResult.data[0].baseline).toBe(800000);
    });
    it('should NOT double-count when legacy taxBuckets and granular/aggregate data both exist', () => {
        const profile = {
            ...baseProfile,
            family: [
                {
                    ...baseProfile.family[0],
                    financials: {
                        ...baseProfile.family[0].financials,
                        stocks: 100000,
                        taxBuckets: { taxable: 100000, taxDeferred: 0, taxFree: 0 }
                    }
                }
            ]
        };

        // Should be 100k, not 200k.
        const scopeNW = getScopedCurrentWealth(profile, getTargetMembers(profile, 'household'));
        expect(scopeNW).toBe(100000);
    });

    it('should prioritize member positions over aggregate stocks', () => {
        const profile = {
            ...baseProfile,
            family: [
                {
                    ...baseProfile.family[0],
                    financials: {
                        ...baseProfile.family[0].financials,
                        stocks: 500000, // Aggregate (maybe stale)
                        positions: [
                            { id: 1, ticker: 'AAPL', value: 200000 } // Granular (Current truth)
                        ]
                    }
                }
            ]
        };

        // Should be 200k, not 700k or 500k.
        const scopeNW = getScopedCurrentWealth(profile, getTargetMembers(profile, 'household'));
        expect(scopeNW).toBe(200000);
    });

    it('should maintain consistency between getScopedCurrentWealth and calculated projection baseline', () => {
        const profile = {
            ...baseProfile,
            family: [
                {
                    ...baseProfile.family[0],
                    financials: {
                        ...baseProfile.family[0].financials,
                        stocks: 500000,
                        cash: 100000,
                        debts: [{ balance: 50000 }]
                    }
                }
            ],
            financials: {
                ...baseProfile.financials,
                assets: { cash: 200000 }
            }
        };

        // Scoped Wealth: (500k + 100k + 200k) - 50k = 750k
        const targetMembers = getTargetMembers(profile, 'household');
        const scopeNW = getScopedCurrentWealth(profile, targetMembers);
        expect(scopeNW).toBe(750000);

        const projectResult = calculateProjection(profile);
        expect(projectResult.data[0].baseline).toBe(750000);
    });
});
