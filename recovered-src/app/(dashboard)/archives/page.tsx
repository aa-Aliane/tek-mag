"use client"

import { mockArchivedRepairs } from "@/lib/data"
import { ArchivesTable } from "@/components/features/archives"
import { SharedHeader } from '@/components/shared/shared-header';
import { ArchiveHighlightStats } from "@/components/features/archives/ArchiveHighlightStats";

export default function ArchivesPage() {
  const totalRevenue = mockArchivedRepairs.reduce((sum, repair) => sum + (repair.totalCost || 0), 0)

  const avgRepairTime =
    mockArchivedRepairs.reduce((sum, repair) => {
      if (repair.completedAt && repair.createdAt) {
        const days = Math.ceil((repair.completedAt.getTime() - repair.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }
      return sum
    }, 0) / mockArchivedRepairs.length

  const deviceTypeCount = mockArchivedRepairs.reduce(
    (acc, repair) => {
      acc[repair.deviceType] = (acc[repair.deviceType] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="h-full">
      <SharedHeader
        title="Archives"
        subtitle="Réparations terminées et récupérées"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <ArchiveHighlightStats className="mb-4 sm:mb-6" />

        <ArchivesTable repairs={mockArchivedRepairs} />
      </div>
    </div>
  )
}
