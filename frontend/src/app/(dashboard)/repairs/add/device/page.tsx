"use client";

import React from "react";
import { DeviceStep } from "@/features/repairs/_add";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

const AddReparationDevicePage: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
  return (
    <DeviceStep
      className={className}
      params={params}
      searchParams={searchParams}
      {...rest}
    />
  );
};

export default AddReparationDevicePage;
