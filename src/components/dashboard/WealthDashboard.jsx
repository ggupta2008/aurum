import React from 'react';
import { useWealth } from '../../context/WealthContext';
import { Users, LayoutGrid, Settings, PieChart } from 'lucide-react';

import WealthProfile from './WealthProfile';
import StrategySelector from './StrategySelector';
import ProjectionChart from './ProjectionChart';
import GoalSelector from './GoalSelector';
import SummaryCards from './SummaryCards';
import BucketVisualizer from './BucketVisualizer';
import ClanBreakdown from './ClanBreakdown';
import EstateReport from './EstateReport';
import MilestoneRoadmap from './MilestoneRoadmap';
import IntelligenceFeed from './IntelligenceFeed';
import GlobalAssumptions from './GlobalAssumptions';
import StochasticCore from './StochasticCore';
import TaxWaterfall from './TaxWaterfall';
import SafeWithdrawalRate from './SafeWithdrawalRate';
import TaxBracketHeatmap from './TaxBracketHeatmap';
import AssetAllocationOptimizer from './AssetAllocationOptimizer';
import SocialSecurityOptimizer from './SocialSecurityOptimizer';
import HealthcareModeler from './HealthcareModeler';
import TrustSimulator from './TrustSimulator';
import CharitableGivingOptimizer from './CharitableGivingOptimizer';
import RothConversionLadder from './RothConversionLadder';
import ClientSwitcher from './ClientSwitcher';
import DividendSnowball from './DividendSnowball';
import CalculationTransparency from './CalculationTransparency';
import FinancialIndependenceCalculator from './FinancialIndependenceCalculator';
import FinancialActionPlan from './FinancialActionPlan';

const WealthDashboard = () => {
    const { taxUnits, planningScope, setPlanningScope } = useWealth();
    const [showEstateReport, setShowEstateReport] = React.useState(false);

    return (
        <div style={{
            display: 'flex',
            height: '100%',
            gap: 'var(--space-6)',
            overflow: 'hidden'
        }}>
            {showEstateReport && <EstateReport onClose={() => setShowEstateReport(false)} />}

            {/* LEFT SIDEBAR: Controls & Inputs */}
            <aside style={{
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)',
                overflowY: 'auto',
                paddingRight: 'var(--space-2)',
                flexShrink: 0
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    color: 'hsl(var(--gold-primary))',
                    marginBottom: 'var(--space-2)'
                }}>
                    <Settings size={18} />
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuration</h2>
                </div>

                <ClientSwitcher />

                <GoalSelector />
                <GlobalAssumptions />
                <WealthProfile />
                <StrategySelector />
                <StochasticCore />
                <BucketVisualizer />
            </aside>

            {/* RIGHT MAIN: Professional Advisor Flow */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-8)',
                overflowY: 'auto',
                paddingRight: 'var(--space-2)'
            }}>
                {/* Scope Selector */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'hsla(var(--bg-surface) / 0.5)',
                    padding: 'var(--space-3) var(--space-5)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid hsla(var(--text-primary) / 0.04)',
                    backdropFilter: 'blur(10px)',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: 600 }}>
                            <Users size={14} />
                            PLANNING FOR:
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                                onClick={() => setPlanningScope('household')}
                                className={`nav-btn ${planningScope === 'household' ? 'nav-btn-active' : ''}`}
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
                </div>

                {/* STEP 1: DISCOVERY - Where Are You Now? */}
                <section>
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

                {/* STEP 2: ANALYSIS - What Does This Mean? */}
                <section>
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
                        <DividendSnowball />
                    </div>
                </section>

                {/* STEP 3: TAX STRATEGY - How Do We Optimize? */}
                <section>
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

                {/* STEP 4: RETIREMENT PLANNING - Can You Retire? */}
                <section>
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
                        <FinancialIndependenceCalculator />
                        <SafeWithdrawalRate />
                        <SocialSecurityOptimizer />
                        <HealthcareModeler />
                    </div>
                </section>

                {/* STEP 5: ACTION PLAN - What Should You Do? */}
                <section>
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
                            AI-powered recommendations to achieve your goals
                        </p>
                    </div>
                    <FinancialActionPlan />
                </section>

                {/* STEP 6: PROJECTION - What Will Happen? */}
                <section>
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

                {/* STEP 6: ESTATE & LEGACY - What Happens to Your Wealth? */}
                <section>
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

                {/* STEP 7: ACTION ITEMS - What Should You Do Next? */}
                <section style={{ paddingBottom: 'var(--space-10)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'hsl(var(--gold-primary))',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Step 7: Recommended Actions
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                            Prioritized strategies to implement immediately
                        </p>
                    </div>
                    <IntelligenceFeed />
                </section>
            </main>
        </div >
    );
};

export default WealthDashboard;
