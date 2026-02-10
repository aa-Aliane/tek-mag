"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { useAddReparationStore } from "@/store/addReparationStore";
import { useReparationStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentLayout from "@/features/repairs/_add-reparation/_layouts/payment-layout";
import {
  DiscountSection,
  PaymentMethods,
} from "@/features/repairs/_add-reparation/_components/payment";
import { cn } from "@/lib/utils";
import { StepLayout } from "@/features/repairs/_add-reparation/_layouts/step-layout";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

const AddReparationPaymentPage: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
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
      <Card
        className={cn(
          "p-8 flex flex-col items-center justify-center min-h-[400px] text-center",
          className,
        )}
        {...rest}
      >
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
    <StepLayout
      title="Paiement et Validation"
      description="Vérifiez les informations une dernière fois avant de valider."
      onBack={() => router.push("/add-reparation/client")}
      onNext={handleFinish}
      nextLabel="Valider la réparation"
      isNextLoading={isSubmitting}
      showNextIcon={false}
      className={className}
      {...rest}
    >
      <div className="space-y-6">
        <Tabs defaultValue="Payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Payments">Paiements</TabsTrigger>
            <TabsTrigger value="Remises">Remises</TabsTrigger>
          </TabsList>
          <TabsContent value="Payments" className="pt-4">
            <PaymentLayout>
              <PaymentMethods />
            </PaymentLayout>
          </TabsContent>
          <TabsContent value="Remises" className="pt-4">
            <PaymentLayout>
              <DiscountSection />
            </PaymentLayout>
          </TabsContent>
        </Tabs>
      </div>
    </StepLayout>
  );
};

export default AddReparationPaymentPage;
