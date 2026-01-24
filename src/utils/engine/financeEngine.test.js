import { describe, it, expect } from 'vitest';
import { calculateProjection, calculateMonteCarlo, getRecommendedStrategies, MARKET_REGIMES } from './financeEngine';

describe('Finance Engine', () => {
    const createTestProfile = (overrides = {}) => ({
        family: [
            {
                id: 1,
                name: 'Test User',
                age: 45,
                relation: 'Self',
                familyGroupId: 0,
                financials: {
                    income: 150000,
                    stocks: 300000,
                    retirement: 500000,
                    realEstate: 400000,
                    cash: 50000,
                    loans: 0,
                },
            },
        ],
        financials: {
            assets: {
                taxable: 300000,
                taxDeferred: 500000,
                taxFree: 100000,
            },
            income: 150000,
            spending: 80000,
            taxRate: 0.35,
        },
        goals: {
            primary: 'retirement',
        },
        strategies: {},
        marketRegime: 'goldilocks',
        ...overrides,
    });

    describe('calculateProjection', () => {
        it('should return projection data with 25 years', () => {
            const profile = createTestProfile();
            const result = calculateProjection(profile);

            expect(result.data).toBeDefined();
            expect(result.data.length).toBeGreaterThanOrEqual(25);
            expect(result.explanations).toBeDefined();
        });

        it('should have increasing years', () => {
            const profile = createTestProfile();
            const result = calculateProjection(profile);

            const currentYear = new Date().getFullYear();
            expect(result.data[0].year).toBe(currentYear);
            expect(result.data[24].year).toBe(currentYear + 24);
        });

        it('should calculate baseline and optimized projections', () => {
            const profile = createTestProfile();
            const result = calculateProjection(profile);

            result.data.forEach(point => {
                expect(point.baseline).toBeDefined();
                expect(point.optimized).toBeDefined();
                expect(typeof point.baseline).toBe('number');
                expect(typeof point.optimized).toBe('number');
            });
        });

        it('should show wealth growth over time', () => {
            const profile = createTestProfile();
            const result = calculateProjection(profile);

            const startWealth = result.data[0].baseline;
            const endWealth = result.data[24].baseline;

            expect(endWealth).toBeGreaterThan(startWealth);
        });

        it('should apply market regime adjustments', () => {
            const goldilocks = calculateProjection(createTestProfile({ marketRegime: 'goldilocks' }));
            const stagflation = calculateProjection(createTestProfile({ marketRegime: 'stagflation' }));

            const goldilocks25yr = goldilocks.data[24].baseline;
            const stagflation25yr = stagflation.data[24].baseline;

            // Goldilocks (8% return) should have higher wealth than Stagflation (4% return)
            expect(goldilocks25yr).toBeGreaterThan(stagflation25yr);
        });
    });

    describe('calculateMonteCarlo', () => {
        it('should return array of simulations', () => {
            const profile = createTestProfile();
            const result = calculateMonteCarlo(profile);

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should have p10, p50, p90 percentiles', () => {
            const profile = createTestProfile();
            const result = calculateMonteCarlo(profile);

            result.forEach(point => {
                expect(point.p10).toBeDefined();
                expect(point.p50).toBeDefined();
                expect(point.p90).toBeDefined();
                expect(typeof point.p10).toBe('number');
                expect(typeof point.p50).toBe('number');
                expect(typeof point.p90).toBe('number');
            });
        });

        it('should have p90 > p50 > p10', () => {
            const profile = createTestProfile();
            const result = calculateMonteCarlo(profile);

            result.forEach(point => {
                expect(point.p90).toBeGreaterThanOrEqual(point.p50);
                expect(point.p50).toBeGreaterThanOrEqual(point.p10);
            });
        });

        it('should have 25 years of data', () => {
            const profile = createTestProfile();
            const result = calculateMonteCarlo(profile);

            expect(result.length).toBeGreaterThanOrEqual(25);
        });

        it('should show increasing wealth over time (p50)', () => {
            const profile = createTestProfile();
            const result = calculateMonteCarlo(profile);

            const start = result[0].p50;
            const end = result[24].p50;

            expect(end).toBeGreaterThan(start);
        });
    });

    describe('getRecommendedStrategies', () => {
        it('should return array of recommendations', () => {
            const profile = createTestProfile();
            const result = getRecommendedStrategies(profile);

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should have required properties', () => {
            const profile = createTestProfile();
            const result = getRecommendedStrategies(profile);

            result.forEach(rec => {
                expect(rec.id).toBeDefined();
                expect(rec.title).toBeDefined();
                expect(rec.description).toBeDefined();
                expect(rec.score).toBeDefined();
                expect(rec.impact).toBeDefined();
                expect(typeof rec.score).toBe('number');
            });
        });

        it('should have scores between 0 and 100', () => {
            const profile = createTestProfile();
            const result = getRecommendedStrategies(profile);

            result.forEach(rec => {
                expect(rec.score).toBeGreaterThanOrEqual(0);
                expect(rec.score).toBeLessThanOrEqual(100);
            });
        });

        it('should recommend Roth conversion for high tax-deferred ratio', () => {
            const profile = createTestProfile({
                financials: {
                    assets: {
                        taxable: 100000,
                        taxDeferred: 1000000, // 83% tax-deferred
                        taxFree: 100000,
                    },
                    income: 150000,
                    spending: 80000,
                    taxRate: 0.35,
                },
            });

            const result = getRecommendedStrategies(profile);
            const rothRec = result.find(r => r.id === 'roth_conversion');

            expect(rothRec).toBeDefined();
            expect(rothRec.score).toBeGreaterThan(70); // High score for high tax-deferred ratio
        });

        it('should sort recommendations by score (descending)', () => {
            const profile = createTestProfile();
            const result = getRecommendedStrategies(profile);

            for (let i = 1; i < result.length; i++) {
                expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
            }
        });
    });

    describe('MARKET_REGIMES', () => {
        it('should have all 4 regimes defined', () => {
            expect(MARKET_REGIMES.goldilocks).toBeDefined();
            expect(MARKET_REGIMES.stagflation).toBeDefined();
            expect(MARKET_REGIMES.lost_decade).toBeDefined();
            expect(MARKET_REGIMES.bull_charge).toBeDefined();
        });

        it('should have return and inflation for each regime', () => {
            Object.values(MARKET_REGIMES).forEach(regime => {
                expect(regime.return).toBeDefined();
                expect(regime.inflation).toBeDefined();
                expect(typeof regime.return).toBe('number');
                expect(typeof regime.inflation).toBe('number');
            });
        });

        it('should have bull_charge > goldilocks > stagflation > lost_decade', () => {
            expect(MARKET_REGIMES.bull_charge.return).toBeGreaterThan(MARKET_REGIMES.goldilocks.return);
            expect(MARKET_REGIMES.goldilocks.return).toBeGreaterThan(MARKET_REGIMES.stagflation.return);
            expect(MARKET_REGIMES.stagflation.return).toBeGreaterThan(MARKET_REGIMES.lost_decade.return);
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero assets', () => {
            const profile = createTestProfile({
                financials: {
                    assets: {
                        taxable: 0,
                        taxDeferred: 0,
                        taxFree: 0,
                    },
                    income: 100000,
                    spending: 50000,
                    taxRate: 0.25,
                },
            });

            const result = calculateProjection(profile);
            expect(result.data).toBeDefined();
            expect(result.data.length).toBeGreaterThan(0);
        });

        it('should handle empty family array', () => {
            const profile = createTestProfile({ family: [] });

            const result = calculateProjection(profile);
            expect(result.data).toBeDefined();
        });

        it('should handle null strategies', () => {
            const profile = createTestProfile({ strategies: null });

            const result = calculateProjection(profile);
            expect(result.data).toBeDefined();
        });
    });
});
