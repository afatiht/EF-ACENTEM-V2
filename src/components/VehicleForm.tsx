import React from 'react';
import { Car } from 'lucide-react';
import type { Vehicle, Customer } from '../types';

interface Props {
  customers: Customer[];
  onSubmit: (vehicle: Omit<Vehicle, 'id'>) => void;
}

export default function VehicleForm({ customers, onSubmit }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      plate: formData.get('plate') as string,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      year: formData.get('year') as string,
      chassisNumber: formData.get('chassisNumber') as string,
      customerId: formData.get('customerId') as string,
      inspectionDate: formData.get('inspectionDate') as string || undefined,
    });
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Araç Bilgileri</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Araç Sahibi</label>
          <select
            name="customerId"
            id="customerId"
            required
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
          <label htmlFor="plate" className="block text-sm font-medium text-gray-700">Plaka</label>
          <input
            type="text"
            name="plate"
            id="plate"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marka</label>
          <input
            type="text"
            name="brand"
            id="brand"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            name="model"
            id="model"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">Model Yılı</label>
          <input
            type="number"
            name="year"
            id="year"
            required
            min="1900"
            max={new Date().getFullYear() + 1}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700">Muayene Tarihi</label>
          <input
            type="date"
            name="inspectionDate"
            id="inspectionDate"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="chassisNumber" className="block text-sm font-medium text-gray-700">Şasi Numarası</label>
          <input
            type="text"
            name="chassisNumber"
            id="chassisNumber"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Car className="w-4 h-4 mr-2" />
        Araç Ekle
      </button>
    </form>
  );
}