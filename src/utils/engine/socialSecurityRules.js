/**
 * Social Security Logic based on SSA rules (2024/2025)
 */

export const FRA = 67; // Full Retirement Age

/**
 * Calculates the annual benefit adjustment factor based on claiming age.
 * @param {number} claimAge 
 * @returns {number} Multiplier for PIA (Primary Insurance Amount)
 */
export const calculateBenefitFactor = (claimAge) => {
    // SSA Rules:
    // - 6.67% reduction per year for first 3 years before FRA
    // - 5% reduction per year for each year thereafter (up to 5 years total)
    // - 8% increase per year for each year delayed after FRA (up to age 70)

    if (claimAge === FRA) return 1.0;

    if (claimAge < FRA) {
        const yearsEarly = FRA - claimAge;
        const first3YearsReduction = Math.min(3, yearsEarly) * 0.0667;
        const additionalYearsReduction = Math.max(0, yearsEarly - 3) * 0.05;
        return 1.0 - (first3YearsReduction + additionalYearsReduction);
    } else {
        const yearsDelayed = Math.min(3, claimAge - FRA); // Max bonus is up to age 70 (3 years from 67)
        return 1.0 + (yearsDelayed * 0.08);
    }
};

/**
 * Calculates total lifetime benefit given a claiming age and life expectancy.
 * @param {number} pia Monthly benefit at FRA
 * @param {number} claimAge 
 * @param {number} endAge 
 * @param {number} inflation 
 * @returns {number}
 */
export const calculateTotalLifetimeBenefit = (pia, claimAge, endAge, inflation = 0) => {
    const annualPIA = pia * 12;
    const factor = calculateBenefitFactor(claimAge);
    const startBenefit = annualPIA * factor;

    let total = 0;
    for (let age = claimAge; age <= endAge; age++) {
        // Apply inflation compounding
        const yearOffset = age - claimAge;
        const inflatedBenefit = startBenefit * Math.pow(1 + inflation, yearOffset);
        total += inflatedBenefit;
    }

    return total;
};

/**
 * Finds the breakeven age between two claiming strategies.
 */
export const findBreakevenAge = (pia, ageA, ageB, inflation = 0) => {
    const startAge = Math.min(ageA, ageB);
    const maxAge = 100;

    let lastDif = null;

    for (let age = startAge; age <= maxAge; age++) {
        const totalA = calculateTotalLifetimeBenefit(pia, ageA, age, inflation);
        const totalB = calculateTotalLifetimeBenefit(pia, ageB, age, inflation);

        const diff = totalA - totalB;

        if (lastDif !== null && Math.sign(diff) !== Math.sign(lastDif)) {
            return age;
        }
        lastDif = diff;
    }

    return null;
};
