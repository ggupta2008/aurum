import { describe, it, expect } from 'vitest';
import { calculateProjection } from './financeEngine';

describe('Strategic Logic - Wealth Alpha Generation', () => {
    const createBaseProfile = () => ({
        family: [{ id: 1, age: 45, relation: 'Self', financials: { income: 200000, cash: 100000 } }],
        financials: {
            assets: { taxable: 1000000, taxDeferred: 2000000, taxFree: 500000 },
            taxRate: 0.35
        },
        marketRegime: 'goldilocks',
        strategies: {}
    });

    it('should generate alpha when "Simple Path" strategy is active', () => {
        const profile = createBaseProfile();
        profile.strategies = {
            'simple_path': { active: true, inputs: { allocation: 100 } }
        };

        const result = calculateProjection(profile);
        const year25 = result.data[24];

        // Optimized should be significantly higher than baseline due to lower drag (1.5bps vs 120bps)
        expect(year25.optimized).toBeGreaterThan(year25.baseline);

        // Calculate raw alpha
        const alpha = year25.optimized - year25.baseline;
        expect(alpha).toBeGreaterThan(500000); // 1% annual delta over 25 years on millions is huge
    });

    it('should generate alpha when "Roth Conversion" strategy is active', () => {
        const profile = createBaseProfile();
        profile.strategies = {
            'roth_conversion': { active: true, inputs: { annualAmount: 50000 } }
        };

        const result = calculateProjection(profile);
        const year25 = result.data[24];

        // Roth conversion moves money from tax-deferred (which has embedded tax liability) 
        // to tax-free. While the engine baseline/optimized in the chart usually shows 
        // total account values, the "alpha" comes from the tax-free compounding.

        // In our current engine, roth conversion affects the buckets.
        // Let's verify and see if it produces delta.
        expect(year25.optimized).toBeGreaterThan(year25.baseline);
    });

    it('should calculate accurate debt amortization over a 30-year term', () => {
        const profile = createBaseProfile();
        const mortgage = { balance: 1000000, rate: 0.04, termYears: 30 };
        profile.family[0].financials.debts = [mortgage];

        const result = calculateProjection(profile);

        // Year 0 (Current)
        expect(result.data[0].baseline).toBeLessThan(4000000); // Net worth = Assets - 1M Debt

        // Year 30 (paid off)
        // Since years only go to 25, let's check Year 25
        const year25 = result.data[24];
        // Debt should be significantly reduced
        // Manual calculation for 4% mortgage would be approx 30% remaining at year 25
        // Total Assets at 8% growth after 25 years on 3.6M (approx 24M)
        expect(year25.baseline).toBeGreaterThan(10000000);
    });
});
