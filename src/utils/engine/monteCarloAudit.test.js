import { describe, it } from 'vitest';
import { calculateMonteCarlo } from './financeEngine.js';

describe('Monte Carlo Audit', () => {
    it('should output stress test results with new amortization math', () => {
        const INITIAL_PROFILE = {
            family: [
                {
                    id: 1,
                    name: 'Primary',
                    age: 45,
                    relation: 'Self',
                    state: 'CA',
                    familyGroupId: 0,
                    financials: {
                        income: 150000,
                        spending: 120000,
                        stocks: 150000,
                        retirement: 200000,
                        realEstate: [
                            { id: 101, name: 'Primary Residence', type: 'primary', value: 500000, mortgage: 300000, rate: 0.035, termYears: 30 }
                        ],
                        cash: 50000
                    }
                }
            ],
            financials: {
                assets: { taxable: 0, taxDeferred: 0, taxFree: 0 },
                income: 0,
                spending: 0,
                taxRate: 0.24
            },
            goals: { primary: 'wealth_preservation' },
            strategies: {},
            marketRegime: 'goldilocks'
        };

        const results = calculateMonteCarlo(INITIAL_PROFILE, 1000);
        const lastYear = results[results.length - 1];

        console.log('\x1b[33m%s\x1b[0m', '\n--- 1,000 ITERATION STRESS TEST RESULTS ---');
        console.log(`Success Rate: ${lastYear.successRate}%`);
        console.log(`Expected Wealth (p50): $${(lastYear.p50 / 1000000).toFixed(2)}M`);
        console.log(`Downside Risk (p10): $${(lastYear.p10 / 1000000).toFixed(2)}M`);
        console.log(`Upside Potential (p90): $${(lastYear.p90 / 1000000).toFixed(2)}M`);
        console.log('-------------------------------------------\n');
    });
});
