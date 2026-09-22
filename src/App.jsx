import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import WaterTab from './components/tabs/WaterTab';
import DietTab from './components/tabs/DietTab';
import WorkoutTab from './components/tabs/WorkoutTab';
import CareAndPillsTab from './components/tabs/CareAndPillsTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import ProfilePage from './components/profile/ProfilePage';
import SettingsPage from './components/settings/SettingsPage';
import FaqPage from './components/settings/FaqPage';
import PrivacyPage from './components/settings/PrivacyPage';
import './styles/theme.css';
import './App.css';

function MainLayout() {
  const { activeTab, currentPage } = useApp();

  // If currently on Settings page
  if (currentPage === 'settings') {
    return (
      <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
        <ErrorBoundary name="Settings Page">
          <SettingsPage />
        </ErrorBoundary>
      </div>
    );
  }

  // If currently on FAQ page
  if (currentPage === 'faq') {
    return (
      <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
        <ErrorBoundary name="Help & FAQ Page">
          <FaqPage />
        </ErrorBoundary>
      </div>
    );
  }

  // If currently on Privacy Policy page
  if (currentPage === 'privacy') {
    return (
      <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
        <ErrorBoundary name="Privacy Policy Page">
          <PrivacyPage />
        </ErrorBoundary>
      </div>
    );
  }

  // If currently on dedicated Profile page
  if (currentPage === 'profile') {
    return (
      <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
        <ErrorBoundary name="Profile Page">
          <ProfilePage />
        </ErrorBoundary>
      </div>
    );
  }

  // Main Tab Layout
  return (
    <div id="app-viewport" className="app-viewport">
      <Header />
      <main className="app-content">
        {activeTab === 'water' && (
          <ErrorBoundary name="Water Tracker">
            <WaterTab />
          </ErrorBoundary>
        )}
        {activeTab === 'diet' && (
          <ErrorBoundary name="Diet Tracker">
            <DietTab />
          </ErrorBoundary>
        )}
        {activeTab === 'workout' && (
          <ErrorBoundary name="Workout Tracker">
            <WorkoutTab />
          </ErrorBoundary>
        )}
        {activeTab === 'care' && (
          <ErrorBoundary name="Care & Pills">
            <CareAndPillsTab />
          </ErrorBoundary>
        )}
        {activeTab === 'analytics' && (
          <ErrorBoundary name="Analytics">
            <AnalyticsTab />
          </ErrorBoundary>
        )}
        {activeTab === 'profile' && (
          <ErrorBoundary name="Profile">
            <ProfilePage />
          </ErrorBoundary>
        )}
      </main>
      <Navbar />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary name="VitalSync App" showHomeAction>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
