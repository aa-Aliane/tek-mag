import React from "react";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import StockItems from "@/features/stock/_items";

interface Props extends React.ComponentPropsWithoutRef<"div"> {}

const StockView: React.FC<Props> = ({ ...rest }) => {
  return <div className="p-10"></div>;
};

export default StockView;
