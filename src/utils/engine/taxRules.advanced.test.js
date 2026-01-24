import { describe, it, expect } from 'vitest';
import { identifyTaxUnits, getUnitFinancials } from './taxRules';

describe('Tax Rules - Advanced Scenarios', () => {
    describe('Complex Family Structures', () => {
        it('should handle 4-generation family', () => {
            const family = [
                // Generation 1: Core
                { id: 1, name: 'John', age: 70, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Jane', age: 68, relation: 'Spouse', familyGroupId: 0 },

                // Generation 2: Children
                { id: 3, name: 'Son', age: 45, relation: 'Child', familyGroupId: 0 },

                // Generation 3: Grandchildren
                { id: 4, name: 'Grandson', age: 20, relation: 'Child', familyGroupId: 0 },

                // Generation 4: Great-grandchildren
                { id: 5, name: 'Great-grandson', age: 2, relation: 'Child', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            // Children under 24 are dependents: Grandson (20) and Great-grandson (2)
            // Son (45) is an adult and forms separate unit
            expect(units.length).toBeGreaterThan(0);

            const coreUnit = units.find(u => u.members.some(m => m.name === 'John'));
            expect(coreUnit).toBeDefined();
            expect(coreUnit.members).toHaveLength(2); // John & Jane
            expect(coreUnit.dependents.length).toBeGreaterThanOrEqual(1); // At least the 2-year-old
        });

        it('should handle multiple sibling branches with spouses', () => {
            const family = [
                // Core
                { id: 1, name: 'Primary', age: 50, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Spouse', age: 48, relation: 'Spouse', familyGroupId: 0 },

                // Sibling 1
                { id: 3, name: 'Sibling1', age: 52, relation: 'Sibling', familyGroupId: 1 },
                { id: 4, name: 'Sibling1Spouse', age: 50, relation: 'Sibling Spouse', familyGroupId: 1 },

                // Sibling 2
                { id: 5, name: 'Sibling2', age: 48, relation: 'Sibling', familyGroupId: 2 },
                { id: 6, name: 'Sibling2Spouse', age: 46, relation: 'Sibling Spouse', familyGroupId: 2 },

                // Sibling 3 (single)
                { id: 7, name: 'Sibling3', age: 45, relation: 'Sibling', familyGroupId: 3 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toHaveLength(4);
            expect(units[0].filingStatus).toBe('married'); // Core
            expect(units[1].filingStatus).toBe('married'); // Sibling 1
            expect(units[2].filingStatus).toBe('married'); // Sibling 2
            expect(units[3].filingStatus).toBe('single'); // Sibling 3
        });

        it('should handle adult children (24+) as separate units', () => {
            const family = [
                { id: 1, name: 'Parent', age: 60, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'AdultChild', age: 30, relation: 'Child', familyGroupId: 0 },
                { id: 3, name: 'YoungChild', age: 15, relation: 'Child', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            // Adult child (30) should not be a dependent
            const coreUnit = units.find(u => u.members.some(m => m.name === 'Parent'));
            expect(coreUnit.dependents).toHaveLength(1);
            expect(coreUnit.dependents[0].name).toBe('YoungChild');
        });

        it('should handle mixed family groups with children', () => {
            const family = [
                // Core with children
                { id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Jane', age: 42, relation: 'Spouse', familyGroupId: 0 },
                { id: 3, name: 'Kid1', age: 10, relation: 'Child', familyGroupId: 0 },
                { id: 4, name: 'Kid2', age: 8, relation: 'Child', familyGroupId: 0 },

                // Sibling with children
                { id: 5, name: 'Bob', age: 48, relation: 'Sibling', familyGroupId: 1 },
                { id: 6, name: 'Alice', age: 46, relation: 'Sibling Spouse', familyGroupId: 1 },
                { id: 7, name: 'Nephew1', age: 12, relation: 'Child', familyGroupId: 1 },
                { id: 8, name: 'Nephew2', age: 9, relation: 'Child', familyGroupId: 1 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toHaveLength(2);

            const coreUnit = units.find(u => u.members.some(m => m.name === 'John'));
            expect(coreUnit.dependents).toHaveLength(2);
            expect(coreUnit.dependents.map(d => d.name)).toEqual(['Kid1', 'Kid2']);

            const siblingUnit = units.find(u => u.members.some(m => m.name === 'Bob'));
            expect(siblingUnit.dependents).toHaveLength(2);
            expect(siblingUnit.dependents.map(d => d.name)).toEqual(['Nephew1', 'Nephew2']);
        });
    });

    describe('getUnitFinancials', () => {
        it('should aggregate member financials correctly', () => {
            const unit = {
                id: 'test_unit',
                name: 'Test Family',
                filingStatus: 'married',
                members: [
                    {
                        id: 1,
                        name: 'Member1',
                        financials: {
                            income: 100000,
                            stocks: 200000,
                            retirement: 300000,
                            realEstate: 400000,
                            cash: 50000,
                            loans: 10000
                        }
                    },
                    {
                        id: 2,
                        name: 'Member2',
                        financials: {
                            income: 80000,
                            stocks: 150000,
                            retirement: 250000,
                            realEstate: 0,
                            cash: 30000,
                            loans: 5000
                        }
                    }
                ],
                dependents: [],
                familyGroupId: 0
            };

            const financials = getUnitFinancials(unit);

            expect(financials.income).toBe(180000);
            expect(financials.stocks).toBe(350000);
            expect(financials.retirement).toBe(550000);
            expect(financials.realEstate).toBe(400000);
            expect(financials.cash).toBe(80000);
            expect(financials.loans).toBe(15000);
        });

        it('should include dependent financials', () => {
            const unit = {
                id: 'test_unit',
                name: 'Family with Kids',
                filingStatus: 'married',
                members: [
                    {
                        id: 1,
                        name: 'Parent',
                        financials: { income: 100000, stocks: 0, retirement: 0, realEstate: 0, cash: 0, loans: 0 }
                    }
                ],
                dependents: [
                    {
                        id: 2,
                        name: 'Child',
                        financials: { income: 20000, stocks: 10000, retirement: 0, realEstate: 0, cash: 5000, loans: 0 }
                    }
                ],
                familyGroupId: 0
            };

            const financials = getUnitFinancials(unit);

            expect(financials.income).toBe(120000); // Parent + Child
            expect(financials.stocks).toBe(10000);
            expect(financials.cash).toBe(5000);
        });

        it('should handle missing financials gracefully', () => {
            const unit = {
                id: 'test_unit',
                name: 'Incomplete Data',
                filingStatus: 'single',
                members: [
                    {
                        id: 1,
                        name: 'Member',
                        financials: {} // Empty financials
                    }
                ],
                dependents: [],
                familyGroupId: 0
            };

            const financials = getUnitFinancials(unit);

            expect(financials.income).toBe(0);
            expect(financials.stocks).toBe(0);
            expect(financials.retirement).toBe(0);
        });

        it('should merge household base for primary unit', () => {
            const unit = {
                id: 'test_unit',
                name: 'Primary',
                filingStatus: 'married',
                members: [
                    {
                        id: 1,
                        name: 'Self',
                        relation: 'Self',
                        financials: { income: 100000, stocks: 0, retirement: 0, realEstate: 0, cash: 0, loans: 0 }
                    }
                ],
                dependents: [],
                familyGroupId: 0
            };

            const householdBase = {
                income: 50000,
                assets: {
                    taxable: 200000,
                    taxDeferred: 300000,
                    taxFree: 100000
                },
                liabilities: {
                    mortgage: 400000,
                    other: 50000
                }
            };

            const financials = getUnitFinancials(unit, householdBase);

            expect(financials.income).toBe(150000); // Member + household
            expect(financials.taxBuckets.taxable).toBeGreaterThan(0);
            expect(financials.taxBuckets.taxDeferred).toBe(300000);
            expect(financials.taxBuckets.taxFree).toBe(100000);
            expect(financials.loans).toBe(450000); // Mortgage + other
        });

        it('should NOT merge household base for non-primary units', () => {
            const unit = {
                id: 'test_unit',
                name: 'Sibling',
                filingStatus: 'single',
                members: [
                    {
                        id: 1,
                        name: 'Sibling',
                        relation: 'Sibling',
                        financials: { income: 80000, stocks: 0, retirement: 0, realEstate: 0, cash: 0, loans: 0 }
                    }
                ],
                dependents: [],
                familyGroupId: 1 // Not group 0
            };

            const householdBase = {
                income: 50000,
                assets: { taxable: 200000, taxDeferred: 300000, taxFree: 100000 }
            };

            const financials = getUnitFinancials(unit, householdBase);

            expect(financials.income).toBe(80000); // Only member income, no household base
            expect(financials.taxBuckets.taxDeferred).toBe(0); // No household assets
        });
    });

    describe('Edge Cases', () => {
        it('should handle family with only children (no adults)', () => {
            const family = [
                { id: 1, name: 'Child1', age: 15, relation: 'Child', familyGroupId: 0 },
                { id: 2, name: 'Child2', age: 12, relation: 'Child', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            // Should still create a unit even without Self/Spouse
            expect(units.length).toBeGreaterThan(0);
        });

        it('should handle family with duplicate relations', () => {
            const family = [
                { id: 1, name: 'Self1', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Self2', age: 42, relation: 'Self', familyGroupId: 0 }, // Duplicate Self
            ];

            const units = identifyTaxUnits(family);

            // Should handle gracefully
            expect(units).toBeDefined();
            expect(units.length).toBeGreaterThan(0);
        });

        it('should handle negative ages gracefully', () => {
            const family = [
                { id: 1, name: 'Person', age: -5, relation: 'Self', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toBeDefined();
            expect(units.length).toBeGreaterThan(0);
        });

        it('should handle very large family groups', () => {
            const family = [];
            for (let i = 0; i < 100; i++) {
                family.push({
                    id: i,
                    name: `Person${i}`,
                    age: 20 + (i % 60),
                    relation: i === 0 ? 'Self' : 'Child',
                    familyGroupId: 0
                });
            }

            const units = identifyTaxUnits(family);

            expect(units).toBeDefined();
            expect(units.length).toBeGreaterThan(0);
        });

        it('should handle missing familyGroupId', () => {
            const family = [
                { id: 1, name: 'Person1', age: 45, relation: 'Self' }, // No familyGroupId
                { id: 2, name: 'Person2', age: 42, relation: 'Spouse' },
            ];

            const units = identifyTaxUnits(family);

            expect(units).toBeDefined();
            expect(units.length).toBeGreaterThan(0);
        });
    });

    describe('Tax Unit Properties Validation', () => {
        it('should always have valid ID format', () => {
            const family = [
                { id: 1, name: 'John', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Jane', age: 42, relation: 'Spouse', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            units.forEach(unit => {
                expect(unit.id).toBeDefined();
                expect(typeof unit.id).toBe('string');
                expect(unit.id).toMatch(/^unit_/);
            });
        });

        it('should always have non-empty name', () => {
            const family = [
                { id: 1, name: 'Test', age: 45, relation: 'Self', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            units.forEach(unit => {
                expect(unit.name).toBeDefined();
                expect(unit.name.length).toBeGreaterThan(0);
            });
        });

        it('should always have valid filingStatus', () => {
            const family = [
                { id: 1, name: 'Single', age: 45, relation: 'Self', familyGroupId: 0 },
                { id: 2, name: 'Married1', age: 50, relation: 'Sibling', familyGroupId: 1 },
                { id: 3, name: 'Married2', age: 48, relation: 'Sibling Spouse', familyGroupId: 1 },
            ];

            const units = identifyTaxUnits(family);

            units.forEach(unit => {
                expect(unit.filingStatus).toBeDefined();
                expect(['single', 'married']).toContain(unit.filingStatus);
            });
        });

        it('should always have members array', () => {
            const family = [
                { id: 1, name: 'Test', age: 45, relation: 'Self', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            units.forEach(unit => {
                expect(Array.isArray(unit.members)).toBe(true);
                expect(unit.members.length).toBeGreaterThan(0);
            });
        });

        it('should always have dependents array', () => {
            const family = [
                { id: 1, name: 'Test', age: 45, relation: 'Self', familyGroupId: 0 },
            ];

            const units = identifyTaxUnits(family);

            units.forEach(unit => {
                expect(Array.isArray(unit.dependents)).toBe(true);
            });
        });
    });
});
