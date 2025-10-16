import React from "react";
import { readStorage, writeStorage } from "@/utils/storage";

type Role = "ADMIN" | "VIEWER";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  isViewer: boolean;
}

const STORAGE_KEY = "active-role";

const RoleContext = React.createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(() => readStorage<Role | null>(STORAGE_KEY, "ADMIN") ?? "ADMIN");

  const setRole = (next: Role) => {
    setRoleState(next);
    writeStorage(STORAGE_KEY, next);
  };

  const value = React.useMemo(() => ({ role, setRole, isViewer: role === "VIEWER" }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
