import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Shield, List, Users, LineChart, PlusCircle, UserCog } from 'lucide-react';
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
import type { Customer, Vehicle, Policy } from './types';

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

function Navigation() {
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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/policies" className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Sigorta Takip</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
  );
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
        <>
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
        </>
      } />
      <Route path="/customers" element={
        <CustomerList
          customers={customers}
          vehicles={vehicles}
          policies={policies}
        />
      } />
      <Route path="/customers/:id" element={<CustomerDetail />} />
      <Route path="/analytics" element={
        <PolicyAnalytics
          policies={policies}
          customers={customers}
          vehicles={vehicles}
        />
      } />
      <Route path="/add" element={
        <div className="space-y-6">
          <CustomerForm onSubmit={handleAddCustomer} />
          <VehicleForm customers={customers} onSubmit={handleAddVehicle} />
          <PolicyForm
            customers={customers}
            vehicles={vehicles}
            onSubmit={handleAddPolicy}
          />
        </div>
      } />
      <Route path="/users" element={<UserManagement />} />
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