# Aurum: AI-First Wealth Platform
## Product Vision & Architecture

### Core Philosophy
**Everything is AI-driven. No hardcoded strategies. No static calculators.**

The platform is a **conversational CFP/CPA advisor** that:
1. Ingests your complete financial profile
2. Analyzes it through the lens of a fiduciary wealth manager
3. Provides personalized, prescriptive advice
4. Dynamically generates projections based on recommendations
5. Evolves with each conversation

---

## Target Persona

**World-Class Fiduciary Financial Advisor**
- Dual CFP (Certified Financial Planner) + CPA (Certified Public Accountant)
- Specializes in high-net-worth individuals ($1M-$50M)
- Expertise: Tax minimization, wealth accumulation, estate planning
- Tone: Direct, analytical, prescriptive
- Cites specific tax codes (IRC §72(t), §1014, §2010, etc.)

**Client Persona**
- High-net-worth individuals/families
- Complex financial situations
- Multiple income streams
- Concentrated stock positions
- Business owners or tech executives
- Multi-generational wealth transfer goals

---

## Three Pillars of Advice

### 1. Investment & Wealth Management
- Asset allocation analysis
- Asset location optimization (taxable vs. tax-advantaged)
- Direct indexing for tax-loss harvesting
- Alternative investments (PE, VC, Real Estate)
- Concentrated position management (VPF, exchange funds, collars)

### 2. Advanced Tax Strategy
- AGI reduction techniques
- Backdoor Roth / Mega Backdoor Roth
- QBI deduction optimization
- Charitable giving strategies (DAF, CRT, CLT)
- Opportunity Zone investments
- Cost basis management
- Tax-loss harvesting automation

### 3. Estate Planning & Asset Protection
- Trust structures (RLT, ILIT, SLAT, GRAT, QPRT)
- Estate tax minimization
- Step-up in basis planning
- Beneficiary designation optimization
- Asset protection from creditors
- Multi-generational wealth transfer

---

## Product Architecture

### 1. Profile Intake (Conversational)
Instead of forms, the AI asks:
```
"Tell me about your financial situation. I'll need to understand:
- Your age, family status, and location
- Employment and income sources
- Current assets and their tax treatment
- Debts and liabilities
- Your primary financial goals"
```

The AI extracts structured data from natural language and builds the profile dynamically.

### 2. Analysis Engine (AI-Powered)
The AI analyzes the profile and identifies:
- **Risks**: Concentration, tax inefficiency, estate exposure
- **Opportunities**: Tax savings, wealth optimization, protection strategies
- **Gaps**: Missing accounts, suboptimal structures, compliance issues

### 3. Recommendation Generation (Dynamic)
For each opportunity, the AI generates:
- **Strategy name** (e.g., "Backdoor Roth Conversion Ladder")
- **Rationale** (why this helps, citing tax code)
- **Implementation steps** (specific actions with timeline)
- **Expected impact** (tax savings, wealth alpha, risk reduction)
- **Trade-offs** (costs, complexity, liquidity constraints)

### 4. Projection Engine (AI-Driven)
The AI translates recommendations into financial projections:
- 25-year wealth trajectory
- Tax burden over time
- Estate tax exposure
- Probability of success (Monte Carlo)
- Sensitivity analysis (what if scenarios)

### 5. Execution Guidance (Actionable)
The AI provides:
- **Prioritized action plan** (what to do first)
- **Vendor recommendations** (which brokerage, trust attorney, CPA)
- **Document templates** (trust language, beneficiary forms)
- **Compliance reminders** (RMD dates, contribution limits)

---

## User Experience Flow

