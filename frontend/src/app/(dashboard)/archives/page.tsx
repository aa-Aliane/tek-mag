"use client"

import { mockArchivedRepairs } from "@/lib/data"
import { ArchivesTable } from "@/components/features/archives"
import { SharedHeader } from '@/components/shared/shared-header';

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

  const stats = {
    total: mockArchivedRepairs.length,
    revenue: totalRevenue,
    avgTime: avgRepairTime.toFixed(1),
    smartphones: deviceTypeCount["smartphone"] || 0,
    tablets: deviceTypeCount["tablet"] || 0,
    computers: deviceTypeCount["computer"] || 0,
  }

  return (
    <div className="h-full">
      <SharedHeader
        title="Archives"
        subtitle="Réparations terminées et récupérées"
      />

      <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Réparations terminées</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.revenue.toFixed(2)} €</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Revenu total</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.avgTime} jours</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Temps moyen</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-lg sm:text-xl font-bold">{stats.smartphones}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Smartphones</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-lg sm:text-xl font-bold">{stats.tablets}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Tablettes</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
            <div className="text-lg sm:text-xl font-bold">{stats.computers}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Ordinateurs</div>
          </div>
        </div>

        <ArchivesTable repairs={mockArchivedRepairs} />
      </div>
    </div>
  )
}
