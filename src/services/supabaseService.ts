import { supabase } from '../lib/supabase';
import { db } from '../db';
import type { Database } from '../types/supabase';

type Tables = keyof Database['public']['Tables'];
type Row<T extends Tables> = Database['public']['Tables'][T]['Row'];
type Insert<T extends Tables> = Database['public']['Tables'][T]['Insert'];
type Update<T extends Tables> = Database['public']['Tables'][T]['Update'];

// Çevrimdışı kuyruk
interface OfflineOperation {
  id: string;
  table: Tables;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

const offlineQueue: OfflineOperation[] = [];

// Ağ durumunu kontrol et
async function checkConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('health_check').select('count').single();
    return !error && data !== null;
  } catch {
    return false;
  }
}

// Çevrimdışı operasyonları işle
async function processOfflineQueue() {
  if (!(await checkConnection()) || offlineQueue.length === 0) return;

  const operations = [...offlineQueue];
  offlineQueue.length = 0;

  for (const op of operations) {
    try {
      switch (op.operation) {
        case 'insert':
          await insertItem(op.table, op.data);
          break;
        case 'update':
          await updateItem(op.table, op.data.id, op.data);
          break;
        case 'delete':
          await deleteItem(op.table, op.data.id);
          break;
      }
    } catch (error) {
      console.error(`Failed to process offline operation:`, op, error);
      offlineQueue.push(op); // Başarısız operasyonu kuyruğa geri ekle
    }
  }
}

export async function insertItem<T extends Tables>(
  table: T,
  data: Insert<T>
): Promise<Row<T>> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    // Çevrimdışıysa kuyruğa ekle
    offlineQueue.push({
      id: crypto.randomUUID(),
      table,
      operation: 'insert',
      data,
      timestamp: Date.now()
    });
    throw error;
  }
}

export async function updateItem<T extends Tables>(
  table: T,
  id: string,
  data: Update<T>
): Promise<Row<T>> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    offlineQueue.push({
      id: crypto.randomUUID(),
      table,
      operation: 'update',
      data: { ...data, id },
      timestamp: Date.now()
    });
    throw error;
  }
}

export async function deleteItem<T extends Tables>(
  table: T,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    offlineQueue.push({
      id: crypto.randomUUID(),
      table,
      operation: 'delete',
      data: { id },
      timestamp: Date.now()
    });
    throw error;
  }
}

let isSyncing = false;

export async function syncWithSupabase() {
  if (isSyncing) return;
  
  try {
    isSyncing = true;

    // Önce çevrimdışı kuyruğu işle
    await processOfflineQueue();
    
    // Supabase'den verileri al
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

    // Yerel veritabanını güncelle
    await db.transaction('rw', [db.customers, db.vehicles, db.policies], async () => {
      await Promise.all([
        db.customers.clear(),
        db.vehicles.clear(),
        db.policies.clear()
      ]);

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
    throw error;
  } finally {
    isSyncing = false;
  }
}