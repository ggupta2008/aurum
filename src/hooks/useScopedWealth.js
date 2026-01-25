import { useWealth } from '../context/WealthContext';
import {
    getTargetMembers,
    calculateScopeRatio,
    getScopedCurrentWealth,
    getScopedTaxBuckets,
    getScopedAge,
    getScopedSpending,
    getScopedIncome,
    getScopedProjection,
    getScopedMonteCarlo,
    getWealthBreakdown
} from '../utils/engine/scopeLogic';

/**
 * Custom hook to provide scope-aware financial data.
 * Wraps useWealth and applies scaling ratios and member filtering automatically.
 */
export const useScopedWealth = () => {
    const wealth = useWealth();
    const { profile, projection, planningScope, taxUnits } = wealth;

    // 1. Determine target members for the current scope
    const targetMembers = getTargetMembers(profile, planningScope, taxUnits);

    // 2. Calculate the scaling ratio based on asset ownership
    const scopeRatio = calculateScopeRatio(profile, projection, planningScope, taxUnits);

    // 3. Calculate current scoped net worth and buckets
    const scopedCurrentWealth = getScopedCurrentWealth(profile, targetMembers);
    const scopedTaxBuckets = getScopedTaxBuckets(profile, targetMembers);
    const scopedAge = getScopedAge(targetMembers, planningScope);
    const scopedSpending = getScopedSpending(profile, targetMembers);
    const scopedIncome = getScopedIncome(profile, targetMembers);

    // 4. Transform projections by applying the scope ratio
    const scopedProjection = getScopedProjection(projection, scopeRatio);

    // 5. Transform Monte Carlo data
    const scopedMonteCarlo = getScopedMonteCarlo(wealth.monteCarlo, scopeRatio);

    // 6. Get detailed wealth breakdown
    const wealthBreakdown = getWealthBreakdown(profile, targetMembers);

    return {
        ...wealth,
        targetMembers,
        scopeRatio,
        scopedCurrentWealth,
        scopedTaxBuckets,
        scopedAge,
        scopedSpending,
        scopedIncome,
        scopedProjection,
        scopedMonteCarlo,
        wealthBreakdown,
        // Provide the primary member of this specific scope
        primaryMember: targetMembers.find(m => m.relation === 'Self') || targetMembers[0]
    };
};
