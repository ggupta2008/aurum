import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getAllClients,
    getClient,
    getCurrentClientId,
    setCurrentClientId,
    saveClient,
    deleteClient,
    createNewClient,
    duplicateClient,
    searchClients,
    getClientStats,
    migrateLegacyData,
} from './clientManager';

describe('Client Manager', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('createNewClient', () => {
        it('should create a new client with default profile', () => {
            const { clientId, profile } = createNewClient('John Smith');

            expect(clientId).toBeDefined();
            expect(clientId).toMatch(/^client_/);
            expect(profile.family).toHaveLength(1);
            expect(profile.family[0].name).toBe('John Smith');
            expect(profile.family[0].age).toBe(45);
            expect(profile.family[0].relation).toBe('Self');
        });

        it('should create client with custom initial profile', () => {
            const customProfile = {
                family: [{ id: 1, name: 'Custom', age: 50, relation: 'Self', financials: {} }],
                financials: { income: 100000 },
                goals: { primary: 'retirement' },
                strategies: {},
                marketRegime: 'stagflation',
            };

            const { profile } = createNewClient('Custom Client', customProfile);

            expect(profile.family[0].name).toBe('Custom');
            expect(profile.family[0].age).toBe(50);
            expect(profile.marketRegime).toBe('stagflation');
        });

        it('should set the new client as current', () => {
            const { clientId } = createNewClient('Test Client');
            const currentId = getCurrentClientId();

            expect(currentId).toBe(clientId);
        });

        it('should add client to index', () => {
            createNewClient('Client 1');
            createNewClient('Client 2');

            const clients = getAllClients();
            expect(clients).toHaveLength(2);
            expect(clients[0].name).toBe('Client 1');
            expect(clients[1].name).toBe('Client 2');
        });
    });

    describe('saveClient and getClient', () => {
        it('should save and retrieve client data', () => {
            const { clientId, profile } = createNewClient('Jane Doe');
            profile.financials.income = 200000;
            profile.family[0].age = 50;

            saveClient(clientId, profile);
            const retrieved = getClient(clientId);

            expect(retrieved.financials.income).toBe(200000);
            expect(retrieved.family[0].age).toBe(50);
        });

        it('should update lastModified timestamp on save', () => {
            const { clientId, profile } = createNewClient('Test');
            const clients1 = getAllClients();
            const created = clients1[0].created;

            // Wait a bit
            vi.useFakeTimers();
            vi.advanceTimersByTime(1000);

            saveClient(clientId, profile, { name: 'Updated Name' });
            const clients2 = getAllClients();

            expect(clients2[0].created).toBe(created);
            expect(clients2[0].lastModified).toBeGreaterThan(created);
            expect(clients2[0].name).toBe('Updated Name');

            vi.useRealTimers();
        });

        it('should preserve metadata when saving', () => {
            const { clientId, profile } = createNewClient('Test');

            saveClient(clientId, profile, {
                name: 'Updated',
                notes: 'Important client',
                tags: ['HNW', 'Retired'],
            });

            const clients = getAllClients();
            expect(clients[0].name).toBe('Updated');
            expect(clients[0].notes).toBe('Important client');
            expect(clients[0].tags).toEqual(['HNW', 'Retired']);
        });
    });

    describe('deleteClient', () => {
        it('should delete client and remove from index', () => {
            const { clientId } = createNewClient('To Delete');

            const success = deleteClient(clientId);

            expect(success).toBe(true);
            expect(getClient(clientId)).toBeNull();
            expect(getAllClients()).toHaveLength(0);
        });

        it('should clear current client ID if deleting current', () => {
            const { clientId } = createNewClient('Current');
            setCurrentClientId(clientId);

            deleteClient(clientId);

            expect(getCurrentClientId()).toBeNull();
        });

        it('should not affect other clients', () => {
            const { clientId: id1 } = createNewClient('Client 1');
            const { clientId: id2 } = createNewClient('Client 2');
            const { clientId: id3 } = createNewClient('Client 3');

            deleteClient(id2);

            expect(getClient(id1)).toBeDefined();
            expect(getClient(id2)).toBeNull();
            expect(getClient(id3)).toBeDefined();
            expect(getAllClients()).toHaveLength(2);
        });
    });

    describe('duplicateClient', () => {
        it('should create a copy of existing client', () => {
            const { clientId: originalId, profile } = createNewClient('Original');
            profile.financials.income = 150000;
            profile.family[0].age = 55;
            saveClient(originalId, profile);

            const result = duplicateClient(originalId, 'Copy');

            expect(result).toBeDefined();
            expect(result.clientId).not.toBe(originalId);

            const copy = getClient(result.clientId);
            expect(copy.financials.income).toBe(150000);
            expect(copy.family[0].age).toBe(55);
        });

        it('should use default copy name if not provided', () => {
            const { clientId } = createNewClient('Original');

            duplicateClient(clientId);

            const clients = getAllClients();
            expect(clients.some(c => c.name === 'Original (Copy)')).toBe(true);
        });
    });

    describe('searchClients', () => {
        beforeEach(() => {
            createNewClient('John Smith');
            saveClient(getCurrentClientId(), getClient(getCurrentClientId()), {
                tags: ['HNW', 'Retired'],
            });

            createNewClient('Jane Doe');
            saveClient(getCurrentClientId(), getClient(getCurrentClientId()), {
                tags: ['Young', 'Entrepreneur'],
                notes: 'Tech startup founder',
            });

            createNewClient('Bob Johnson');
        });

        it('should search by name', () => {
            const results = searchClients('john');
            expect(results).toHaveLength(2); // John Smith and Bob Johnson
            expect(results.some(c => c.name === 'John Smith')).toBe(true);
            expect(results.some(c => c.name === 'Bob Johnson')).toBe(true);
        });

        it('should search by tags', () => {
            const results = searchClients('retired');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('John Smith');
        });

        it('should search by notes', () => {
            const results = searchClients('startup');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Jane Doe');
        });

        it('should be case-insensitive', () => {
            const results = searchClients('JOHN');
            expect(results.length).toBeGreaterThan(0);
        });
    });

    describe('getClientStats', () => {
        it('should calculate total assets', () => {
            const { clientId, profile } = createNewClient('Test');
            profile.financials.assets = {
                taxable: 100000,
                taxDeferred: 200000,
                taxFree: 50000,
            };
            saveClient(clientId, profile);

            const stats = getClientStats(clientId);

            expect(stats.totalAssets).toBe(350000);
        });

        it('should count family members', () => {
            const { clientId, profile } = createNewClient('Test');
            profile.family.push({
                id: 2,
                name: 'Spouse',
                age: 42,
                relation: 'Spouse',
                financials: {},
            });
            saveClient(clientId, profile);

            const stats = getClientStats(clientId);

            expect(stats.familyMembers).toBe(2);
        });

        it('should count active strategies', () => {
            const { clientId, profile } = createNewClient('Test');
            profile.strategies = {
                roth_conversion: { active: true, inputs: {} },
                tax_loss_harvesting: { active: true, inputs: {} },
                asset_location: { active: false, inputs: {} },
            };
            saveClient(clientId, profile);

            const stats = getClientStats(clientId);

            expect(stats.activeStrategies).toBe(2);
        });
    });

    describe('migrateLegacyData', () => {
        it('should migrate legacy profile to new system', () => {
            const legacyProfile = {
                family: [{ id: 1, name: 'Legacy User', age: 60, relation: 'Self', financials: {} }],
                financials: { income: 100000 },
                goals: { primary: 'retirement' },
                strategies: {},
                marketRegime: 'goldilocks',
            };

            localStorage.setItem('aurum_wealth_profile_v4', JSON.stringify(legacyProfile));

            const result = migrateLegacyData();

            expect(result.migrated).toBe(true);
            expect(result.clientId).toBeDefined();

            const clients = getAllClients();
            expect(clients).toHaveLength(1);
            expect(clients[0].name).toBe('Legacy User');
        });

        it('should not migrate if already migrated', () => {
            createNewClient('Existing');

            const result = migrateLegacyData();

            expect(result.migrated).toBe(false);
            expect(result.message).toContain('Already migrated');
        });

        it('should not migrate if no legacy data exists', () => {
            const result = migrateLegacyData();

            expect(result.migrated).toBe(false);
            expect(result.message).toContain('No legacy data');
        });
    });

    describe('getCurrentClientId and setCurrentClientId', () => {
        it('should get and set current client ID', () => {
            const { clientId } = createNewClient('Test');

            setCurrentClientId(clientId);
            const retrieved = getCurrentClientId();

            expect(retrieved).toBe(clientId);
        });
    });
});