### Initial Conversation
```
AI: "Hi, I'm your fiduciary wealth advisor. I hold CFP and CPA certifications 
     and specialize in high-net-worth tax optimization and estate planning.
     
     Tell me about your financial situation—I'll analyze it and propose a 
     comprehensive Wealth Architecture plan."

User: "I'm 42, married with 2 kids. I make $350K/year as a tech executive 
       in California. I have $500K in my 401k, $200K in a brokerage account, 
       and $1M in home equity. I want to retire at 55 and minimize taxes."

AI: "Thank you. I see several opportunities:
     
     1. **Tax Optimization**: You're likely in the 35% federal bracket plus 
        9.3% CA state. I recommend:
        - Mega Backdoor Roth ($43.5K/year tax-free growth)
        - Tax-loss harvesting in your brokerage (est. $5K-$10K annual savings)
        - Direct indexing to create $20K+ in losses annually
     
     2. **Retirement Acceleration**: To retire at 55 with your current spending:
        - You'll need $3.5M-$4M (assuming 3.5% withdrawal rate)
        - Current trajectory: $2.8M by 55 (shortfall of $700K)
        - Recommended: Increase 401k to max + after-tax contributions
     
     3. **Estate Planning**: With $1.7M net worth growing to $4M+:
        - Set up Revocable Living Trust (avoid CA probate, 1-2% of estate)
        - Consider ILIT for life insurance (remove from taxable estate)
        - 529 plans for kids (CA state deduction + tax-free growth)
     
     Would you like me to detail any of these strategies?"

User: "Tell me more about the Mega Backdoor Roth"

AI: "The Mega Backdoor Roth is a powerful strategy under IRC §402(g) and §415(c).
     
     **How it works:**
     1. Max out your 401k ($23,000 in 2024)
     2. Make after-tax contributions to 401k (up to $69,000 total limit)
     3. Immediately convert after-tax to Roth 401k or Roth IRA
     4. Result: $43,500/year of tax-free growth
     
     **Your specific numbers:**
     - Current 401k: $23,000/year
     - After-tax space: $46,000 ($69,000 - $23,000)
     - Employer match: ~$10,500 (3% of $350K)
     - Available for Mega Backdoor: $35,500/year
     
     **25-year impact:**
     - Contributions: $887,500
     - Growth at 8%: $2.8M (all tax-free!)
     - Tax savings vs. taxable: $420K (15% LTCG on $2.8M)
     
     **Requirements:**
     - Your 401k plan must allow after-tax contributions
     - Must allow in-service conversions to Roth
     
     Should I model this in your projection?"
```

### Projection Updates
Every recommendation generates a new scenario:
- **Baseline**: Current trajectory
- **Scenario 1**: Mega Backdoor Roth only
- **Scenario 2**: Mega Backdoor + Tax-loss harvesting
- **Scenario 3**: Full optimization (all strategies)

User can compare side-by-side and ask "what if" questions.

---

## Technical Implementation

### AI Prompt Engineering
```javascript
const ADVISOR_SYSTEM_PROMPT = `
You are a world-class fiduciary Financial Advisor and Wealth Manager with:
- CFP (Certified Financial Planner) certification
- CPA (Certified Public Accountant) license
- 20+ years serving high-net-worth clients ($1M-$50M)
- Expertise in tax minimization, estate planning, and wealth accumulation

Your role:
1. Analyze the client's financial profile
2. Identify risks, opportunities, and gaps
3. Recommend specific strategies with rationale
4. Cite relevant tax codes (IRC sections)
5. Provide implementation steps
6. Calculate expected financial impact

Tone: Direct, analytical, prescriptive. Use bullet points.

Always consider:
- Federal and state tax implications
- Estate tax exposure (current exemption: $13.61M in 2024)
- Asset protection and creditor risk
- Multi-generational wealth transfer
- Liquidity needs and cash flow

When recommending strategies, explain:
- WHY it helps (tax savings, wealth growth, protection)
- HOW to implement (specific steps)
- WHAT it costs (fees, complexity, time)
- WHEN to execute (timing matters for taxes)
`;
```

