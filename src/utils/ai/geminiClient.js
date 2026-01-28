import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Client for Wealth Strategy Generation
 * 
 * This module handles all AI interactions for generating personalized
 * wealth strategies based on user goals and profile data.
 */

// Initialize Gemini (API key should be in env, but for demo we'll use direct import)
let genAI = null;
let model = null;

export function initializeGemini(apiKey) {
    if (!apiKey) {
        console.warn('⚠️ No Gemini API key provided. AI features will be limited.');
        return false;
    }

    try {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('✅ Gemini AI initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Gemini:', error);
        return false;
    }
}

/**
 * Generate wealth strategies based on user message and profile
 */
export async function generateStrategies(profile, userMessage, conversationHistory = []) {
    if (!model) {
        // Fallback to rule-based strategies if no API key
        return generateFallbackStrategies(profile, userMessage);
    }

    const prompt = buildStrategyPrompt(profile, userMessage, conversationHistory);

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const strategies = parseAIResponse(text);
        return strategies;
    } catch (error) {
        console.error('AI generation error:', error);
        return generateFallbackStrategies(profile, userMessage);
    }
}

/**
 * Build the prompt for strategy generation
 */
function buildStrategyPrompt(profile, userMessage, conversationHistory) {
    const financials = profile?.financials || {};
    const family = profile?.family || [];
    const primaryMember = family.find(m => m.relation === 'Self') || family[0] || {};

    const netWorth = (financials.assets?.taxable || 0) +
        (financials.assets?.taxDeferred || 0) +
        (financials.assets?.taxFree || 0);

    return `You are an expert wealth advisor specializing in tax optimization and estate planning.

CLIENT PROFILE:
- Age: ${primaryMember.age || 'Unknown'}
- Net Worth: $${netWorth.toLocaleString()}
- Taxable Assets: $${(financials.assets?.taxable || 0).toLocaleString()}
- Tax-Deferred (401k/IRA): $${(financials.assets?.taxDeferred || 0).toLocaleString()}
- Tax-Free (Roth): $${(financials.assets?.taxFree || 0).toLocaleString()}
- Annual Income: $${(financials.income || 0).toLocaleString()}
- Annual Spending: $${(financials.spending || 0).toLocaleString()}
- Tax Rate: ${((financials.taxRate || 0.35) * 100).toFixed(0)}%

${conversationHistory.length > 0 ? `CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role === 'user' ? 'Client' : 'Advisor'}: ${m.content}`).join('\n')}
` : ''}

CLIENT REQUEST: "${userMessage}"

Generate 3-4 specific, actionable wealth strategies to address the client's request.

For each strategy, provide:
1. **name**: Short, clear name (e.g., "Roth Conversion Ladder")
2. **description**: 2-3 sentences explaining what it does and why it helps
3. **impact**: Expected wealth impact in 25 years (as a multiplier, e.g., 1.2 for 20% increase)
4. **taxSavings**: Estimated annual tax savings in dollars
5. **riskLevel**: 1-10 (1=very safe, 10=very risky)
6. **timeframe**: How long to implement (e.g., "5 years", "Ongoing")
7. **actions**: Array of specific steps with year, type, and amount

Return ONLY valid JSON in this exact format:
{
  "strategies": [
    {
      "name": "Strategy Name",
      "description": "What this does and why it helps",
      "impact": 1.15,
      "taxSavings": 25000,
      "riskLevel": 3,
      "timeframe": "5 years",
      "actions": [
        {
          "year": 1,
          "type": "roth_conversion",
          "amount": 50000,
          "description": "Convert $50K from traditional IRA to Roth"
        }
      ]
    }
  ],
  "reasoning": "Brief explanation of why these strategies were chosen"
}

Action types can be: roth_conversion, sell_asset, charitable_gift, trust_transfer, tax_loss_harvest, rebalance

Be specific with dollar amounts based on the client's profile. Focus on tax efficiency and long-term wealth growth.`;
}

/**
 * Parse AI response (handles both JSON and text responses)
 */
function parseAIResponse(text) {
    try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;

        const parsed = JSON.parse(jsonText);
        return parsed.strategies || [];
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        console.log('Raw response:', text);

        // Try to extract strategies from text
        return extractStrategiesFromText(text);
    }
}

/**
 * Extract strategies from unstructured text response
 */
function extractStrategiesFromText(text) {
    // Simple fallback: create one strategy from the text
    return [{
        name: 'AI Recommendation',
        description: text.substring(0, 200),
        impact: 1.1,
        taxSavings: 10000,
        riskLevel: 5,
        timeframe: 'Varies',
        actions: []
    }];
}

/**
 * Fallback strategies when AI is unavailable
 */
function generateFallbackStrategies(profile, userMessage) {
    const financials = profile?.financials || {};
    const family = profile?.family || [];
    const primaryMember = family.find(m => m.relation === 'Self') || family[0] || {};

    const totalAssets = (financials.assets?.taxable || 0) +
        (financials.assets?.taxDeferred || 0) +
        (financials.assets?.taxFree || 0);
    const taxDeferredRatio = (financials.assets?.taxDeferred || 0) / (totalAssets || 1);
    const age = primaryMember.age || 45;

    const strategies = [];

    // Tax optimization if high tax-deferred
    if (taxDeferredRatio > 0.4) {
        strategies.push({
            name: 'Roth Conversion Strategy',
            description: 'Systematically convert traditional IRA/401(k) to Roth IRA to reduce future tax burden. This creates tax-free growth and eliminates RMDs.',
            impact: 1.15,
            taxSavings: 20000,
            riskLevel: 2,
            timeframe: '10 years',
            actions: [
                {
                    year: 1,
                    type: 'roth_conversion',
                    amount: 50000,
                    description: 'Convert $50K annually to Roth IRA'
                }
            ]
        });
    }

    // Growth strategy if younger
    if (age < 60) {
        strategies.push({
            name: 'Tax-Loss Harvesting',
            description: 'Harvest investment losses to offset gains and reduce taxable income. Can carry forward unused losses indefinitely.',
            impact: 1.08,
            taxSavings: 15000,
            riskLevel: 1,
            timeframe: 'Ongoing',
            actions: [
                {
                    year: 1,
                    type: 'tax_loss_harvest',
                    amount: 100000,
                    description: 'Harvest losses from underperforming positions'
                }
            ]
        });
    }

    // Always include charitable giving
    strategies.push({
        name: 'Donor-Advised Fund',
        description: 'Donate appreciated securities to a DAF for immediate tax deduction while maintaining control over charitable distributions.',
        impact: 1.05,
        taxSavings: 30000,
        riskLevel: 1,
        timeframe: '1 year',
        actions: [
            {
                year: 1,
                type: 'charitable_gift',
                amount: 100000,
                description: 'Contribute appreciated stock to DAF'
            }
        ]
    });

    return strategies;
}

/**
 * Interpret a strategy and convert to projection parameters
 */
export async function interpretStrategy(strategy, profile) {
    // For now, use the actions directly from the strategy
    // In the future, we could use AI to refine these

    return {
        actions: strategy.actions || [],
        assumptions: {
            growthRate: 0.08,
            taxSavings: strategy.taxSavings || 0,
            costs: 0,
            impactMultiplier: strategy.impact || 1.0
        }
    };
}
