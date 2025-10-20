import { Button } from "@/components/ui/button";
import { useTranslation } from "@/vendor/react-i18next";
import { usePageActions } from "@/app/PageActionsContext";
import { useRole } from "@/app/RoleContext";

export function TopBar() {
  const { t, i18n } = useTranslation();
  const { publishAction } = usePageActions();
  const { role, setRole, isViewer } = useRole();

  const handleLanguageChange = (lang: "en" | "bn") => {
    void i18n.changeLanguage(lang);
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <p className="text-xs uppercase text-slate-500">{t("topbar.workspace")}</p>
        <p className="text-lg font-semibold text-slate-900">Agami Demo Workspace</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500">{t("topbar.language")}</span>
          <Button size="sm" variant={i18n.language === "en" ? "default" : "outline"} onClick={() => handleLanguageChange("en")}>
            EN
          </Button>
          <Button size="sm" variant={i18n.language === "bn" ? "default" : "outline"} onClick={() => handleLanguageChange("bn")}>
            BN
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500">{t("topbar.role")}</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value === "ADMIN" ? "ADMIN" : "VIEWER")}
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
          >
            <option value="ADMIN">{t("role.admin")}</option>
            <option value="VIEWER">{t("role.viewer")}</option>
          </select>
        </div>
        {publishAction ? (
          <Button onClick={publishAction.onClick} disabled={publishAction.disabled || isViewer}>
            {t("actions.publish")}
          </Button>
        ) : null}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          JD
        </div>
      </div>
    </header>
  );
}
