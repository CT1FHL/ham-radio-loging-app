import { create } from 'zustand';
import { QSO } from '../types/QSO';

interface LogState {
  logs: QSO[];
  addLog: (qso: Omit<QSO, 'id'>) => void;
  deleteLog: (id: string) => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  addLog: (qso) =>
    set((state) => ({
      logs: [...state.logs, { ...qso, id: crypto.randomUUID() }],
    })),
  deleteLog: (id) =>
    set((state) => ({
      logs: state.logs.filter((log) => log.id !== id),
    })),
}));