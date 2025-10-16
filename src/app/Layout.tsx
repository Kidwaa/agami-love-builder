import { Outlet, useLocation, useMatches } from "react-router-dom";
import { Sidebar } from "@/app/Sidebar";
import { TopBar } from "@/app/TopBar";
import { PageActionsProvider } from "@/app/PageActionsContext";
import { RoleProvider } from "@/app/RoleContext";
import { Toaster } from "sonner";

export function Layout() {
  const location = useLocation();
  const matches = useMatches();
  const breadcrumbs = matches
    .filter((match) => (match.handle as any)?.breadcrumb)
    .map((match) => ({ label: (match.handle as any)!.breadcrumb as string, path: match.pathname || location.pathname }));

  return (
    <RoleProvider>
      <PageActionsProvider>
        <div className="flex h-full min-h-screen bg-slate-100">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">
              <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb.path}>
                    {index > 0 ? <span className="mx-2">/</span> : null}
                    {crumb.label}
                  </span>
                ))}
              </nav>
              <Outlet />
            </main>
          </div>
          <Toaster richColors />
        </div>
      </PageActionsProvider>
    </RoleProvider>
  );
}
