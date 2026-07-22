export interface Product {
  manufacturer: string;
  model: string;
  hashrate: string;
  power: string;
  weight: string;
  slug: string;
  condition: string;
  algorithm: string;
  priceUsd: string;
  priceRub: string;
  payback: string;
  priceUsdNumeric: number;
  priceRubNumeric: number;
  imageUrl?: string;
  efficiency?: string;
  sourcesChecked?: string[];
  isCustom?: boolean;
}

export interface FilterState {
  search: string;
  manufacturer: string;
  condition: string;
  algorithm: string;
  hasPrice: boolean;
}

export interface SeoOverride {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}
