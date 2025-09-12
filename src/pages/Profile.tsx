import React, { useState, useEffect } from 'react';
import { User, Save, Camera, Lock, Bell, Shield, AlertCircle, Settings } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [originalProfileData, setOriginalProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyUrl, setCompanyUrl] = useState('');
  const [companyData, setCompanyData] = useState(() => {
    const savedCompany = localStorage.getItem('companyData');
    return savedCompany ? JSON.parse(savedCompany) : {
      name: 'Kanky Store',
      logo: '',
      type: 'Company'
    };
  });

  const {
    profileData,
    updateProfileData,
    saveProfileData,
    accountSettings,
    updateAccountSettings,
    saveAccountSettings,
    securitySettings,
    updateSecuritySettings,
    saveSecuritySettings,
    isSaving,
  } = useProfile();

  // Store original data when editing starts
  useEffect(() => {
    if (isEditing && !originalProfileData.firstName) {
      setOriginalProfileData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        avatar: profileData.avatar,
      });
    }
  }, [isEditing, profileData, originalProfileData.firstName]);

  const handleInputChange = (field: string, value: string) => {
    updateProfileData({ [field]: value });
  };

  const handleCancel = () => {
    // Restore original data
    updateProfileData(originalProfileData);
    setIsEditing(false);
    // Clear original data
    setOriginalProfileData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      avatar: '',
    });
  };

  const handleSettingsChange = (field: string, value: boolean) => {
    updateAccountSettings({ [field]: value });
    saveAccountSettings();
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCameraClick = () => {
    setAvatarUrl(profileData.avatar);
    setShowAvatarModal(true);
  };

  const handleAvatarUpdate = async () => {
    if (avatarUrl.trim()) {
      updateProfileData({ avatar: avatarUrl.trim() });
      
      // Save to localStorage immediately
      const result = await saveProfileData();
      if (result.success) {
        // Download updated profile data as .env file
        const profileEnvContent = `# Profile Data
PROFILE_FIRST_NAME=${profileData.firstName}
PROFILE_LAST_NAME=${profileData.lastName}
PROFILE_EMAIL=${profileData.email}
PROFILE_PHONE=${profileData.phone}
PROFILE_LOCATION=${profileData.location}
PROFILE_BIO=${profileData.bio}
PROFILE_AVATAR=${avatarUrl.trim()}

# Account Settings
ACCOUNT_EMAIL_NOTIFICATIONS=${accountSettings.emailNotifications}
ACCOUNT_SMS_NOTIFICATIONS=${accountSettings.smsNotifications}
ACCOUNT_MARKETING_EMAILS=${accountSettings.marketingEmails}
ACCOUNT_PUBLIC_PROFILE=${accountSettings.publicProfile}

# Security Settings
SECURITY_TWO_FACTOR_AUTH=${securitySettings.twoFactorAuth}
SECURITY_SESSION_TIMEOUT=${securitySettings.sessionTimeout}
SECURITY_PASSWORD_MIN_LENGTH=${securitySettings.passwordMinLength}
SECURITY_REQUIRE_2FA=${securitySettings.require2FA}

# Avatar Updated
AVATAR_UPDATED=${new Date().toISOString()}`;

        const dataBlob = new Blob([profileEnvContent], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '.env';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setShowAvatarModal(false);
        setAvatarUrl('');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        setErrorMessage('Failed to save avatar. Please try again.');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
      }
    }
  };

  const handleAvatarCancel = () => {
    setShowAvatarModal(false);
    setAvatarUrl('');
  };

  const handleCompanyClick = () => {
    setCompanyUrl(companyData.logo);
    setShowCompanyModal(true);
  };

  const handleCompanyUpdate = async () => {
    if (companyUrl.trim()) {
      const updatedCompany = { ...companyData, logo: companyUrl.trim() };
      setCompanyData(updatedCompany);
      localStorage.setItem('companyData', JSON.stringify(updatedCompany));
      
      // Dispatch custom event to notify the sidebar
      window.dispatchEvent(new CustomEvent('companyUpdated', {
        detail: { companyData: updatedCompany }
      }));
      
      // Download updated company data as .env file
      const companyEnvContent = `# Company Data
COMPANY_NAME=${companyData.name}
COMPANY_LOGO=${companyUrl.trim()}
COMPANY_TYPE=${companyData.type}

# Profile Data
PROFILE_FIRST_NAME=${profileData.firstName}
PROFILE_LAST_NAME=${profileData.lastName}
PROFILE_EMAIL=${profileData.email}
PROFILE_PHONE=${profileData.phone}
PROFILE_LOCATION=${profileData.location}
PROFILE_BIO=${profileData.bio}
PROFILE_AVATAR=${profileData.avatar}

# Account Settings
ACCOUNT_EMAIL_NOTIFICATIONS=${accountSettings.emailNotifications}
ACCOUNT_SMS_NOTIFICATIONS=${accountSettings.smsNotifications}
ACCOUNT_MARKETING_EMAILS=${accountSettings.marketingEmails}
ACCOUNT_PUBLIC_PROFILE=${accountSettings.publicProfile}

# Security Settings
SECURITY_TWO_FACTOR_AUTH=${securitySettings.twoFactorAuth}
SECURITY_SESSION_TIMEOUT=${securitySettings.sessionTimeout}
SECURITY_PASSWORD_MIN_LENGTH=${securitySettings.passwordMinLength}
SECURITY_REQUIRE_2FA=${securitySettings.require2FA}

# Company Updated
COMPANY_UPDATED=${new Date().toISOString()}`;

      const dataBlob = new Blob([companyEnvContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '.env';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowCompanyModal(false);
      setCompanyUrl('');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleCompanyCancel = () => {
    setShowCompanyModal(false);
    setCompanyUrl('');
  };

  const handleCompanyNameChange = (field: string, value: string) => {
    const updatedCompany = { ...companyData, [field]: value };
    setCompanyData(updatedCompany);
    localStorage.setItem('companyData', JSON.stringify(updatedCompany));
    
    // Dispatch custom event to notify the sidebar
    window.dispatchEvent(new CustomEvent('companyUpdated', {
      detail: { companyData: updatedCompany }
    }));
  };

  const handleSaveProfile = async () => {
    const result = await saveProfileData();
    if (result.success) {
      setShowSuccessMessage(true);
      setIsEditing(false);
      
      // Download profile data as .env file
      const profileEnvContent = `# Profile Data
PROFILE_FIRST_NAME=${profileData.firstName}
PROFILE_LAST_NAME=${profileData.lastName}
PROFILE_EMAIL=${profileData.email}
PROFILE_PHONE=${profileData.phone}
PROFILE_LOCATION=${profileData.location}
PROFILE_BIO=${profileData.bio}
PROFILE_AVATAR=${profileData.avatar}

# Account Settings
ACCOUNT_EMAIL_NOTIFICATIONS=${accountSettings.emailNotifications}
ACCOUNT_SMS_NOTIFICATIONS=${accountSettings.smsNotifications}
ACCOUNT_MARKETING_EMAILS=${accountSettings.marketingEmails}
ACCOUNT_PUBLIC_PROFILE=${accountSettings.publicProfile}

# Security Settings
SECURITY_TWO_FACTOR_AUTH=${securitySettings.twoFactorAuth}
SECURITY_SESSION_TIMEOUT=${securitySettings.sessionTimeout}
SECURITY_PASSWORD_MIN_LENGTH=${securitySettings.passwordMinLength}
SECURITY_REQUIRE_2FA=${securitySettings.require2FA}`;

      const dataBlob = new Blob([profileEnvContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '.env';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Clear original data since we saved successfully
      setOriginalProfileData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        avatar: '',
      });
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } else {
      setErrorMessage(result.errors.join(', '));
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
    }
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
      return;
    }

    if (passwordData.newPassword.length < securitySettings.passwordMinLength) {
      setErrorMessage(`Password must be at least ${securitySettings.passwordMinLength} characters long`);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
      return;
    }

    // Here you would typically make an API call to update the password
    console.log('Password update requested');
    
    // Download updated profile data as .env file
    const profileEnvContent = `# Profile Data
PROFILE_FIRST_NAME=${profileData.firstName}
PROFILE_LAST_NAME=${profileData.lastName}
PROFILE_EMAIL=${profileData.email}
PROFILE_PHONE=${profileData.phone}
PROFILE_LOCATION=${profileData.location}
PROFILE_BIO=${profileData.bio}
PROFILE_AVATAR=${profileData.avatar}

# Account Settings
ACCOUNT_EMAIL_NOTIFICATIONS=${accountSettings.emailNotifications}
ACCOUNT_SMS_NOTIFICATIONS=${accountSettings.smsNotifications}
ACCOUNT_MARKETING_EMAILS=${accountSettings.marketingEmails}
ACCOUNT_PUBLIC_PROFILE=${accountSettings.publicProfile}

# Security Settings
SECURITY_TWO_FACTOR_AUTH=${securitySettings.twoFactorAuth}
SECURITY_SESSION_TIMEOUT=${securitySettings.sessionTimeout}
SECURITY_PASSWORD_MIN_LENGTH=${securitySettings.passwordMinLength}
SECURITY_REQUIRE_2FA=${securitySettings.require2FA}

# Password Updated
PASSWORD_UPDATED=${new Date().toISOString()}`;

      const dataBlob = new Blob([profileEnvContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '.env';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account Settings', icon: Lock },
    { id: 'company', name: 'Company Settings', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  ];

  // Auto-save settings when they change
  useEffect(() => {
    if (activeTab === 'notifications') {
      saveAccountSettings();
    }
  }, [accountSettings, activeTab, saveAccountSettings]);

  useEffect(() => {
    if (activeTab === 'privacy') {
      saveSecuritySettings();
    }
  }, [securitySettings, activeTab, saveSecuritySettings]);

  return (
    <div className="p-6">
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="mb-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Settings saved successfully!
          </div>
        </div>
      )}

      {showErrorMessage && (
        <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <span className="text-gray-500 dark:text-gray-400">Dashboard</span>
            </li>
            <li>
              <span className="text-gray-500 dark:text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 dark:text-white font-medium">Profile</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h2>
                  <button
                    onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <img
                      className="h-24 w-24 rounded-full object-cover"
                      src={profileData.avatar}
                      alt="Profile"
                    />
                    {isEditing && (
                      <button 
                        onClick={handleCameraClick}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{profileData.email}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Account Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        minLength={securitySettings.passwordMinLength}
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Minimum {securitySettings.passwordMinLength} characters
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button 
                      onClick={handlePasswordUpdate}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Company Settings</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    {companyData.logo ? (
                      <img
                        className="h-24 w-24 rounded-full object-cover"
                        src={companyData.logo}
                        alt={companyData.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="h-24 w-24 rounded-full bg-red-500 flex items-center justify-center"><span class="text-white font-bold text-2xl">K</span></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">K</span>
                      </div>
                    )}
                    <button 
                      onClick={handleCompanyClick}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                    {companyData.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{companyData.type}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyData.name}
                      onChange={(e) => handleCompanyNameChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Type
                    </label>
                    <input
                      type="text"
                      value={companyData.type}
                      onChange={(e) => handleCompanyNameChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => handleSettingsChange('emailNotifications', !accountSettings.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accountSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accountSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                  </div>
                  <button
                    onClick={() => handleSettingsChange('smsNotifications', !accountSettings.smsNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accountSettings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accountSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive marketing and promotional emails</p>
                  </div>
                  <button
                    onClick={() => handleSettingsChange('marketingEmails', !accountSettings.marketingEmails)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accountSettings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accountSettings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Privacy & Security</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => updateSecuritySettings({ twoFactorAuth: !securitySettings.twoFactorAuth })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Public Profile</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Make your profile visible to other users</p>
                  </div>
                  <button
                    onClick={() => updateAccountSettings({ publicProfile: !accountSettings.publicProfile })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accountSettings.publicProfile ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accountSettings.publicProfile ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Security Settings</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Session Timeout: {securitySettings.sessionTimeout} minutes</p>
                    <p>Minimum Password Length: {securitySettings.passwordMinLength} characters</p>
                    <p>2FA Required: {securitySettings.require2FA ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar URL Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Profile Picture</h3>
              <button
                onClick={handleAvatarCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a valid image URL (JPG, PNG, GIF, etc.)
                </p>
              </div>
              {avatarUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="flex justify-center">
                    <img
                      src={avatarUrl}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">Invalid URL</div>';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleAvatarCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAvatarUpdate}
                disabled={!avatarUrl.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Update Avatar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Logo Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Company Logo</h3>
              <button
                onClick={handleCompanyCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a valid image URL (JPG, PNG, GIF, etc.)
                </p>
              </div>
              {companyUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="flex justify-center">
                    <img
                      src={companyUrl}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="h-20 w-20 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">Invalid URL</div>';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCompanyCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompanyUpdate}
                disabled={!companyUrl.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Update Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
