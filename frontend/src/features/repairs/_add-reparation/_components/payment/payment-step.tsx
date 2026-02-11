"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAddReparationStore } from "@/store/addReparationStore";
import { useReparationStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Ban,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StepLayout } from "../../_layouts/step-layout";
import PaymentLayout from "../../_layouts/payment-layout";
import { DiscountSection } from "./discount-section";
import { PaymentMethods } from "./payment-methods";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

export const PaymentStep: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formData, setFormData, submitForm } = useAddReparationStore();
  const { reset: resetReparationStore } = useReparationStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionType, setSubmissionType] = useState<
    "with-payment" | "no-payment" | null
  >(null);

  const handleFinish = async (type: "with-payment" | "no-payment") => {
    setSubmissionType(type);
    setIsSubmitting(true);

    try {
      // If "no-payment" is selected, we could optionally clear payments,
      // but let's assume the user knows what they're doing if they added them.
      // Or we can explicitly clear them if type is no-payment:
      if (type === "no-payment" && formData.payments.length > 0) {
        setFormData({ payments: [] });
      }

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
      setSubmissionType(null);
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

  const hasPayments = formData.payments.length > 0;

  const CustomFooter = (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <Button
        variant="outline"
        onClick={() => router.push("/add-reparation/client")}
        size="lg"
        disabled={isSubmitting}
        className="px-6"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={() => handleFinish("no-payment")}
          disabled={isSubmitting}
          size="lg"
          className="px-6"
        >
          {isSubmitting && submissionType === "no-payment" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Ban className="h-4 w-4 mr-2" />
          )}
          Valider sans paiement
        </Button>

        <Button
          onClick={() => handleFinish("with-payment")}
          disabled={isSubmitting || !hasPayments}
          size="lg"
          className="px-8 min-w-[140px]"
        >
          {isSubmitting && submissionType === "with-payment" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Valider avec paiement
        </Button>
      </div>
    </div>
  );

  return (
    <StepLayout
      title="Paiement et Validation"
      description="Vérifiez les informations une dernière fois avant de valider."
      customFooter={CustomFooter}
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
