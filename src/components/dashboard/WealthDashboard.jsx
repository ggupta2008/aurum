import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useScopedWealth } from '../../hooks/useScopedWealth';
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
    const [showEstateReport, setShowEstateReport] = useState(false);

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            background: 'transparent' // Let global gradient shine
        }}>
            {/* MAIN CONTENT */}
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-6)',
                paddingRight: 'var(--space-4)'
            }}>
                {/* TRUST SIGNAL HEADER */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-8)',
                    paddingBottom: 'var(--space-4)',
                    borderBottom: '1px solid hsla(var(--text-primary) / 0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 16px',
                        background: 'hsla(var(--success)/0.1)',
                        borderRadius: '20px',
                        border: '1px solid hsla(var(--success)/0.2)'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'hsl(var(--success))',
                            boxShadow: '0 0 12px hsl(var(--success))'
                        }} className="anim-pulse" />
                        <span style={{
                            fontSize: '0.7rem',
                            color: 'hsl(var(--success))',
                            fontWeight: 700,
                            letterSpacing: '0.08em'
                        }}>
                            SECURE CONNECTION • FIDUCIARY PROTOCOL ACTIVE
                        </span>
                    </div>

                    {/* SCOPE SELECTOR */}
                    <div className="glass-panel" style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '4px',
                        borderRadius: '12px'
                    }}>
                        {/* Grand Clan Toggle */}
                        <button
                            onClick={() => setPlanningScope('grand')}
                            style={{
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                background: planningScope === 'grand' ? 'hsl(var(--gold-primary))' : 'transparent',
                                color: planningScope === 'grand' ? 'hsl(var(--text-on-gold))' : 'hsl(var(--text-secondary))',
                                transition: 'all 0.2s',
                                fontFamily: 'Space Grotesk, sans-serif'
                            }}
                        >
                            GRAND CLAN
                        </button>

                        {/* Divider */}
                        <div style={{ width: '1px', background: 'hsla(var(--text-primary)/0.1)', margin: '4px 0' }} />

                        {/* Tax Units */}
                        {taxUnits.map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => setPlanningScope(unit.id)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: planningScope === unit.id ? 'hsla(var(--text-primary)/0.1)' : 'transparent',
                                    color: planningScope === unit.id ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Space Grotesk, sans-serif'
                                }}
                            >
                                {unit.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SECTION 1: WEALTH COMMAND CENTER */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h2 className="anim-fade-up" style={{
                                fontSize: '2rem',
                                fontWeight: 600,
                                letterSpacing: '-0.02em',
                                color: 'hsl(var(--text-primary))',
                                margin: 0,
                                fontFamily: 'Space Grotesk, sans-serif'
                            }}>
                                Wealth Command Center
                            </h2>
                            <p className="anim-fade-up anim-delay-1" style={{
                                fontSize: '0.9rem',
                                color: 'hsl(var(--text-secondary))',
                                marginTop: '4px'
                            }}>
                                Live telemetry of gross assets across {planningScope === 'household' ? 'all entities' : 'selected tax unit'}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <SummaryCards />
                    </div>
                </section>

                {/* SECTION 2: INTELLIGENCE & PROJECTIONS GRID */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr', // 60/40 spread
                    gap: 'var(--space-6)',
                    marginBottom: 'var(--space-8)'
                }}>
                    {/* Left Col: AI Advisor + Strategy */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* AI Advisor */}
                        <section className="anim-fade-up anim-delay-2">
                            <AIWealthAdvisor />
                        </section>

                        {/* Strategy Comparison */}
                        <StrategyComparison />
                    </div>

                    {/* Right Col: Charts & Visuals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <div className="anim-fade-up anim-delay-3" style={{ height: '500px' }}>
                            {/* Projection Chart - Now self-contained glass panel */}
                            <ProjectionChart />
                        </div>
                        <div className="anim-fade-up anim-delay-3">
                            <TaxWaterfall />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: DEEP DIVES GRID */}
                <h3 className="anim-fade-up" style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: 'hsl(var(--text-primary))',
                    marginBottom: 'var(--space-6)',
                    borderTop: '1px solid hsla(var(--text-primary)/0.1)',
                    paddingTop: 'var(--space-6)'
                }}>
                    Strategic Deep Dives
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: 'var(--space-6)',
                    paddingBottom: 'var(--space-12)'
                }}>
                    {/* Tax Strategy */}
                    <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Tax Engineering</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <TaxBracketHeatmap />
                            <RothConversionLadder />
                            <CharitableGivingOptimizer />
                        </div>
                    </div>

                    {/* Retirement & Longevity */}
                    <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Longevity & Cash Flow</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <SafeWithdrawalRate />
                            <SocialSecurityOptimizer />
                            <HealthcareModeler />
                        </div>
                    </div>

                    {/* Estate & Legacy */}
                    <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Estate Architecture</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <TrustSimulator />
                            <ClanBreakdown onShowReport={() => setShowEstateReport(true)} />
                            <MilestoneRoadmap />
                        </div>
                    </div>

                    {/* Portfolio Optimization */}
                    <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'hsl(var(--gold-primary))', marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Risk & Allocation</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <AssetAllocationOptimizer />
                            <IntelligenceFeed />
                            <FinancialActionPlan />
                        </div>
                    </div>
                </div>
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
        <WealthDashboardContent />
    );
};

export default WealthDashboard;
