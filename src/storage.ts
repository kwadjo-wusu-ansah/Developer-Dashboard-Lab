import type { DevResource, PartialDevResource, Resources } from "./types";
import { generateId } from "./utils";

export function loadResources(key: string):Resources {
  const rawData = localStorage.getItem(key);
  if (!rawData) {
    return [];
  }
  try {
    const parsed = JSON.parse(rawData);
    return parsed
  } 
  catch (e) {
    return [];
  }
}

function saveJournals(key:string, resources: Resources): void {
    localStorage.setItem(key, JSON.stringify(resources));
}


export function addEntry(key: string, input: PartialDevResource): void{

  if (
    !input ||
    !input.name?.trim() ||
    !input.link?.trim() ||
    !input.category
  ) {
    return;
  }

    const existingJournals = loadResources(key);

    const newEntry: DevResource = {
        id: generateId(),
        ...input,
        
    };
    
    saveJournals(key, [newEntry, ...existingJournals]);

}