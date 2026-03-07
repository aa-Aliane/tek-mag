"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 1. Generate Breadcrumb Items
  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const isLast = index === pathSegments.length - 1;

    let label = segment;
    if (segment === "stock") label = "Stock";
    if (segment === "items") label = "Articles de stock";
    if (segment === "orders") label = "Commandes";
    if (segment === "new") label = "Nouveau";

    return (
      <React.Fragment key={href}>
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage>{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={href}>{label}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  // 2. Tab Logic
  // Matches "orders" if the URL contains it, otherwise defaults to "items"
  const activeTab = pathname.includes("/stock/orders") ? "orders" : "items";

  const handleTabChange = (value: string) => {
    // If the user clicks "items", it goes to /stock/items
    // If the user clicks "orders", it goes to /stock/orders
    router.push(`/stock/${value}`);
  };

  // 3. Conditional Layout States
  const isNewItemPage = pathname === "/stock/items/new";

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
        </Breadcrumb>
      </div>

      {isNewItemPage ? (
        // For the "New" page, show children without the Tab bar
        <div className="mt-6">{children}</div>
      ) : (
        // For /stock, /stock/items, and /stock/orders, show the Tabs
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="items">Articles de stock</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
          </TabsList>
          <div className="mt-6">{children}</div>
        </Tabs>
      )}
    </div>
  );
}
