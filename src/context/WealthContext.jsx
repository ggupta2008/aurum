import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PROFILE, calculateProjection, getRecommendedStrategies, calculateMonteCarlo } from '../utils/engine/financeEngine';
import { identifyTaxUnits } from '../utils/engine/taxRules';
import {
    getAllClients,
    getClient,
    getCurrentClientId,
    setCurrentClientId,
    saveClient,
    deleteClient,
    createNewClient,
    duplicateClient,
    migrateLegacyData
} from '../utils/clientManager';
import { performFullMigration } from '../utils/dataMigration';

const WealthContext = createContext();

export const WealthProvider = ({ children }) => {
    // Multi-client state
    const [currentClientId, setCurrentClientIdState] = useState(() => {
        // Run full migration to ensure data integrity
        try {
            performFullMigration();
        } catch (error) {
            console.error('Migration error:', error);
        }

        // Try to migrate legacy data on first load
        const migration = migrateLegacyData();
        if (migration.migrated) {
            console.log(migration.message);
            return migration.clientId;
        }

        // Check for existing current client
        const existing = getCurrentClientId();
        if (existing) return existing;

        // No clients exist - create default
        const { clientId } = createNewClient('Demo Client', INITIAL_PROFILE);
        return clientId;
    });

    const [profile, setProfile] = useState(() => {
        const clientData = getClient(currentClientId);
        const p = clientData || INITIAL_PROFILE;

        // --- SANITY CHECK & REAL-TIME MIGRATION ---
        if (p.family && Array.isArray(p.family)) {
            p.family = p.family.map(m => {
                if (m.financials) {
                    if (typeof m.financials.realEstate === 'number') {
                        const val = m.financials.realEstate;
                        m.financials.realEstate = val > 0 ? [{ id: Date.now(), name: 'Legacy Asset', type: 'primary', value: val, mortgage: 0, rate: 0.04, termYears: 30 }] : [];
                    }
                    if (!Array.isArray(m.financials.positions)) m.financials.positions = [];
                    if (!Array.isArray(m.financials.debts)) m.financials.debts = [];
                }
                return m;
            });
        }
        if (p.financials?.assets) {
            if (typeof p.financials.assets.realEstate === 'number') {
                const val = p.financials.assets.realEstate;
                p.financials.assets.realEstate = val > 0 ? [{ id: Date.now(), name: 'Legacy Household asset', type: 'primary', value: val, mortgage: 0, rate: 0.04, termYears: 30 }] : [];
            }
            if (!Array.isArray(p.financials.assets.realEstate)) p.financials.assets.realEstate = [];
            if (!Array.isArray(p.financials.assets.positions)) p.financials.assets.positions = [];
        }
        return p;
    });

    const [planningScope, setPlanningScope] = useState('household'); // 'household' or unit_id
    const [projection, setProjection] = useState({ data: [], explanations: [] });
    const [monteCarlo, setMonteCarlo] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('aurum_ui_theme') || 'dark';
    });

    // Derived IRS groupings
    const taxUnits = identifyTaxUnits(profile.family);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('aurum_ui_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Auto-save profile changes to current client
    useEffect(() => {
        if (currentClientId && profile) {
            saveClient(currentClientId, profile);
        }

        let targetProfile = profile;
        if (planningScope !== 'household') {
            const unit = taxUnits.find(u => u.id === planningScope);
            if (unit) {
                targetProfile = {
                    ...profile,
                    family: [...unit.members, ...unit.dependents],
                };
            }
        }

        setProjection(calculateProjection(targetProfile));
        setMonteCarlo(calculateMonteCarlo(targetProfile));
        setRecommendations(getRecommendedStrategies(targetProfile));
    }, [profile, planningScope, currentClientId]);

    const updateFinancials = (key, value) => {
        setProfile(prev => ({
            ...prev,
            financials: { ...prev.financials, [key]: parseFloat(value) || 0 }
        }));
    };

    const togglePrivacyMode = () => {
        setPrivacyMode(prev => !prev);
    };

    /**
     * Formats currency with respect to privacy mode
     */
    const formatCurrency = (amount, options = {}) => {
        if (privacyMode) {
            return '••••••';
        }

        const defaultOptions = {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        };

        return new Intl.NumberFormat('en-US', {
            ...defaultOptions,
            ...options
        }).format(amount);
    };

    const updateGoal = (goalId) => {
        setProfile(prev => ({
            ...prev,
            goals: { ...prev.goals, primary: goalId }
        }));
    };

    const updateMarketRegime = (regimeId) => {
        setProfile(prev => ({
            ...prev,
            marketRegime: regimeId
        }));
    };

    const addFamilyMember = (groupId = 0, relation = 'Child') => {
        setProfile(prev => ({
            ...prev,
            family: [...prev.family, {
                id: Date.now(),
                name: groupId === 0 ? 'New Member' : `Sibling Branch Member`,
                age: relation === 'Sibling' ? 40 : 10,
                relation: relation,
                residency: 'US_Citizen',
                state: 'CA',
                familyGroupId: groupId,
                financials: {
                    income: 0,
                    stocks: 0,
                    retirement: 0,
                    realEstate: [],
                    positions: [],
                    debts: [],
                    cash: 0
                }
            }]
        }));
    };

    const updateFamilyMember = (index, updates) => {
        setProfile(prev => {
            const newFamily = [...prev.family];
            newFamily[index] = { ...newFamily[index], ...updates };
            return { ...prev, family: newFamily };
        });
    };

    const removeFamilyMember = (index) => {
        setProfile(prev => ({
            ...prev,
            family: prev.family.filter((_, i) => i !== index)
        }));
    };

    const toggleStrategy = (id) => {
        setProfile(prev => {
            const existing = prev.strategies[id] || { active: false, inputs: {} };
            return {
                ...prev,
                strategies: {
                    ...prev.strategies,
                    [id]: { ...existing, active: !existing.active }
                }
            };
        });
    };

    // Auto-enable high confidence strategies
    const applyAutopilot = () => {
        const recs = getRecommendedStrategies(profile);
        setProfile(prev => {
            const newStrategies = { ...prev.strategies };
            recs.forEach(rec => {
                if (rec.score > 85) {
                    const existing = newStrategies[rec.id] || { inputs: {} };
                    newStrategies[rec.id] = { ...existing, active: true };
                }
            });
            return { ...prev, strategies: newStrategies };
        });
    };

    const updateStrategyInput = (stratId, inputKey, value) => {
        setProfile(prev => {
            const existing = prev.strategies[stratId] || { active: true, inputs: {} };
            return {
                ...prev,
                strategies: {
                    ...prev.strategies,
                    [stratId]: {
                        ...existing,
                        inputs: { ...existing.inputs, [inputKey]: parseFloat(value) || 0 }
                    }
                }
            };
        });
    };

    const applyAIStrategies = (aiMeta) => {
        if (!aiMeta || !aiMeta.active_strategies) return;

        setProfile(prev => {
            const newStrategies = { ...prev.strategies };
            aiMeta.active_strategies.forEach(strat => {
                const { id, active, ...inputs } = strat;
                newStrategies[id] = {
                    active,
                    inputs: { ...(newStrategies[id]?.inputs || {}), ...inputs }
                };
            });
            return { ...prev, strategies: newStrategies };
        });
    };

    // ========== CLIENT MANAGEMENT FUNCTIONS ==========

    const switchClient = (clientId) => {
        const clientData = getClient(clientId);
        if (clientData) {
            setCurrentClientIdState(clientId);
            setCurrentClientId(clientId);
            setProfile(clientData);
            setPlanningScope('household'); // Reset to household view
        }
    };

    const createClient = (name = 'New Client') => {
        const { clientId, profile: newProfile } = createNewClient(name);
        setCurrentClientIdState(clientId);
        setProfile(newProfile);
        setPlanningScope('household');
        return clientId;
    };

    const removeClient = (clientId) => {
        const success = deleteClient(clientId);
        if (success && clientId === currentClientId) {
            // If deleting current client, switch to first available or create new
            const remaining = getAllClients();
            if (remaining.length > 0) {
                switchClient(remaining[0].id);
            } else {
                createClient('New Client');
            }
        }
        return success;
    };

    const cloneClient = (clientId, newName) => {
        const result = duplicateClient(clientId, newName);
        if (result) {
            switchClient(result.clientId);
            return result.clientId;
        }
        return null;
    };

    const updateClientMetadata = (clientId, metadata) => {
        const clientData = getClient(clientId);
        if (clientData) {
            saveClient(clientId, clientData, metadata);
        }
    };

    const getClientList = () => {
        return getAllClients();
    };

    const updateProfile = (updates) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    return (
        <WealthContext.Provider value={{
            profile,
            projection,
            monteCarlo,
            recommendations,
            planningScope,
            setPlanningScope,
            taxUnits,
            updateProfile,
            updateFinancials,
            updateGoal,
            updateFamilyMember,
            addFamilyMember,
            removeFamilyMember,
            toggleStrategy,
            updateStrategyInput,
            applyAIStrategies,
            applyAutopilot,
            updateMarketRegime,
            // Client management
            currentClientId,
            switchClient,
            createClient,
            removeClient,
            cloneClient,
            updateClientMetadata,
            getClientList,
            // Privacy mode
            privacyMode,
            togglePrivacyMode,
            formatCurrency,
            // Theme
            theme,
            toggleTheme
        }}>
            {children}
        </WealthContext.Provider>
    );
};

export const useWealth = () => useContext(WealthContext);
