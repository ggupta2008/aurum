import React, { useState } from 'react';
import Layout from './components/Layout';
import WealthDashboard from './components/dashboard/WealthDashboard';
import PortfolioView from './components/PortfolioView';
import DevTools from './components/DevTools';
import { WealthProvider } from './context/WealthContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [view, setView] = useState('dashboard');

  return (
    <ErrorBoundary>
      <WealthProvider>
        <Layout currentView={view} setView={setView}>
          {view === 'dashboard' && <WealthDashboard />}
          {view === 'portfolio' && <PortfolioView />}
        </Layout>
        <DevTools />
      </WealthProvider>
    </ErrorBoundary>
  );
}

export default App;
