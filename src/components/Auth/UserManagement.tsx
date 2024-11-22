import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Users, UserCheck, UserX } from 'lucide-react';
import { db } from '../../db';
import type { User } from '../../types';

export default function UserManagement() {
  const users = useLiveQuery(() => db.users.toArray()) ?? [];
  const customers = useLiveQuery(() => db.customers.toArray()) ?? [];

  const handleUpdateRole = async (userId: string, role: User['role']) => {
    await db.users.update(userId, { role });
  };

  const handleAssignCustomer = async (userId: string, customerId: string) => {
    await db.users.update(userId, { assignedCustomerId: customerId });
    await db.customers.update(customerId, { assignedUserId: userId });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Kullanıcı Yönetimi
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atanan Müşteri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.filter(user => user.id !== 'admin').map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as User['role'])}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="pending">Onay Bekliyor</option>
                    <option value="employee">Çalışan</option>
                    <option value="customer">Müşteri</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'customer' && (
                    <select
                      value={user.assignedCustomerId || ''}
                      onChange={(e) => handleAssignCustomer(user.id, e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Müşteri Seçin</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role === 'pending' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateRole(user.id, 'employee')}
                        className="text-green-600 hover:text-green-900"
                      >
                        <UserCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateRole(user.id, 'customer')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => db.users.delete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}