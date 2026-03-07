import { create } from "zustand";

export type entityCategory =
  | "devices"
  | "accessories"
  | "repairs"
  | "computers";

interface CategoriesStore {
  category: entityCategory;
  setCategory: (category: entityCategory) => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  category: "devices",
  setCategory: (category: entityCategory) => set({ category }),
}));
