import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import WaterTab from './components/tabs/WaterTab';
import DietTab from './components/tabs/DietTab';
import WorkoutTab from './components/tabs/WorkoutTab';
import CareAndPillsTab from './components/tabs/CareAndPillsTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import ProfileTab from './components/tabs/ProfileTab';
import './styles/theme.css';
import './App.css';

function MainLayout() {
  const { activeTab } = useApp();

  return (
    <div id="app-viewport" className="app-viewport">
      <Header />
      <main className="app-content">
        {activeTab === 'water' && <WaterTab />}
        {activeTab === 'diet' && <DietTab />}
        {activeTab === 'workout' && <WorkoutTab />}
        {activeTab === 'care' && <CareAndPillsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>
      <Navbar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
