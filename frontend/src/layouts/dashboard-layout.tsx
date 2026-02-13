import React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children, className, ...rest }) => {
  return (
    <div className={cn("h-full flex flex-col", className)} {...rest}>
      {children}
    </div>
  );
};

export default DashboardLayout;
