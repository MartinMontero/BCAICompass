import { useCallback, useMemo, useState } from 'react';
import { ORGANIZATIONS } from '../data/organizations';
import {
  MAX_SHORTLIST,
  SHORTLIST_STORAGE_KEY,
  parseShortlist,
  toggleShortlistId,
} from '../lib/shortlist';

const VALID_IDS = new Set(ORGANIZATIONS.map((organization) => organization.id));

function readInitial(): { ids: string[]; storageAvailable: boolean } {
  try {
    return { ids: parseShortlist(window.localStorage.getItem(SHORTLIST_STORAGE_KEY), VALID_IDS), storageAvailable: true };
  } catch {
    return { ids: [], storageAvailable: false };
  }
}

export interface ShortlistController {
  ids: string[];
  count: number;
  storageAvailable: boolean;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export function useShortlist(): ShortlistController {
  const [initial] = useState(readInitial);
  const [ids, setIds] = useState<string[]>(initial.ids);
  const [storageAvailable, setStorageAvailable] = useState(initial.storageAvailable);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    try {
      window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(next));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, []);

  const toggle = useCallback((id: string) => {
    persist(toggleShortlistId(ids, id, VALID_IDS));
  }, [ids, persist]);

  const remove = useCallback((id: string) => persist(ids.filter((candidate) => candidate !== id)), [ids, persist]);
  const clear = useCallback(() => persist([]), [persist]);
  const saved = useMemo(() => new Set(ids), [ids]);

  return {
    ids,
    count: ids.length,
    storageAvailable,
    isSaved: (id: string) => saved.has(id),
    toggle,
    remove,
    clear,
  };
}

export { MAX_SHORTLIST };
