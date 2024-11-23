import Dexie, { Table } from 'dexie';
import { insertItem, updateItem, deleteItem } from '../services/supabaseService';
import type { Customer, Vehicle, Policy, User } from '../types';

class InsuranceDB extends Dexie {
  customers!: Table<Customer>;
  vehicles!: Table<Vehicle>;
  policies!: Table<Policy>;
  users!: Table<User>;

  constructor() {
    super('insuranceDB');
    this.version(3).stores({
      customers: '&id, firstName, lastName, identityNumber, phone, assignedUserId',
      vehicles: '&id, plate, brand, model, year, chassisNumber, customerId',
      policies: '&id, customerId, vehicleId, startDate, endDate, price, type, policyNumber',
      users: '&id, email, role'
    });

    // Supabase senkronizasyon hooks'ları
    this.customers.hook('creating', async (_, obj) => {
      await insertItem('customers', {
        id: obj.id,
        first_name: obj.firstName,
        last_name: obj.lastName,
        identity_number: obj.identityNumber,
        phone: obj.phone,
        type: obj.type || 'individual',
        assigned_user_id: obj.assignedUserId,
        documents: obj.documents,
        notes: obj.notes
      }).catch(console.error);
    });

    this.vehicles.hook('creating', async (_, obj) => {
      await insertItem('vehicles', {
        id: obj.id,
        plate: obj.plate,
        brand: obj.brand,
        model: obj.model,
        year: obj.year,
        chassis_number: obj.chassisNumber,
        customer_id: obj.customerId,
        inspection_date: obj.inspectionDate
      }).catch(console.error);
    });

    this.policies.hook('creating', async (_, obj) => {
      await insertItem('policies', {
        id: obj.id,
        customer_id: obj.customerId,
        vehicle_id: obj.vehicleId,
        start_date: obj.startDate,
        end_date: obj.endDate,
        price: obj.price,
        type: obj.type,
        policy_number: obj.policyNumber
      }).catch(console.error);
    });

    // Güncelleme hooks'ları
    this.customers.hook('updating', async (_, primKey, obj) => {
      await updateItem('customers', primKey as string, {
        first_name: obj.firstName,
        last_name: obj.lastName,
        identity_number: obj.identityNumber,
        phone: obj.phone,
        type: obj.type || 'individual',
        assigned_user_id: obj.assignedUserId,
        documents: obj.documents,
        notes: obj.notes
      }).catch(console.error);
    });

    this.vehicles.hook('updating', async (_, primKey, obj) => {
      await updateItem('vehicles', primKey as string, {
        plate: obj.plate,
        brand: obj.brand,
        model: obj.model,
        year: obj.year,
        chassis_number: obj.chassisNumber,
        customer_id: obj.customerId,
        inspection_date: obj.inspectionDate
      }).catch(console.error);
    });

    this.policies.hook('updating', async (_, primKey, obj) => {
      await updateItem('policies', primKey as string, {
        customer_id: obj.customerId,
        vehicle_id: obj.vehicleId,
        start_date: obj.startDate,
        end_date: obj.endDate,
        price: obj.price,
        type: obj.type,
        policy_number: obj.policyNumber
      }).catch(console.error);
    });

    // Silme hooks'ları
    this.customers.hook('deleting', async (primKey) => {
      await deleteItem('customers', primKey as string).catch(console.error);
    });

    this.vehicles.hook('deleting', async (primKey) => {
      await deleteItem('vehicles', primKey as string).catch(console.error);
    });

    this.policies.hook('deleting', async (primKey) => {
      await deleteItem('policies', primKey as string).catch(console.error);
    });
  }
}

export const db = new InsuranceDB();