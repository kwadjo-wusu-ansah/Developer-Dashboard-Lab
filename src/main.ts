import seedResources from "../resource.json";
import {
  filterResources,
  isResourceCategory,
  normalizeResourceList,
  normalizeSeedResource,
} from "./resourceProcessor";
import { loadResources, saveResources } from "./storage";
import {
  type CategoryFilter,
  type DashboardState,
  type Resources,
  type SeedResourceEntry,
} from "./types";
import { renderDashboard } from "./ui";
import { KEYS } from "./utils";

const allCategoryFilter: CategoryFilter = "All";
const searchInputElementId = "resource-search";

const dashboardState: DashboardState = {
  resources: [],
  activeCategory: allCategoryFilter,
  searchTerm: "",
};

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
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  saveResources(KEYS.RESOURCES_STORAGE_KEY, normalizedSeedResources);
  localStorage.setItem(KEYS.FIRST_SEED_KEY, "true");

  return normalizedSeedResources;
}

// Renders the dashboard based on the latest application state.
function renderDashboardState(): void {
  const filteredResources = filterResources(
    dashboardState.resources,
    dashboardState.activeCategory,
    dashboardState.searchTerm,
  );
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
