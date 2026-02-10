import { cn } from "@/lib/utils";
import { getDeviceIcon } from "./device-utils";

interface DeviceTypeGridProps {
  deviceTypes: any[];
  deviceType: string | null;
  onDeviceTypeSelect: (slug: string) => void;
}

export function DeviceTypeGrid({
  deviceTypes,
  deviceType,
  onDeviceTypeSelect,
}: DeviceTypeGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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
          <span className="text-xs font-medium text-center">
            {type.name}
          </span>
        </button>
      ))}
    </div>
  );
}
