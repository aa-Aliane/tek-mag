"use client"

import { ArchivesTable } from "@/components/features/archives"
import { SharedHeader } from '@/components/shared/shared-header';
import { ArchiveHighlightStats } from "@/components/features/archives/ArchiveHighlightStats";
import { useRepairs } from "@/hooks/use-repairs";
import { type Repair } from "@/types";

export default function ArchivesPage() {
  // Fetch repairs with 'prete' status (ready/completed)
  const { data, isLoading, error } = useRepairs(1, "prete");

  const repairs = data?.results || [];

  // Calculate stats from API data
  const totalRevenue = repairs.reduce((sum, repair) => sum + (repair.totalCost || 0), 0)

  const avgRepairTime = repairs.length > 0
    ? repairs.reduce((sum, repair) => {
        if (repair.completedAt && repair.created_at) {
          const completedDate = typeof repair.completedAt === 'string' ? new Date(repair.completedAt) : repair.completedAt;
          const createdDate = typeof repair.created_at === 'string' ? new Date(repair.created_at) : repair.created_at;

          const days = Math.ceil((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0) / repairs.length
    : 0;

  const deviceTypeCount = repairs.reduce(
    (acc, repair) => {
      const deviceType = repair.deviceType || 'unknown';
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Chargement des archives...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg text-red-500">Erreur lors du chargement des archives: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <SharedHeader
        title="Archives"
        subtitle="Réparations terminées et récupérées"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <ArchiveHighlightStats repairs={repairs} className="mb-4 sm:mb-6" />

        <ArchivesTable repairs={repairs} />
      </div>
    </div>
  )
}
