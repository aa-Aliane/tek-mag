import React from "react";
import { cn } from "@/lib/utils";
import { StatCardProps } from "@/components/shared/StatCard";
import { SimpleStatsGrid } from "@/components/shared/SimpleStatsGrid";
import { useRepairs } from "../../_queries/use-repairs-queries";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

export const RepairHighlightStats: React.FC<Props> = ({ className, ...rest }) => {
  // Fetch a larger sample for stats, or we could have a specific stats endpoint
  const { data } = useRepairs({ page: 1, pageSize: 50 });

  const repairs = data?.results || [];

  // Calculate stats
  const totalRevenue = repairs.reduce(
    (sum, repair) => sum + parseFloat(repair.totalPrice?.toString() || "0"),
    0,
  );
  const avgRepairValue =
    repairs.length > 0 ? (totalRevenue / repairs.length).toFixed(2) : "0.00";

  const stats: StatCardProps[] = [
    {
      title: "Total",
      value: repairs.length,
      color: "default",
    },
    {
      title: "En cours",
      value: repairs.filter((r) => r.status === "en-cours").length,
      color: "warning",
    },
    {
      title: "Prêtes",
      value: repairs.filter((r) => r.status === "prete").length,
      color: "success",
    },
    {
      title: "€/Rép",
      value: `${avgRepairValue}€`,
      color: "primary",
    },
  ];

  return (
    <div className={cn(className)} {...rest}>
      <SimpleStatsGrid stats={stats} />
    </div>
  );
};
