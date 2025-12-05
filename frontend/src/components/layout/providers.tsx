"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type User } from "@/types"

export const currentUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@repair.com",
  role: "admin",
}

export const mockUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@repair.com", role: "admin" },
  { id: "2", name: "Manager User", email: "manager@repair.com", role: "manager" },
  { id: "3", name: "Technicien User", email: "tech@repair.com", role: "technician" },
]

const defaultCurrentUser = currentUser

interface UserRoleContextType {
  currentUser: User
  setCurrentUser: (user: User) => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultCurrentUser)

  return <UserRoleContext.Provider value={{ currentUser, setCurrentUser }}>{children}</UserRoleContext.Provider>
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider")
  }
  return context
}

