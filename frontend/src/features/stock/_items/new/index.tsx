"use client";

import React from "react";
import { CatalogueTable } from "../../_catalogue/catalogue-table";
import { Header } from "./_components";
import { entityCategory, useCategoriesStore } from "../../_store/categories";
import { useCatalogueStore } from "../../_store/catalogue";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const StockNewItem: React.FC<Props> = ({ ...rest }) => {
  const setCategory = useCategoriesStore((state) => state.setCategory);
  const { setPage, resetFilters } = useCatalogueStore();

  const onCategoryChange = (category: entityCategory) => {
    setCategory(category);
    setPage(1);
    resetFilters();
  };

  return (
    <div {...rest}>
      <Header onCategoryChange={onCategoryChange} onCreateNew={() => {}} />
      <CatalogueTable onSelect={() => {}} />
    </div>
  );
};

export default StockNewItem;
