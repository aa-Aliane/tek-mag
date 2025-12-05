"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ClientStep } from "@/components/add-reparation/client-step";

export default function AddReparationClientPage() {
  const router = useRouter();

  const handleFormSubmit = () => {
    // Navigate back to the calendar after successful submission
    router.push('/calendrier');
  };

  return (
    <Card className="p-8">
      <ClientStep onFormSubmit={handleFormSubmit} />
    </Card>
  );
}