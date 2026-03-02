import React from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { UnlockScreen } from './components/UnlockScreen';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
  const { isLocked } = useVault();

  return (
    <>
      {isLocked ? <UnlockScreen /> : <Dashboard />}
    </>
  );
};

export default function App() {
  return (
    <VaultProvider>
      <AppContent />
    </VaultProvider>
  );
}
