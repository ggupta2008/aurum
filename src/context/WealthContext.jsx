import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_PROFILE, calculateProjection, calculateMonteCarlo } from '../utils/engine/financeEngine';
import { identifyTaxUnits } from '../utils/engine/taxRules';
import { getAdvisorResponse } from '../utils/ai/geminiClient';
import {
    getClient,
    getCurrentClientId,
    setCurrentClientId,
    saveClient,
    createNewClient,
    migrateLegacyData
} from '../utils/clientManager';
import { performFullMigration } from '../utils/dataMigration';

export const WealthContext = createContext();

export const WealthProvider = ({ children }) => {
    // Multi-client state
    const [currentClientId, setCurrentClientIdState] = useState(() => {
        try {
            performFullMigration();
        } catch (error) {
            console.error('Migration error:', error);
        }

        const migration = migrateLegacyData();
        if (migration.migrated) return migration.clientId;

        const existing = getCurrentClientId();
        if (existing) return existing;

        const { clientId } = createNewClient('Demo Client', INITIAL_PROFILE);
        return clientId;
    });

    const [profile, setProfile] = useState(() => {
        const clientData = getClient(currentClientId);
        return clientData || INITIAL_PROFILE;
    });

    const [planningScope, setPlanningScope] = useState('household');
    const [projection, setProjection] = useState({ data: [], explanations: [] });
    const [monteCarlo, setMonteCarlo] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('aurum_ui_theme') || 'dark');
    const [recommendations, setRecommendations] = useState([]);
    const isAnalyzingRef = React.useRef(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('aurum_ui_theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const taxUnits = React.useMemo(() => identifyTaxUnits(profile.family), [profile.family]);

    // --- DYNAMIC AI ANALYSIS ---
    const performInitialAnalysis = useCallback(async (p = profile) => {
        if (isAnalyzingRef.current) return;
        isAnalyzingRef.current = true;
        setIsAnalyzing(true);
        
        try {
            const primaryMember = p.family?.find(m => m.relation === 'Self') || p.family?.[0];
            const aiContext = {
                primaryProfile: primaryMember,
                totalNetWorth: (p.financials?.assets?.taxable || 0) + (p.financials?.assets?.taxDeferred || 0),
                annualIncome: p.financials?.income || primaryMember?.financials?.income || 0,
                breakdown: { assets: [], liabilities: [] } 
            };

            const response = await getAdvisorResponse("Run a comprehensive financial audit and suggest optimization strategies.", aiContext);
            
            if (response.success && response.meta?.active_strategies) {
                setRecommendations(response.meta.active_strategies);
            }
        } catch (error) {
            console.error('Initial analysis failed:', error);
        } finally {
            isAnalyzingRef.current = false;
            setIsAnalyzing(false);
        }
    }, [profile]);

    // Auto-save & Update Projections
    useEffect(() => {
        if (currentClientId && profile) {
            saveClient(currentClientId, profile);
        }

        let targetProfile = profile;
        if (planningScope !== 'household') {
            const unit = taxUnits.find(u => u.id === planningScope);
            if (unit) {
                targetProfile = { ...profile, family: [...unit.members, ...unit.dependents] };
            }
        }

        setProjection(calculateProjection(targetProfile));

        const timer = setTimeout(() => {
            setMonteCarlo(calculateMonteCarlo(targetProfile));
        }, 100);

        return () => clearTimeout(timer);
    }, [profile, planningScope, currentClientId, taxUnits]);

    // Initial Trigger
    useEffect(() => {
        // Only run if we have no AI strategies yet
        if (Object.keys(profile.strategies || {}).length === 0) {
            performInitialAnalysis();
        }
    }, [currentClientId, performInitialAnalysis]);

    const updateFinancials = (key, value) => {
        setProfile(prev => ({
            ...prev,
            financials: { ...prev.financials, [key]: parseFloat(value) || 0 }
        }));
    };

    const toggleStrategy = (id) => {
        setProfile(prev => {
            const existing = prev.strategies[id] || { active: false };
            return {
                ...prev,
                strategies: {
                    ...prev.strategies,
                    [id]: { ...existing, active: !existing.active }
                }
            };
        });
    };

    const removeStrategy = (id) => {
        setProfile(prev => {
            const newStrategies = { ...prev.strategies };
            delete newStrategies[id];
            return { ...prev, strategies: newStrategies };
        });
    };

    const applyAIStrategies = (aiMeta) => {
        if (!aiMeta || !aiMeta.active_strategies) return;

        setProfile(prev => {
            const newStrategies = { ...(prev.strategies || {}) };
            aiMeta.active_strategies.forEach(strat => {
                if (!strat.id) return; // Safeguard against malformed AI output
                // Store the full AI metadata so the engine can model it dynamically
                newStrategies[strat.id] = {
                    ...strat,
                    active: true,
                    inputs: { ...(newStrategies[strat.id]?.inputs || {}), ...(strat.inputs || {}) }
                };
            });
            return { ...prev, strategies: newStrategies };
        });
    };

    const formatCurrency = (amount, options = {}) => {
        if (privacyMode) return '••••••';
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD',
            maximumFractionDigits: 0, minimumFractionDigits: 0,
            ...options
        }).format(amount);
    };

    // Client Management Wrappers
    const switchClient = (clientId) => {
        const clientData = getClient(clientId);
        if (clientData) {
            setCurrentClientIdState(clientId);
            setCurrentClientId(clientId);
            setProfile(clientData);
            setPlanningScope('household');
        }
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
            toggleStrategy,
            removeStrategy,
            applyAIStrategies,
            performInitialAnalysis,
            isAnalyzing,
            // Client management
            currentClientId,
            switchClient,
            createClient: (name) => {
                const { clientId, profile: p } = createNewClient(name);
                setCurrentClientIdState(clientId);
                setProfile(p);
                return clientId;
            },
            // UI
            privacyMode,
            togglePrivacyMode: () => setPrivacyMode(p => !p),
            formatCurrency,
            theme,
            toggleTheme,
            updateProfile: (u) => setProfile(prev => ({ ...prev, ...u }))
        }}>
            {children}
        </WealthContext.Provider>
    );
};

export const useWealth = () => useContext(WealthContext);
