import React from "react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const RepairEditView: React.FC<Props> = ({ className, ...rest }) => {
  return (
    <div className={className} {...rest}>
      RepairEditView
    </div>
  );
};

export default RepairEditView;
