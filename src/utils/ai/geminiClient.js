import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Aurum AI Advisor - CFP/CPA Fiduciary Wealth Manager
 * 
 * This is the core AI engine that powers the conversational wealth advisor.
 * It acts as a world-class Financial Advisor with CFP and CPA certifications.
 */

// System prompt defining the AI's persona and expertise
const ADVISOR_SYSTEM_PROMPT = `You are a world-class fiduciary Financial Advisor (CFP/CPA).
Your goal is to provide institutional-grade wealth optimization strategies.

**DYNAMIC STRATEGY GENERATION:**
You are the source of all financial strategies. For every recommendation, you must provide a structured JSON metadata block that the engine will use to model your advice in real-time.

**Metadata Schema:**
\`\`\`json
{
  "active_strategies": [
    {
      "id": "unique_string_id",
      "name": "Strategy Name",
      "impact_type": "return_boost" | "tax_reduction" | "cash_flow",
      "impact_value": 0.015, // 1.5% boost or reduction, or absolute dollar for cash_flow
      "description": "Short summary",
      "explanation": "Technical fiduciary reasoning citing tax code or market theory.",
      "inputs": { "key": "value" }
    }
  ]
}
\`\`\`

**Guidelines:**
1. **Return Boost**: Use for fee reduction (Simple Path), alpha generation (AQR Delphi), or superior asset location.
2. **Tax Reduction**: Use for Roth conversions, tax-loss harvesting, or municipal bond shifting.
3. **Cash Flow**: Use for monetizing positions (Variable Prepaid Forwards), debt paydown, or income generation.
4. **Baseline**: Always compare against a "Status Quo" baseline.
5. **Transparency**: Clearly state your assumptions for Market Returns and Inflation.`;

let genAI = null;
let model = null;
let conversationHistory = [];

// --- Spending Cap Implementation ---
const SPENDING_CAP_KEY = 'aurum_ai_spending_cap';
const TOTAL_SPENT_KEY = 'aurum_ai_total_spent';
const DEFAULT_CAP = 5.00; // $5.00 hard default

/* Pricing (Per 1M Tokens) as of late 2024 */
const PRICING = {
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-1.5-pro': { input: 3.50, output: 10.50 },
    'gemini-pro': { input: 0.50, output: 1.50 },
    'fallback': { input: 3.50, output: 10.50 } // Assume worst case if unknown
};

const SAFE_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
];
let currentModelIndex = 0;

/**
 * Get current spending stats
 */
export function getSpendingStats() {
    const caps = localStorage.getItem(SPENDING_CAP_KEY);
    const spent = localStorage.getItem(TOTAL_SPENT_KEY);
    return {
        cap: caps ? parseFloat(caps) : DEFAULT_CAP,
        spent: spent ? parseFloat(spent) : 0.0,
        remaining: (caps ? parseFloat(caps) : DEFAULT_CAP) - (spent ? parseFloat(spent) : 0.0)
    };
}

/**
 * Update total spent based on usage metadata
 */
function updateUsageSpend(usageMetadata, modelName) {
    if (!usageMetadata) return;

    const { promptTokenCount = 0, candidatesTokenCount = 0 } = usageMetadata;
    const priceTable = PRICING[modelName] || PRICING['fallback'];

    const costInput = (promptTokenCount / 1000000) * priceTable.input;
    const costOutput = (candidatesTokenCount / 1000000) * priceTable.output;
    const totalCost = costInput + costOutput;

    const currentSpent = parseFloat(localStorage.getItem(TOTAL_SPENT_KEY) || '0');
    const newTotal = currentSpent + totalCost;

    localStorage.setItem(TOTAL_SPENT_KEY, newTotal.toFixed(6));
    console.log(`💰 AI Spend: $${totalCost.toFixed(6)} | Total: $${newTotal.toFixed(4)}`);
}

/**
 * Check if budget is exceeded
 */
function checkBudget() {
    const { spent, cap } = getSpendingStats();
    if (spent >= cap) {
        throw new Error(`BILLING_CAP_REACHED: Your configurable AI spending cap ($${cap.toFixed(2)}) has been reached. Please increase the limit in settings to continue.`);
    }
}

/**
 * Reset total spend (for clearing limits)
 */
export function resetSpending() {
    localStorage.setItem(TOTAL_SPENT_KEY, '0.0');
}

/**
 * Initialize Gemini AI with API key
 */
