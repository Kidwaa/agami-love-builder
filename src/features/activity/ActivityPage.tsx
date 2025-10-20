import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listActivity } from "@/mocks/activity";
import { useTranslation } from "@/vendor/react-i18next";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export function ActivityPage() {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<string>("ALL");
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["activity", page, filter],
    queryFn: () => listActivity(page, PAGE_SIZE, filter === "ALL" ? undefined : (filter as any)),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  React.useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: ["activity", page + 1, filter],
      queryFn: () => listActivity(page + 1, PAGE_SIZE, filter === "ALL" ? undefined : (filter as any)),
    });
  }, [page, filter, queryClient]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">{t("activity.filter")}</label>
          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
          >
            <option value="ALL">{t("activity.all")}</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="REORDER">REORDER</option>
            <option value="PUBLISH">PUBLISH</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
            Prev
          </Button>
          <span className="text-sm text-slate-600">
            {page} / {totalPages || 1}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">{t("table.action")}</th>
              <th className="px-4 py-2">{t("table.entity")}</th>
              <th className="px-4 py-2">{t("table.when")}</th>
              <th className="px-4 py-2">{t("table.note")}</th>
              <th className="px-4 py-2">{t("table.details")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-100">
                <td className="px-4 py-2 font-medium">{entry.action}</td>
                <td className="px-4 py-2">{entry.entityType}</td>
                <td className="px-4 py-2">{new Date(entry.when).toLocaleString()}</td>
                <td className="px-4 py-2">{entry.note}</td>
                <td className="px-4 py-2">
                  {entry.before || entry.after ? (
                    <details>
                      <summary className="cursor-pointer text-xs text-indigo-600">
                        {t("table.viewDelta")}
                      </summary>
                      <div className="mt-2 space-y-2 text-xs">
                        {entry.before ? (
                          <div>
                            <p className="font-semibold">{t("table.before")}</p>
                            <pre className="max-h-32 overflow-auto rounded bg-slate-900 p-2 text-slate-100">
                              {JSON.stringify(entry.before, null, 2)}
                            </pre>
                          </div>
                        ) : null}
                        {entry.after ? (
                          <div>
                            <p className="font-semibold">{t("table.after")}</p>
                            <pre className="max-h-32 overflow-auto rounded bg-slate-900 p-2 text-slate-100">
                              {JSON.stringify(entry.after, null, 2)}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  ) : (
                    <span className="text-xs text-slate-400">{t("table.noDelta")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
