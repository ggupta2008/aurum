import { describe, it, expect } from 'vitest';
import { calculateBenefitFactor, calculateTotalLifetimeBenefit, findBreakevenAge, FRA } from './socialSecurityRules';

describe('Social Security Rules', () => {
    describe('calculateBenefitFactor', () => {
        it('should return 1.0 for FRA (67)', () => {
            expect(calculateBenefitFactor(67)).toBe(1.0);
        });

        it('should reduce benefit to 70% for age 62 (5 years early)', () => {
            // (3 years * 6.67%) + (2 years * 5%) = 20.01% + 10% = 30.01% reduction
            const factor = calculateBenefitFactor(62);
            expect(factor).toBeCloseTo(0.70, 2);
        });

        it('should increase benefit to 124% for age 70 (3 years delayed)', () => {
            expect(calculateBenefitFactor(70)).toBe(1.24);
        });
    });

    describe('calculateTotalLifetimeBenefit', () => {
        it('should calculate nominal total correctly without inflation', () => {
            const pia = 3000;
            const annual = pia * 12; // 36000
            // Claiming at 67, living to 72 = 6 years of benefits (67, 68, 69, 70, 71, 72)
            const total = calculateTotalLifetimeBenefit(pia, 67, 72, 0);
            expect(total).toBe(annual * 6);
        });

        it('should account for inflation correctly', () => {
            const pia = 1000;
            const inflation = 0.10; // 10% for easy math
            // Year 1: 12000
            // Year 2: 13200
            const total = calculateTotalLifetimeBenefit(pia, 67, 68, inflation);
            expect(total).toBe(12000 + 13200);
        });
    });

    describe('findBreakevenAge', () => {
        it('should find breakeven between 62 and 67', () => {
            const breakeven = findBreakevenAge(3000, 62, 67, 0);
            // Typically around age 77-78
            expect(breakeven).toBeGreaterThan(75);
            expect(breakeven).toBeLessThan(80);
        });

        it('should find breakeven between 67 and 70', () => {
            const breakeven = findBreakevenAge(3000, 67, 70, 0);
            // Typically around age 82-83
            expect(breakeven).toBeGreaterThan(80);
            expect(breakeven).toBeLessThan(85);
        });
    });
});
