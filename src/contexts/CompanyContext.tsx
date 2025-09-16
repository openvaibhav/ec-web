import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProfileService, CompanyData } from '../services/profileService';

interface CompanyContextType {
  companyData: CompanyData;
  updateCompanyData: (updates: Partial<CompanyData>) => void;
  saveCompanyData: () => Promise<void>;
  resetCompanyData: () => void;
  isSaving: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companyData, setCompanyData] = useState<CompanyData>(() => {
    return ProfileService.loadCompanyData();
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateCompanyData = (updates: Partial<CompanyData>) => {
    setCompanyData(prev => ({ ...prev, ...updates }));
  };

  const saveCompanyData = async (): Promise<void> => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      ProfileService.saveCompanyData(companyData);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('companyUpdated', {
        detail: { companyData }
      }));
      
    } catch (error) {
      console.error('Error saving company data:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const resetCompanyData = () => {
    const defaultData = ProfileService.loadCompanyData();
    setCompanyData(defaultData);
    ProfileService.resetCompanyData();
  };

  // Listen for company data changes from other components
  useEffect(() => {
    const handleCompanyUpdate = (event: CustomEvent) => {
      setCompanyData(event.detail.companyData);
    };

    window.addEventListener('companyUpdated', handleCompanyUpdate as EventListener);
    
    return () => {
      window.removeEventListener('companyUpdated', handleCompanyUpdate as EventListener);
    };
  }, []);

  return (
    <CompanyContext.Provider value={{
      companyData,
      updateCompanyData,
      saveCompanyData,
      resetCompanyData,
      isSaving
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
