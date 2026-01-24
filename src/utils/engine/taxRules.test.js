import { describe, it, expect } from 'vitest';
import { identifyTaxUnits, getUnitFinancials } from './taxRules';

describe('Tax Rules - Tax Unit Identification', () => {
    describe('Single Person', () => {
        it('should create one tax unit for single person', () => {
            const family = [
                { id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toHaveLength(1);
            expect(units[0].name).toBe('John');
            expect(units[0].filingStatus).toBe('single');
            expect(units[0].members).toHaveLength(1);
            expect(units[0].dependents).toHaveLength(0);
        });
    });

    describe('Married Couple', () => {
        it('should create one tax unit for married couple', () => {
            const family = [
                { id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Jane', age: 42, relation: 'Spouse', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toHaveLength(1);
            expect(units[0].name).toBe('John & Jane');
            expect(units[0].filingStatus).toBe('married');
            expect(units[0].members).toHaveLength(2);
            expect(units[0].dependents).toHaveLength(0);
        });

        it('should include children as dependents', () => {
            const family = [
                { id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Jane', age: 42, relation: 'Spouse', familyGroupId: 0 },
                { id: 3, name: 'Kid1', age: 10, relation: 'Child', familyGroupId: 0 },
                { id: 4, name: 'Kid2', age: 8, relation: 'Child', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toHaveLength(1);
            expect(units[0].members).toHaveLength(2);
            expect(units[0].dependents).toHaveLength(2);
            expect(units[0].dependents[0].name).toBe('Kid1');
            expect(units[0].dependents[1].name).toBe('Kid2');
        });
    });

    describe('Multi-Generational (Siblings)', () => {
        it('should create separate tax units for sibling branches', () => {
            const family = [
                // Core household
                { id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Jane', age: 42, relation: 'Spouse', familyGroupId: 0 },

                // Sibling branch
                { id: 3, name: 'Bob', age: 48, relation: 'Sibling', familyGroupId: 1 },
                { id: 4, name: 'Alice', age: 46, relation: 'Sibling Spouse', familyGroupId: 1 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toHaveLength(2);

            // Core household
            expect(units[0].name).toBe('John & Jane');
            expect(units[0].members).toHaveLength(2);

            // Sibling branch
            expect(units[1].name).toBe('Bob & Alice');
            expect(units[1].members).toHaveLength(2);
        });

        it('should handle single sibling without spouse', () => {
            const family = [
                { id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Bob', age: 48, relation: 'Sibling', familyGroupId: 1 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toHaveLength(2);
            expect(units[0].name).toBe('John');
            expect(units[0].filingStatus).toBe('single');
            expect(units[1].name).toBe('Bob');
            expect(units[1].filingStatus).toBe('single');
        });
    });

    describe('getUnitFinancials', () => {
        const mockMember = {
            id: 1,
            name: 'John',
            relation: 'Self',
            financials: { income: 100000, stocks: 50000, retirement: 20000 }
        };

        const mockUnit = {
            members: [mockMember],
            dependents: [],
            familyGroupId: 0
        };

        const mockHouseholdBase = {
            income: 50000,
            assets: { taxable: 500000, taxDeferred: 100000, taxFree: 0 },
            liabilities: { mortgage: 200000, other: 0 }
        };

        it('should aggregate member financials', () => {
            const financials = getUnitFinancials(mockUnit);
            expect(financials.income).toBe(100000);
            expect(financials.stocks).toBe(50000);
            expect(financials.retirement).toBe(20000);
        });

        it('should include household base for primary group 0 unit', () => {
            const financials = getUnitFinancials(mockUnit, mockHouseholdBase);
            expect(financials.income).toBe(150000); // 100k + 50k
            expect(financials.taxBuckets.taxable).toBe(550000); // 50k stocks + 500k household
            expect(financials.taxBuckets.taxDeferred).toBe(120000); // 20k retirement + 100k household
        });

        it('should NOT include household base for other groups', () => {
            const siblingUnit = {
                ...mockUnit,
                members: [{ ...mockMember, relation: 'Sibling' }],
                familyGroupId: 1
            };
            const financials = getUnitFinancials(siblingUnit, mockHouseholdBase);
            expect(financials.income).toBe(100000);
            expect(financials.taxBuckets.taxable).toBe(50000);
        });
    });
});
