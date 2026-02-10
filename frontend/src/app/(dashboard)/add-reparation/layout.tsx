"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SharedHeader } from "@/components/shared/shared-header";
import { SummarySidebar } from "@/features/repairs/_add-reparation/_layouts/summary-sidebar";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  params?: any;
}

const AddReparationLayout: React.FC<Props> = ({
  children,
  className,
  params,
  ...rest
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Determine current step based on the pathname
  const pathname = usePathname();
  let currentStep = 1;

  if (pathname.includes("/add-reparation/issues")) {
    currentStep = 2;
  } else if (pathname.includes("/add-reparation/client")) {
    currentStep = 3;
  } else if (pathname.includes("/add-reparation/payment")) {
    currentStep = 4;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn("min-h-screen bg-background", className)} {...rest}>
      <SharedHeader
        title="Nouvelle Réparation"
        showProgress={true}
        steps={[
          { num: 1, label: "Appareil" },
          { num: 2, label: "Problèmes" },
          { num: 3, label: "Client" },
          { num: 4, label: "Paiement" },
        ]}
        currentStep={currentStep}
      />

      {/* Main Content */}
      <div
        className={"container mx-auto mt-10 px-4 transition-all duration-300"}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <div className="lg:col-span-2">{children}</div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <SummarySidebar isScrolled={isScrolled} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReparationLayout;
