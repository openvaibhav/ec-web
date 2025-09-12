import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProfileProvider } from './contexts/ProfileContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
//import Dashboard from './pages/Dashboard';
//import Products from './pages/Products';
//import Orders from './pages/Orders';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import EditCustomer from './pages/EditCustomer';
import Profile from './pages/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/signup" element={<SignupPage onSignup={() => setIsAuthenticated(true)} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ProfileProvider>
        <Router>
          <Layout onLogout={() => setIsAuthenticated(false)}>
            <Routes>
              <Route path="/" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1><p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p></div>} />
              <Route path="/products" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1><p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p></div>} />
              <Route path="/orders" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1><p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p></div>} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/add" element={<AddCustomer />} />
              <Route path="/customers/edit" element={<EditCustomer />} />
              <Route path="/customers/edit/:id" element={<EditCustomer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/sales-report" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Report</h1><p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p></div>} />
              <Route path="/help" element={<div className="p-6"><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help</h1><p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p></div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
