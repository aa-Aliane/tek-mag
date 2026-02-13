import { PaginatedLayout } from "@/components/layout/paginated-layout";
import { DashboardLayout } from "@/layouts";
import { cn } from "@/lib/utils";
import React from "react";
import { useStockList } from "../_queries/use-store-items";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const StockView: React.FC<Props> = ({ className, ...rest }) => {
  const {
    data: stockItems,
    isLoading,
    error,
  } = useStockList({ page: 1, pageSize: 10 });
  return (
    <DashboardLayout className={cn("p-4", className)} {...rest}>
      <>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {stockItems && (
          <ul>
            {stockItems.results.map((item) => (
              <li key={item.id}>{item.part.name}</li>
            ))}
          </ul>
        )}
      </>
    </DashboardLayout>
  );
};

export default StockView;
