import Dexie, { Table } from 'dexie';
import type { Customer, Vehicle, Policy, User } from '../types';

export class InsuranceDB extends Dexie {
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
  }
}

export const db = new InsuranceDB();