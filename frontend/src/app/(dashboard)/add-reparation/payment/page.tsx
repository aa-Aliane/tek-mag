"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { useAddReparationStore } from "@/store/addReparationStore";
import { useReparationStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentLayout from "../_layouts/payment-layout";
import { Discount, Payment } from "./_components";

export default function AddReparationPaymentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formData, submitForm } = useAddReparationStore();
  const { reset: resetReparationStore } = useReparationStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["repairs"] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });

      setIsSuccess(true);
      resetReparationStore();

      // Navigate to calendar after a short delay
      setTimeout(() => {
        router.push("/calendrier");
      }, 2000);
    } catch (error) {
      console.error("Error submitting repair:", error);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Réparation créée avec succès !
        </h2>
        <p className="text-muted-foreground">
          La réparation a été enregistrée. Redirection vers le calendrier...
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Paiement et Validation</h2>
          <p className="text-sm text-muted-foreground">
            Vérifiez les informations une dernière fois avant de valider.
          </p>
        </div>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="Payments">Payments</TabsTrigger>
            <TabsTrigger value="Remises">Remises</TabsTrigger>
          </TabsList>
          <TabsContent value="Payments">
            <PaymentLayout>
              <Payment />
            </PaymentLayout>
          </TabsContent>
          <TabsContent value="Remises">
            <PaymentLayout>
              <Discount />
            </PaymentLayout>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between pt-8">
          <Button
            variant="outline"
            onClick={() => router.push("/add-reparation/client")}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            size="lg"
            className="px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Valider la réparation"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
