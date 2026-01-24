import { describe, it, expect } from 'vitest';
import {
    getTargetMembers,
    getScopedCurrentWealth,
    calculateScopeRatio,
    getScopedTaxBuckets,
    getScopedAge,
    getScopedSpending,
    getScopedIncome,
    getScopedProjection,
    getScopedMonteCarlo
} from './scopeLogic';

describe('Scope Logic Engine', () => {
    const mockProfile = {
        family: [
            { id: 1, name: 'John', age: 75, relation: 'Self', financials: { stocks: 100000, retirement: 50000, income: 1000, spending: 2000 } },
            { id: 2, name: 'Jane', age: 72, relation: 'Spouse', financials: { stocks: 50000, retirement: 20000, income: 500, spending: 1000 } },
            { id: 3, name: 'Kid', age: 40, relation: 'Child', financials: { stocks: 10000, retirement: 0, income: 2000, spending: 3000 } },
            { id: 4, name: 'Sibling', age: 60, relation: 'Sibling', financials: { stocks: 200000, retirement: 100000, income: 0, spending: 5000 } }
        ],
        financials: {
            assets: { taxable: 500000, taxDeferred: 100000, taxFree: 50000 }
        }
    };

    const mockTaxUnits = [
        {
            id: 'household',
            name: 'Household',
            members: mockProfile.family.slice(0, 2),
            dependents: [mockProfile.family[2]]
        },
        {
            id: 'unit_sibling',
            name: 'Sibling Branch',
            members: [mockProfile.family[3]],
            dependents: []
        }
    ];

    const mockProjection = {
        data: [
            { year: 2024, baseline: 1130000, optimized: 1130000 }
            // Total sum: (100+50+10+200) taxable member assets + 500 taxable household + (50+20+0+100) deferred member + 100 deferred household + 50 free household = 1130k
        ]
    };

    describe('getTargetMembers', () => {
        it('should return all family members for household scope', () => {
            const members = getTargetMembers(mockProfile, 'household');
            expect(members).toHaveLength(4);
        });

        it('should return unit-specific members for branch scope', () => {
            const members = getTargetMembers(mockProfile, 'unit_sibling', mockTaxUnits);
            expect(members).toHaveLength(1);
            expect(members[0].name).toBe('Sibling');
        });
    });

    describe('getScopedCurrentWealth', () => {
        it('should calculate correct wealth for primary unit (includes household assets)', () => {
            const targetMembers = [mockProfile.family[0]]; // John (Self)
            const wealth = getScopedCurrentWealth(mockProfile, targetMembers);

            // John's assets (100k stocks + 50k retirement) + Household assets (500k + 100k + 50k) = 150k + 650k = 800k
            expect(wealth).toBe(800000);
        });

        it('should calculate correct wealth for non-primary unit (no household assets)', () => {
            const targetMembers = [mockProfile.family[3]]; // Sibling
            const wealth = getScopedCurrentWealth(mockProfile, targetMembers);

            // Sibling's assets (200k stocks + 100k retirement) = 300k
            expect(wealth).toBe(300000);
        });
    });

    describe('getScopedTaxBuckets', () => {
        it('should aggregate buckets for household scope', () => {
            const targetMembers = mockProfile.family;
            const buckets = getScopedTaxBuckets(mockProfile, targetMembers);

            // Taxable: (100+50+10+200) + 500 = 860k
            // Deferred: (50+20+0+100) + 100 = 270k
            // Free: 50k (household)
            expect(buckets.taxable).toBe(860000);
            expect(buckets.taxDeferred).toBe(270000);
            expect(buckets.taxFree).toBe(50000);
        });

        it('should aggregate buckets for sibling branch (no household assets)', () => {
            const targetMembers = [mockProfile.family[3]]; // Sibling
            const buckets = getScopedTaxBuckets(mockProfile, targetMembers);

            // Taxable: 200k
            // Deferred: 100k
            // Free: 0
            expect(buckets.taxable).toBe(200000);
            expect(buckets.taxDeferred).toBe(100000);
            expect(buckets.taxFree).toBe(0);
        });
    });

    describe('getScopedAge', () => {
        it('should return oldest age for household scope', () => {
            const age = getScopedAge(mockProfile.family, 'household');
            expect(age).toBe(75);
        });

        it('should return primary member age for unit scope', () => {
            const age = getScopedAge([mockProfile.family[3]], 'unit_sibling');
            expect(age).toBe(60);
        });
    });

    describe('getScopedSpending', () => {
        it('should sum spending for target members', () => {
            const spending = getScopedSpending(mockProfile.family.slice(0, 2)); // John + Jane
            expect(spending).toBe(3000);
        });
    });

    describe('getScopedIncome', () => {
        it('should sum income for target members', () => {
            const income = getScopedIncome(mockProfile.family.slice(0, 3)); // John + Jane + Kid
            expect(income).toBe(3500);
        });
    });

    describe('getScopedProjection', () => {
        it('should scale projection data by ratio', () => {
            const projection = {
                data: [{ baseline: 1000, optimized: 1200, rothAlpha: 200, estateTaxSavings: 50 }]
            };
            const ratio = 0.5;
            const scoped = getScopedProjection(projection, ratio);

            expect(scoped.data[0].baseline).toBe(500);
            expect(scoped.data[0].optimized).toBe(600);
            expect(scoped.data[0].rothAlpha).toBe(100);
            expect(scoped.data[0].estateTaxSavings).toBe(25);
        });

        it('should handle missing data gracefully', () => {
            const scoped = getScopedProjection(null, 0.5);
            expect(scoped.data).toEqual([]);
        });
    });

    describe('getScopedMonteCarlo', () => {
        it('should scale monte carlo data by ratio', () => {
            const mc = [{ p10: 800, p50: 1000, p90: 1200 }];
            const ratio = 0.8;
            const scoped = getScopedMonteCarlo(mc, ratio);

            expect(scoped[0].p10).toBe(640);
            expect(scoped[0].p50).toBe(800);
            expect(scoped[0].p90).toBe(960);
        });

        it('should handle null mc data', () => {
            const scoped = getScopedMonteCarlo(null, 0.5);
            expect(scoped).toEqual([]);
        });
    });

    describe('calculateScopeRatio', () => {
        it('should return 1 for household scope', () => {
            const ratio = calculateScopeRatio(mockProfile, mockProjection, 'household');
            expect(ratio).toBe(1);
        });

        it('should calculate correct ratio for sibling branch', () => {
            const ratio = calculateScopeRatio(mockProfile, mockProjection, 'unit_sibling', mockTaxUnits);
            // Sibling wealth: 300k
            // Total wealth: 1130k
            expect(ratio).toBeCloseTo(300000 / 1130000);
        });
    });
});

