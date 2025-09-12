import React from 'react';
import { TrendingUp, Users, ShoppingCart, Package, ArrowUpRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Revenue',
      value: '$81,000',
      change: '+5.000%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Total Customer',
      value: '5,000',
      change: '+1.5%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Total Transactions',
      value: '12,000',
      change: '+3.5%',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      name: 'Total Product',
      value: '5,000',
      change: '+1.5%',
      changeType: 'positive',
      icon: Package,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Sales Target */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Target</h2>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>$231,032,444</span>
            <span>$500,000,000</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '46%' }}></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4" />
                        <span className="sr-only">
                          {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Sales this year
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">$211,411,223</div>
              <div className="text-sm">Average Sale Value</div>
              <div className="text-2xl font-bold text-green-600 mt-4 mb-2">$339,091,888</div>
              <div className="text-sm">Average Item per Sale</div>
            </div>
          </div>
        </div>

        {/* Increase Sales Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Increase your sales</h3>
          <p className="text-blue-100 mb-4">
            Discover new strategies to boost your revenue and grow your business.
          </p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Customer Growth and Product Popular */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Customer Growth */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Customer Growth 3 Province
          </h3>
          <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-32 h-32 border-4 border-blue-200 dark:border-blue-800 rounded-full flex items-center justify-center">
                <div className="text-2xl font-bold text-blue-600">85%</div>
              </div>
              <div className="mt-4 text-sm">Growth Rate</div>
            </div>
          </div>
        </div>

        {/* Product Popular */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Product Popular
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Gatsby Global (Green)</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">$299.00</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-900 dark:text-white">1,234 sales</div>
                <div className="text-xs text-green-600">Success</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Gatsby Global (Red)</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">$299.00</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-900 dark:text-white">987 sales</div>
                <div className="text-xs text-green-600">Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
