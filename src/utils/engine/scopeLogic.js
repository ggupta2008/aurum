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
 * CRITICAL: Implements "Hierarchy of Truth" to prevent double-counting.
 */
export const getScopedCurrentWealth = (profile, targetMembers) => {
    let assets = 0;
    let liabilities = 0;
    const financials = profile?.financials || {};

    const isPrimaryIncluded = targetMembers.some(m => m.relation === 'Self');

    // 1. Clan Level Assets/Liabilities (only if primary unit included)
    if (isPrimaryIncluded) {
        let clanAssetsAddedByHierarchy = false;

        // A. Granular Positions (Priority 1)
        const clanPOS = financials.assets?.positions || [];
        if (Array.isArray(clanPOS) && clanPOS.length > 0) {
            clanPOS.forEach(pos => {
                assets += (parseFloat(pos.value) || 0);
            });
            clanAssetsAddedByHierarchy = true;
        }

        // B. Legacy Buckets (Priority 2 - Only if no positions)
        if (!clanAssetsAddedByHierarchy) {
            assets += (parseFloat(financials.assets?.taxable) || 0);
            assets += (parseFloat(financials.assets?.taxDeferred) || 0);
            assets += (parseFloat(financials.assets?.taxFree) || 0);
        }

        // Cash (always separate from positions/buckets)
        assets += (parseFloat(financials.assets?.cash) || 0);

        // Real Estate (always added - not part of positions)
        const clanRE = financials.assets?.realEstate || [];
        if (Array.isArray(clanRE)) {
            clanRE.forEach(p => {
                assets += (parseFloat(p.value) || 0);
                liabilities += (parseFloat(p.mortgage) || 0);
            });
        }

        // Clan Liabilities
        const clanLiab = financials.liabilities || [];
        if (Array.isArray(clanLiab)) {
            clanLiab.forEach(l => {
                liabilities += (parseFloat(l.balance) || 0);
            });
        }
    }

    // 2. Member Level Assets/Liabilities
    targetMembers.forEach(member => {
        const f = member.financials || {};
        let memberAssetsAddedByHierarchy = 0;

        // --- ASSET HIERARCHY ---
        // A. Granular Positions (Priority 1)
        if (Array.isArray(f.positions) && f.positions.length > 0) {
            f.positions.forEach(pos => {
                memberAssetsAddedByHierarchy += (parseFloat(pos.value) || 0);
            });
        }
        // B. Aggregate Tally (Priority 2)
        else {
            memberAssetsAddedByHierarchy += (parseFloat(f.stocks) || 0);
            memberAssetsAddedByHierarchy += (parseFloat(f.retirement) || 0);
            memberAssetsAddedByHierarchy += (parseFloat(f.taxFree) || 0);

            // C. Legacy Buckets (Priority 3 - Only if no aggregate tally was found)
            if (memberAssetsAddedByHierarchy === 0 && f.taxBuckets) {
                memberAssetsAddedByHierarchy += (parseFloat(f.taxBuckets.taxable) || 0) +
                    (parseFloat(f.taxBuckets.taxDeferred) || 0) +
                    (parseFloat(f.taxBuckets.taxFree) || 0);
            }
        }

        assets += memberAssetsAddedByHierarchy;

        // Cash (always separate from stock tallies)
        assets += (parseFloat(f.cash) || 0);

        // Real Estate (always added - not part of positions)
        const memberRE = f.realEstate || [];
        if (Array.isArray(memberRE)) {
            memberRE.forEach(p => {
                assets += (parseFloat(p.value) || 0);
                liabilities += (parseFloat(p.mortgage) || 0);
            });
        }

        // --- LIABILITY HIERARCHY ---
        // Granular Debts
        const memberDebts = f.debts || [];
        if (Array.isArray(memberDebts) && memberDebts.length > 0) {
            memberDebts.forEach(d => {
                liabilities += (parseFloat(d.balance) || 0);
            });
        } else {
            // Aggregate Fallback
            liabilities += (parseFloat(f.loans) || 0);
        }
    });

    return assets - liabilities;
};

/**
 * Aggregates assets by tax bucket for the target members.
 * CRITICAL: Implements "Hierarchy of Truth" to prevent double-counting.
 */
