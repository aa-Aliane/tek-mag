"use client";

import React from "react";
import { IssuesStep } from "@/features/repairs/_add";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  params?: any;
  searchParams?: any;
}

const AddReparationIssuesPage: React.FC<Props> = ({
  className,
  params,
  searchParams,
  ...rest
}) => {
  return (
    <IssuesStep
      className={className}
      params={params}
      searchParams={searchParams}
      {...rest}
    />
  );
};

export default AddReparationIssuesPage;
