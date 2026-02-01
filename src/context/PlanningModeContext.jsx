import React, { createContext, useContext, useState } from 'react';
import { useWealth } from './WealthContext';

const PlanningModeContext = createContext();

export const usePlanningMode = () => {
    const context = useContext(PlanningModeContext);
    if (!context) {
        throw new Error('usePlanningMode must be used within PlanningModeProvider');
    }
    return context;
};

export const PlanningModeProvider = ({ children }) => {
    const { profile, updateProfile } = useWealth();

    // AI-powered goal analysis helper (needs to be available for initialization)
    const analyzeGoalInternal = (objective) => {
        if (!objective || objective.trim().length === 0) return null;

        const lower = objective.toLowerCase();
        const analysis = {
            objective,
            themes: [],
            targets: {},
            urgency: 'medium',
            timeframe: null,
            primaryFocus: null,
            relevantMetrics: [],
            criticalActions: []
        };

        // Detect themes
        if (lower.includes('retire') || lower.includes('financial independence') || lower.includes('fi')) {
            analysis.themes.push('retirement');
            analysis.relevantMetrics.push('yearsToFI', 'safeWithdrawal', 'retirementReadiness');
        }
        if (lower.includes('tax') || lower.includes('roth') || lower.includes('minimize tax')) {
            analysis.themes.push('tax_optimization');
            analysis.relevantMetrics.push('taxEfficiency', 'rothConversion', 'taxBracket');
        }
        if (lower.includes('estate') || lower.includes('legacy') || lower.includes('children') || lower.includes('heirs')) {
            analysis.themes.push('estate_planning');
            analysis.relevantMetrics.push('estateTax', 'trustStructure', 'generationalWealth');
        }
        if (lower.includes('passive income') || lower.includes('dividend') || lower.includes('cash flow')) {
            analysis.themes.push('passive_income');
            analysis.relevantMetrics.push('dividendIncome', 'cashFlow', 'yieldRate');
        }
        if (lower.includes('debt') || lower.includes('pay off') || lower.includes('loan')) {
            analysis.themes.push('debt_elimination');
            analysis.relevantMetrics.push('debtToIncome', 'interestSavings', 'debtFreeDate');
        }
        if (lower.includes('emergency') || lower.includes('safety') || lower.includes('buffer')) {
            analysis.themes.push('emergency_fund');
            analysis.relevantMetrics.push('emergencyFundMonths', 'cashReserves');
        }
        if (lower.includes('real estate') || lower.includes('rental') || lower.includes('property')) {
            analysis.themes.push('real_estate');
            analysis.relevantMetrics.push('realEstateValue', 'rentalIncome', 'propertyAppreciation');
        }

        // Extract numeric targets
        const netWorthMatch = objective.match(/\$?([\d,]+)([km])?.*(?:net worth|wealth|portfolio)/i);
        if (netWorthMatch) {
            let amount = parseInt(netWorthMatch[1].replace(/,/g, ''));
            if (netWorthMatch[2]?.toLowerCase() === 'k') amount *= 1000;
            if (netWorthMatch[2]?.toLowerCase() === 'm') amount *= 1000000;
            analysis.targets.netWorth = amount;
            analysis.relevantMetrics.push('currentNetWorth', 'projectedNetWorth', 'gapToGoal');
        }

        const incomeMatch = objective.match(/\$?([\d,]+)([km])?.*(?:income|cash flow|passive)/i);
        if (incomeMatch) {
            let amount = parseInt(incomeMatch[1].replace(/,/g, ''));
            if (incomeMatch[2]?.toLowerCase() === 'k') amount *= 1000;
            if (incomeMatch[2]?.toLowerCase() === 'm') amount *= 1000000;
            analysis.targets.passiveIncome = amount;
            analysis.relevantMetrics.push('currentIncome', 'targetIncome', 'incomeGap');
        }

        // Extract timeframe
        const ageMatch = objective.match(/(?:by|at)?\s*age\s*(\d+)/i);
        if (ageMatch) {
            analysis.targets.retirementAge = parseInt(ageMatch[1]);
        }

        const yearsMatch = objective.match(/(?:in|within)?\s*(\d+)\s*years?/i);
        if (yearsMatch) {
            analysis.timeframe = parseInt(yearsMatch[1]);
        }

        // Determine urgency
        if (lower.includes('asap') || lower.includes('urgent') || lower.includes('immediately') || analysis.timeframe <= 3) {
            analysis.urgency = 'high';
        } else if (analysis.timeframe >= 10) {
            analysis.urgency = 'low';
        }

        // Determine primary focus (most important theme)
        if (analysis.themes.length > 0) {
            // Priority order: retirement > passive_income > tax_optimization > estate_planning > debt_elimination
            const priorityOrder = ['retirement', 'passive_income', 'tax_optimization', 'estate_planning', 'debt_elimination', 'emergency_fund', 'real_estate'];
            for (const theme of priorityOrder) {
                if (analysis.themes.includes(theme)) {
                    analysis.primaryFocus = theme;
                    break;
                }
            }
        }

        return analysis;
    };

    // Planning mode state
    const [isPlanningMode, setIsPlanningMode] = useState(() => (profile?.goals?.objective?.trim().length || 0) > 0);
    const [planningGoal, setPlanningGoal] = useState(() => profile?.goals?.objective || '');
    const [goalAnalysis, setGoalAnalysis] = useState(() => analyzeGoalInternal(profile?.goals?.objective || ''));

    // Public wrapper for analyzeGoal
    const analyzeGoal = (objective) => setGoalAnalysis(analyzeGoalInternal(objective));

    // Enter planning mode
    const enterPlanningMode = (goal) => {
        setPlanningGoal(goal);
        setIsPlanningMode(true);
        analyzeGoal(goal);

        // Save to profile
        updateProfile({
            ...profile,
            goals: {
                ...profile.goals,
                objective: goal
            }
        });
    };

    // Exit planning mode
    const exitPlanningMode = () => {
        setIsPlanningMode(false);
        setPlanningGoal('');
        setGoalAnalysis(null);

        // Clear from profile
        updateProfile({
            ...profile,
            goals: {
                ...profile.goals,
                objective: ''
            }
        });
    };

    // Update goal
    const updateGoal = (goal) => {
        setPlanningGoal(goal);
        analyzeGoal(goal);

        // Save to profile
        updateProfile({
            ...profile,
            goals: {
                ...profile.goals,
                objective: goal
            }
        });
    };

    // Check if a metric is relevant to current goal
    const isMetricRelevant = (metricKey) => {
        if (!goalAnalysis) return true; // Show all if no goal
        return goalAnalysis.relevantMetrics.includes(metricKey);
    };

    // Check if a component should be highlighted
    const isComponentPriority = (componentType) => {
        if (!goalAnalysis) return false;

        const priorityMap = {
            'retirement': ['FinancialIndependenceCalculator', 'SafeWithdrawalRate', 'SocialSecurityOptimizer'],
            'passive_income': ['DividendSnowball', 'AssetAllocationOptimizer'],
            'tax_optimization': ['TaxWaterfall', 'RothConversionLadder', 'TaxBracketHeatmap'],
            'estate_planning': ['TrustSimulator', 'EstateReport', 'ClanBreakdown'],
            'debt_elimination': ['SummaryCards'],
            'emergency_fund': ['SummaryCards']
        };

        const focus = goalAnalysis.primaryFocus;
        return priorityMap[focus]?.includes(componentType) || false;
    };

    const value = {
        isPlanningMode,
        planningGoal,
        goalAnalysis,
        enterPlanningMode,
        exitPlanningMode,
        updateGoal,
        isMetricRelevant,
        isComponentPriority
    };

    return (
        <PlanningModeContext.Provider value={value}>
            {children}
        </PlanningModeContext.Provider>
    );
};
