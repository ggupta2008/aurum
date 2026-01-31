# Project Context: Aurum Wealth Intelligence

## 1. High-Level Summary

**Aurum** is an AI-first, S-Tier dynastic wealth intelligence platform designed to replace traditional financial advisors with a conversational, fiduciary CFP/CPA persona. Powered by Google Gemini, it moves beyond simple tracking into proactive, automated optimization of a client's entire financial life. The platform prioritizes tax efficiency, estate planning, and wealth accumulation for high-net-worth individuals. It is currently in a feature-complete state for local use, featuring a "Glassmorphism" UI and a robust React/Vite architecture.

## 2. Core Principles & Philosophy

### AI-First Fiduciary Standard
*   **Conversational Interface:** No forms or static calculators. The platform ingests financial profiles and goals through natural language conversation.
*   **CFP & CPA Expertise:** The AI is prompted with a world-class fiduciary persona, holding dual certifications and specializing in HNW clients ($1M-$50M).
*   **Transparent Reasoning:** Advice is prescriptive, educational, and always cites specific tax codes (e.g., IRC §72(t), §1014) to build trust.

### Financial Philosophy
*   **Tax-Efficiency First:** Inspired by "The Power of Zero," prioritizing moving assets from tax-deferred to tax-free buckets.
*   **Low-Cost Investing:** Aligned with "The Simple Path to Wealth," modeling long-term alpha by minimizing fee drag.
*   **Tax Alpha Generation:** Active modeling of strategies like tax-loss harvesting, asset location, and granular tax-lot tracking.

## 3. Technical Architecture

*   **Tech Stack:** React (Vite) with vanilla CSS (`src/styles/index.css`) for a lightweight, high-performance frontend.
*   **AI Engine:** `src/utils/ai/geminiClient.js` manages the connection to Google Gemini, handling context-aware prompting (via `buildContextualPrompt`), conversation history, and persona enforcement.
*   **State Management:** A centralized `WealthContext.jsx` acts as the single source of truth, integrated with `useScopedWealth.js` for scope-aware data retrieval.
*   **Mathematical Engine:** `src/utils/engine/financeEngine.js` performs 25-year projections, Monte Carlo simulations, and integrates with `taxRules.js` for complex unit identification.
*   **Data Persistence:** `clientManager.js` handles multi-client data, currently using `localStorage` with a robust `dataMigration.js` system.
*   **Design:** "Comfort Dark" palette with Glassmorphism, using `Space Grotesk` and `Inter` fonts.

## 4. Key Features

### Conversational AI Advisor
*   **AIWealthAdvisor:** The central hub for user interaction. Provides real-time, context-aware financial advice, strategy generation, and scenario planning.
*   **Strategy Sync:** Extracted strategies from AI responses can be deployed directly into the financial engine for immediate projection updates.
*   **Granular Tax-Lot Tracking:** Tracks Cost Basis, Purchase Date, and Depreciation for precise Unrealized G/L and Holding Period analysis.

## 5. Development Workflow & Testing

### Continuous Testing Protocol
*   **Incremental Testing:** Add tests immediately alongside new logic.
*   **TDD by Default:** Write test definitions before implementation.
*   **Pre-Commit Verification:** Run `npm run test:run` before changes.
*   **Coverage:** Maintain >95% test coverage for math/financial logic.

### Test Suite
*   **Stack:** Vitest with happy-dom.
*   **Coverage:** ~99% coverage of core business logic across 148 tests.
*   **Performance:** The entire suite runs in under 1 second.

## 6. Development Roadmap

### Current Focus (Phase 2: Advanced Strategies)
*   **Dynamic Projection Generation:** AI-driven drawing of wealth trajectories based on conversational recommendations.
*   **Multi-Scenario Comparison:** Side-by-side view of "Baseline" vs. "AI-Optimized" futures.
*   **Action Center:** A dedicated space for implementing agreed-upon strategies.

### Future Initiatives
*   **Account-Level Tracking:** Enhance "The Vault" to track individual financial accounts (e.g., specific brokerage accounts, 401(k)s) instead of just aggregate buckets.
*   **Withdrawal Sequencing Optimizer:** Algorithms to determine the optimal order of withdrawals (e.g., Taxable -> Tax-Deferred -> Tax-Free) to minimize lifetime tax drag.
*   **Tax-Loss Harvesting Simulator:** A dedicated module to simulate the harvesting of losses to offset capital gains.
*   **Advisor Collaboration:** Features for human CPAs/CFPs to use Aurum with their clients.
