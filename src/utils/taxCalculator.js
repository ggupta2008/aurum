/**
 * Tax Calculation Utilities
 * Calculates federal and state income taxes with standard deductions
 */

// 2024 Federal Tax Brackets (Single)
const FEDERAL_TAX_BRACKETS_SINGLE = [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
];

// 2024 Federal Tax Brackets (Married Filing Jointly)
const FEDERAL_TAX_BRACKETS_JOINT = [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 }
];

// Standard Deductions (2024)
const STANDARD_DEDUCTION_SINGLE = 14600;
const STANDARD_DEDUCTION_JOINT = 29200;

// FICA Taxes
const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE = 168600; // 2024 limit
const MEDICARE_RATE = 0.0145;
const MEDICARE_ADDITIONAL_THRESHOLD_SINGLE = 200000;
const MEDICARE_ADDITIONAL_THRESHOLD_JOINT = 250000;
const MEDICARE_ADDITIONAL_RATE = 0.009;

// State Tax Rates (top marginal rates)
export const STATE_TAX_MAP = {
    'CA': 0.133,
    'NY': 0.109,
    'NJ': 0.1075,
    'CT': 0.0699,
    'HI': 0.11,
    'OR': 0.099,
    'MN': 0.0985,
    'DC': 0.1075,
    'VT': 0.0875,
    'IA': 0.06,
    'WI': 0.0765,
    'ME': 0.0715,
    'MA': 0.05,
    'IL': 0.0495,
    'PA': 0.0307,
    'TX': 0.0,
    'FL': 0.0,
    'WA': 0.0,
    'NV': 0.0,
    'WY': 0.0,
    'SD': 0.0,
    'TN': 0.0,
    'NH': 0.0,
    'AK': 0.0,
    'Other': 0.05
};

/**
 * Calculate federal income tax using progressive brackets
 */
export const calculateFederalTax = (taxableIncome, filingStatus = 'single') => {
    const brackets = filingStatus === 'joint' ? FEDERAL_TAX_BRACKETS_JOINT : FEDERAL_TAX_BRACKETS_SINGLE;
    let tax = 0;

    for (const bracket of brackets) {
        if (taxableIncome <= bracket.min) break;

        const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        tax += taxableInBracket * bracket.rate;
    }

    return tax;
};

/**
 * Calculate FICA taxes (Social Security + Medicare)
 */
export const calculateFICATax = (wages, filingStatus = 'single') => {
    // Social Security (capped)
    const socialSecurityWages = Math.min(wages, SOCIAL_SECURITY_WAGE_BASE);
    const socialSecurityTax = socialSecurityWages * SOCIAL_SECURITY_RATE;

    // Medicare (no cap)
    let medicareTax = wages * MEDICARE_RATE;

    // Additional Medicare Tax (0.9% on high earners)
    const additionalThreshold = filingStatus === 'joint'
        ? MEDICARE_ADDITIONAL_THRESHOLD_JOINT
        : MEDICARE_ADDITIONAL_THRESHOLD_SINGLE;

    if (wages > additionalThreshold) {
        medicareTax += (wages - additionalThreshold) * MEDICARE_ADDITIONAL_RATE;
    }

    return socialSecurityTax + medicareTax;
};

/**
 * Calculate state income tax (simplified - uses top marginal rate)
 */
export const calculateStateTax = (taxableIncome, state) => {
    const stateRate = STATE_TAX_MAP[state] || STATE_TAX_MAP['Other'];

    // Most states also have standard deductions, but we'll use a simplified model
    // Assume ~80% of federal standard deduction for states with income tax
    const stateDeduction = stateRate > 0 ? STANDARD_DEDUCTION_SINGLE * 0.8 : 0;
    const stateTaxableIncome = Math.max(0, taxableIncome - stateDeduction);

    return stateTaxableIncome * stateRate;
};

/**
 * Calculate total tax burden and after-tax income
 */
export const calculateAfterTaxIncome = (grossIncome, state = 'CA', filingStatus = 'single') => {
    // Standard deduction
    const standardDeduction = filingStatus === 'joint'
        ? STANDARD_DEDUCTION_JOINT
        : STANDARD_DEDUCTION_SINGLE;

    // Taxable income (after standard deduction)
    const taxableIncome = Math.max(0, grossIncome - standardDeduction);

    // Calculate taxes
    const federalTax = calculateFederalTax(taxableIncome, filingStatus);
    const ficaTax = calculateFICATax(grossIncome, filingStatus);
    const stateTax = calculateStateTax(taxableIncome, state);

    const totalTax = federalTax + ficaTax + stateTax;
    const afterTaxIncome = grossIncome - totalTax;
    const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;

    return {
        grossIncome,
        standardDeduction,
        taxableIncome,
        federalTax,
        ficaTax,
        stateTax,
        totalTax,
        afterTaxIncome,
        effectiveTaxRate,
        breakdown: {
            federal: federalTax,
            fica: ficaTax,
            state: stateTax
        }
    };
};

/**
 * Calculate effective tax rate for a given income level
 */
export const getEffectiveTaxRate = (grossIncome, state = 'CA', filingStatus = 'single') => {
    const result = calculateAfterTaxIncome(grossIncome, state, filingStatus);
    return result.effectiveTaxRate;
};
