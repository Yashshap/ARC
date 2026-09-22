import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProfileHeroCard from './profile/ProfileHeroCard';
import AppearanceCard from './profile/AppearanceCard';
import AppToolsCard from './profile/AppToolsCard';
import EditProfileModal from './profile/EditProfileModal';
import AndroidGuideModal from './profile/AndroidGuideModal';
import ImportDataModal from './profile/ImportDataModal';

export default function ProfileTab() {
  const { data, updateProfile, resetAllData, importData, toggleTheme } = useApp();
  const { profile, theme } = data;

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `arc_winter_health_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all tracker data to default state?')) {
      resetAllData();
    }
  };

  return (
    <div className="tab-content profile-tab-content">
      {/* Profile Hero Card */}
      <ProfileHeroCard
        profile={profile}
        onEditClick={() => setIsEditProfileOpen(true)}
      />

      {/* Appearance & Theme Toggle */}
      <AppearanceCard theme={theme} onToggleTheme={toggleTheme} />

      {/* App Tools & Android Build */}
      <AppToolsCard
        onOpenAndroid={() => setIsAndroidModalOpen(true)}
        onExportData={handleExportData}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        key={isEditProfileOpen ? 'open' : 'closed'}
        isOpen={isEditProfileOpen}
        profile={profile}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={updateProfile}
      />

      {/* Android Capacitor Guide Modal */}
      <AndroidGuideModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Import Data Modal */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importData}
      />
    </div>
  );
}
