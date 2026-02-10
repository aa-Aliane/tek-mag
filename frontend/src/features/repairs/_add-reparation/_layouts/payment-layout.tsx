import React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

const PaymentLayout: React.FC<Props> = ({ children, className, ...rest }) => {
  return (
    <div className={cn(className)} {...rest}>
      {children}
    </div>
  );
};

export default PaymentLayout;
