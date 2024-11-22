export interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee' | 'customer' | 'pending';
  name?: string;
  assignedCustomerId?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  phone: string;
  documents?: CustomerDocument[];
  assignedUserId?: string;
}

export interface CustomerDocument {
  id: string;
  type: 'identity' | 'vehicle-registration' | 'other';
  name: string;
  url: string;
  mimeType: string;
  uploadDate: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  chassisNumber: string;
  customerId: string;
  inspectionDate?: string;
}

export interface Policy {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  price: number;
  type: 'traffic' | 'comprehensive';
  policyNumber: string;
}