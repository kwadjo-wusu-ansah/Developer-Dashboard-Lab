import { ResourceCategories } from "./types";
import type {
  CategoryFilter,
  DevResource,
  ResourceCategories as CategoryValue,
  Resources,
  SeedResourceEntry,
} from "./types";
import { generateId } from "./utils";

const allCategoryFilter: CategoryFilter = "All";

// Validates that a string value maps to one of the supported category enums.
export function isResourceCategory(category: string): category is CategoryValue {
  return Object.values(ResourceCategories).includes(category as CategoryValue);
}

// Filters resources by selected category, or returns all resources for the "All" filter.
function filterResourcesByCategory(
  resources: Resources,
  category: CategoryFilter,
): Resources {
  if (category === allCategoryFilter) {
    return resources;
  }

  return resources.filter((resource) => resource.category === category);
}

// Validates and normalizes a seed resource entry before persistence.
export function normalizeSeedResource(entry: SeedResourceEntry): DevResource | null {
  const normalizedName = entry.name.trim();
  const normalizedLink = entry.link.trim();

  if (!normalizedName || !normalizedLink || !isResourceCategory(entry.category)) {
    return null;
  }

  return {
    id: generateId(),
    name: normalizedName,
    category: entry.category,
    link: normalizedLink,
  };
}

// Validates and normalizes one stored resource entry for safe rendering.
export function normalizeStoredResource(entry: Partial<DevResource>): DevResource | null {
  const normalizedName = entry.name?.trim() ?? "";
  const normalizedLink = entry.link?.trim() ?? "";
  const normalizedCategory = entry.category ?? "";

  if (!normalizedName || !normalizedLink || !isResourceCategory(normalizedCategory)) {
    return null;
  }

  return {
    id: entry.id?.trim() || generateId(),
    name: normalizedName,
    category: normalizedCategory,
    link: normalizedLink,
  };
}

// Converts unknown storage data into a fully normalized resource list.
export function normalizeResourceList(entries: unknown[]): Resources {
  return entries
    .map((entry) => normalizeStoredResource(entry as Partial<DevResource>))
    .filter((entry): entry is DevResource => entry !== null);
}

// Filters resources by search term across resource name and category values.
function filterResourcesBySearchTerm(
  resources: Resources,
  searchTerm: string,
): Resources {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  if (!normalizedSearchTerm) {
    return resources;
  }

  return resources.filter((resource) => {
    const searchableText = `${resource.name} ${resource.category}`.toLowerCase();
    return searchableText.includes(normalizedSearchTerm);
  });
}

// Applies category and search filters together and returns the visible resources.
export function filterResources(
  resources: Resources,
  category: CategoryFilter,
  searchTerm: string,
): Resources {
  const categoryFilteredResources = filterResourcesByCategory(resources, category);
  return filterResourcesBySearchTerm(categoryFilteredResources, searchTerm);
}
