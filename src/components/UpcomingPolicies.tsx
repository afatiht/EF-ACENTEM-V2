import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Policy, Customer, Vehicle } from '../types';

interface Props {
  policies: Policy[];
  customers: Customer[];
  vehicles: Vehicle[];
}

export default function UpcomingPolicies({ policies, customers, vehicles }: Props) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingPolicies = policies.filter(policy => {
    const endDate = new Date(policy.endDate);
    return endDate <= thirtyDaysFromNow && endDate >= new Date();
  }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  if (upcomingPolicies.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <AlertCircle className="w-6 h-6 text-yellow-500" />
        Yaklaşan Poliçe Vadeleri
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poliçe No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan Gün</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {upcomingPolicies.map(policy => {
              const customer = customers.find(c => c.id === policy.customerId);
              const vehicle = vehicles.find(v => v.id === policy.vehicleId);
              const daysLeft = Math.ceil((new Date(policy.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer ? `${customer.firstName} ${customer.lastName}` : 'Bilinmiyor'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Bilinmiyor'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {policy.policyNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {policy.type === 'traffic' ? 'Trafik Sigortası' : 'Kasko'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(policy.endDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      daysLeft <= 7 ? 'bg-red-100 text-red-800' : 
                      daysLeft <= 15 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {daysLeft} gün
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}