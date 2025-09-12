import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Search,
  User,
  Moon,
  Sun,
  Filter,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { isDark, toggleTheme } = useTheme();
  const { profileData } = useProfile();
  const location = useLocation();

  // Company data state
  const [companyData, setCompanyData] = useState(() => {
    const savedCompany = localStorage.getItem('companyData');
    return savedCompany ? JSON.parse(savedCompany) : {
      name: 'Kanky Store',
      logo: '',
      type: 'Company'
    };
  });

  // Listen for company data changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCompany = localStorage.getItem('companyData');
      if (savedCompany) {
        setCompanyData(JSON.parse(savedCompany));
      }
    };

    const handleCompanyUpdate = (event: CustomEvent) => {
      setCompanyData(event.detail.companyData);
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom company update events
    window.addEventListener('companyUpdated', handleCompanyUpdate as EventListener);
    
    // Also check for changes on focus (when user comes back to tab)
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyUpdated', handleCompanyUpdate as EventListener);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Get search placeholder and functionality based on current page
  const getSearchConfig = () => {
    const path = location.pathname;
    
    // Only show search on main pages, not on sub-pages
    if (path === '/products') {
      return {
        placeholder: 'Search products',
        showSearch: true
      };
    } else if (path === '/orders') {
      return {
        placeholder: 'Search orders',
        showSearch: true
      };
    } else if (path === '/customers') {
      return {
        placeholder: 'Search customers',
        showSearch: true
      };
    } else {
      return {
        placeholder: '',
        showSearch: false
      };
    }
  };

  const searchConfig = getSearchConfig();

  // Handle search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Store search term in localStorage for the current page to use
    localStorage.setItem(`search_${location.pathname}`, term);
    
    // Dispatch custom event to notify the current page
    window.dispatchEvent(new CustomEvent('searchUpdated', {
      detail: { term, path: location.pathname, filters: selectedFilters }
    }));
  };

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];
    
    setSelectedFilters(newFilters);
    
    // Store filters in localStorage
    localStorage.setItem(`filters_${location.pathname}`, JSON.stringify(newFilters));
    
    // Dispatch search update with new filters
    window.dispatchEvent(new CustomEvent('searchUpdated', {
      detail: { term: searchTerm, path: location.pathname, filters: newFilters }
    }));
  };

  // Get available filters based on current page
  const getAvailableFilters = () => {
    const path = location.pathname;
    
    if (path === '/customers') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'id', label: 'ID' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'address', label: 'Address' },
        { key: 'purchases', label: 'Purchases' },
        { key: 'orderQty', label: 'Order Qty' }
      ];
    }
    return [];
  };

  // Clear search when navigating away from search-enabled pages
  useEffect(() => {
    if (!searchConfig.showSearch) {
      setSearchTerm('');
      setSelectedFilters([]);
    } else {
      // Load saved filters for current page
      const savedFilters = localStorage.getItem(`filters_${location.pathname}`);
      if (savedFilters) {
        setSelectedFilters(JSON.parse(savedFilters));
      }
    }
  }, [location.pathname, searchConfig.showSearch]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, current: location.pathname === '/' },
    { name: 'Products', href: '/products', icon: Package, current: location.pathname === '/products' },
    { name: 'Orders', href: '/orders', icon: ShoppingCart, current: location.pathname === '/orders' },
    { 
      name: 'Customers', 
      href: '/customers', 
      icon: Users, 
      current: location.pathname === '/customers' || location.pathname === '/customers/add' || location.pathname.startsWith('/customers/edit'),
      subItems: [
        { name: 'Add Customer', href: '/customers/add', current: location.pathname === '/customers/add' },
        { name: 'Edit Customer', href: '/customers/edit', current: location.pathname.startsWith('/customers/edit') }
      ]
    },
    { name: 'Sales Report', href: '/sales-report', icon: BarChart3, current: location.pathname === '/sales-report' },
  ];

  const tools = [
    { name: 'Account & Settings', href: '/profile', icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
    { name: 'Dark Mode', href: '#', icon: isDark ? Moon : Sun , isToggle: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarContent navigation={navigation} tools={tools} isDark={isDark} toggleTheme={toggleTheme} profileData={profileData} companyData={companyData} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <SidebarContent navigation={navigation} tools={tools} isDark={isDark} toggleTheme={toggleTheme} profileData={profileData} companyData={companyData} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            {searchConfig.showSearch ? (
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      className="block w-full h-12 pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700"
                      placeholder={searchConfig.placeholder}
                      type="search"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center justify-center w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Filter className="h-5 w-5" />
                  </button>
                  
                  {/* Filter Dropdown */}
                  {showFilterDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filter by fields</h3>
                          <button
                            onClick={() => setShowFilterDropdown(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {getAvailableFilters().map((filter) => (
                            <label key={filter.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedFilters.includes(filter.key)}
                                onChange={() => handleFilterChange(filter.key)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                {filter.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        {selectedFilters.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => {
                                setSelectedFilters([]);
                                localStorage.removeItem(`filters_${location.pathname}`);
                                window.dispatchEvent(new CustomEvent('searchUpdated', {
                                  detail: { term: searchTerm, path: location.pathname, filters: [] }
                                }));
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              Clear all filters
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex">
                <div className="w-full flex md:ml-0">
                  {/* Empty space - no page titles shown */}
                </div>
              </div>
            )}
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {profileData.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={profileData.avatar}
                        alt={`${profileData.firstName} ${profileData.lastName}`}
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center"><svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {profileData.firstName} {profileData.lastName}
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="ml-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    current: boolean;
    subItems?: Array<{
      name: string;
      href: string;
      current: boolean;
    }>;
  }>;
  tools: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    isToggle?: boolean;
  }>;
  isDark: boolean;
  toggleTheme: () => void;
  profileData: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  companyData: {
    name: string;
    logo: string;
    type: string;
  };
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, tools, isDark, toggleTheme, profileData, companyData }) => {
  return (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4 mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-sm mr-3"></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Culters</h1>
      </div>
      
      {/* Company Section */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {companyData.logo ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={companyData.logo}
                  alt={companyData.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center"><span class="text-white font-bold text-sm">K</span></div>';
                    }
                  }}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {companyData.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {companyData.type}
              </p>
            </div>
          </div>
        </div>
      </div>
      <nav className="mt-5 px-2 space-y-1">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            General
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const hasActiveSubItem = hasSubItems && item.subItems!.some(subItem => subItem.current);
            
            return (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
                
                {/* Sub-items - only show the active sub-item */}
                {hasActiveSubItem && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems!.filter(subItem => subItem.current).map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        className="bg-blue-50 dark:bg-blue-800 text-blue-700 dark:text-blue-200 block px-2 py-1 text-xs font-medium rounded-md"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="space-y-1 mt-8">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Tools
          </div>
          {tools.map((item) => {
            const Icon = item.icon;
            if (item.isToggle) {
              return (
                <div key={item.name} className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.name}</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isDark ? 'bg-blue-600' : 'bg-gray-500'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg border border-gray-200 transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      
        {/* User Profile Section */}
        <div className="mt-6 px-2">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {profileData.avatar ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={profileData.avatar}
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center"><svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></div>';
                    }
                  }}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profileData.firstName} {profileData.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
