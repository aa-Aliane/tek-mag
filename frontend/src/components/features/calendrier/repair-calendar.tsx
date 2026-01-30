"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Added useRouter
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
// Removed: import { RepairFormDialog } from "@/components/features/calendrier"
import type { Repair } from "@/types"
import { format, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, Smartphone, Plus } from "lucide-react"

interface RepairCalendarProps {
  repairs: Repair[]
  onSelectRepair?: (repair: Repair) => void
  onAddRepair?: (repair: Partial<Repair>) => void
}

export function RepairCalendar({ repairs, onSelectRepair, onAddRepair }: RepairCalendarProps) {
  const router = useRouter() // Initialize useRouter
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  // Removed: const [isAddRepairOpen, setIsAddRepairOpen] = useState(false)

  // Get repairs scheduled for selected date
  const scheduledRepairs = repairs.filter(
    (repair) => repair.scheduledDate && selectedDate && isSameDay(new Date(repair.scheduledDate), selectedDate),
  )

  // Get all dates with scheduled repairs
  const datesWithRepairs = repairs.filter((r) => r.scheduledDate).map((r) => new Date(r.scheduledDate!))

  const modifiers = {
    scheduled: datesWithRepairs,
  }

  const modifiersStyles = {
    scheduled: {
      fontWeight: "bold",
      textDecoration: "underline",
    },
  }

  const handleNavigateToAddRepair = () => {
    if (selectedDate) {
      router.push(`/dashboard/add-reparation?date=${selectedDate.toISOString()}`)
    } else {
      router.push("/dashboard/add-reparation")
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={fr}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md"
          />
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {scheduledRepairs.length} réparation(s) programmée(s)
                </p>
              </div>
              {/* Updated onClick to navigate to the new page */}
              {selectedDate && ( // onAddRepair prop is no longer needed here
                <Button onClick={handleNavigateToAddRepair} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Programmer
                </Button>
              )}
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {scheduledRepairs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune réparation programmée pour cette date</p>
                  </div>
                ) : (
                  scheduledRepairs.map((repair) => (
                    <button
                      key={repair.id}
                      onClick={() => onSelectRepair?.(repair)}
                      className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Smartphone className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {repair.brand} {repair.model}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{repair.client?.first_name} {repair.client?.last_name}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {repair.issues.slice(0, 2).map((issue, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {issue}
                                </Badge>
                              ))}
                              {repair.issues.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{repair.issues.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={repair.depositStatus === "deposited" ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {repair.depositStatus === "deposited" ? "Déposé" : "À déposer"}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>

      {/* Removed: RepairFormDialog rendering */}
    </>
  )
}