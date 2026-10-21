import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type Mood = 'rough' | 'low' | 'okay' | 'good';
export type DailyTask = 'connect' | 'move' | 'rest';

export type StoredData = {
  checkIn: { date: string; mood: Mood } | null;
  daily: { date: string; tasks: Record<DailyTask, boolean> };
  journal: string;
};

type AppState = {
  data: StoredData;
  ready: boolean;
  storageAvailable: boolean;
  notice: string | null;
  checkIn: (mood: Mood) => void;
  toggleTask: (task: DailyTask) => void;
  saveJournal: (journal: string) => Promise<boolean>;
  clearNotice: () => void;
};

const STORAGE_KEY = 'men-tal-mobile-v1';
export const MAX_JOURNAL_BYTES = 1500;
const MAX_STORAGE_BYTES = 1800;
export const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const initialData: StoredData = {
  checkIn: null,
  daily: { date: todayKey(), tasks: { connect: false, move: false, rest: false } },
  journal: '',
};

const StateContext = createContext<AppState | null>(null);
const moods: Mood[] = ['rough', 'low', 'okay', 'good'];

function isStoredData(value: unknown): value is StoredData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StoredData>;
  const daily = candidate.daily;
  const tasks = daily?.tasks;
  const checkIn = candidate.checkIn;
  return typeof candidate.journal === 'string'
    && !!daily
    && typeof daily.date === 'string'
    && !!tasks
    && typeof tasks.connect === 'boolean'
    && typeof tasks.move === 'boolean'
    && typeof tasks.rest === 'boolean'
    && (checkIn == null || (
      typeof checkIn.date === 'string'
      && moods.includes(checkIn.mood)
    ));
}

export function utf8Length(value: string) {
  let bytes = 0;
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
  }
  return bytes;
}

export function journalFitsStorage(journal: string, data: StoredData) {
  return utf8Length(journal) <= MAX_JOURNAL_BYTES
    && utf8Length(JSON.stringify({ ...data, journal })) <= MAX_STORAGE_BYTES;
}

function readData() {
  return Platform.OS === 'web'
    ? Promise.resolve(localStorage.getItem(STORAGE_KEY))
    : SecureStore.getItemAsync(STORAGE_KEY);
}

function writeData(value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, value);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(STORAGE_KEY, value);
}

export function AppStateProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<StoredData>(initialData);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const writeQueue = useRef(Promise.resolve());
  const dataRef = useRef(initialData);

  useEffect(() => {
    let active = true;
    readData()
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!isStoredData(parsed)) {
            throw new Error('Saved data could not be validated.');
          }
          const candidate = parsed;
          const nextData = {
            checkIn: candidate.checkIn ?? null,
            daily: candidate.daily.date === todayKey()
              ? candidate.daily
              : { date: todayKey(), tasks: { connect: false, move: false, rest: false } },
            journal: candidate.journal,
          };
          dataRef.current = nextData;
          setData(nextData);
        }
        setStorageAvailable(true);
      })
      .catch((error: unknown) => {
        console.error('MEN-TAL could not read saved data.', error);
        if (active) {
          setStorageAvailable(false);
          setNotice('Saved data could not be read. You can keep using MEN-TAL, but changes may not save. Check device storage before relying on it.');
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateData = useCallback((update: (current: StoredData) => StoredData) => {
    if (!storageAvailable) return Promise.resolve(false);
    const nextData = update(dataRef.current);
    const serialized = JSON.stringify(nextData);
    if (utf8Length(serialized) > MAX_STORAGE_BYTES) {
      setNotice('This saved content is too large for protected device storage. Shorten the journal note and try again.');
      return Promise.resolve(false);
    }
    dataRef.current = nextData;
    setData(nextData);
    const pendingWrite = writeQueue.current.then(() => writeData(serialized));
    writeQueue.current = pendingWrite.catch((error: unknown) => {
      console.error('MEN-TAL could not save data on this device.', error);
      setNotice('This device could not save that just now. Check available storage and try again.');
    });
    return pendingWrite.then(() => true, () => false);
  }, [storageAvailable]);

  const checkIn = useCallback((mood: Mood) => {
    void updateData((current) => ({ ...current, checkIn: { date: todayKey(), mood } }));
  }, [updateData]);

  const toggleTask = useCallback((task: DailyTask) => {
    void updateData((current) => {
      const daily = current.daily.date === todayKey()
        ? current.daily
        : { date: todayKey(), tasks: { connect: false, move: false, rest: false } };
      return { ...current, daily: { ...daily, tasks: { ...daily.tasks, [task]: !daily.tasks[task] } } };
    });
  }, [updateData]);

  const saveJournal = useCallback(async (journal: string) => {
    if (!journalFitsStorage(journal, dataRef.current)) {
      setNotice('This note is too large for protected device storage. Shorten it and try again.');
      return false;
    }
    return updateData((current) => ({ ...current, journal }));
  }, [updateData]);

  const clearNotice = useCallback(() => setNotice(null), []);
  const value = useMemo(() => ({ data, ready, storageAvailable, notice, checkIn, toggleTask, saveJournal, clearNotice }), [
    data, ready, storageAvailable, notice, checkIn, toggleTask, saveJournal, clearNotice,
  ]);

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function useAppState() {
  const state = useContext(StateContext);
  if (!state) throw new Error('useAppState must be used inside AppStateProvider.');
  return state;
}
