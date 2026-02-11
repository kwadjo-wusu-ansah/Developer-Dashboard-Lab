import type { DevResource, PartialDevResource, Resources } from "./types";
import { generateId } from "./utils";

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

export function addEntry(key: string, input: PartialDevResource): void {
  if (
    !input ||
    !input.name?.trim() ||
    !input.link?.trim() ||
    !input.category
  ) {
    return;
  }

  const existingResources = loadResources(key);

  const newEntry: DevResource = {
    id: generateId(),
    ...input,
  };

  saveResources(key, [newEntry, ...existingResources]);
}
