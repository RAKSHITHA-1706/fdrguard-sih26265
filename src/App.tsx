import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import InstitutionsPage from './pages/Institutions/InstitutionsPage';
import FDRManagementPage from './pages/FDRManagement/FDRManagementPage';
import FDRSentinelPage from './pages/FDRSentinel/FDRSentinelPage';
import NetworkIntelligencePage from './pages/NetworkIntelligence/NetworkIntelligencePage';
import GuardianAIPage from './pages/GuardianAI/GuardianAIPage';
import LifecycleRiskRadarPage from './pages/LifecycleRiskRadar/LifecycleRiskRadarPage';
import EvidenceVaultPage from './pages/EvidenceVault/EvidenceVaultPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import ReportsPage from './pages/Reports/ReportsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        {/* Entry / Authentication Route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions"
          element={
            <ProtectedRoute>
              <InstitutionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fdrs"
          element={
            <ProtectedRoute>
              <FDRManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fdrs/new"
          element={
            <ProtectedRoute>
              <FDRManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentinel"
          element={
            <ProtectedRoute>
              <FDRSentinelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <NetworkIntelligencePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guardian"
          element={
            <ProtectedRoute>
              <GuardianAIPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-radar"
          element={
            <ProtectedRoute>
              <LifecycleRiskRadarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evidence-vault"
          element={
            <ProtectedRoute>
              <EvidenceVaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
