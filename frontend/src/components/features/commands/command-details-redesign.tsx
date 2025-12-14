"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { useStoreOrder } from "@/hooks/use-store-orders";
import { toast } from "sonner";
import { commandsApi } from "@/services/api/commands";
import { type StoreOrder } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  Download,
  Trash2,
  Printer,
} from "lucide-react";

interface CommandDetailsProps {
  orderId?: number; // Optional prop to override the route parameter
  order?: StoreOrder; // Pass the order directly (for side-panel view)
  onClose?: () => void; // Function to close the side panel
  isStandalone?: boolean; // Flag to indicate if the component is used as a standalone page
}

export function CommandDetailsRedesign({
  orderId,
  order: propOrder,
  onClose,
  isStandalone = true,
}: CommandDetailsProps) {
  const router = useRouter();

  // If an order is passed directly, use it; otherwise fetch via API
  const isDirectOrder = !!propOrder;
  const id = orderId || (propOrder ? propOrder.id : undefined);

  const { data, isLoading, error } = useStoreOrder(id);

  // Use the direct order prop when available, otherwise use fetched data
  const order = isDirectOrder ? propOrder : data || null;

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    try {
      await commandsApi.updateStoreOrderStatus(order.id, newStatus);
      // If this is a direct order (side panel view), we might need to notify parent
      // component to update its data, but for now we just show a success message
      toast.success(`Statut mis à jour à: ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Handle loading and error states
  if (isLoading && !isDirectOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement des détails de la commande...</p>
      </div>
    );
  }

  if ((error || !order) && !isDirectOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Erreur lors du chargement des détails de la commande</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Aucune commande à afficher</p>
      </div>
    );
  }

  // Get order items count (using a placeholder for now - in a real app, you would have items in the order)
  const orderItemsCount = 2; // Placeholder - would be the length of actual items array

  return (
    <div
      className={
        isStandalone
          ? "bg-white rounded-lg shadow-md w-full max-w-lg mx-auto" // Reasonable max width
          : "bg-white rounded-lg shadow-md"
      }
    >
      {/* Main container */}
      <div
        className={
          isStandalone
            ? "flex flex-col items-start w-full space-y-2 p-2" // More compact padding and spacing
            : "flex flex-col items-start w-full space-y-6 p-6"
        }
      >
        {/* Header */}
        <div
          className={
            isStandalone
              ? "flex flex-col items-start w-full space-y-3" /* Reduced space-y */
              : "flex flex-col items-start w-full space-y-6"
          }
        >
          {/* Order title and navigation */}
          <div
            className={
              isStandalone
                ? "flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-3" /* Stack on mobile */
                : "flex flex-row justify-between items-center w-full"
            }
          >
            <div
              className={
                isStandalone
                  ? "text-xl font-bold text-[#000000]" /* Smaller text on large screens */
                  : "text-xl font-semibold text-[#000000]"
              }
            >
              {isStandalone
                ? `Commande #${order.id}`
                : `Commande #${order.id} - ${order.order_name}`}
            </div>

            {isStandalone ? (
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-row items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="p-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/commandes")}
                    className="p-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Action buttons */}
          {isStandalone && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => router.push(`/commandes/${order.id}/edit`)}
                variant="default"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </Button>

              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>

              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-1" />
                Export Détails
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Delete action would go here
                  if (
                    confirm(
                      "Êtes-vous sûr de vouloir supprimer cette commande?",
                    )
                  ) {
                    // commandsApi.deleteStoreOrder(order.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-row items-center gap-3">
          <Button
            onClick={() => router.push(`/commandes/${order.id}/edit`)}
            variant="default"
            size="sm"
            className="px-5 py-3 rounded-md"
          >
            <Edit className="w-4 h-4 mr-1" />
            Modifier
          </Button>

          <Button variant="outline" size="sm" className="px-5 py-3 rounded-md border-2">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>

          <Button variant="outline" size="sm" className="px-5 py-3 rounded-md border-2">
            <Printer className="w-4 h-4 mr-1" />
            Imprimer Facture
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="p-3 rounded-md border-2"
            onClick={() => {
              // Delete action would go here
              if (
                confirm(
                  "Êtes-vous sûr de vouloir supprimer cette commande?",
                )
              ) {
                // commandsApi.deleteStoreOrder(order.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Order items section */}
        <div className="flex flex-row justify-between items-center w-full">
          <span className="text-base font-semibold text-[#000000]">
            Éléments de la commande
          </span>
          <span className="text-sm text-muted-foreground">
            {orderItemsCount}
          </span>
        </div>

        {/* Items list */}
        <div className="flex flex-col items-start w-full gap-3">
          {/* First item */}
          <div className="flex flex-row items-center w-full gap-3">
            <div className="w-12 h-16 rounded-sm bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">Image</span>
            </div>
            <div className="flex flex-col justify-center items-start flex-1">
              <div className="text-sm font-semibold text-[#000000]">
                {order.order_name}
              </div>
              <div className="text-xs font-semibold text-[rgba(0,0,0,0.7)]">
                {order.reference || "N/A"}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          />

          {/* Second item */}
          <div className="flex flex-row items-center w-full gap-3">
            <div className="w-12 h-16 rounded-sm bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">Image</span>
            </div>
            <div className="flex flex-col justify-center items-start flex-1">
              <div className="text-sm font-semibold text-[#000000]">
                Produit additionnel
              </div>
              <div className="text-xs font-semibold text-[rgba(0,0,0,0.7)]">
                SKU-12345
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          />
        </div>

        {/* Shipping info */}
        <div className="flex flex-col items-start w-full gap-1.5">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">Acompte</div>
            <div className="text-xs font-semibold text-[#000000]">
              {order.down_payment || '0.00 €'}
            </div>
          </div>
          <div className="flex flex-row justify-between items-center w-full">
            <div className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">Total</div>
            <div className="text-xs font-semibold text-[#000000]">
              {order.total_price || '0.00 €'}
            </div>
          </div>
          <div className="flex flex-row justify-between items-center w-full">
            <div className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">Statut Paiement</div>
            <div className="text-xs font-semibold text-[#000000]">
              {order.down_payment && order.total_price &&
               parseFloat(order.down_payment) >= parseFloat(order.total_price)
               ? 'Payé'
               : 'Partiel'}
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          />
        </div>

        {/* Customer info */}
        <div className="flex flex-col items-start w-full gap-3">
          <div className="text-base font-semibold text-[#000000]">
            Informations client
          </div>
          <div className="flex flex-col items-start w-full gap-1.5">
            <div className="flex flex-row justify-between items-center w-full">
              <div className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">
                Date
              </div>
              <div className="text-xs font-semibold text-[#000000]">
                {order.created_at
                  ? format(new Date(order.created_at), "dd MMM yyyy", {
                      locale: fr,
                    })
                  : "N/A"}
              </div>
            </div>
            <div className="flex flex-row justify-between items-center w-full">
              <div className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">
                Référence
              </div>
              <div className="text-xs font-semibold text-[#000000]">
                {order.reference || "N/A"}
              </div>
            </div>
            <div className="flex flex-row justify-between items-center w-full">
              <div className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">
                Statut
              </div>
              <div className="text-xs font-semibold text-[#000000]">
                {order.delivery_status}
              </div>
            </div>
            <div className="flex flex-row justify-between items-center w-full">
              <div className="text-sm font-semibold text-[rgba(0,0,0,0.6)]">
                Date de livraison
              </div>
              <div className="text-xs font-semibold text-[#000000]">
                {order.estimated_delivery_date
                  ? format(
                      new Date(order.estimated_delivery_date),
                      "dd MMM yyyy",
                      { locale: fr },
                    )
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Order status */}
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-col items-start">
            <div className="text-base font-semibold text-[#000000]">
              Statut de la commande
            </div>
            <div className="flex flex-row items-center gap-2 mt-1">
              <span className="text-sm font-normal text-[rgba(0,0,0,0.8)]">
                {order.delivery_status}
              </span>
              <ChevronLeft className="w-3 h-3 text-[#000000] rotate-90" />
            </div>
          </div>
          <Button
            onClick={() =>
              handleStatusUpdate(
                order.delivery_status === "pending" ? "ordered" : "pending",
              )
            }
            variant="default"
            size="sm"
          >
            Modifier
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#D9D9D9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#555FD4] rounded-full"
            style={{
              width:
                order.delivery_status === "pending"
                  ? "25%"
                  : order.delivery_status === "ordered"
                    ? "50%"
                    : order.delivery_status === "shipped"
                      ? "75%"
                      : order.delivery_status === "received"
                        ? "100%"
                        : "25%",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

