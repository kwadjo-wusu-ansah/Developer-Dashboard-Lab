import seedResources from "../resource.json";
import { loadResources, saveResources } from "./storage";
import {
  ResourceCategories,
  type CategoryFilter,
  type DevResource,
  type Resources,
} from "./types";
import { renderDashboard } from "./ui";
import { generateId, KEYS } from "./utils";

interface DashboardState {
  resources: Resources;
  activeCategory: CategoryFilter;
  searchTerm: string;
}

interface SeedResourceEntry {
  name: string;
  category: string;
  link: string;
}

const allCategoryFilter: CategoryFilter = "All";
const searchInputElementId = "resource-search";

const dashboardState: DashboardState = {
  resources: [],
  activeCategory: allCategoryFilter,
  searchTerm: "",
};

// Lists supported category values for runtime category validation.
function getSupportedCategories(): ResourceCategories[] {
  return Object.values(ResourceCategories);
}

// Checks if a category string is one of the supported resource categories.
function isResourceCategory(category: string): category is ResourceCategories {
  return getSupportedCategories().includes(category as ResourceCategories);
}

// Validates and normalizes one seed resource before persisting it.
function normalizeSeedResource(entry: SeedResourceEntry): DevResource | null {
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

// Validates and normalizes one stored resource entry for safe UI rendering.
function normalizeStoredResource(entry: Partial<DevResource>): DevResource | null {
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

// Converts an unknown list into validated resource entries only.
function normalizeResourceList(entries: unknown[]): Resources {
  return entries
    .map((entry) => normalizeStoredResource(entry as Partial<DevResource>))
    .filter((entry): entry is DevResource => entry !== null);
}

// Loads persisted resources and seeds the storage from JSON when needed.
function initializeResources(): Resources {
  const persistedResources = loadResources(KEYS.RESOURCES_STORAGE_KEY);
  const normalizedPersistedResources = Array.isArray(persistedResources)
    ? normalizeResourceList(persistedResources)
    : [];

  if (normalizedPersistedResources.length > 0) {
    localStorage.setItem(KEYS.FIRST_SEED_KEY, "true");
    return normalizedPersistedResources;
  }

  const normalizedSeedResources = (seedResources as SeedResourceEntry[])
    .map((entry) => normalizeSeedResource(entry))
    .filter((entry): entry is DevResource => entry !== null);

  saveResources(KEYS.RESOURCES_STORAGE_KEY, normalizedSeedResources);
  localStorage.setItem(KEYS.FIRST_SEED_KEY, "true");

  return normalizedSeedResources;
}

// Filters resources by selected category and current search text.
function getFilteredResources(state: DashboardState): Resources {
  const normalizedSearchTerm = state.searchTerm.trim().toLowerCase();

  return state.resources.filter((resource) => {
    const categoryMatches =
      state.activeCategory === allCategoryFilter ||
      resource.category === state.activeCategory;

    if (!categoryMatches) {
      return false;
    }

    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableText = `${resource.name} ${resource.category}`.toLowerCase();
    return searchableText.includes(normalizedSearchTerm);
  });
}

// Renders the dashboard based on the latest application state.
function renderDashboardState(): void {
  const filteredResources = getFilteredResources(dashboardState);
  renderDashboard({
    filteredResources,
    totalResources: dashboardState.resources.length,
    activeCategory: dashboardState.activeCategory,
    searchTerm: dashboardState.searchTerm,
  });
}

// Handles category filter interactions routed from the global click listener.
function handleFilterCategories(event: MouseEvent): boolean {
  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  const categoryButton = target.closest<HTMLButtonElement>(
    ".filter-pills button[data-category]",
  );
  if (!categoryButton) {
    return false;
  }

  const clickedCategory = categoryButton.dataset.category;
  if (!clickedCategory) {
    return false;
  }

  if (clickedCategory !== allCategoryFilter && !isResourceCategory(clickedCategory)) {
    return false;
  }

  dashboardState.activeCategory = clickedCategory as CategoryFilter;
  renderDashboardState();
  return true;
}

// Routes click events to focused handlers using event delegation.
function handleGlobalClick(event: MouseEvent): void {
  handleFilterCategories(event);
}

// Handles search input updates and triggers a dashboard re-render.
function handleSearchInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.id !== searchInputElementId) {
    return;
  }

  dashboardState.searchTerm = target.value;
  renderDashboardState();
}

// Registers global listeners used by the dashboard UI interactions.
function setupDashboardEvents(): void {
  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("input", handleSearchInput);
}

// Bootstraps initial state, first render, and event registration.
function initializeDashboard(): void {
  dashboardState.resources = initializeResources();
  renderDashboardState();
  setupDashboardEvents();
}

initializeDashboard();
