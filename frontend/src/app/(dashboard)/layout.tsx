import { MobileNav } from "@/components/layout/mobile-nav";
import { UserRoleProvider } from "@/components/layout/providers";
import { Sidebar } from "@/components/layout/sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <UserRoleProvider>
        <MobileNav />
        <div className="flex h-screen max-w-screen">
          <Sidebar className="w-[15%]" />
          <main className="flex-1 relative  overflow-auto pt-0 lg:pt-0 max-w-[85%]">
            {children}
          </main>
        </div>
      </UserRoleProvider>
    </div>
  );
}
