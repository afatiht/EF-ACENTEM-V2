import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Tables = keyof Database['public']['Tables'];
type Row<T extends Tables> = Database['public']['Tables'][T]['Row'];
type Insert<T extends Tables> = Database['public']['Tables'][T]['Insert'];
type Update<T extends Tables> = Database['public']['Tables'][T]['Update'];

export async function insertItem<T extends Tables>(
  table: T,
  data: Insert<T>
): Promise<Row<T>> {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateItem<T extends Tables>(
  table: T,
  id: string,
  data: Update<T>
): Promise<Row<T>> {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteItem<T extends Tables>(
  table: T,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function migrateFromDexie(dexieData: {
  customers?: any[];
  vehicles?: any[];
  policies?: any[];
  users?: any[];
}) {
  try {
    if (dexieData.customers?.length) {
      const { error: customersError } = await supabase
        .from('customers')
        .insert(dexieData.customers.map(customer => ({
          ...customer,
          first_name: customer.firstName,
          last_name: customer.lastName,
          identity_number: customer.identityNumber,
          assigned_user_id: customer.assignedUserId
        })));
      if (customersError) throw customersError;
    }

    if (dexieData.vehicles?.length) {
      const { error: vehiclesError } = await supabase
        .from('vehicles')
        .insert(dexieData.vehicles.map(vehicle => ({
          ...vehicle,
          customer_id: vehicle.customerId,
          chassis_number: vehicle.chassisNumber,
          inspection_date: vehicle.inspectionDate
        })));
      if (vehiclesError) throw vehiclesError;
    }

    if (dexieData.policies?.length) {
      const { error: policiesError } = await supabase
        .from('policies')
        .insert(dexieData.policies.map(policy => ({
          ...policy,
          customer_id: policy.customerId,
          vehicle_id: policy.vehicleId,
          start_date: policy.startDate,
          end_date: policy.endDate,
          policy_number: policy.policyNumber
        })));
      if (policiesError) throw policiesError;
    }

    if (dexieData.users?.length) {
      const { error: usersError } = await supabase
        .from('users')
        .insert(dexieData.users.map(user => ({
          ...user,
          assigned_customer_id: user.assignedCustomerId
        })));
      if (usersError) throw usersError;
    }

    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}