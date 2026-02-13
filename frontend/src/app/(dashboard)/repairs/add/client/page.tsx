"use client";

import React from "react";
import { ClientStep } from "@/features/repairs/_add";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

const AddReparationClientPage: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
  return (
    <ClientStep
      className={className}
      params={params}
      searchParams={searchParams}
      {...rest}
    />
  );
};

export default AddReparationClientPage;
