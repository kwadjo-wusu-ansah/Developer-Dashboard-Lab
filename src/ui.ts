import type { CategoryFilter, DevResource, Resources } from "./types";
import { getDocument } from "./utils";

interface DashboardRenderState {
  filteredResources: Resources;
  totalResources: number;
  activeCategory: CategoryFilter;
  searchTerm: string;
}

const resultsMetaElementId = "results-meta";
const resourceGridElementId = "resource-grid";

// Escapes text values before placing them into template-literal HTML.
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Normalizes and validates external links for safe card rendering.
function normalizeLink(value: string): string {
  try {
    return new URL(value).href;
  } catch (_error) {
    return "#";
  }
}

// Retrieves the resource grid container from the dashboard DOM.
function getResourceGridElement(): HTMLUListElement | null {
  const gridElement = getDocument("id", resourceGridElementId);
  return gridElement instanceof HTMLUListElement ? gridElement : null;
}

// Retrieves the results metadata element from the dashboard DOM.
function getResultsMetaElement(): HTMLParagraphElement | null {
  const metaElement = getDocument("id", resultsMetaElementId);
  return metaElement instanceof HTMLParagraphElement ? metaElement : null;
}

// Retrieves all filter-category button elements from the controls panel.
function getCategoryButtons(): HTMLButtonElement[] {
  const buttonsNodeList = getDocument(
    "queryAll",
    ".filter-pills button[data-category]",
  );

  if (!(buttonsNodeList instanceof NodeList)) {
    return [];
  }

  return Array.from(buttonsNodeList).filter(
    (button): button is HTMLButtonElement => button instanceof HTMLButtonElement,
  );
}

// Creates one resource-card HTML fragment from a typed resource entry.
function createResourceCardMarkup(resource: DevResource): string {
  const safeName = escapeHtml(resource.name);
  const safeCategory = escapeHtml(resource.category);
  const safeLink = normalizeLink(resource.link);

  return `
    <li class="resource-card" data-resource-id="${escapeHtml(resource.id)}">
      <div class="resource-card-header">
        <h3>${safeName}</h3>
        <p class="resource-category-pill">${safeCategory}</p>
      </div>
      <p class="resource-url">${escapeHtml(resource.link)}</p>
      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="resource-link">
        Open Resource
      </a>
    </li>
  `;
}

// Creates the empty-state card used when no resources match filters.
function createEmptyStateMarkup(): string {
  return `
    <li class="resource-empty-state">
      <h3>No resources found</h3>
      <p>Try a different category or clear the search input.</p>
    </li>
  `;
}

// Builds list markup for the resource grid using template literals.
function createResourceGridMarkup(resources: Resources): string {
  if (resources.length === 0) {
    return createEmptyStateMarkup();
  }

  return resources.map((resource) => createResourceCardMarkup(resource)).join("");
}

// Builds metadata markup with emphasized values for the current filter state.
function createResultsMetaMarkup(state: DashboardRenderState): string {
  const normalizedSearch = state.searchTerm.trim();
  const safeCategory = escapeHtml(state.activeCategory);
  const searchValue = normalizedSearch ? escapeHtml(normalizedSearch) : "None";

  return `
    <span class="results-emphasis">${state.filteredResources.length}</span> of
    <span class="results-emphasis">${state.totalResources}</span> resources.
    Category: <span class="results-emphasis">${safeCategory}</span>. Search:
    <span class="results-emphasis">${searchValue}</span>.
  `;
}

// Renders all visible resource cards into the dashboard grid.
function renderResourceGrid(resources: Resources): void {
  const gridElement = getResourceGridElement();
  if (!gridElement) {
    return;
  }

  gridElement.innerHTML = createResourceGridMarkup(resources);
}

// Renders summary metadata for the current dashboard filter result.
function renderResultsMeta(state: DashboardRenderState): void {
  const resultsMetaElement = getResultsMetaElement();
  if (!resultsMetaElement) {
    return;
  }

  resultsMetaElement.innerHTML = createResultsMetaMarkup(state);
}

// Updates category filter aria state so UI selection stays synchronized.
function renderActiveCategory(activeCategory: CategoryFilter): void {
  const categoryButtons = getCategoryButtons();

  categoryButtons.forEach((button) => {
    const isActive = button.dataset.category === activeCategory;
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

// Renders the dashboard grid and filter metadata from current state.
export function renderDashboard(state: DashboardRenderState): void {
  renderResourceGrid(state.filteredResources);
  renderResultsMeta(state);
  renderActiveCategory(state.activeCategory);
}