export function initializeGemini(apiKey) {
    if (!apiKey) {
        console.warn('⚠️ No Gemini API key provided. AI features will be limited.');
        return false;
    }

    try {
        genAI = new GoogleGenerativeAI(apiKey);

        // Always reset to primary model on init
        currentModelIndex = 0;
        const primaryModel = SAFE_MODELS[0];

        model = genAI.getGenerativeModel({
            model: primaryModel,
            systemInstruction: ADVISOR_SYSTEM_PROMPT
        });
        console.log(`✅ Gemini AI initialized with ${primaryModel}`);

        // Initialize conversation history with correct alternating roles
        conversationHistory = [{
            role: 'user',
            parts: [{ text: 'Please analyze my financial profile and provide fiduciary advice.' }]
        }, {
            role: 'model',
            parts: [{ text: 'Understood. I have access to your profile data and am ready to provide institutional-grade wealth management advice as a CFP and CPA. How can I assist you today?' }]
        }];

        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
        return false;
    }
}

export function buildContextualPrompt(userMessage, contextData) {
    try {
        // Handle gracefully if contextData is missing or legacy
        if (!contextData) return userMessage;

        // Detect if we received the new aiContext structure or the old profile structure
        let assetsList = [];
        let liabilitiesList = [];
        let primaryMember = {};
        let totalNetWorth = 0;

        if (contextData.breakdown && contextData.primaryProfile) {
            // NEW PATH: Using pre-calculated scoped data (Correct)
            assetsList = contextData.breakdown.assets || [];
            liabilitiesList = contextData.breakdown.liabilities || [];
            primaryMember = contextData.primaryProfile || {};
            totalNetWorth = contextData.totalNetWorth || 0;
        } else if (contextData.financials) {
            // LEGACY PATH: Fallback to raw profile parsing (Deprecated but safe)
            // (We keep this simplified logic just in case, but usually we shouldn't hit it)
            const financials = contextData.financials;
            const family = contextData.family || [];
            primaryMember = family.find(m => m.relation === 'Self') || family[0] || {};

            // Simple estimation
            totalNetWorth = (Number(financials.assets?.taxable) || 0) +
                (Number(financials.assets?.taxDeferred) || 0) +
                (Number(financials.assets?.cash) || 0); // Very rough

            assetsList.push({ name: 'Aggregate Assets', value: totalNetWorth, source: 'Legacy Fallback' });
        } else {
            // Just return message if data format is unknown
            return userMessage;
        }

        // Format Asset Details
        // We group them by type for clarity in the prompt
        const equities = assetsList.filter(a =>
            a.name.toLowerCase().includes('stock') ||
            a.name.toLowerCase().includes('equity') ||
            a.name.toLowerCase().includes('taxable') ||
            a.name.toLowerCase().includes('bucket')
        );

        const retirement = assetsList.filter(a =>
            a.name.toLowerCase().includes('retirement') ||
            a.name.toLowerCase().includes('deferred') ||
            a.name.toLowerCase().includes('roth') ||
            a.name.toLowerCase().includes('tax-free')
        );

        const realEstate = assetsList.filter(a => a.name.toLowerCase().includes('real estate') || a.name.toLowerCase().includes('property'));
        const cash = assetsList.filter(a => a.name.toLowerCase().includes('cash'));

        // Helper to format list
        const formatList = (items) => {
            if (!items.length) return 'None listed.';
            return items.map(i => `- ${i.name} (${i.source}): $${i.value.toLocaleString()}`).join('\n');
        };

        // Calculate totals for prompt summary
        const totalTaxable = equities.reduce((sum, a) => sum + a.value, 0) + cash.reduce((sum, a) => sum + a.value, 0);
        const totalTaxDeferred = retirement.filter(a => !a.name.toLowerCase().includes('tax-free') && !a.name.toLowerCase().includes('roth')).reduce((sum, a) => sum + a.value, 0);
        const totalTaxFree = retirement.filter(a => a.name.toLowerCase().includes('tax-free') || a.name.toLowerCase().includes('roth')).reduce((sum, a) => sum + a.value, 0);

        return `
**CLIENT FIDUCIARY PROFILE (Scoped View):**
- **Primary Entity:** ${primaryMember.name || 'Client'} (Age: ${primaryMember.age || 'N/A'})
- **Total Net Worth:** $${totalNetWorth.toLocaleString()}
- **Annual Income:** $${(Number(primaryMember.financials?.income) || 0).toLocaleString()} (Projected)
- **Annual Spending:** $${(Number(primaryMember.financials?.spending) || 0).toLocaleString()} (Projected)

**ASSET BREAKDOWN:**
**Equities & Taxable Accounts:**
${formatList(equities)}

**Retirement & Tax-Advantaged:**
${formatList(retirement)}

**Real Estate & Hard Assets:**
${formatList(realEstate)}

**Liquidity (Cash):**
${formatList(cash)}

**Liabilities:**
${formatList(liabilitiesList)}

**SUMMARY SNAPSHOT:**
- Total Taxable/Liquid: $${totalTaxable.toLocaleString()}
- Total Tax-Deferred: $${totalTaxDeferred.toLocaleString()}
- Total Tax-Free: $${totalTaxFree.toLocaleString()}

**USER REQUEST:**
${userMessage}

Please provide your fiduciary analysis. Use the specific asset data provided above. 
CRITICAL: If "Equities & Taxable Accounts" lists aggregate buckets (e.g. "Clan Taxable" or "Legacy Buckets") but no specific tickers, you MUST assume the client holds a diversified portfolio within those buckets. DO NOT assume the assets are missing.
Compare your recommendations against a "Status Quo" baseline.
`;
    } catch (error) {
        console.error('Error building contextual prompt:', error);
        return userMessage;
    }
}

