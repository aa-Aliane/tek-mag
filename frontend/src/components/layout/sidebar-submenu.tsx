"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SubmenuItem {
  label: string;
  href: string;
}

interface SidebarSubmenuProps {
  items: SubmenuItem[];
  title: string;
}

export function SidebarSubmenu({ items, title }: SidebarSubmenuProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-30 bottom-0 w-64 bg-background border-r border-border overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {title}
        </h2>
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {isActive ? (
                  <motion.div
                    layoutId="activeSidebarItem"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
