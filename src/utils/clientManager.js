/**
 * Client Data Management System
 * Handles multi-client storage, retrieval, and management using localStorage
 */

const CLIENTS_KEY = 'aurum_clients_index';
const CLIENT_PREFIX = 'aurum_client_';
const CURRENT_CLIENT_KEY = 'aurum_current_client_id';

/**
 * Client metadata structure:
 * {
 *   id: string (UUID),
 *   name: string,
 *   created: timestamp,
 *   lastModified: timestamp,
 *   notes: string,
 *   tags: string[] (e.g., ['HNW', 'Retired', 'Multi-Gen'])
 * }
 */

/**
 * Get list of all clients (metadata only)
 */
export const getAllClients = () => {
    try {
        const index = localStorage.getItem(CLIENTS_KEY);
        return index ? JSON.parse(index) : [];
    } catch (error) {
        console.error('Error loading clients index:', error);
        return [];
    }
};

/**
 * Get full client data by ID
 */
export const getClient = (clientId) => {
    try {
        const data = localStorage.getItem(`${CLIENT_PREFIX}${clientId}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error loading client ${clientId}:`, error);
        return null;
    }
};

/**
 * Get current active client ID
 */
export const getCurrentClientId = () => {
    return localStorage.getItem(CURRENT_CLIENT_KEY);
};

/**
 * Set current active client
 */
export const setCurrentClientId = (clientId) => {
    localStorage.setItem(CURRENT_CLIENT_KEY, clientId);
};

/**
 * Save client data (create or update)
 */
export const saveClient = (clientId, profile, metadata = {}) => {
    try {
        const clients = getAllClients();
        const now = Date.now();

        // Check if client exists
        const existingIndex = clients.findIndex(c => c.id === clientId);

        const clientMetadata = {
            id: clientId,
            name: metadata.name || profile.family?.[0]?.name || 'Unnamed Client',
            created: existingIndex >= 0 ? clients[existingIndex].created : now,
            lastModified: now,
            notes: metadata.notes || '',
            tags: metadata.tags || []
        };

        // Update or add to index
        if (existingIndex >= 0) {
            clients[existingIndex] = clientMetadata;
        } else {
            clients.push(clientMetadata);
        }

        // Save index
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));

        // Save full client data
        localStorage.setItem(`${CLIENT_PREFIX}${clientId}`, JSON.stringify(profile));

        return clientMetadata;
    } catch (error) {
        console.error('Error saving client:', error);
        throw error;
    }
};

/**
 * Delete client
 */
export const deleteClient = (clientId) => {
    try {
        const clients = getAllClients();
        const filtered = clients.filter(c => c.id !== clientId);

        localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
        localStorage.removeItem(`${CLIENT_PREFIX}${clientId}`);

        // If deleting current client, clear current
        if (getCurrentClientId() === clientId) {
            localStorage.removeItem(CURRENT_CLIENT_KEY);
        }

        return true;
    } catch (error) {
        console.error('Error deleting client:', error);
        return false;
    }
};

/**
 * Create new client with default profile
 */
export const createNewClient = (name = 'New Client', initialProfile = null) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const profile = initialProfile || {
        family: [{
            id: Date.now(),
            name: name,
            age: 45,
            relation: 'Self',
            residency: 'US_Citizen',
            state: 'CA',
            familyGroupId: 0,
            financials: {
                income: 0,
                stocks: 0,
                retirement: 0,
                realEstate: 0,
                cash: 0,
                loans: 0
            }
        }],
        financials: {
            assets: {
                taxable: 0,
                taxDeferred: 0,
                taxFree: 0
            },
            income: 0,
            spending: 0,
            taxRate: 0.35
        },
        goals: {
            primary: 'wealth_preservation'
        },
        strategies: {},
        marketRegime: 'goldilocks'
    };

    saveClient(clientId, profile, { name });
    setCurrentClientId(clientId);

    return { clientId, profile };
};

/**
 * Duplicate client
 */
export const duplicateClient = (sourceClientId, newName = null) => {
    const sourceProfile = getClient(sourceClientId);
    if (!sourceProfile) return null;

    const sourceMetadata = getAllClients().find(c => c.id === sourceClientId);
    const name = newName || `${sourceMetadata?.name || 'Client'} (Copy)`;

    return createNewClient(name, sourceProfile);
};

/**
 * Export client data as JSON
 */
export const exportClient = (clientId) => {
    const profile = getClient(clientId);
    const metadata = getAllClients().find(c => c.id === clientId);

    if (!profile || !metadata) return null;

    return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        metadata,
        profile
    };
};

/**
 * Import client data from JSON
 */
export const importClient = (exportData) => {
    try {
        if (!exportData.profile || !exportData.metadata) {
            throw new Error('Invalid export format');
        }

        const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const name = `${exportData.metadata.name} (Imported)`;

        saveClient(clientId, exportData.profile, {
            name,
            notes: exportData.metadata.notes,
            tags: exportData.metadata.tags
        });

        return { clientId, name };
    } catch (error) {
        console.error('Error importing client:', error);
        throw error;
    }
};

/**
 * Search clients by name or tags
 */
export const searchClients = (query) => {
    const clients = getAllClients();
    const lowerQuery = query.toLowerCase();

    return clients.filter(client =>
        client.name.toLowerCase().includes(lowerQuery) ||
        client.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        client.notes.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Get client statistics
 */
export const getClientStats = (clientId) => {
    const profile = getClient(clientId);
    if (!profile) return null;

    const totalAssets = (profile.financials?.assets?.taxable || 0) +
        (profile.financials?.assets?.taxDeferred || 0) +
        (profile.financials?.assets?.taxFree || 0);

    const familyMembers = profile.family?.length || 0;
    const activeStrategies = Object.values(profile.strategies || {}).filter(s => s.active).length;

    return {
        totalAssets,
        familyMembers,
        activeStrategies,
        marketRegime: profile.marketRegime || 'goldilocks'
    };
};

/**
 * Migrate legacy single-client data to multi-client system
 */
export const migrateLegacyData = () => {
    try {
        // Check if already migrated
        const clients = getAllClients();
        if (clients.length > 0) {
            return { migrated: false, message: 'Already migrated' };
        }

        // Look for legacy profile
        const legacyProfile = localStorage.getItem('aurum_wealth_profile_v4');
        if (!legacyProfile) {
            return { migrated: false, message: 'No legacy data found' };
        }

        // Create new client from legacy data
        const profile = JSON.parse(legacyProfile);
        const primaryMember = profile.family?.[0];
        const name = primaryMember?.name || 'Legacy Client';

        const { clientId } = createNewClient(name, profile);

        // Keep legacy data for safety (don't delete)
        return {
            migrated: true,
            clientId,
            message: `Migrated legacy profile to client: ${name}`
        };
    } catch (error) {
        console.error('Error migrating legacy data:', error);
        return { migrated: false, message: error.message };
    }
};
