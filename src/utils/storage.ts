import type { GardenState } from '../types';

const STORAGE_KEY = 'knowledge-garden-data';

interface PersistedData {
  nodes: GardenState['nodes'];
  connections: GardenState['connections'];
  tags: GardenState['tags'];
  canvas: GardenState['canvas'];
  version: number;
}

export function loadFromStorage(): Partial<PersistedData> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedData;
    return data;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
}

export function saveToStorage(data: PersistedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
}