export const getScopedTaxBuckets = (profile, targetMembers) => {
    let taxable = 0;
    let taxDeferred = 0;
    let taxFree = 0;

    const financials = profile?.financials || {};
    const isPrimaryIncluded = targetMembers.some(m => m.relation === 'Self');

    // 1. Clan Level Buckets (with Hierarchy of Truth)
    if (isPrimaryIncluded) {
        let clanAssetsAddedByHierarchy = false;

        // A. Granular Positions (Priority 1)
        const clanPOS = financials.assets?.positions || [];
        if (Array.isArray(clanPOS) && clanPOS.length > 0) {
            clanPOS.forEach(pos => {
                const val = parseFloat(pos.value) || 0;
                if (pos.taxStatus === 'taxDeferred') taxDeferred += val;
                else if (pos.taxStatus === 'taxFree') taxFree += val;
                else taxable += val;
            });
            clanAssetsAddedByHierarchy = true;
        }

        // B. Legacy Buckets (Priority 2 - Only if no positions)
        if (!clanAssetsAddedByHierarchy) {
            taxable += (parseFloat(financials.assets?.taxable) || 0);
            taxDeferred += (parseFloat(financials.assets?.taxDeferred) || 0);
            taxFree += (parseFloat(financials.assets?.taxFree) || 0);
        }

        // Cash (always separate from positions/buckets)
        taxable += (parseFloat(financials.assets?.cash) || 0);

        // Real Estate (always added - not part of positions)
        const clanRE = financials.assets?.realEstate || [];
        if (Array.isArray(clanRE)) {
            clanRE.forEach(p => taxable += (parseFloat(p.value) || 0));
        }
    }

    // 2. Member Level Buckets (with Hierarchy of Truth)
    targetMembers.forEach(m => {
        const f = m.financials || {};
        let addedInThisStep = false;

        // A. Granular Positions (Priority 1)
        if (Array.isArray(f.positions) && f.positions.length > 0) {
            f.positions.forEach(pos => {
                const val = parseFloat(pos.value) || 0;
                if (pos.taxStatus === 'taxDeferred') taxDeferred += val;
                else if (pos.taxStatus === 'taxFree') taxFree += val;
                else taxable += val;
            });
            addedInThisStep = true;
        }
        // B. Aggregate Tallies (Priority 2)
        else if ((parseFloat(f.stocks) || 0) > 0 || (parseFloat(f.retirement) || 0) > 0 || (parseFloat(f.taxFree) || 0) > 0) {
            taxable += (parseFloat(f.stocks) || 0);
            taxDeferred += (parseFloat(f.retirement) || 0);
            taxFree += (parseFloat(f.taxFree) || 0);
            addedInThisStep = true;
        }

        // C. Legacy Buckets (Priority 3 - Fallback)
        if (!addedInThisStep && f.taxBuckets) {
            taxable += parseFloat(f.taxBuckets.taxable) || 0;
            taxDeferred += parseFloat(f.taxBuckets.taxDeferred) || 0;
            taxFree += parseFloat(f.taxBuckets.taxFree) || 0;
        }

        // Cash (always separate from positions/stocks/buckets)
        taxable += (parseFloat(f.cash) || 0);

        // Real Estate (always added - not part of positions)
        const reVal = Array.isArray(f.realEstate)
            ? f.realEstate.reduce((acc, p) => acc + (parseFloat(p.value) || 0), 0)
            : (parseFloat(f.realEstate) || 0);
        taxable += reVal;
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
export const getScopedSpending = (profile, targetMembers) => {
    let total = 0;
    const financials = profile?.financials || {};
    const isPrimaryIncluded = targetMembers.some(m => m.relation === 'Self');

    if (isPrimaryIncluded) {
        total += (parseFloat(financials.spending) || 0);
    }

    targetMembers.forEach(m => {
        total += (parseFloat(m.financials?.spending) || 0);
    });
    return total;
};

/**
 * Calculates total annual income for the target members.
 */
export const getScopedIncome = (profile, targetMembers) => {
    let total = 0;
    const financials = profile?.financials || {};
    const isPrimaryIncluded = targetMembers.some(m => m.relation === 'Self');

    if (isPrimaryIncluded) {
        total += (parseFloat(financials.income) || 0);
    }

    targetMembers.forEach(m => {
        total += (parseFloat(m.financials?.income) || 0);
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
    const globalCurrent = parseFloat(projection?.data?.[0]?.baseline);

    if (isNaN(globalCurrent) || globalCurrent <= 0) return 0;

    const ratio = scopedCurrent / globalCurrent;
    if (isNaN(ratio)) return 0;

    // Ensure ratio doesn't exceed 1 (safety check for data anomalies)
    return Math.min(1, ratio);
};
/**
 * Returns a detailed breakdown of assets and liabilities for the target members.
 */
export const getWealthBreakdown = (profile, targetMembers) => {
    const assetsBySource = [];
    const liabilitiesBySource = [];
    const financials = profile?.financials || {};
    const isPrimaryIncluded = targetMembers.some(m => m.relation === 'Self');

    if (isPrimaryIncluded) {
        if (parseFloat(financials.assets?.taxable)) assetsBySource.push({ name: 'Clan Taxable', value: parseFloat(financials.assets.taxable), source: 'Clan' });
        if (parseFloat(financials.assets?.taxDeferred)) assetsBySource.push({ name: 'Clan Tax-Deferred', value: parseFloat(financials.assets.taxDeferred), source: 'Clan' });
        if (parseFloat(financials.assets?.taxFree)) assetsBySource.push({ name: 'Clan Tax-Free', value: parseFloat(financials.assets.taxFree), source: 'Clan' });

        // Only show clan cash if meaningful (> $10)
        const clanCashVal = parseFloat(financials.assets?.cash) || 0;
        if (clanCashVal > 10) {
            assetsBySource.push({ name: 'Clan Cash', value: clanCashVal, source: 'Clan' });
        }

        const clanRE = financials.assets?.realEstate || [];
        if (Array.isArray(clanRE)) {
            clanRE.forEach(p => {
                if (parseFloat(p.value)) assetsBySource.push({ name: `Clan Real Estate: ${p.name || 'Property'}`, value: parseFloat(p.value), source: 'Clan' });
                if (parseFloat(p.mortgage)) liabilitiesBySource.push({ name: `Clan Mortgage: ${p.name || 'Property'}`, value: parseFloat(p.mortgage), source: 'Clan' });
            });
        }

        const clanLiab = financials.liabilities || [];
        if (Array.isArray(clanLiab)) {
            clanLiab.forEach(l => {
                if (parseFloat(l.balance)) liabilitiesBySource.push({ name: l.name || 'Clan Liability', value: parseFloat(l.balance), source: 'Clan' });
            });
        }

        const clanPOS = financials.assets?.positions || [];
        if (Array.isArray(clanPOS)) {
            clanPOS.forEach(pos => {
                if (parseFloat(pos.value)) assetsBySource.push({ name: `Clan: ${pos.ticker || 'Equity'}`, value: parseFloat(pos.value), source: 'Clan' });
            });
        }
    }

    targetMembers.forEach(member => {
        const f = member.financials || {};
        const mName = member.name;
        let memberAssetsAdded = false;

        // Assets
        if (Array.isArray(f.positions) && f.positions.length > 0) {
            f.positions.forEach(pos => {
                if (parseFloat(pos.value)) assetsBySource.push({ name: `${mName}: ${pos.ticker || 'Equity'}`, value: parseFloat(pos.value), source: mName });
            });
            memberAssetsAdded = true;
        }

        if (!memberAssetsAdded && ((parseFloat(f.stocks) || 0) > 0 || (parseFloat(f.retirement) || 0) > 0 || (parseFloat(f.taxFree) || 0) > 0)) {
            if (parseFloat(f.stocks)) assetsBySource.push({ name: `${mName}: Stocks`, value: parseFloat(f.stocks), source: mName });
            if (parseFloat(f.retirement)) assetsBySource.push({ name: `${mName}: Retirement`, value: parseFloat(f.retirement), source: mName });
            if (parseFloat(f.taxFree)) assetsBySource.push({ name: `${mName}: Tax-Free`, value: parseFloat(f.taxFree), source: mName });
            memberAssetsAdded = true;
        }

        if (!memberAssetsAdded && f.taxBuckets) {
            const val = (parseFloat(f.taxBuckets.taxable) || 0) + (parseFloat(f.taxBuckets.taxDeferred) || 0) + (parseFloat(f.taxBuckets.taxFree) || 0);
            if (val > 0) assetsBySource.push({ name: `${mName}: Legacy Buckets`, value: val, source: mName });
        }

        // Only show cash if it's meaningful (> $10)
        const cashVal = parseFloat(f.cash) || 0;
        if (cashVal > 10) {
            assetsBySource.push({ name: `${mName}: Cash`, value: cashVal, source: mName });
        }

        const memberRE = f.realEstate || [];
        if (Array.isArray(memberRE)) {
            memberRE.forEach(p => {
                if (parseFloat(p.value)) assetsBySource.push({ name: `${mName} Real Estate: ${p.name || 'Property'}`, value: parseFloat(p.value), source: mName });
                if (parseFloat(p.mortgage)) liabilitiesBySource.push({ name: `${mName} Mortgage: ${p.name || 'Property'}`, value: parseFloat(p.mortgage), source: mName });
            });
        }

        // Liabilities - only check debts array, no fallback to legacy loans
        const memberDebts = f.debts || [];
        if (Array.isArray(memberDebts) && memberDebts.length > 0) {
            memberDebts.forEach(d => {
                if (parseFloat(d.balance)) liabilitiesBySource.push({ name: `${mName}: ${d.name || 'Debt'}`, value: parseFloat(d.balance), source: mName });
            });
        }
    });

    return { assets: assetsBySource, liabilities: liabilitiesBySource };
};
