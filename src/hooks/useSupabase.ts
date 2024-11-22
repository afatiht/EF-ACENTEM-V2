import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Tables = keyof Database['public']['Tables'];
type Row<T extends Tables> = Database['public']['Tables'][T]['Row'];

export function useSupabaseQuery<T extends Tables>(
  table: T,
  options?: {
    filter?: { column: string; value: any };
    orderBy?: { column: string; ascending?: boolean };
  }
) {
  const [data, setData] = useState<Row<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase.from(table).select('*');

        if (options?.filter) {
          query = query.eq(options.filter.column, options.filter.value);
        }

        if (options?.orderBy) {
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true,
          });
        }

        const { data: result, error } = await query;

        if (error) throw error;
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, options?.filter?.value]);

  return { data, loading, error };
}

export function useSupabaseItem<T extends Tables>(
  table: T,
  id: string | undefined
) {
  const [data, setData] = useState<Row<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, id]);

  return { data, loading, error };
}