import React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const Discount: React.FC<Props> = ({ className, ...rest }) => {
  return <div className={cn(className)} {...rest}>Discount</div>;
};

export default Discount;
