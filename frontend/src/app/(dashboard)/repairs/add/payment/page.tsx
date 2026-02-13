"use client";

import React from "react";
import { PaymentStep } from "@/features/repairs/_add";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

const AddReparationPaymentPage: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
  return (
    <PaymentStep
      className={className}
      params={params}
      searchParams={searchParams}
      {...rest}
    />
  );
};

export default AddReparationPaymentPage;
