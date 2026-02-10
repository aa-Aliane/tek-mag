import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Watch,
  Gamepad2,
} from "lucide-react";
import React from "react";

// Helper function to get device icon
export const getDeviceIcon = (slug: string) => {
  if (slug.includes("smartphone") || slug.includes("phone")) {
    return <Smartphone className="h-8 w-8" />;
  } else if (slug.includes("tablet")) {
    return <Tablet className="h-8 w-8" />;
  } else if (
    slug.includes("laptop") ||
    slug.includes("computer") ||
    slug.includes("pc")
  ) {
    return <Laptop className="h-8 w-8" />;
  } else if (slug.includes("desktop")) {
    return <Monitor className="h-8 w-8" />;
  } else if (slug.includes("watch")) {
    return <Watch className="h-8 w-8" />;
  } else if (slug.includes("console")) {
    return <Gamepad2 className="h-8 w-8" />;
  } else if (slug.includes("other")) {
    return <Smartphone className="h-8 w-8" />; // Using smartphone as default for 'other'
  } else {
    return <Smartphone className="h-8 w-8" />;
  }
};
