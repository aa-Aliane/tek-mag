'use client';

import { Separator } from '@/components/ui/separator';
import { useAddReparationStore } from '@/store/addReparationStore';
import { DeviceType } from '@/types';

interface AddReparationSummaryProps {
  showTotal?: boolean;
}

export function AddReparationSummary({ showTotal = true }: AddReparationSummaryProps) {
  const { formData } = useAddReparationStore();
  const { 
    deviceType, 
    brand, 
    model, 
    issues, 
    issueDescription, 
    accessories, 
    client, 
    newClient, 
    totalPrice 
  } = formData;

  // Get device type name
  const deviceTypeName = deviceType ? 
    (deviceType === 'computer' ? 'Ordinateur' : 
     deviceType === 'smartphone' ? 'Smartphone' : 
     deviceType === 'tablet' ? 'Tablette' : 'Autre') 
    : '';

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        Récapitulatif
      </h3>

      <div className="space-y-4 mb-6">
        {/* Device Summary */}
        {deviceType && brand && model && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Appareil
            </div>
            <div className="text-sm text-card-foreground">
              {deviceTypeName}
            </div>
            <div className="text-sm font-medium text-card-foreground">
              {brand} {model}
            </div>
          </div>
        )}

        {/* Issues Summary */}
        {issues.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Réparations
              </div>
              <div className="space-y-1.5">
                {issues.map((issueName, index) => {
                  // This is a simplified calculation - in reality, you'd need to get the price from the issues list
                  // For now, we'll just show the issue name
                  return (
                    <div
                      key={index}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-card-foreground">
                        {issueName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Issue Description */}
        {issueDescription && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </div>
              <div className="text-sm text-card-foreground">
                {issueDescription}
              </div>
            </div>
          </>
        )}

        {/* Accessories */}
        {accessories && accessories.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Accessoires
              </div>
              <div className="text-sm text-card-foreground">
                {accessories.join(', ')}
              </div>
            </div>
          </>
        )}

        {/* Client Summary */}
        {(client || (newClient.name && newClient.phone)) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Client
              </div>
              <div className="text-sm font-medium text-card-foreground">
                {client?.name || newClient.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {client?.phone || newClient.phone}
              </div>
              {(client?.email || newClient.email) && (
                <div className="text-sm text-muted-foreground">
                  {client?.email || newClient.email}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Total Price */}
      {showTotal && totalPrice > 0 && (
        <>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-card-foreground">
              Total estimé
            </span>
            <span className="text-2xl font-bold text-accent">
              {totalPrice.toFixed(2)} €
            </span>
          </div>
        </>
      )}
    </div>
  );
}