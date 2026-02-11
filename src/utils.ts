import type { DomResult, SeletorType } from "./types";

/*This function return the */
export function getDocument(selector: SeletorType, name: string): DomResult {
  switch (selector) {
    case "id":
      return document.getElementById(name);

    case "class":
      return document.getElementsByClassName(name);

    case "tag":
      return document.getElementsByTagName(name);

    case "query":
      return document.querySelector(name);

    case "queryAll":
      return document.querySelectorAll(name);

    default:
      console.error(`Invalid selector type: ${selector}`);
      return null;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const KEYS = {
  RESOURCES_STORAGE_KEY: "Resources_Key",
  FIRST_SEED_KEY: "Seeded_Key",
};
