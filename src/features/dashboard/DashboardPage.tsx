import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/vendor/react-i18next";
import { loginCarouselRepo } from "@/features/loginCarousel/repo";
import { guestCarouselRepo } from "@/features/guestCarousel/repo";
import { tutorialsRepo } from "@/features/tutorials/repo";
import { successStoryRepo } from "@/features/successStories/repo";
import { shebaTilesRepo, getShebaHeader } from "@/features/sheba/repo";
import { serviceCatalogRepo } from "@/features/serviceCatalog/repo";
import { getLatestSnapshot } from "@/mocks/publish";
import { listActivity } from "@/mocks/activity";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  name: string;
  count: number;
  lastEditedAt?: string;
  lastPublished?: string;
  lastPublishedVersion?: number;
  openTo: string;
}

function DashboardCard({ name, count, lastEditedAt, lastPublished, lastPublishedVersion, openTo }: DashboardCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500">{count} items</p>
        </div>
        <Link to={openTo}>
          <Button size="sm" variant="outline">
            Open
          </Button>
        </Link>
      </div>
      <dl className="mt-4 space-y-2 text-xs text-slate-500">
        {lastEditedAt ? (
          <div className="flex justify-between">
            <dt>Last edited</dt>
            <dd>{new Date(lastEditedAt).toLocaleString()}</dd>
          </div>
        ) : null}
        {lastPublished ? (
          <div className="flex justify-between">
            <dt>Last published</dt>
            <dd>
              {new Date(lastPublished).toLocaleString()} {lastPublishedVersion ? `(v${lastPublishedVersion})` : null}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const moduleQuery = useQuery({
    queryKey: ["dashboard", "modules"],
    queryFn: async () => {
      const [loginItems, guestItems, tutorials, successStory, shebaTiles, shebaHeader, serviceCards] = await Promise.all([
        loginCarouselRepo.list(),
        guestCarouselRepo.list(),
        tutorialsRepo.list(),
        successStoryRepo.get(),
        shebaTilesRepo.list(),
        getShebaHeader(),
        serviceCatalogRepo.list(),
      ]);

      return {
        login: {
          name: t("nav.loginCarousel"),
          count: loginItems.length,
          lastEditedAt: loginItems[0]?.updatedAt,
          lastPublished: getLatestSnapshot("LOGIN_CAROUSEL")?.publishedAt,
          lastPublishedVersion: getLatestSnapshot("LOGIN_CAROUSEL")?.version,
          openTo: "/cms/login-carousel",
        },
        guest: {
          name: t("nav.guestCarousel"),
          count: guestItems.length,
          lastEditedAt: guestItems[0]?.updatedAt,
          lastPublished: getLatestSnapshot("GUEST_CAROUSEL")?.publishedAt,
          lastPublishedVersion: getLatestSnapshot("GUEST_CAROUSEL")?.version,
          openTo: "/cms/guest-carousel",
        },
        tutorials: {
          name: t("nav.tutorials"),
          count: tutorials.length,
          lastEditedAt: tutorials[0]?.updatedAt,
          lastPublished: getLatestSnapshot("TUTORIAL")?.publishedAt,
          lastPublishedVersion: getLatestSnapshot("TUTORIAL")?.version,
          openTo: "/cms/tutorials",
        },
        success: {
          name: t("nav.success"),
          count: successStory ? 1 : 0,
          lastEditedAt: successStory?.updatedAt,
          lastPublished: getLatestSnapshot("SUCCESS_STORY")?.publishedAt,
          lastPublishedVersion: getLatestSnapshot("SUCCESS_STORY")?.version,
          openTo: "/cms/success-stories",
        },
        sheba: {
          name: t("nav.sheba"),
          count: shebaTiles.length,
          lastEditedAt: shebaTiles[0]?.updatedAt || shebaHeader?.titleEn ? new Date().toISOString() : undefined,
          lastPublished: getLatestSnapshot("SHEBA")?.publishedAt,
          lastPublishedVersion: getLatestSnapshot("SHEBA")?.version,
          openTo: "/cms/sheba",
        },
        service: {
          name: t("nav.service"),
          count: serviceCards.length,
          lastEditedAt: serviceCards[0]?.updatedAt,
          lastPublished: getLatestSnapshot("SERVICE_CONFIG")?.publishedAt,
          lastPublishedVersion: getLatestSnapshot("SERVICE_CONFIG")?.version,
          openTo: "/cms/service-catalog",
        },
      };
    },
  });

  const activityQuery = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => listActivity(1, 5),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {moduleQuery.data
          ? Object.entries(moduleQuery.data).map(([key, value]) => (
              <DashboardCard key={key} {...value} />
            ))
          : null}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.recent")}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">{t("table.action")}</th>
                <th className="px-4 py-2">{t("table.entity")}</th>
                <th className="px-4 py-2">{t("table.when")}</th>
                <th className="px-4 py-2">{t("table.note")}</th>
              </tr>
            </thead>
            <tbody>
              {activityQuery.data?.data.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-medium">{entry.action}</td>
                  <td className="px-4 py-2">{entry.entityType}</td>
                  <td className="px-4 py-2">{new Date(entry.when).toLocaleString()}</td>
                  <td className="px-4 py-2">{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
