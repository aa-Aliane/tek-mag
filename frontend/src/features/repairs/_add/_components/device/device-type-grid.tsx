import React from "react";
import { cn } from "@/lib/utils";
import { getDeviceIcon } from "../../_utils/device-helpers";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  deviceTypes: any[];
  deviceType: string | null;
  onDeviceTypeSelect: (slug: string) => void;
}

export const DeviceTypeGrid: React.FC<Props> = ({
  deviceTypes,
  deviceType,
  onDeviceTypeSelect,
  className,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2",
        className,
      )}
      {...rest}
    >
      {deviceTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onDeviceTypeSelect(type.slug)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:border-primary/50",
            deviceType === type.slug
              ? "border-primary bg-primary/5"
              : "border-border bg-card",
          )}
        >
          {getDeviceIcon(type.slug)}
          <span className="text-xs font-medium text-center">{type.name}</span>
        </button>
      ))}
    </div>
  );
};
