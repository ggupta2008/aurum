import React, { useState } from 'react';
import { PlanningModeProvider, usePlanningMode } from '../../context/PlanningModeContext';
import { useScopedWealth } from '../../hooks/useScopedWealth';
import PlanningModeEntry from './PlanningModeEntry';
import GoalProgressTracker from './GoalProgressTracker';
import WealthProfile from './WealthProfile';
import StrategyComparison from './StrategyComparison';
import AIWealthAdvisor from './AIWealthAdvisor';
import StochasticCore from './StochasticCore';
import BucketVisualizer from './BucketVisualizer';
import SummaryCards from './SummaryCards';
import AssetAllocationOptimizer from './AssetAllocationOptimizer';
import TaxWaterfall from './TaxWaterfall';
import TaxBracketHeatmap from './TaxBracketHeatmap';
import RothConversionLadder from './RothConversionLadder';
import CharitableGivingOptimizer from './CharitableGivingOptimizer';
import SafeWithdrawalRate from './SafeWithdrawalRate';
import SocialSecurityOptimizer from './SocialSecurityOptimizer';
import HealthcareModeler from './HealthcareModeler';
import FinancialActionPlan from './FinancialActionPlan';
import ProjectionChart from './ProjectionChart';
import TrustSimulator from './TrustSimulator';
import ClanBreakdown from './ClanBreakdown';
import MilestoneRoadmap from './MilestoneRoadmap';
import IntelligenceFeed from './IntelligenceFeed';
import EstateReport from './EstateReport';

const WealthDashboardContent = () => {
    const { planningScope, setPlanningScope, taxUnits } = useScopedWealth();
    const { isPlanningMode } = usePlanningMode();
    const [showEstateReport, setShowEstateReport] = useState(false);

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden'
        }}>
            {/* LEFT SIDEBAR */}
            <aside style={{
                width: '260px',
                overflowY: 'auto',
                padding: 'var(--space-4)',
                borderRight: '1px solid hsl(var(--border-muted))'
            }}>
                <PlanningModeEntry />
                <WealthProfile />
            </aside>

            {/* MAIN CONTENT */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-6)',
                paddingRight: 'var(--space-2)'
            }}>
                {/* SCOPE SELECTOR */}
                <div style={{
                    marginBottom: 'var(--space-6)',
                    padding: 'var(--space-4)',
                    background: 'hsl(var(--surface-elevated))',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid hsl(var(--border-muted))'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'hsl(var(--text-muted))',
                        marginBottom: 'var(--space-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Planning Scope
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setPlanningScope('grand')}
                            className={`nav-btn ${planningScope === 'grand' ? 'nav-btn-active' : ''}`}
                            style={{ fontSize: '0.7rem', padding: '6px 14px' }}
                        >
                            Grand Clan
                        </button>
                        {taxUnits.map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => setPlanningScope(unit.id)}
                                className={`nav-btn ${planningScope === unit.id ? 'nav-btn-active' : ''}`}
                                style={{ fontSize: '0.7rem', padding: '6px 14px' }}
                            >
                                {unit.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PLANNING MODE SECTION - Only show when active */}
                {isPlanningMode && (
                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <GoalProgressTracker />
                    </div>
                )}

                {/* STEP 1: CURRENT POSITION */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 1: Current Position
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Understanding your current financial situation
                        </p>
                    </div>
                    <SummaryCards />
                </section>

                {/* STEP 2: PORTFOLIO ANALYSIS */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 2: Portfolio Analysis
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Deep dive into your asset allocation and tax efficiency
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 'var(--space-6)'
                    }}>
                        <AssetAllocationOptimizer />
                        <TaxWaterfall />
                    </div>
                </section>

                {/* STEP 2.5: AI WEALTH ADVISOR */}
                <section style={{ marginBottom: 'var(--space-8)', minHeight: '600px' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 2.5: AI Wealth Advisor
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Chat with AI to explore personalized wealth strategies
                        </p>
                    </div>
                    <AIWealthAdvisor />
                </section>

                {/* STEP 3: TAX OPTIMIZATION STRATEGY */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 3: Tax Optimization Strategy
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Identifying opportunities to minimize lifetime tax burden
                        </p>
                    </div>
                    <TaxBracketHeatmap />
                    <RothConversionLadder />
                    <CharitableGivingOptimizer />
                </section>

                {/* STEP 4: RETIREMENT READINESS */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 4: Retirement Readiness
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Determining your safe withdrawal rate and sustainability
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: 'var(--space-6)'
                    }}>
                        <SafeWithdrawalRate />
                        <SocialSecurityOptimizer />
                        <HealthcareModeler />
                    </div>
                </section>

                {/* STEP 5: AI ACTION PLAN */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 5: Your Action Plan
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            AI-powered recommendations tailored to your situation
                        </p>
                    </div>
                    <FinancialActionPlan />
                </section>

                {/* STEP 6: 25-YEAR WEALTH TRAJECTORY */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 6: 25-Year Wealth Trajectory
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Comparing baseline vs optimized strategies over time
                        </p>
                    </div>
                    <div style={{ height: '500px' }}>
                        <ProjectionChart />
                    </div>
                </section>

                {/* STEP 7: ESTATE & LEGACY PLANNING */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 7: Estate & Legacy Planning
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Ensuring smooth wealth transfer to the next generation
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-6)'
                    }}>
                        <TrustSimulator />
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: 'var(--space-6)'
                        }}>
                            <ClanBreakdown onShowReport={() => setShowEstateReport(true)} />
                            <MilestoneRoadmap />
                        </div>
                    </div>
                </section>

                {/* STEP 8: RECOMMENDED ACTIONS */}
                <section style={{ paddingBottom: 'var(--space-10)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 8: Recommended Actions
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Prioritized strategies to implement immediately
                        </p>
                    </div>
                    <IntelligenceFeed />
                </section>
            </main>

            {/* MODALS */}
            {showEstateReport && (
                <EstateReport onClose={() => setShowEstateReport(false)} />
            )}
        </div>
    );
};

const WealthDashboard = () => {
    return (
        <PlanningModeProvider>
            <WealthDashboardContent />
        </PlanningModeProvider>
    );
};

export default WealthDashboard;
