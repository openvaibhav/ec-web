import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import customersData from '../data/customers.json';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  purchases: number;
  orderQty: number;
}

const EditCustomer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    purchases: '',
    orderQty: ''
  });
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Load customer data on component mount
  useEffect(() => {
    const loadCustomer = () => {
      try {
        // Get customer ID from URL params, location state, or route params
        const customerId = id || new URLSearchParams(location.search).get('id');
        const stateCustomer = location.state?.customer;
        
        if (customerId || stateCustomer) {
          // Get customers from localStorage or use default data
          const existingCustomers = JSON.parse(localStorage.getItem('customers') || JSON.stringify(customersData));
          
          // Find customer by ID
          const foundCustomer = stateCustomer || existingCustomers.find((c: Customer) => c.id === parseInt(customerId!));
          
          if (foundCustomer) {
            setCustomer(foundCustomer);
            setFormData({
              name: foundCustomer.name,
              email: foundCustomer.email,
              phone: foundCustomer.phone,
              address: foundCustomer.address,
              purchases: foundCustomer.purchases.toString(),
              orderQty: foundCustomer.orderQty.toString()
            });
          } else {
            // Customer not found, redirect back
            navigate('/customers');
          }
        } else {
          // No customer ID provided, redirect back
          navigate('/customers');
        }
      } catch (error) {
        console.error('Error loading customer:', error);
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [location, navigate, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) return;
    
    // Get existing customers from localStorage or use default data
    const existingCustomers = JSON.parse(localStorage.getItem('customers') || JSON.stringify(customersData));
    
    // Update the customer object
    const updatedCustomer = {
      ...customer,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      purchases: parseFloat(formData.purchases) || 0,
      orderQty: parseInt(formData.orderQty) || 0,
    };
    
    // Update customer in the list
    const updatedCustomers = existingCustomers.map((c: Customer) => 
      c.id === customer.id ? updatedCustomer : c
    );
    
    // Save to localStorage
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    
    // Download updated customers.json
    const dataStr = JSON.stringify(updatedCustomers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Navigate back to customers page
    navigate('/customers');
  };

  const handleBack = () => {
    navigate('/customers');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading customer data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The customer you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
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
                <span className="text-gray-900 dark:text-white font-medium">Customers</span>
              </li>
              <li>
                <span className="text-gray-500 dark:text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 dark:text-white font-medium">Edit Customer</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Main Content Card */}
        <div className="max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Card Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Edit Customer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Update customer information. All fields are required.
            </p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Customer ID: {customer.id}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name Customer
              </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Input name"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Input email"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ph. Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Input Ph. Number"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Purchases & Order Quantity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purchases
                </label>
                <input
                  type="number"
                  name="purchases"
                  value={formData.purchases}
                  onChange={handleInputChange}
                  placeholder="Total Purchases"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Quantity
                </label>
                <input
                  type="number"
                  name="orderQty"
                  value={formData.orderQty}
                  onChange={handleInputChange}
                  placeholder="Order Quantity"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Input address"
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Update Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