### Dynamic Projection Engine
```javascript
async function generateProjection(profile, aiRecommendations) {
  // AI translates recommendations into financial model
  const prompt = `
  Given this client profile: ${JSON.stringify(profile)}
  
  And these recommendations: ${JSON.stringify(aiRecommendations)}
  
  Generate a 25-year financial projection showing:
  1. Annual income (including growth)
  2. Annual spending (adjusted for inflation)
  3. Tax burden (federal + state)
  4. Asset growth by account type
  5. Net worth trajectory
  
  Return as JSON with year-by-year data.
  `;
  
  const result = await gemini.generateContent(prompt);
  return parseProjection(result);
}
```

### Conversation Memory
```javascript
const conversationHistory = [
  { role: 'system', content: ADVISOR_SYSTEM_PROMPT },
  { role: 'user', content: 'I make $350K and want to retire at 55' },
  { role: 'assistant', content: 'I see 3 opportunities...' },
  { role: 'user', content: 'Tell me about Mega Backdoor Roth' },
  // ... continues
];
```

---

## Key Differentiators

### vs. Traditional Advisors
- **24/7 availability** (no scheduling)
- **Instant analysis** (no waiting for meetings)
- **Transparent reasoning** (shows the math)
- **No conflicts of interest** (no product sales)
- **Continuous optimization** (always learning)

### vs. Robo-Advisors
- **Holistic advice** (not just asset allocation)
- **Tax expertise** (CPA-level strategies)
- **Estate planning** (trusts, beneficiaries)
- **Natural language** (no forms or questionnaires)
- **Personalized** (not one-size-fits-all)

### vs. Financial Planning Software
- **Conversational** (chat, not calculators)
- **AI-driven** (no hardcoded rules)
- **Prescriptive** (tells you what to do)
- **Educational** (explains the why)
- **Actionable** (provides next steps)

---

## Roadmap

### Phase 1: Core AI Advisor (Current)
- [x] Conversational interface
- [x] Gemini integration
- [x] Profile extraction from chat
- [ ] Dynamic projection generation
- [ ] Multi-scenario comparison

### Phase 2: Advanced Strategies
- [ ] Tax code citation engine
- [ ] Trust structure recommendations
- [ ] Concentrated position analysis
- [ ] Business owner strategies (QBI, etc.)
- [ ] Alternative investment suggestions

### Phase 3: Execution Support
- [ ] Document generation (trust templates)
- [ ] Vendor recommendations (CPAs, attorneys)
- [ ] Compliance calendar (RMDs, deadlines)
- [ ] Progress tracking
- [ ] Annual review automation

### Phase 4: Multi-Client & Collaboration
- [ ] Advisor mode (for CPAs/CFPs to use with clients)
- [ ] Client portal (share analysis)
- [ ] Family office features
- [ ] CPA integration (import tax returns)

---

## Success Metrics

### User Engagement
- Average conversation length (target: 10+ messages)
- Return rate (target: 3+ sessions/month)
- Recommendation acceptance (target: 60%+)

### Financial Impact
- Average tax savings identified (target: $10K+/year)
- Wealth alpha vs. baseline (target: 15%+ over 25 years)
- Estate tax reduction (target: $500K+ for HNW clients)

### Quality
- Accuracy of tax code citations (target: 95%+)
- User satisfaction (target: 4.5/5 stars)
- Advisor endorsement (target: CFPs recommend to clients)

---

## Competitive Moat

1. **AI-First Architecture**: No legacy calculator baggage
2. **Fiduciary Standard**: Always acts in client's best interest
3. **Tax Expertise**: CPA-level knowledge (rare in fintech)
4. **Estate Planning**: Trusts, not just investments
5. **Conversational UX**: Natural language, not forms
6. **Transparent**: Shows reasoning, cites sources
7. **Privacy**: Local-first, no data selling

---

**This is the future of wealth management.**

The question isn't "Can AI replace advisors?"  
The question is "Why would you pay $10K/year for advice that AI can provide instantly, accurately, and transparently?"

Aurum is that AI.
