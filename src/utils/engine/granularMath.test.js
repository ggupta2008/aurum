import { describe, it, expect } from 'vitest';
import { calculateProjection } from './financeEngine';

describe('Granular Wealth Math Audit', () => {
    const baseProfile = {
        financials: {
            assets: { taxable: 100000, taxDeferred: 0, taxFree: 0, realEstate: [] },
            income: 100000,
            spending: 50000,
            liabilities: []
        },
        family: [{ id: 1, name: 'Self', age: 40, relation: 'Self', familyGroupId: 0, financials: { income: 0, stocks: 0, retirement: 0, realEstate: [] } }],
        strategies: {},
        marketRegime: 'goldilocks'
    };

    describe('Debt Amortization', () => {
        it('should correctly model P&I debt reduction over time', () => {
            const profile = {
                ...baseProfile,
                financials: {
                    ...baseProfile.financials,
                    taxRate: 0,
                    income: 12950, // Exactly the annual debt service
                    spending: 0,
                    assets: {
                        ...baseProfile.financials.assets, realEstate: [
                            { id: 1, name: 'Loan Test', type: 'primary', value: 0, mortgage: 100000, rate: 0.05, termYears: 10 }
                        ]
                    }
                },
                family: [{ id: 1, name: 'Self', age: 40, relation: 'Self', state: 'TX', familyGroupId: 0, financials: { income: 0, stocks: 0, retirement: 0, realEstate: [] } }] // No state tax in TX
            };
            const result = calculateProjection(profile);

            // Year 0: Snapshot should be assets(100k) - debt(100k) = 0
            expect(result.data[0].baseline).toBe(0);

            // Year 5: NW should be Assets (compounded) - Remaining Principal
            // Baseline drag is 0.04% (dynamic), so net return is 8% - 0.04% = 7.96%
            // 100k * 1.0796^5 is ~146,600.
            // Remaining Principal after 5 years on 5% 10yr loan is ~58,000.
            // NW should be ~169,000.
            const totalNW_yr5 = result.data[5].baseline;
            expect(totalNW_yr5).toBeGreaterThan(150000);
            expect(totalNW_yr5).toBeLessThan(180000);
        });
    });

    describe('Rental Income Engine', () => {
        it('should inject rental income into cash flow', () => {
            const profile = {
                ...baseProfile,
                financials: {
                    ...baseProfile.financials,
                    income: 26000,
                    spending: 26000, // Living on earned income
                    assets: {
                        ...baseProfile.financials.assets, realEstate: [
                            { id: 1, name: 'Rental', type: 'rental', value: 500000, mortgage: 0, annualIncome: 24000 }
                        ]
                    }
                }
            };

            const result = calculateProjection(profile);

            // Assets start at 100k (cash) + 500k (RE) = 600k
            expect(result.data[0].baseline).toBe(600000);

            // Year 1: surplus should be 24k rental * (1-tax) - debt service(0)
            const yr1_baseline = result.data[1].baseline;
            expect(yr1_baseline).toBeGreaterThan(610000);
        });
    });

    describe('1031 Exchange Logic', () => {
        it('should apply tax alpha and return alpha upon exchange', () => {
            const profile = {
                ...baseProfile,
                financials: {
                    ...baseProfile.financials,
                    income: 50000,
                    spending: 50000,
                    assets: {
                        ...baseProfile.financials.assets, realEstate: [
                            { id: 1, name: 'Rental', type: 'rental', value: 1000000, mortgage: 0 }
                        ]
                    }
                },
                strategies: {
                    '1031_exchange': {
                        active: true,
                        impact_type: 'return_boost',
                        impact_value: 0.02,
                        name: '1031 Exchange'
                    }
                }
            };

            const result = calculateProjection(profile);

            // Baseline Growth (End of sequence)
            const baselineFinal = result.data[25].baseline;
            const optimizedFinal = result.data[25].optimized;

            // Optimized should be higher due to 2% return boost
            expect(optimizedFinal).toBeGreaterThan(baselineFinal);
        });
    });
});
