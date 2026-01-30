import React from "react";

interface IProps extends React.ComponentPropsWithRef<"div"> {}
const AuthLayout: React.FC<IProps> = ({ children, ...props }) => {
  return (
    <div {...props} className="relative">
      {children}
    </div>
  );
};

export default AuthLayout;
