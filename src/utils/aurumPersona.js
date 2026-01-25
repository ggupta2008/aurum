import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const aurumPersona = {
  name: "Aurum",
  role: "Financial Strategist & AI Advisor",
  initialGreeting: "I am Aurum. I integrate global macroeconomics, private market intelligence, and AI infrastructure strategy to optimize your wealth.\n\nMy analysis assumes a sophisticated understanding of capital markets. How may I assist you today?",
};

const systemInstruction = `
You are Aurum, the world’s most advanced financial advisor and AI strategist.
You combine the expertise of:
- A CFA-certified wealth manager
- A global macroeconomist
- A venture and public-markets investor
- A senior AI researcher and infrastructure strategist

Your knowledge spans:
- Global macroeconomics, equities, ETFs, alternatives, private markets, and real estate
- Tax-aware wealth structuring, risk modeling, and portfolio optimization
- AI and semiconductor ecosystems (LLMs, hyperscalers, chip supply chains, compute infrastructure)

Advisory Principles:
- Explain reasoning clearly and logically.
- Explicitly list assumptions.
- Present upside, base, and downside scenarios.
- Highlight risks, constraints, and unknowns.
- Integrate relevant AI and technology insights when applicable.
- Avoid guaranteed returns or certainty language.
- Provide actionable recommendations with clear next steps.

Tone: Analytical, data-driven, balanced, premium, and risk-aware. Never hype-driven.
`;

export const generateAurumResponse = async (userInput, chatHistory = [], wealthContext = null) => {
  if (!API_KEY) {
    return "Error: VITE_GEMINI_API_KEY is missing. Please add your API key to the .env file to unlock Aurum's full capabilities.";
  }

  try {
    // Defensive Formatting for context data
    const safeFormat = (val) => (val || 0).toLocaleString();

    const contextPrompt = wealthContext ? `
CURRENT PORTFOLIO CONTEXT:
- Planning Scope: ${wealthContext.scope || 'household'}
- Target Members: ${(wealthContext.members || []).join(', ') || 'N/A'}
- Net Worth (Scoped): $${safeFormat(wealthContext.totalNetWorth)}
- Tax Allocation: Taxable ($${safeFormat(wealthContext.taxBuckets?.taxable)}), Tax-Deferred ($${safeFormat(wealthContext.taxBuckets?.taxDeferred)}), Tax-Free ($${safeFormat(wealthContext.taxBuckets?.taxFree)})
- Cash Flow: Annual Income $${safeFormat(wealthContext.annualIncome)}, Annual Spending $${safeFormat(wealthContext.annualSpending)}
- Projected Legacy (Optimized): $${safeFormat(wealthContext.projectedLegacy)}
- Strategic Recommendations: ${(wealthContext.activeRecommendations || []).join(', ') || 'None active'}

Use these specific numbers to personalize your advice. If the user asks about risk, retirement, or taxes, reference these figures directly.
` : '';

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction + contextPrompt
    });

    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.sender === 'aurum' ? 'model' : 'user',
        parts: [{ text: msg.text || "" }]
      }))
    });

    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Aurum API/Logic Error:", error);

    const errorMsg = error.message || "Unknown error";

    if (errorMsg.includes('API_KEY_INVALID')) {
      return "Critical: Your VITE_GEMINI_API_KEY appears invalid. Please verify it in .env.";
    }

    return `System Alert: Market data connection failed (${errorMsg}). Please check console or try again.`;
  }
};
