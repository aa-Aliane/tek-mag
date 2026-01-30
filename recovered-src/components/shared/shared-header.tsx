"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  num: number;
  label: string;
}

interface SharedHeaderProps {
  title: string;
  subtitle?: string;
  steps?: Step[];
  currentStep?: number;
  showProgress?: boolean;
  children?: React.ReactNode;
}

export function SharedHeader({
  title,
  subtitle,
  steps = [],
  currentStep = 1,
  showProgress = false,
  children,
}: SharedHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        {showProgress && steps.length > 0 ? (
          // Progress header for multi-step forms
          <div>
            <h1 className="text-2xl font-bold mb-4">{title}</h1>

            <div className="flex items-center justify-between max-w-2xl">
              {steps.map((step, idx) => (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors",
                        currentStep > step.num
                          ? "border-primary bg-primary text-primary-foreground"
                          : currentStep === step.num
                          ? "border-primary bg-background text-primary"
                          : "border-muted-foreground/30 bg-background text-muted-foreground"
                      )}
                    >
                      {currentStep > step.num ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.num
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        currentStep >= step.num
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-4 h-[2px] flex-1 transition-colors",
                        currentStep > step.num
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Standard header for regular pages
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        )}

        {showProgress && children && (
          <div className="mt-4 flex justify-end">{children}</div>
        )}
      </div>
    </div>
  );
}
