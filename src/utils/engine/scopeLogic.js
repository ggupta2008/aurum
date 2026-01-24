/**
 * Aurum Scope Logic Engine
 * Consolidates multi-unit and multi-generational scope filtering and scaling.
 */

/**
 * Returns the members belonging to the current planning scope.
 */
export const getTargetMembers = (profile, planningScope, taxUnits = []) => {
    const safeFamily = Array.isArray(profile?.family) ? profile.family : [];
    if (!planningScope || planningScope === 'household') {
        return safeFamily;
    }

    const unit = taxUnits.find(u => u.id === planningScope);
    if (!unit) return safeFamily;

    // A unit includes primary members and dependents
    return [...unit.members, ...unit.dependents];
};

/**
 * Calculates the current net worth for the target members.
 */
export const getScopedCurrentWealth = (profile, targetMembers) => {
    let total = 0;
    const financials = profile?.financials || {};

    // 1. Sum up all member-specific assets
    targetMembers.forEach(member => {
        const f = member.financials || {};
        total += (f.stocks || 0) + (f.realEstate || 0) + (f.cash || 0) + (f.retirement || 0) + (f.taxFree || 0);

        // Handle legacy structure if present
        if (f.taxBuckets) {
            total += (f.taxBuckets.taxable || 0) + (f.taxBuckets.taxDeferred || 0) + (f.taxBuckets.taxFree || 0);
        }
    });

    // 2. Add household-level assets only if the primary 'Self' member is in the scope
    const isPrimaryIncluded = targetMembers.some(m => m.relation === 'Self');
    if (isPrimaryIncluded) {
        total += (financials.assets?.taxable || 0) + (financials.assets?.taxDeferred || 0) + (financials.assets?.taxFree || 0);
    }

    return total;
};

/**
 * Aggregates assets by tax bucket for the target members.
 */
export const getScopedTaxBuckets = (profile, targetMembers) => {
    let taxable = 0;
    let taxDeferred = 0;
    let taxFree = 0;

    const financials = profile?.financials || {};
    const isPrimaryIncluded = targetMembers.some(m => m.relation === 'Self');

    if (isPrimaryIncluded) {
        taxable += financials.assets?.taxable || 0;
        taxDeferred += financials.assets?.taxDeferred || 0;
        taxFree += financials.assets?.taxFree || 0;
    }

    targetMembers.forEach(m => {
        const f = m.financials || {};
        taxable += (f.stocks || 0) + (f.realEstate || 0) + (f.cash || 0);
        taxDeferred += (f.retirement || 0);
        taxFree += (f.taxFree || 0);

        // Handle legacy/alternate structure
        if (f.taxBuckets) {
            taxable += f.taxBuckets.taxable || 0;
            taxDeferred += f.taxBuckets.taxDeferred || 0;
            taxFree += f.taxBuckets.taxFree || 0;
        }
    });

    return { taxable, taxDeferred, taxFree };
};

/**
 * Detects the primary age for the scope (oldest if household, else primary member).
 */
export const getScopedAge = (targetMembers, planningScope) => {
    const primaryMember = targetMembers.find(m => m.relation === 'Self');

    if (planningScope === 'household') {
        const ages = targetMembers.map(m => m.age || 0).filter(a => a > 0);
        return ages.length > 0 ? Math.max(...ages) : 45;
    }

    return primaryMember?.age || targetMembers[0]?.age || 45;
};

/**
 * Calculates total annual spending for the target members.
 */
export const getScopedSpending = (targetMembers) => {
    let total = 0;
    targetMembers.forEach(m => {
        total += m.financials?.spending || 0;
    });
    return total;
};

/**
 * Calculates total annual income for the target members.
 */
export const getScopedIncome = (targetMembers) => {
    let total = 0;
    targetMembers.forEach(m => {
        total += m.financials?.income || 0;
    });
    return total;
};

/**
 * Transforms a projection by applying a scope ratio.
 */
export const getScopedProjection = (projection, ratio) => {
    if (!projection) return { data: [], explanations: [] };
    return {
        ...projection,
        data: (projection.data || []).map(point => ({
            ...point,
            baseline: (point.baseline || 0) * ratio,
            optimized: (point.optimized || 0) * ratio,
            rothAlpha: (point.rothAlpha || 0) * ratio,
            estateTaxSavings: (point.estateTaxSavings || 0) * ratio
        }))
    };
};

/**
 * Transforms monte carlo data by applying a scope ratio.
 */
export const getScopedMonteCarlo = (monteCarlo, ratio) => {
    if (!monteCarlo) return [];
    return monteCarlo.map(point => ({
        ...point,
        p10: (point.p10 || 0) * ratio,
        p50: (point.p50 || 0) * ratio,
        p90: (point.p90 || 0) * ratio
    }));
};

/**
 * Calculates the ratio of scoped wealth to total household wealth.
 * Used for scaling global projections.
 */
export const calculateScopeRatio = (profile, projection, planningScope, taxUnits = []) => {
    if (!planningScope || planningScope === 'household') return 1;

    const targetMembers = getTargetMembers(profile, planningScope, taxUnits);
    const scopedCurrent = getScopedCurrentWealth(profile, targetMembers);

    // Global current wealth from baseline projection (year 0)
    const globalCurrent = projection?.data?.[0]?.baseline;

    if (globalCurrent === undefined || globalCurrent <= 0) return 0;

    // Ensure ratio doesn't exceed 1 (safety check for data anomalies)
    return Math.min(1, scopedCurrent / globalCurrent);
};
