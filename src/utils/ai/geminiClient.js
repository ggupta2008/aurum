import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Aurum AI Advisor - CFP/CPA Fiduciary Wealth Manager
 * 
 * This is the core AI engine that powers the conversational wealth advisor.
 * It acts as a world-class Financial Advisor with CFP and CPA certifications.
 */

// System prompt defining the AI's persona and expertise
const ADVISOR_SYSTEM_PROMPT = `You are a world-class fiduciary Financial Advisor and Wealth Manager with dual qualifications:
- **CFP (Certified Financial Planner)** - Expert in comprehensive financial planning
- **CPA (Certified Public Accountant)** - Deep tax law and accounting expertise

**Your Expertise:**
- 20+ years serving high-net-worth individuals ($1M-$50M net worth)
- Specialization: Tax minimization, wealth accumulation, estate planning
- Deep knowledge of US tax code (IRC), state tax laws, and estate regulations
- Experience with complex situations: concentrated stock, business owners, multi-generational wealth

**Your Role:**
1. Analyze the client's complete financial profile
2. Identify risks, opportunities, and gaps
3. Recommend specific, actionable strategies
4. Cite relevant tax codes and regulations (e.g., IRC §72(t), §1014, §2010)
5. Provide implementation steps with timeline
6. Calculate expected financial impact (tax savings, wealth growth)

**Three Pillars of Advice:**

**1. Investment & Wealth Management**
- Asset allocation analysis (sector risks, overlaps)
- Asset location optimization (taxable vs. tax-advantaged accounts)
- Specific investment vehicles (ETFs, Direct Indexing, Alternatives)
- Concentrated position management (VPF, exchange funds, collars)
- Risk-adjusted return optimization

**2. Advanced Tax Strategy**
- AGI reduction techniques beyond standard 401k
- Backdoor Roth, Mega Backdoor Roth, HSA maximization
- Tax-loss harvesting and gain deferral strategies
- Business owner deductions (QBI, depreciation, home office)
- Charitable giving strategies (DAF, CRT, CLT)
- Opportunity Zone investments
- Cost basis management and lot selection

**3. Estate Planning & Asset Protection**
- Trust structures (RLT, ILIT, SLAT, GRAT, QPRT, CRUT, CLAT)
- Estate tax minimization (current exemption: $13.61M in 2024)
- Step-up in basis planning (IRC §1014)
- Beneficiary designation optimization
- Asset protection from creditors and litigation
- Multi-generational wealth transfer strategies
- Probate avoidance techniques

**Tone & Style:**
- Direct, analytical, and prescriptive
- Use bullet points for clarity
- Cite specific tax codes where relevant
- Explain the "why" behind every recommendation
- Provide concrete numbers and calculations
- Be honest about trade-offs and costs

**Always Consider:**
- Federal and state tax implications
- Liquidity needs and cash flow
- Risk tolerance and time horizon
- Family dynamics and goals
- Regulatory compliance
- Cost-benefit analysis

**Response Format:**
When analyzing a situation:
1. **Summary**: Brief assessment of current state
2. **Opportunities**: 3-5 specific strategies ranked by impact
3. **Implementation**: Step-by-step action plan
4. **Impact**: Quantified benefits (tax savings, wealth alpha)
5. **Trade-offs**: Costs, complexity, risks

When answering questions:
- Be specific and actionable
- Use examples with real numbers
- Cite tax code sections
- Explain in plain English
- Provide next steps`;

let genAI = null;
let model = null;
let conversationHistory = [];

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
        model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: ADVISOR_SYSTEM_PROMPT
        });

        // Initialize conversation with system prompt
        conversationHistory = [{
            role: 'user',
            parts: [{ text: ADVISOR_SYSTEM_PROMPT }]
        }, {
            role: 'model',
            parts: [{ text: 'Understood. I am ready to provide fiduciary wealth management advice as a CFP and CPA.' }]
        }];

        console.log('✅ Gemini AI initialized with CFP/CPA persona');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Gemini:', error);
        return false;
    }
}

/**
 * Get AI advisor response to user message
 */
export async function getAdvisorResponse(userMessage, profile = null) {
    if (!model) {
        return {
            success: false,
            message: 'AI not initialized. Please configure your Gemini API key in settings.',
            suggestions: []
        };
    }

    try {
        // Build context-aware prompt
        const contextualPrompt = buildContextualPrompt(userMessage, profile);

        // Add user message to history
        conversationHistory.push({
            role: 'user',
            parts: [{ text: contextualPrompt }]
        });

        // Generate response
        const chat = model.startChat({
            history: conversationHistory.slice(0, -1) // Exclude the message we just added
        });

        const result = await chat.sendMessage(contextualPrompt);
        const response = await result.response;
        const text = response.text();

        // Add AI response to history
        conversationHistory.push({
            role: 'model',
            parts: [{ text }]
        });

        // Extract actionable strategies from response
        const strategies = extractStrategies(text);

        return {
            success: true,
            message: text,
            strategies,
            conversationId: Date.now()
        };

    } catch (error) {
        console.error('AI response error:', error);
        return {
            success: false,
            message: 'I encountered an error analyzing your request. Please try rephrasing or provide more details.',
            suggestions: []
        };
    }
}

/**
 * Build context-aware prompt with profile data
 */
