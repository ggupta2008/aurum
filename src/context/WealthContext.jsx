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

const WealthContext = createContext();

export const WealthProvider = ({ children }) => {
    // Multi-client state
    const [currentClientId, setCurrentClientIdState] = useState(() => {
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
        return clientData || INITIAL_PROFILE;
    });

    const [planningScope, setPlanningScope] = useState('household'); // 'household' or unit_id
    const [projection, setProjection] = useState({ data: [], explanations: [] });
    const [monteCarlo, setMonteCarlo] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    // Derived IRS groupings
    const taxUnits = identifyTaxUnits(profile.family);

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
                    realEstate: 0,
                    cash: 0,
                    loans: 0
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

    return (
        <WealthContext.Provider value={{
            profile,
            projection,
            monteCarlo,
            recommendations,
            planningScope,
            setPlanningScope,
            taxUnits,
            updateFinancials,
            updateGoal,
            updateFamilyMember,
            addFamilyMember,
            removeFamilyMember,
            toggleStrategy,
            updateStrategyInput,
            applyAutopilot,
            updateMarketRegime,
            // Client management
            currentClientId,
            switchClient,
            createClient,
            removeClient,
            cloneClient,
            updateClientMetadata,
            getClientList
        }}>
            {children}
        </WealthContext.Provider>
    );
};

export const useWealth = () => useContext(WealthContext);
