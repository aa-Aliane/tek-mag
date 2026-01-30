
"use client";
import { Navbar08 } from "@/components/ui/shadcn-structural/nav-8";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar08 />
      <main>{children}</main>
    </div>
  );
}
