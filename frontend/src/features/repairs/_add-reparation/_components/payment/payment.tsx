import React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const Payment: React.FC<Props> = ({ className, ...rest }) => {
  return <div className={cn(className)} {...rest}>Payment</div>;
};

export default Payment;
