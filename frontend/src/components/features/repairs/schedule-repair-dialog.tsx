"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import type { Repair } from "@/types"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ScheduleRepairDialogProps {
  repair: Repair | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (repair: Repair, date: Date) => void
}

export function ScheduleRepairDialog({ repair, open, onOpenChange, onSchedule }: ScheduleRepairDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (repair?.scheduledDate) {
      setSelectedDate(repair.scheduledDate)
    } else {
      setSelectedDate(undefined)
    }
  }, [repair])

  const handleSubmit = () => {
    if (repair && selectedDate) {
      onSchedule(repair, selectedDate)
      onOpenChange(false)
    }
  }

  if (!repair) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Programmer la réparation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sélectionnez une date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                className="rounded-md border"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
          </div>

          {selectedDate && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date sélectionnée:</span>
                <span>{format(selectedDate, "dd MMMM yyyy", { locale: fr })}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedDate}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Programmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