function buildContextualPrompt(userMessage, profile) {
    if (!profile) {
        return userMessage;
    }

    const financials = profile?.financials || {};
    const family = profile?.family || [];
    const primaryMember = family.find(m => m.relation === 'Self') || family[0] || {};

    const netWorth = (financials.assets?.taxable || 0) +
        (financials.assets?.taxDeferred || 0) +
        (financials.assets?.taxFree || 0);

    const context = `
**CLIENT PROFILE:**
- Age: ${primaryMember.age || 'Not specified'}
- Family: ${family.length} member(s)
- Net Worth: $${netWorth.toLocaleString()}
- Annual Income: $${(financials.income || 0).toLocaleString()}
- Annual Spending: $${(financials.spending || 0).toLocaleString()}

**ASSETS:**
- Taxable: $${(financials.assets?.taxable || 0).toLocaleString()}
- Tax-Deferred (401k/IRA): $${(financials.assets?.taxDeferred || 0).toLocaleString()}
- Tax-Free (Roth): $${(financials.assets?.taxFree || 0).toLocaleString()}
- Real Estate: $${(financials.assets?.realEstate || 0).toLocaleString()}
- Cash: $${(financials.assets?.cash || 0).toLocaleString()}

**TAX SITUATION:**
- Marginal Tax Rate: ${((financials.taxRate || 0.35) * 100).toFixed(0)}%
- Estimated Federal Bracket: ${estimateTaxBracket(financials.income || 0)}

**CLIENT REQUEST:**
${userMessage}

Please provide your fiduciary analysis and recommendations.`;

    return context;
}

/**
 * Extract actionable strategies from AI response
 */
function extractStrategies(responseText) {
    const strategies = [];

    // Look for numbered strategies or bullet points
    const strategyPatterns = [
        /\d+\.\s+\*\*([^*]+)\*\*:?\s*([^\n]+)/g,  // "1. **Strategy Name**: description"
        /[-•]\s+\*\*([^*]+)\*\*:?\s*([^\n]+)/g,   // "- **Strategy Name**: description"
    ];

    for (const pattern of strategyPatterns) {
        let match;
        while ((match = pattern.exec(responseText)) !== null) {
            strategies.push({
                name: match[1].trim(),
                description: match[2].trim(),
                fullText: match[0]
            });
        }
    }

    return strategies;
}

/**
 * Estimate federal tax bracket based on income
 */
function estimateTaxBracket(income) {
    if (income >= 609350) return '37% (highest)';
    if (income >= 243725) return '35%';
    if (income >= 191950) return '32%';
    if (income >= 100525) return '24%';
    if (income >= 47150) return '22%';
    if (income >= 11600) return '12%';
    return '10%';
}

/**
 * Generate financial projection based on AI recommendations
 */
export async function generateProjection(profile, recommendations) {
    if (!model) {
        return generateFallbackProjection(profile);
    }

    try {
        const prompt = `Given this client profile and recommendations, generate a 25-year financial projection.

**CLIENT PROFILE:**
${JSON.stringify(profile, null, 2)}

**RECOMMENDATIONS:**
${recommendations}

**TASK:**
Generate a year-by-year projection (25 years) showing:
1. Net worth growth
2. Annual tax burden
3. Wealth in each account type (taxable, tax-deferred, tax-free)
4. Impact of recommended strategies

Return ONLY valid JSON in this format:
{
  "projection": [
    {
      "year": 0,
      "netWorth": 1000000,
      "taxBurden": 100000,
      "taxable": 400000,
      "taxDeferred": 500000,
      "taxFree": 100000
    }
  ],
  "summary": {
    "finalNetWorth": 5000000,
    "totalTaxSavings": 250000,
    "wealthAlpha": 1200000
  }
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;

        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Projection generation error:', error);
        return generateFallbackProjection(profile);
    }
}

/**
 * Fallback projection when AI is unavailable
 */
function generateFallbackProjection(profile) {
    const financials = profile?.financials || {};
    const startingWealth = (financials.assets?.taxable || 0) +
        (financials.assets?.taxDeferred || 0) +
        (financials.assets?.taxFree || 0);

    const projection = [];
    let wealth = startingWealth;
    const growthRate = 0.08;
    const inflationRate = 0.03;

    for (let year = 0; year < 25; year++) {
        wealth *= (1 + growthRate);

        projection.push({
            year,
            netWorth: Math.round(wealth),
            taxBurden: Math.round(wealth * 0.02), // Rough estimate
            taxable: Math.round(wealth * 0.4),
            taxDeferred: Math.round(wealth * 0.5),
            taxFree: Math.round(wealth * 0.1)
        });
    }

    return {
        projection,
        summary: {
            finalNetWorth: Math.round(wealth),
            totalTaxSavings: 0,
            wealthAlpha: 0
        }
    };
}

/**
 * Reset conversation history
 */
export function resetConversation() {
    conversationHistory = [{
        role: 'user',
        parts: [{ text: ADVISOR_SYSTEM_PROMPT }]
    }, {
        role: 'model',
        parts: [{ text: 'Understood. I am ready to provide fiduciary wealth management advice as a CFP and CPA.' }]
    }];
}

/**
 * Get conversation history
 */
export function getConversationHistory() {
    return conversationHistory;
}
