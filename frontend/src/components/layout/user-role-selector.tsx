"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, UserCog, Wrench } from "lucide-react"
import { useUserRole, mockUsers } from "@/components/layout/providers"

const roleIcons = {
  admin: Shield,
  manager: UserCog,
  technician: Wrench,
}

const roleLabels = {
  admin: "Administrateur",
  manager: "Manager",
  technician: "Technicien",
}

export function UserRoleSelector() {
  const { currentUser, setCurrentUser } = useUserRole()
  const Icon = roleIcons[currentUser.role]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 w-full justify-start">
          <Icon className="h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Changer de compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockUsers.map((user) => {
          const UserIcon = roleIcons[user.role]
          return (
            <DropdownMenuItem key={user.id} onClick={() => setCurrentUser(user)}>
              <UserIcon className="h-4 w-4 mr-2" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{roleLabels[user.role]}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
