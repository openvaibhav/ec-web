// Profile Service for managing profile data from environment variables and localStorage
export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
}

export interface AccountSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  twoFactorAuth: boolean;
  publicProfile: boolean;
}

export interface SecuritySettings {
  sessionTimeout: number;
  passwordMinLength: number;
  require2FA: boolean;
  twoFactorAuth: boolean;
}

// Default values from environment variables or fallbacks
const getEnvValue = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Default profile data from environment
export const defaultProfileData: ProfileData = {
  firstName: getEnvValue('REACT_APP_PROFILE_FIRST_NAME', 'Guy'),
  lastName: getEnvValue('REACT_APP_PROFILE_LAST_NAME', 'Hawkins'),
  email: getEnvValue('REACT_APP_PROFILE_EMAIL', 'guy.hawkins@example.com'),
  phone: getEnvValue('REACT_APP_PROFILE_PHONE', '+1 (555) 123-4567'),
  location: getEnvValue('REACT_APP_PROFILE_LOCATION', 'New York, NY'),
  bio: getEnvValue('REACT_APP_PROFILE_BIO', 'E-commerce business owner with 5+ years of experience in online retail.'),
  avatar: getEnvValue('REACT_APP_PROFILE_AVATAR', 'https://via.placeholder.com/120x120'),
};

// Default account settings from environment
export const defaultAccountSettings: AccountSettings = {
  emailNotifications: getEnvBoolean('REACT_APP_ACCOUNT_EMAIL_NOTIFICATIONS', true),
  smsNotifications: getEnvBoolean('REACT_APP_ACCOUNT_SMS_NOTIFICATIONS', false),
  marketingEmails: getEnvBoolean('REACT_APP_ACCOUNT_MARKETING_EMAILS', true),
  twoFactorAuth: getEnvBoolean('REACT_APP_ACCOUNT_TWO_FACTOR_AUTH', false),
  publicProfile: getEnvBoolean('REACT_APP_ACCOUNT_PUBLIC_PROFILE', true),
};

// Default security settings from environment
export const defaultSecuritySettings: SecuritySettings = {
  sessionTimeout: getEnvNumber('REACT_APP_SECURITY_SESSION_TIMEOUT', 30),
  passwordMinLength: getEnvNumber('REACT_APP_SECURITY_PASSWORD_MIN_LENGTH', 8),
  require2FA: getEnvBoolean('REACT_APP_SECURITY_REQUIRE_2FA', false),
  twoFactorAuth: getEnvBoolean('REACT_APP_ACCOUNT_TWO_FACTOR_AUTH', false),
};

// Profile Service Class
export class ProfileService {
  private static readonly PROFILE_STORAGE_KEY = 'user_profile';
  private static readonly SETTINGS_STORAGE_KEY = 'user_settings';
  private static readonly SECURITY_STORAGE_KEY = 'security_settings';

  // Load profile data from localStorage or return defaults
  static loadProfileData(): ProfileData {
    try {
      const saved = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        return { ...defaultProfileData, ...parsed };
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    return { ...defaultProfileData };
  }

  // Save profile data to localStorage
  static saveProfileData(profileData: ProfileData): void {
    try {
      localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  }

  // Load account settings from localStorage or return defaults
  static loadAccountSettings(): AccountSettings {
    try {
      const saved = localStorage.getItem(this.SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultAccountSettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading account settings:', error);
    }
    return { ...defaultAccountSettings };
  }

  // Save account settings to localStorage
  static saveAccountSettings(settings: AccountSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving account settings:', error);
    }
  }

  // Load security settings from localStorage or return defaults
  static loadSecuritySettings(): SecuritySettings {
    try {
      const saved = localStorage.getItem(this.SECURITY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSecuritySettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
    return { ...defaultSecuritySettings };
  }

  // Save security settings to localStorage
  static saveSecuritySettings(settings: SecuritySettings): void {
    try {
      localStorage.setItem(this.SECURITY_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  }

  // Reset profile data to environment defaults
  static resetProfileData(): void {
    localStorage.removeItem(this.PROFILE_STORAGE_KEY);
  }

  // Reset account settings to environment defaults
  static resetAccountSettings(): void {
    localStorage.removeItem(this.SETTINGS_STORAGE_KEY);
  }

  // Reset security settings to environment defaults
  static resetSecuritySettings(): void {
    localStorage.removeItem(this.SECURITY_STORAGE_KEY);
  }

  // Validate profile data
  static validateProfileData(profileData: ProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!profileData.firstName.trim()) {
      errors.push('First name is required');
    }

    if (!profileData.lastName.trim()) {
      errors.push('Last name is required');
    }

    if (!profileData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.push('Email format is invalid');
    }

    if (!profileData.phone.trim()) {
      errors.push('Phone number is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export all data as JSON
  static exportData(): string {
    const profileData = this.loadProfileData();
    const accountSettings = this.loadAccountSettings();
    const securitySettings = this.loadSecuritySettings();

    return JSON.stringify({
      profile: profileData,
      accountSettings,
      securitySettings,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // Import data from JSON
  static importData(jsonData: string): { success: boolean; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];

      if (data.profile) {
        const validation = this.validateProfileData(data.profile);
        if (!validation.isValid) {
          errors.push(...validation.errors);
        } else {
          this.saveProfileData(data.profile);
        }
      }

      if (data.accountSettings) {
        this.saveAccountSettings(data.accountSettings);
      }

      if (data.securitySettings) {
        this.saveSecuritySettings(data.securitySettings);
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Invalid JSON format']
      };
    }
  }
}
