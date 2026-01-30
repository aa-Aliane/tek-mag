"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, AlertTriangle } from "lucide-react"
import type { StockItem, Part } from "@/types"

interface StockTableProps {
  stockItems: StockItem[]
  onAddStock: (itemId: number, quantity: number) => void
}

export function StockTable({ stockItems, onAddStock }: StockTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [quantity, setQuantity] = useState("")

  const handleAddStock = () => {
    if (selectedItem && quantity) {
      onAddStock(selectedItem.id, Number.parseInt(quantity))
      setIsDialogOpen(false)
      setSelectedItem(null)
      setQuantity("")
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pièce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Marque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stockItems.map((item) => {
                const isLowStock = item.quantity < 5 // Hardcoded minQuantity
                const isOutOfStock = item.quantity === 0
                const part = item.part

                return (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{part.name}</div>
                        {isOutOfStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        {isLowStock && !isOutOfStock && <AlertTriangle className="h-4 w-4 text-warning" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground capitalize">
                        {/* part.model?.deviceType || "-" */}
                        -
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {/* part.brand?.name || "-" */}
                        -
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          isOutOfStock
                            ? "bg-destructive text-destructive-foreground"
                            : isLowStock
                              ? "bg-warning text-warning-foreground"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }
                      >
                        {item.quantity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {part.price ? parseFloat(part.price).toFixed(2) : "0.00"} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter du stock</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label>Pièce</Label>
                <div className="mt-1 text-sm font-medium">{selectedItem.part.name}</div>
                <div className="text-xs text-muted-foreground">Stock actuel: {selectedItem.quantity}</div>
              </div>
              <div>
                <Label htmlFor="quantity">Quantité à ajouter</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 5"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddStock} disabled={!quantity}>
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}