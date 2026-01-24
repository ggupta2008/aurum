import { describe, it, expect } from 'vitest';
import { MARKET_REGIMES, WEALTH_GOALS, AVAILABLE_STRATEGIES } from './financeEngine';

describe('Finance Engine - Additional Coverage', () => {
    describe('MARKET_REGIMES', () => {
        it('should have correct structure for all regimes', () => {
            Object.entries(MARKET_REGIMES).forEach(([key, regime]) => {
                expect(regime).toHaveProperty('name');
                expect(regime).toHaveProperty('return');
                expect(regime).toHaveProperty('inflation');
                expect(regime).toHaveProperty('description');
                expect(typeof regime.name).toBe('string');
                expect(typeof regime.return).toBe('number');
                expect(typeof regime.inflation).toBe('number');
                expect(typeof regime.description).toBe('string');
            });
        });

        it('should have realistic return ranges', () => {
            Object.values(MARKET_REGIMES).forEach(regime => {
                expect(regime.return).toBeGreaterThanOrEqual(0);
                expect(regime.return).toBeLessThanOrEqual(0.20); // Max 20% return
                expect(regime.inflation).toBeGreaterThanOrEqual(0);
                expect(regime.inflation).toBeLessThanOrEqual(0.10); // Max 10% inflation
            });
        });

        it('should have real return (return - inflation) that makes sense', () => {
            const goldilocks = MARKET_REGIMES.goldilocks;
            const realReturn = goldilocks.return - goldilocks.inflation;
            expect(realReturn).toBeGreaterThan(0); // Positive real return

            const stagflation = MARKET_REGIMES.stagflation;
            const stagRealReturn = stagflation.return - stagflation.inflation;
            expect(stagRealReturn).toBeLessThan(goldilocks.return - goldilocks.inflation); // Lower real return
        });
    });

    describe('WEALTH_GOALS', () => {
        it('should have all required properties', () => {
            WEALTH_GOALS.forEach(goal => {
                expect(goal).toHaveProperty('id');
                expect(goal).toHaveProperty('name');
                expect(goal).toHaveProperty('description');
                expect(typeof goal.id).toBe('string');
                expect(typeof goal.name).toBe('string');
                expect(typeof goal.description).toBe('string');
            });
        });

        it('should have unique IDs', () => {
            const ids = WEALTH_GOALS.map(g => g.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should include standard wealth goals', () => {
            const goalIds = WEALTH_GOALS.map(g => g.id);
            expect(goalIds).toContain('max_wealth');
            expect(goalIds).toContain('tax_min');
            expect(goalIds).toContain('estate_transfer');
            expect(goalIds).toContain('income_gen');
        });
    });

    describe('AVAILABLE_STRATEGIES', () => {
        it('should have all required properties', () => {
            AVAILABLE_STRATEGIES.forEach(strategy => {
                expect(strategy).toHaveProperty('id');
                expect(strategy).toHaveProperty('name');
                expect(strategy).toHaveProperty('description');
                expect(strategy).toHaveProperty('inputs');
                expect(Array.isArray(strategy.inputs)).toBe(true);
            });
        });

        it('should have valid input configurations', () => {
            AVAILABLE_STRATEGIES.forEach(strategy => {
                strategy.inputs.forEach(input => {
                    expect(input).toHaveProperty('key');
                    expect(input).toHaveProperty('label');
                    expect(input).toHaveProperty('type');
                    expect(input).toHaveProperty('default');
                    expect(['number', 'text', 'boolean']).toContain(input.type);
                });
            });
        });

        it('should include key strategies', () => {
            const strategyIds = AVAILABLE_STRATEGIES.map(s => s.id);
            expect(strategyIds).toContain('roth_conversion');
            expect(strategyIds).toContain('simple_path');
            expect(strategyIds).toContain('backdoor_roth');
            expect(strategyIds).toContain('direct_indexing');
        });

        it('should have unique strategy IDs', () => {
            const ids = AVAILABLE_STRATEGIES.map(s => s.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('Market Regime Comparisons', () => {
        it('should have bull_charge as highest return', () => {
            const returns = Object.values(MARKET_REGIMES).map(r => r.return);
            const maxReturn = Math.max(...returns);
            expect(MARKET_REGIMES.bull_charge.return).toBe(maxReturn);
        });

        it('should have lost_decade as lowest return', () => {
            const returns = Object.values(MARKET_REGIMES).map(r => r.return);
            const minReturn = Math.min(...returns);
            expect(MARKET_REGIMES.lost_decade.return).toBe(minReturn);
        });

        it('should have stagflation as highest inflation', () => {
            const inflations = Object.values(MARKET_REGIMES).map(r => r.inflation);
            const maxInflation = Math.max(...inflations);
            expect(MARKET_REGIMES.stagflation.inflation).toBe(maxInflation);
        });
    });

    describe('Strategy Input Defaults', () => {
        it('should have reasonable default values', () => {
            const rothStrategy = AVAILABLE_STRATEGIES.find(s => s.id === 'roth_conversion');
            const annualAmountInput = rothStrategy.inputs.find(i => i.key === 'annualAmount');
            expect(annualAmountInput.default).toBeGreaterThan(0);
            expect(annualAmountInput.default).toBeLessThan(100000); // Reasonable conversion amount
        });

        it('should have percentage inputs between 0-100', () => {
            AVAILABLE_STRATEGIES.forEach(strategy => {
                strategy.inputs.forEach(input => {
                    if (input.label.toLowerCase().includes('allocation') ||
                        input.label.toLowerCase().includes('%')) {
                        expect(input.default).toBeGreaterThanOrEqual(0);
                        expect(input.default).toBeLessThanOrEqual(100);
                    }
                });
            });
        });
    });
});
