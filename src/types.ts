export enum ResourceCategories {
  Docs = "Documentation",
  Tool = "Build Tool",
  Design = "Design",
  Language = "Language",
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

export type SeletorType = "id" | "class" | "tag" | "query" | "queryAll";

export type DomResult =
  | HTMLElement
  | Element
  | HTMLCollectionOf<Element>
  | NodeListOf<Element>
  | null;
