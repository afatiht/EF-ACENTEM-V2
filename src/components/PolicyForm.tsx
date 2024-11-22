import React from 'react';
import { FileText } from 'lucide-react';
import type { Policy, Customer, Vehicle } from '../types';

interface Props {
  customers: Customer[];
  vehicles: Vehicle[];
  onSubmit: (policy: Omit<Policy, 'id'>) => void;
}

export default function PolicyForm({ customers, vehicles, onSubmit }: Props) {
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('');
  
  const customerVehicles = vehicles.filter(
    vehicle => vehicle.customerId === selectedCustomerId
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      customerId: formData.get('customerId') as string,
      vehicleId: formData.get('vehicleId') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      price: Number(formData.get('price')),
      type: formData.get('type') as 'traffic' | 'comprehensive',
      policyNumber: formData.get('policyNumber') as string,
    });
    e.currentTarget.reset();
    setSelectedCustomerId('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Poliçe Bilgileri</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Müşteri</label>
          <select
            name="customerId"
            id="customerId"
            required
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Müşteri Seçin</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName} - {customer.identityNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">Araç</label>
          <select
            name="vehicleId"
            id="vehicleId"
            required
            disabled={!selectedCustomerId}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Araç Seçin</option>
            {customerVehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.brand} {vehicle.model}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
          <input
            type="date"
            name="endDate"
            id="endDate"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Poliçe Türü</label>
          <select
            name="type"
            id="type"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="traffic">Trafik Sigortası</option>
            <option value="comprehensive">Kasko</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Poliçe Tutarı (TL)</label>
          <input
            type="number"
            name="price"
            id="price"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">Poliçe Numarası</label>
          <input
            type="text"
            name="policyNumber"
            id="policyNumber"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FileText className="w-4 h-4 mr-2" />
        Poliçe Ekle
      </button>
    </form>
  );
}