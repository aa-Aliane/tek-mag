"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wrench, Users, Archive, ShoppingCart, Package, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserRoleSelector } from "@/components/layout/user-role-selector"

const navigation = [
  { name: "Réparations", href: "/", icon: Wrench },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Archives", href: "/archives", icon: Archive },
  { name: "Commande Pièces", href: "/commandes", icon: ShoppingCart },
  { name: "Stock", href: "/stock", icon: Package },
  { name: "Calendrier", href: "/calendrier", icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="ml-3 text-lg font-semibold text-foreground">{"TekMag"}</h1>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <UserRoleSelector />
        <div className="text-xs text-muted-foreground">Version 1.0.0</div>
      </div>
    </div>
  )
}
