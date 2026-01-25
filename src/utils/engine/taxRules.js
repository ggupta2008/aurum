/**
 * IRS Tax Unit Intelligence v2 - Multi-Family / Multi-Clan Support
 */

export const FILING_STATUSES = {
    SINGLE: 'Single',
    MFJ: 'Married Filing Jointly',
    MFS: 'Married Filing Separately',
    HOH: 'Head of Household'
};

/**
 * Categorizes members into Group-based Units.
 */
export const identifyTaxUnits = (family) => {
    if (!family || family.length === 0) return [];

    // Grouping by familyGroupId (e.g. 0 = Core, 1 = Sibling A, etc.)
    const groups = {};
    family.forEach(m => {
        const gid = m.familyGroupId || 0;
        if (!groups[gid]) groups[gid] = [];
        groups[gid].push(m);
    });

    const units = [];

    Object.keys(groups).forEach(gid => {
        const groupMembers = groups[gid];
        const processedIds = new Set();

        // 1. Identify primary/spouse/children within this specific group
        // If gid != 0, 'Self' equivalent is the highest age or designated head
        const head = groupMembers.find(m => m.relation === 'Self' || m.relation === 'Sibling') || groupMembers[0];
        const spouse = groupMembers.find(m => (m.relation === 'Spouse' || m.relation === 'Sibling Spouse') && !processedIds.has(m.id));

        if (head && spouse) {
            const unit = {
                id: `unit_${head.id}_${spouse.id}`,
                name: `${head.name} & ${spouse.name}`,
                status: FILING_STATUSES.MFJ,
                filingStatus: 'married',
                members: [head, spouse],
                dependents: [],
                familyGroupId: parseInt(gid)
            };
            processedIds.add(head.id);
            processedIds.add(spouse.id);

            // Add children of this branch
            groupMembers.forEach(m => {
                if (!processedIds.has(m.id) && (m.relation === 'Child' || m.relation === 'Sibling Child') && m.age < 24) {
                    unit.dependents.push(m);
                    processedIds.add(m.id);
                }
            });
            units.push(unit);
        } else if (head) {
            const unit = {
                id: `unit_${head.id}`,
                name: head.name,
                status: groupMembers.length > 1 ? FILING_STATUSES.HOH : FILING_STATUSES.SINGLE,
                filingStatus: 'single',
                members: [head],
                dependents: groupMembers.filter(m => m.id !== head.id && (m.relation === 'Child' || m.relation === 'Sibling Child') && m.age < 24),
                familyGroupId: parseInt(gid)
            };
            processedIds.add(head.id);
            unit.dependents.forEach(d => processedIds.add(d.id));
            units.push(unit);
        }

        // Catch anyone else in the group as Single units
        groupMembers.forEach(m => {
            if (!processedIds.has(m.id)) {
                units.push({
                    id: `unit_${m.id}`,
                    name: m.name,
                    status: FILING_STATUSES.SINGLE,
                    filingStatus: 'single',
                    members: [m],
                    dependents: [],
                    familyGroupId: parseInt(gid)
                });
            }
        });
    });

    return units;
};

export const getUnitFinancials = (unit, householdBase = null) => {
    // ... logic same as before, but ensure it aggregates precisely
    const aggregate = {
        income: 0,
        stocks: 0,
        retirement: 0,
        realEstate: 0,
        cash: 0,
        loans: 0,
        taxBuckets: { taxable: 0, taxDeferred: 0, taxFree: 0 }
    };

    unit.members.concat(unit.dependents).forEach(m => {
        const f = m.financials || {};
        aggregate.income += (f.income || 0);
        aggregate.stocks += (f.stocks || 0);
        aggregate.retirement += (f.retirement || 0);

        const reVal = Array.isArray(f.realEstate) ? f.realEstate.reduce((acc, p) => acc + (p.value || 0), 0) : (f.realEstate || 0);
        aggregate.realEstate += reVal;
        aggregate.cash += (f.cash || 0);
        aggregate.loans += (f.loans || 0);

        aggregate.taxBuckets.taxable += (f.stocks || 0) + reVal + (f.cash || 0);
        aggregate.taxBuckets.taxDeferred += (f.retirement || 0);
    });

    // Merge household base only for Group 0 Primary Unit
    if (householdBase && (unit.members.some(m => m.relation === 'Self')) && unit.familyGroupId === 0) {
        aggregate.income += (householdBase.income || 0);
        aggregate.taxBuckets.taxable += (householdBase.assets?.taxable || 0);
        aggregate.taxBuckets.taxDeferred += (householdBase.assets?.taxDeferred || 0);
        aggregate.taxBuckets.taxFree += (householdBase.assets?.taxFree || 0);
        aggregate.loans += (householdBase.liabilities?.mortgage || 0) + (householdBase.liabilities?.other || 0);
    }

    return aggregate;
};
