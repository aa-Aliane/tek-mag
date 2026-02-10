import React from "react";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const PaymentLayout: React.FC<Props> = ({ children, ...rest }) => {
  return <div {...rest}>{children}</div>;
};

export default PaymentLayout;
