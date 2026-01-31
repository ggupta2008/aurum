import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getAdvisorResponse,
    initializeGemini,
    buildContextualPrompt,
    extractStrategies
} from './geminiClient';

// Mock the generative-ai SDK
vi.mock('@google/generative-ai', () => {
    const sendMessageMock = vi.fn().mockResolvedValue({
        response: {
            text: () => 'Mocked AI Response: You should consider Tax Loss Harvesting.'
        }
    });

    const startChatMock = vi.fn().mockImplementation(() => ({
        sendMessage: sendMessageMock
    }));

    const getGenerativeModelMock = vi.fn().mockImplementation(() => ({
        generateContent: vi.fn().mockResolvedValue({
            response: {
                text: () => 'Mocked AI Response: You should consider Tax Loss Harvesting.'
            }
        }),
        startChat: startChatMock
    }));

    class MockGoogleGenerativeAI {
        constructor(apiKey) { this.apiKey = apiKey; }
        getGenerativeModel() { return getGenerativeModelMock(); }
    }

    return { GoogleGenerativeAI: MockGoogleGenerativeAI };
});

describe('Gemini AI Client - Comprehensive Suite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        initializeGemini('mock-api-key');
    });

    describe('Context Construction Logic', () => {
        it('should accurately aggregate net worth across all asset categories', () => {
            const aiContext = {
                breakdown: {
                    assets: [
                        { name: 'TSLA Stock', value: 500000, source: 'Equities' },
                        { name: 'Roth IRA Account', value: 250000, source: 'Retirement' },
                        { name: 'Cash Savings', value: 100000, source: 'Liquidity' }
                    ],
                    liabilities: [
                        { name: 'Mortgage', value: 300000, source: 'Debt' }
                    ]
                },
                primaryProfile: {
                    name: 'John Doe',
                    age: 45,
                    financials: {
                        income: 250000,
                        spending: 150000
                    }
                },
                totalNetWorth: 550000
            };

            const prompt = buildContextualPrompt("Optimize my wealth", aiContext);

            expect(prompt).toContain('Total Net Worth:** $550,000');
            expect(prompt).toContain('Primary Entity:** John Doe (Age: 45)');
            expect(prompt).toContain('TSLA Stock (Equities): $500,000');
            expect(prompt).toContain('Mortgage (Debt): $300,000');
            expect(prompt).toContain('Annual Income:** $250,000');
        });

        it('should handle missing or malformed financial data gracefully', () => {
            const brokenProfile = {};
            const prompt = buildContextualPrompt("Tell me something", brokenProfile);
            // Should return original message if data is empty/unknown
            expect(prompt).toBe("Tell me something");
        });
    });

    describe('Strategy Extraction & Parsing', () => {
        it('should extract structured metadata and individual strategy cards', () => {
            const aiResponse = `
Here are my recommendations:
1. **Roth Conversion**: Convert $50k annually.

\`\`\`json
{
  "active_strategies": [{"id": "roth_conversion", "active": true, "annualAmount": 50000}],
  "strategy_cards": [
    {
      "title": "Precision Roth Move",
      "explanation": "Convert to POZ.",
      "timeline": "Immediate",
      "impact": "+$250k Alpha",
      "complexity": "Simple"
    }
  ]
}
\`\`\`
            `;

            const { strategies, meta } = extractStrategies(aiResponse);

            expect(strategies.length).toBe(1);
            expect(meta.active_strategies[0].id).toBe('roth_conversion');
            expect(meta.strategy_cards[0].title).toBe('Precision Roth Move');
        });

        it('should return empty strategies if no JSON metadata found', () => {
            const plainResponse = "1. **Simple Path**: Use VTSAX.";
            const { strategies, meta } = extractStrategies(plainResponse);

            expect(strategies.length).toBe(0);
            expect(meta).toBeNull();
        });
    });

    describe('End-to-End Analysis Flow', () => {
        it('should return a success object with extracted intelligence', async () => {
            const response = await getAdvisorResponse("Analyze me", { financials: {} });

            expect(response.success).toBe(true);
            expect(response.message).toBeDefined();
            expect(Array.isArray(response.strategies)).toBe(true);
        });
    });
});
