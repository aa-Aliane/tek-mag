import { create } from "zustand";
import { CatalogueItem } from "../_types/catalogue";

interface CatalogueFilters {
  brand?: string;
  quality_tier?: string; // repairs and devices
  storage?: string; // devices / computers
  color?: string; // accessories / devices
  part_type?: string; // repairs / accessories
  device_type?: string; // computers
  source: "all" | "global" | "private";
}

interface CatalogueStore {
  search: string;
  debouncedSearch: string;
  page: number;
  filters: CatalogueFilters;
  selectedItems: CatalogueItem[];
  setSearch: (val: string) => void;
  setPage: (page: number) => void;
  setFilter: (key: keyof CatalogueFilters, val: string) => void;
  resetFilters: () => void;
  addItem: (item: CatalogueItem) => void;
  removeItem: (itemId: number) => void;
  removeAllItems: () => void;
}

export const useCatalogueStore = create<CatalogueStore>((set) => ({
  search: "",
  debouncedSearch: "",
  page: 1,
  filters: {
    source: "all",
  },
  selectedItems: [],
  setSearch: (val) => {
    set({ search: val, page: 1 });
    clearTimeout((window as any).searchTimer);
    (window as any).searchTimer = setTimeout(() => {
      set({ debouncedSearch: val });
    }, 400);
  },

  setPage: (page) => set({ page }),

  setFilter: (key, val) =>
    set((state) => ({
      page: 1,
      filters: {
        ...state.filters,
        [key]: val === "all" ? undefined : val,
      },
    })),

  resetFilters: () =>
    set({
      search: "",
      debouncedSearch: "",
      page: 1,
      filters: { source: "all" },
    }),

  addItem: (item: CatalogueItem) =>
    set((state) => ({ selectedItems: [...state.selectedItems, item] })),
  removeItem: (itemId: number) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter(
        (item: CatalogueItem) => item.id !== itemId,
      ),
    })),
  removeAllItems: () => ({ selectedItems: [] }),
}));
