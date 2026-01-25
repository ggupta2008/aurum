/**
 * Data Migration & Cleanup Utility
 * Ensures localStorage data matches current schema and removes stale fields
 */

import { getAllClients, getClient, saveClient } from './clientManager';

/**
 * Migrates a single profile to the latest schema
 */
export const migrateProfile = (profile) => {
    if (!profile) return null;

    const migrated = { ...profile };

    // Ensure financials structure exists
    if (!migrated.financials) {
        migrated.financials = {
            assets: {},
            liabilities: [],
            income: 0,
            spending: 0,
            taxRate: 0.24
        };
    }

    // Migrate financials.assets
    if (!migrated.financials.assets) {
        migrated.financials.assets = {};
    }

    // Ensure assets have proper structure
    const assets = migrated.financials.assets;
    if (!assets.taxable) assets.taxable = 0;
    if (!assets.taxDeferred) assets.taxDeferred = 0;
    if (!assets.taxFree) assets.taxFree = 0;
    if (!assets.cash) assets.cash = 0;

    // Migrate realEstate from number to array
    if (typeof assets.realEstate === 'number') {
        const val = assets.realEstate;
        assets.realEstate = val > 0 ? [{
            id: Date.now(),
            name: 'Legacy Property',
            type: 'primary',
            value: val,
            mortgage: 0,
            rate: 0.04,
            termYears: 30
        }] : [];
    }
    if (!Array.isArray(assets.realEstate)) {
        assets.realEstate = [];
    }

    // Ensure positions array exists
    if (!Array.isArray(assets.positions)) {
        assets.positions = [];
    }

    // Ensure liabilities array exists
    if (!Array.isArray(migrated.financials.liabilities)) {
        migrated.financials.liabilities = [];
    }

    // Migrate family members
    if (Array.isArray(migrated.family)) {
        migrated.family = migrated.family.map(member => {
            const m = { ...member };

            // Ensure financials exists
            if (!m.financials) {
                m.financials = {
                    income: 0,
                    spending: 0,
                    stocks: 0,
                    retirement: 0,
                    taxFree: 0,
                    cash: 0
                };
            }

            const f = m.financials;

            // Migrate member realEstate from number to array
            if (typeof f.realEstate === 'number') {
                const val = f.realEstate;
                f.realEstate = val > 0 ? [{
                    id: Date.now(),
                    name: `${m.name}'s Property`,
                    type: 'primary',
                    value: val,
                    mortgage: 0,
                    rate: 0.04,
                    termYears: 30
                }] : [];
            }
            if (!Array.isArray(f.realEstate)) {
                f.realEstate = [];
            }

            // Ensure positions array exists
            if (!Array.isArray(f.positions)) {
                f.positions = [];
            }

            // Ensure debts array exists
            if (!Array.isArray(f.debts)) {
                f.debts = [];
            }

            // Remove stale fields that no longer exist in the UI
            delete f.taxBuckets; // Legacy field - now using stocks/retirement/taxFree
            delete f.loans; // Legacy field - now using debts array

            return m;
        });
    }

    // Ensure goals exists
    if (!migrated.goals) {
        migrated.goals = {
            primary: 'max_wealth',
            timeHorizon: 'long_term'
        };
    }

    // Ensure strategies exists
    if (!migrated.strategies) {
        migrated.strategies = {};
    }

    // Ensure marketRegime exists
    if (!migrated.marketRegime) {
        migrated.marketRegime = 'goldilocks';
    }

    return migrated;
};

/**
 * Migrates all clients in localStorage
 */
export const migrateAllClients = () => {
    const clients = getAllClients();
    let migratedCount = 0;

    clients.forEach(clientMeta => {
        const profile = getClient(clientMeta.id);
        if (profile) {
            const migrated = migrateProfile(profile);
            if (migrated) {
                saveClient(clientMeta.id, migrated, {
                    name: clientMeta.name,
                    notes: clientMeta.notes,
                    tags: clientMeta.tags
                });
                migratedCount++;
            }
        }
    });

    return {
        total: clients.length,
        migrated: migratedCount
    };
};

/**
 * Cleans up orphaned localStorage keys
 */
export const cleanupOrphanedData = () => {
    const clients = getAllClients();
    const validClientIds = new Set(clients.map(c => c.id));
    const removedKeys = [];

    // Find all aurum_client_ keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aurum_client_')) {
            const clientId = key.replace('aurum_client_', '');
            if (!validClientIds.has(clientId)) {
                localStorage.removeItem(key);
                removedKeys.push(key);
            }
        }
    }

    return {
        removed: removedKeys.length,
        keys: removedKeys
    };
};

/**
 * Full cleanup and migration
 */
export const performFullMigration = () => {
    console.log('🔄 Starting Aurum data migration...');

    const migrationResult = migrateAllClients();
    console.log(`✅ Migrated ${migrationResult.migrated} of ${migrationResult.total} clients`);

    const cleanupResult = cleanupOrphanedData();
    console.log(`🧹 Removed ${cleanupResult.removed} orphaned keys`);

    return {
        migration: migrationResult,
        cleanup: cleanupResult
    };
};

/**
 * Reset all data (use with caution!)
 */
export const resetAllData = () => {
    const confirmed = window.confirm(
        '⚠️ WARNING: This will delete ALL client data and cannot be undone. Are you sure?'
    );

    if (!confirmed) return false;

    // Remove all aurum-related keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aurum_')) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log(`🗑️ Removed ${keysToRemove.length} keys from localStorage`);

    // Reload page to reinitialize
    window.location.reload();

    return true;
};
