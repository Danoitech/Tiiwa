import { getBaby, getMeta } from '@/db/queries';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import type { Baby } from '@/db/types';

export function useBaby() {
  const { tick } = useStore();
  const [baby, setBaby] = useState<Baby | null>(null);

  useEffect(() => {
    getBaby().then(setBaby);
  }, [tick]);

  return baby;
}

export function useMeta(key: string) {
  const { tick } = useStore();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    getMeta(key).then(setValue);
  }, [key, tick]);

  return value;
}
