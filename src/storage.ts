import type { Resources } from "./types";

export function loadResources(key: string): Resources {
  const rawData = localStorage.getItem(key);
  if (!rawData) {
    return [];
  }
  try {
    const parsed = JSON.parse(rawData);
    return parsed;
  } catch (_error) {
    return [];
  }
}

export function saveResources(key: string, resources: Resources): void {
  localStorage.setItem(key, JSON.stringify(resources));
}
