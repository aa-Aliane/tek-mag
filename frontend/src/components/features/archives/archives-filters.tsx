"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { CreditCard, DollarSign, Wallet, X } from "lucide-react"
import type { Repair, PaymentStatus } from "@/types"

interface ArchivesFiltersProps {
  repairs: Repair[]
  onFilterChange: (filteredRepairs: Repair[]) => void
  activeFilter: PaymentStatus | "all"
  onFilterSelect: (filter: PaymentStatus | "all") => void
}

export function ArchivesFilters({ 
  repairs, 
  onFilterChange, 
  activeFilter, 
  onFilterSelect 
}: ArchivesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const paidRepairs = repairs.filter(r => r.paymentStatus === 'paid')
  const unpaidRepairs = repairs.filter(r => r.paymentStatus === 'unpaid')
  const partialRepairs = repairs.filter(r => r.paymentStatus === 'partial')

  const totalRevenue = paidRepairs.reduce((sum, repair) => sum + (repair.finalPrice || 0), 0)
  const pendingRevenue = unpaidRepairs.reduce((sum, repair) => sum + (repair.finalPrice || 0), 0)
  const partialRevenue = partialRepairs.reduce((sum, repair) => sum + (repair.finalPrice || 0), 0)

  const handleFilterClick = (filter: PaymentStatus | "all") => {
    if (activeFilter === filter) {
      onFilterSelect("all")
      onFilterChange(repairs)
    } else {
      onFilterSelect(filter)
      const filtered = filter === "all" 
        ? repairs 
        : repairs.filter(repair => repair.paymentStatus === filter)
      onFilterChange(filtered)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("all")}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Tous ({repairs.length})
        </Button>
        <Button
          variant={activeFilter === "paid" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("paid")}
          className="flex items-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Payés ({paidRepairs.length})
        </Button>
        <Button
          variant={activeFilter === "partial" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("partial")}
          className="flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Partiels ({partialRepairs.length})
        </Button>
        <Button
          variant={activeFilter === "unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("unpaid")}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Impayés ({unpaidRepairs.length})
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réparations</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repairs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Encaissés</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)} DH</div>
            <p className="text-xs text-muted-foreground">{paidRepairs.length} réparations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{partialRevenue.toFixed(2)} DH</div>
            <p className="text-xs text-muted-foreground">{partialRepairs.length} réparations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impayés</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingRevenue.toFixed(2)} DH</div>
            <p className="text-xs text-muted-foreground">{unpaidRepairs.length} réparations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}