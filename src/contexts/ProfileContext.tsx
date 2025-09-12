import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProfileService, ProfileData, AccountSettings, SecuritySettings } from '../services/profileService';

interface ProfileContextType {
  // Profile Data
  profileData: ProfileData;
  updateProfileData: (data: Partial<ProfileData>) => void;
  saveProfileData: () => Promise<{ success: boolean; errors: string[] }>;
  
  // Account Settings
  accountSettings: AccountSettings;
  updateAccountSettings: (settings: Partial<AccountSettings>) => void;
  saveAccountSettings: () => void;
  
  // Security Settings
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  saveSecuritySettings: () => void;
  
  // Utility functions
  resetToDefaults: () => void;
  exportData: () => string;
  importData: (jsonData: string) => { success: boolean; errors: string[] };
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>(ProfileService.loadProfileData());
  const [accountSettings, setAccountSettings] = useState<AccountSettings>(ProfileService.loadAccountSettings());
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(ProfileService.loadSecuritySettings());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load data on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      setProfileData(ProfileService.loadProfileData());
      setAccountSettings(ProfileService.loadAccountSettings());
      setSecuritySettings(ProfileService.loadSecuritySettings());
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile data
  const updateProfileData = (data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  // Save profile data with validation
  const saveProfileData = async (): Promise<{ success: boolean; errors: string[] }> => {
    setIsSaving(true);
    try {
      const validation = ProfileService.validateProfileData(profileData);
      if (validation.isValid) {
        ProfileService.saveProfileData(profileData);
        return { success: true, errors: [] };
      } else {
        return { success: false, errors: validation.errors };
      }
    } catch (error) {
      console.error('Error saving profile data:', error);
      return { success: false, errors: ['Failed to save profile data'] };
    } finally {
      setIsSaving(false);
    }
  };

  // Update account settings
  const updateAccountSettings = (settings: Partial<AccountSettings>) => {
    setAccountSettings(prev => ({ ...prev, ...settings }));
  };

  // Save account settings
  const saveAccountSettings = () => {
    try {
      ProfileService.saveAccountSettings(accountSettings);
    } catch (error) {
      console.error('Error saving account settings:', error);
    }
  };

  // Update security settings
  const updateSecuritySettings = (settings: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => ({ ...prev, ...settings }));
  };

  // Save security settings
  const saveSecuritySettings = () => {
    try {
      ProfileService.saveSecuritySettings(securitySettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  };

  // Reset all data to environment defaults
  const resetToDefaults = () => {
    try {
      ProfileService.resetProfileData();
      ProfileService.resetAccountSettings();
      ProfileService.resetSecuritySettings();
      
      setProfileData(ProfileService.loadProfileData());
      setAccountSettings(ProfileService.loadAccountSettings());
      setSecuritySettings(ProfileService.loadSecuritySettings());
    } catch (error) {
      console.error('Error resetting to defaults:', error);
    }
  };

  // Export all data
  const exportData = () => {
    return ProfileService.exportData();
  };

  // Import data
  const importData = (jsonData: string) => {
    const result = ProfileService.importData(jsonData);
    if (result.success) {
      // Reload data after successful import
      setProfileData(ProfileService.loadProfileData());
      setAccountSettings(ProfileService.loadAccountSettings());
      setSecuritySettings(ProfileService.loadSecuritySettings());
    }
    return result;
  };

  const value: ProfileContextType = {
    profileData,
    updateProfileData,
    saveProfileData,
    accountSettings,
    updateAccountSettings,
    saveAccountSettings,
    securitySettings,
    updateSecuritySettings,
    saveSecuritySettings,
    resetToDefaults,
    exportData,
    importData,
    isLoading,
    isSaving,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
