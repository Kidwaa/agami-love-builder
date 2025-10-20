import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "@/vendor/react-i18next";
import { cn } from "@/utils/cn";

const cmsLinks = [
  { to: "/cms/login-carousel", labelKey: "nav.loginCarousel" },
  { to: "/cms/guest-carousel", labelKey: "nav.guestCarousel" },
  { to: "/cms/tutorials", labelKey: "nav.tutorials" },
  { to: "/cms/success-stories", labelKey: "nav.success" },
  { to: "/cms/sheba", labelKey: "nav.sheba" },
  { to: "/cms/service-catalog", labelKey: "nav.service" },
];

const campaignLinks = [{ to: "/campaign-outreach/cms/amar-hishab-benefits", labelKey: "nav.amarHishab" }];

export function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-indigo-600">{t("app.title")}</h1>
      </div>
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{t("nav.dashboard")}</p>
          <nav className="space-y-1">
            <SidebarLink to="/">{t("nav.dashboard")}</SidebarLink>
          </nav>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{t("nav.cms")}</p>
          <nav className="space-y-1">
            {cmsLinks.map((link) => (
              <SidebarLink key={link.to} to={link.to}>
                {t(link.labelKey)}
              </SidebarLink>
            ))}
          </nav>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{t("nav.campaign")}</p>
          <nav className="space-y-1">
            {campaignLinks.map((link) => (
              <SidebarLink key={link.to} to={link.to}>
                {t(link.labelKey)}
              </SidebarLink>
            ))}
          </nav>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{t("nav.activity")}</p>
          <nav className="space-y-1">
            <SidebarLink to="/activity">{t("nav.activity")}</SidebarLink>
          </nav>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "block rounded-md px-3 py-2 text-sm font-medium",
          isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
        )
      }
    >
      {children}
    </NavLink>
  );
}
