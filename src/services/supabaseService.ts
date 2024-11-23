import { supabase } from '../lib/supabase';
import { db } from '../db';
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

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }
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

  if (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
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

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
}

let isSyncing = false;

export async function syncWithSupabase() {
  if (isSyncing) return;
  
  try {
    isSyncing = true;
    
    // Fetch all data from Supabase
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
    if (customersError) throw customersError;

    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*');
    if (vehiclesError) throw vehiclesError;

    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*');
    if (policiesError) throw policiesError;

    // Convert and update local database
    await db.transaction('rw', [db.customers, db.vehicles, db.policies], async () => {
      // Clear existing data
      await Promise.all([
        db.customers.clear(),
        db.vehicles.clear(),
        db.policies.clear()
      ]);

      // Add new data
      if (customers) {
        await db.customers.bulkAdd(customers.map(c => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          identityNumber: c.identity_number,
          phone: c.phone,
          type: c.type,
          assignedUserId: c.assigned_user_id,
          documents: c.documents,
          notes: c.notes
        })));
      }

      if (vehicles) {
        await db.vehicles.bulkAdd(vehicles.map(v => ({
          id: v.id,
          plate: v.plate,
          brand: v.brand,
          model: v.model,
          year: v.year,
          chassisNumber: v.chassis_number,
          customerId: v.customer_id,
          inspectionDate: v.inspection_date
        })));
      }

      if (policies) {
        await db.policies.bulkAdd(policies.map(p => ({
          id: p.id,
          customerId: p.customer_id,
          vehicleId: p.vehicle_id,
          startDate: p.start_date,
          endDate: p.end_date,
          price: p.price,
          type: p.type,
          policyNumber: p.policy_number
        })));
      }
    });

    return true;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  } finally {
    isSyncing = false;
  }
}