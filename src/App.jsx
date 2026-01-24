import React, { useState } from 'react';
import Layout from './components/Layout';
import AdvisorInterface from './components/AdvisorInterface';
import WealthDashboard from './components/dashboard/WealthDashboard';
import PortfolioView from './components/PortfolioView';
import { WealthProvider } from './context/WealthContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [view, setView] = useState('dashboard'); // Default to dashboard for this task

  return (
    <ErrorBoundary>
      <WealthProvider>
        <Layout currentView={view} setView={setView}>
          {view === 'advisor' && <AdvisorInterface />}
          {view === 'dashboard' && <WealthDashboard />}
          {view === 'portfolio' && <PortfolioView />}
        </Layout>
      </WealthProvider>
    </ErrorBoundary>
  );
}

export default App;