/**
 * Get AI advisor response to user message
 */
export async function getAdvisorResponse(userMessage, contextData = null) {
    if (!model) {
        return {
            success: false,
            message: 'AI not initialized. Please configure your Gemini API key in settings.',
            suggestions: []
        };
    }

    try {
        // Enforce spending cap check
        checkBudget();

        // Build context-aware prompt using the new flexible contextData
        const contextualPrompt = buildContextualPrompt(userMessage, contextData);

        // Truncate history to avoid token limits (keep initial pair + last 10 exchanges)
        if (conversationHistory.length > 22) {
            const initialPair = conversationHistory.slice(0, 2);
            const recentExchanges = conversationHistory.slice(-20);
            conversationHistory = [...initialPair, ...recentExchanges];
        }

        // Generate response using a fresh chat for simplicity and robustness
        const chat = model.startChat({
            history: conversationHistory
        });

        const result = await chat.sendMessage(contextualPrompt);
        const response = await result.response;
        const text = response.text();

        // Track spending based on actual tokens (using safe key if model name unavailable)
        // Accessing underlying model name safely if possible, else default to known current index
        const utilizedModel = SAFE_MODELS[currentModelIndex] || 'gemini-1.5-flash';
        updateUsageSpend(response.usageMetadata, utilizedModel);

        // Update history with simple roles
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
        conversationHistory.push({
            role: 'model',
            parts: [{ text }]
        });

        const { strategies, meta } = extractStrategies(text);

        return {
            success: true,
            message: text,
            strategies,
            meta,
            conversationId: Date.now()
        };

    } catch (error) {
        console.error('AI response error details:', error);
        const errStr = String(error);

        // Robust Tiered Fallback for 404 or Availability Errors
        if (errStr.includes('404') || errStr.includes('not found') || errStr.includes('unsupported')) {
            const failedModel = SAFE_MODELS[currentModelIndex];
            currentModelIndex++; // Move to next model

            if (currentModelIndex < SAFE_MODELS.length) {
                const nextModelName = SAFE_MODELS[currentModelIndex];
                console.warn(`🔄 Model error (${failedModel}). Switching to fallback: ${nextModelName}...`);

                try {
                    model = genAI.getGenerativeModel({
                        model: nextModelName,
                        systemInstruction: ADVISOR_SYSTEM_PROMPT
                    });
                    // Recursive retry with new model
                    return getAdvisorResponse(userMessage, contextData);
                } catch (fallbackError) {
                    console.error(`❌ Fallback initialization failed for ${nextModelName}:`, fallbackError);
                }
            } else {
                console.error('❌ All fallback models exhausted.');
            }
        }

        let userErrorMessage = 'I encountered an error analyzing your request.';
        if (errStr.includes('429')) {
            userErrorMessage = 'AI rate limit reached. Please wait a moment.';
        } else if (errStr.includes('400')) {
            userErrorMessage = 'Request too complex or malformed. Try resetting.';
        } else if (errStr.includes('candidate')) {
            userErrorMessage = 'The response was blocked by safety filters. Consider rephrasing.';
        }

        return {
            success: false,
            message: `${userErrorMessage} (Details: ${error.message || 'Unknown network error'})`,
            suggestions: []
        };
    }
}

/**
 * Extract strategies from the AI response text
 */
export function extractStrategies(text) {
    let strategies = [];
    let meta = null;

    try {
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            meta = JSON.parse(jsonMatch[1]);
            strategies = meta.active_strategies || [];
        }
    } catch (e) {
        console.warn('Failed to parse strategy JSON from AI response', e);
    }

    return { strategies, meta };
}
