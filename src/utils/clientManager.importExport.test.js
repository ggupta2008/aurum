import { describe, it, expect, beforeEach } from 'vitest';
import {
    exportClient,
    importClient,
    createNewClient,
    saveClient,
    getClient,
} from './clientManager';

describe('Client Manager - Import/Export', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('exportClient', () => {
        it('should export client with all data', () => {
            const { clientId, profile } = createNewClient('Export Test');
            profile.financials.income = 200000;
            profile.family[0].age = 50;
            saveClient(clientId, profile, {
                notes: 'Test notes',
                tags: ['HNW', 'Retired']
            });

            const exported = exportClient(clientId);

            expect(exported).toBeDefined();
            expect(exported.version).toBe('1.0');
            expect(exported.exportDate).toBeDefined();
            expect(exported.metadata).toBeDefined();
            expect(exported.profile).toBeDefined();
            expect(exported.metadata.name).toBe('Export Test');
            expect(exported.metadata.notes).toBe('Test notes');
            expect(exported.metadata.tags).toEqual(['HNW', 'Retired']);
            expect(exported.profile.financials.income).toBe(200000);
        });

        it('should return null for non-existent client', () => {
            const exported = exportClient('non-existent-id');
            expect(exported).toBeNull();
        });

        it('should include ISO date format', () => {
            const { clientId } = createNewClient('Date Test');
            const exported = exportClient(clientId);

            expect(exported.exportDate).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601 format
        });

        it('should preserve all profile properties', () => {
            const { clientId, profile } = createNewClient('Full Profile');
            profile.strategies = {
                roth_conversion: { active: true, inputs: { annualAmount: 25000 } }
            };
            profile.marketRegime = 'stagflation';
            profile.goals.primary = 'tax_min';
            saveClient(clientId, profile);

            const exported = exportClient(clientId);

            expect(exported.profile.strategies.roth_conversion.active).toBe(true);
            expect(exported.profile.marketRegime).toBe('stagflation');
            expect(exported.profile.goals.primary).toBe('tax_min');
        });
    });

    describe('importClient', () => {
        it('should import client from export data', () => {
            const { clientId: originalId, profile } = createNewClient('Original');
            profile.financials.income = 150000;
            saveClient(originalId, profile, { notes: 'Original notes' });

            const exportData = exportClient(originalId);
            const imported = importClient(exportData);

            expect(imported).toBeDefined();
            expect(imported.clientId).toBeDefined();
            expect(imported.clientId).not.toBe(originalId); // New ID
            expect(imported.name).toContain('Imported');

            const importedProfile = getClient(imported.clientId);
            expect(importedProfile.financials.income).toBe(150000);
        });

        it('should throw error for invalid export format', () => {
            const invalidData = { invalid: 'data' };
            expect(() => importClient(invalidData)).toThrow('Invalid export format');
        });

        it('should throw error for missing profile', () => {
            const invalidData = { metadata: { name: 'Test' } };
            expect(() => importClient(invalidData)).toThrow('Invalid export format');
        });

        it('should throw error for missing metadata', () => {
            const invalidData = { profile: { family: [] } };
            expect(() => importClient(invalidData)).toThrow('Invalid export format');
        });

        it('should preserve all imported data', () => {
            const { clientId: originalId, profile } = createNewClient('Complex');
            profile.family.push({
                id: 2,
                name: 'Spouse',
                age: 42,
                relation: 'Spouse',
                financials: { income: 100000 }
            });
            profile.strategies = {
                simple_path: { active: true, inputs: {} }
            };
            saveClient(originalId, profile, {
                notes: 'Complex client',
                tags: ['Multi-Gen', 'HNW']
            });

            const exportData = exportClient(originalId);
            const imported = importClient(exportData);
            const importedProfile = getClient(imported.clientId);

            expect(importedProfile.family).toHaveLength(2);
            expect(importedProfile.strategies.simple_path.active).toBe(true);
        });

        it('should handle empty strategies', () => {
            const { clientId: originalId, profile } = createNewClient('Empty Strategies');
            profile.strategies = {};
            saveClient(originalId, profile);

            const exportData = exportClient(originalId);
            const imported = importClient(exportData);
            const importedProfile = getClient(imported.clientId);

            expect(importedProfile.strategies).toEqual({});
        });

        it('should handle empty family', () => {
            const { clientId: originalId, profile } = createNewClient('Empty Family');
            profile.family = [];
            saveClient(originalId, profile);

            const exportData = exportClient(originalId);
            const imported = importClient(exportData);
            const importedProfile = getClient(imported.clientId);

            expect(importedProfile.family).toEqual([]);
        });
    });

    describe('Export/Import Round Trip', () => {
        it('should preserve all data through export/import cycle', () => {
            const { clientId: originalId, profile } = createNewClient('Round Trip');
            profile.financials.income = 250000;
            profile.financials.assets = {
                taxable: 500000,
                taxDeferred: 1000000,
                taxFree: 200000
            };
            profile.family[0].age = 55;
            profile.family[0].state = 'NY';
            profile.strategies = {
                roth_conversion: { active: true, inputs: { annualAmount: 30000 } },
                direct_indexing: { active: false, inputs: {} }
            };
            profile.marketRegime = 'bull_charge';
            profile.goals.primary = 'max_wealth';

            saveClient(originalId, profile, {
                notes: 'High net worth client',
                tags: ['HNW', 'NY', 'Aggressive']
            });

            // Export
            const exportData = exportClient(originalId);

            // Import
            const imported = importClient(exportData);
            const importedProfile = getClient(imported.clientId);

            // Verify all data preserved
            expect(importedProfile.financials.income).toBe(250000);
            expect(importedProfile.financials.assets.taxable).toBe(500000);
            expect(importedProfile.financials.assets.taxDeferred).toBe(1000000);
            expect(importedProfile.financials.assets.taxFree).toBe(200000);
            expect(importedProfile.family[0].age).toBe(55);
            expect(importedProfile.family[0].state).toBe('NY');
            expect(importedProfile.strategies.roth_conversion.active).toBe(true);
            expect(importedProfile.strategies.roth_conversion.inputs.annualAmount).toBe(30000);
            expect(importedProfile.strategies.direct_indexing.active).toBe(false);
            expect(importedProfile.marketRegime).toBe('bull_charge');
            expect(importedProfile.goals.primary).toBe('max_wealth');
        });

        it('should handle multiple export/import cycles', () => {
            const { clientId: id1, profile: profile1 } = createNewClient('Client 1');
            profile1.financials.income = 100000;
            saveClient(id1, profile1);

            const export1 = exportClient(id1);
            const import1 = importClient(export1);

            const export2 = exportClient(import1.clientId);
            const import2 = importClient(export2);

            const finalProfile = getClient(import2.clientId);
            expect(finalProfile.financials.income).toBe(100000);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large client data', () => {
            const { clientId, profile } = createNewClient('Large Family');

            // Add many family members
            for (let i = 0; i < 20; i++) {
                profile.family.push({
                    id: i + 2,
                    name: `Member ${i}`,
                    age: 20 + i,
                    relation: 'Child',
                    financials: { income: 50000 * i }
                });
            }

            saveClient(clientId, profile);
            const exportData = exportClient(clientId);
            const imported = importClient(exportData);
            const importedProfile = getClient(imported.clientId);

            expect(importedProfile.family).toHaveLength(21); // Original + 20 added
        });

        it('should handle special characters in notes', () => {
            const { clientId, profile } = createNewClient('Special Chars');
            saveClient(clientId, profile, {
                notes: 'Client with "quotes", \'apostrophes\', and émojis 🎯'
            });

            const exportData = exportClient(clientId);
            const imported = importClient(exportData);

            expect(imported.name).toContain('Special Chars');
        });

        it('should handle very long client names', () => {
            const longName = 'A'.repeat(200);
            const { clientId, profile } = createNewClient(longName);
            saveClient(clientId, profile);

            const exportData = exportClient(clientId);
            const imported = importClient(exportData);

            expect(imported.name).toContain(longName);
        });
    });
});
