import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Shield, List, Users, LineChart, PlusCircle, UserCog, Menu, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuthStore } from './store/authStore';
import Login from './components/Auth/Login';
import PendingApproval from './components/Auth/PendingApproval';
import UserManagement from './components/Auth/UserManagement';
import CustomerForm from './components/CustomerForm';
import VehicleForm from './components/VehicleForm';
import PolicyForm from './components/PolicyForm';
import PolicyList from './components/PolicyList';
import PolicyAnalytics from './components/PolicyAnalytics';
import UpcomingPolicies from './components/UpcomingPolicies';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import { db } from './db';

function MobileMenu({ isOpen, setIsOpen, navItems }: { 
  isOpen: boolean; 
  setIsOpen: (isOpen: boolean) => void;
  navItems: Array<{ path: string; icon: any; text: string; }>;
}) {
  const location = useLocation();

  return (
    <div className={`
      fixed inset-0 z-50 lg:hidden
      transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      transition-transform duration-300 ease-in-out
    `}>
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setIsOpen(false)} />
      <div className="relative bg-white h-full w-64 shadow-xl">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <Shield className="h-8 w-8 text-blue-600" />
            <button onClick={() => setIsOpen(false)} className="text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8">
            <div className="space-y-1">
              {navItems.map(({ path, icon: Icon, text }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    ${location.pathname === path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                    group flex items-center px-3 py-2 text-base font-medium rounded-md
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {text}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const user = useAuthStore(state => state.user);

  const navItems = [
    { path: '/policies', icon: List, text: 'Poliçeler', roles: ['admin', 'employee', 'customer'] },
    { path: '/customers', icon: Users, text: 'Müşteriler', roles: ['admin', 'employee', 'customer'] },
    { path: '/analytics', icon: LineChart, text: 'Analiz', roles: ['admin', 'employee'] },
    { path: '/add', icon: PlusCircle, text: 'Yeni Kayıt', roles: ['admin', 'employee'] },
    { path: '/users', icon: UserCog, text: 'Kullanıcılar', roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <Link to="/policies" className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Sigorta Takip</span>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex lg:items-center">
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                {navItems.map(({ path, icon: Icon, text }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`${
                      currentPath === path
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen}
        navItems={navItems}
      />
    </>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user.role === 'customer') {
    const allowedPaths = ['/policies', '/customers'];
    if (!allowedPaths.some(path => location.pathname.startsWith(path))) {
      return <Navigate to="/policies" replace />;
    }
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function MainContent() {
  const user = useAuthStore(state => state.user);
  const customers = useLiveQuery(() => {
    if (user?.role === 'customer' && user.assignedCustomerId) {
      return db.customers
        .where('id')
        .equals(user.assignedCustomerId)
        .toArray();
    }
    return db.customers.toArray();
  }) ?? [];
  
  const vehicles = useLiveQuery(() => {
    if (user?.role === 'customer' && user.assignedCustomerId) {
      return db.vehicles
        .where('customerId')
        .equals(user.assignedCustomerId)
        .toArray();
    }
    return db.vehicles.toArray();
  }) ?? [];
  
  const policies = useLiveQuery(() => {
    if (user?.role === 'customer' && user.assignedCustomerId) {
      return db.policies
        .where('customerId')
        .equals(user.assignedCustomerId)
        .toArray();
    }
    return db.policies.toArray();
  }) ?? [];

  const handleAddCustomer = async (customerData: Omit<Customer, 'id'>) => {
    const id = crypto.randomUUID();
    await db.customers.add({ ...customerData, id });
  };

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    const id = crypto.randomUUID();
    await db.vehicles.add({ ...vehicleData, id });
  };

  const handleAddPolicy = async (policyData: Omit<Policy, 'id'>) => {
    const id = crypto.randomUUID();
    await db.policies.add({ ...policyData, id });
  };

  const handleDeletePolicy = async (id: string) => {
    await db.policies.delete(id);
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/policies" replace />} />
      <Route path="/policies" element={
        <div className="space-y-4 px-4 sm:px-0">
          <UpcomingPolicies
            policies={policies}
            customers={customers}
            vehicles={vehicles}
          />
          <PolicyList
            policies={policies}
            customers={customers}
            vehicles={vehicles}
            onDelete={handleDeletePolicy}
          />
        </div>
      } />
      <Route path="/customers" element={
        <div className="px-4 sm:px-0">
          <CustomerList
            customers={customers}
            vehicles={vehicles}
            policies={policies}
          />
        </div>
      } />
      <Route path="/customers/:id" element={
        <div className="px-4 sm:px-0">
          <CustomerDetail />
        </div>
      } />
      <Route path="/analytics" element={
        <div className="px-4 sm:px-0">
          <PolicyAnalytics
            policies={policies}
            customers={customers}
            vehicles={vehicles}
          />
        </div>
      } />
      <Route path="/add" element={
        <div className="space-y-6 px-4 sm:px-0">
          <CustomerForm onSubmit={handleAddCustomer} />
          <VehicleForm customers={customers} onSubmit={handleAddVehicle} />
          <PolicyForm
            customers={customers}
            vehicles={vehicles}
            onSubmit={handleAddPolicy}
          />
        </div>
      } />
      <Route path="/users" element={
        <div className="px-4 sm:px-0">
          <UserManagement />
        </div>
      } />
      <Route path="*" element={<Navigate to="/policies" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <MainContent />
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}