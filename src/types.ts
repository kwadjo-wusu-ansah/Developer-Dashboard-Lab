export enum ResourceCategories {
  Documentation = "Documentation",
  BuildTool = "Build Tool",
  Design = "Design",
  Language = "Language",
  Tool = "Tool",
}

export interface DevResource {
  id: string;
  name: string;
  category: ResourceCategories;
  link: string;
}

export interface PartialDevResource {
  name: string;
  category: ResourceCategories;
  link: string;
}

export type Resources = DevResource[];
export type CategoryFilter = "All" | ResourceCategories;

export type SeletorType = "id" | "class" | "tag" | "query" | "queryAll";

export type DomResult =
  | HTMLElement
  | Element
  | HTMLCollectionOf<Element>
  | NodeListOf<Element>
  | null;
