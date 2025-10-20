import React from "react";
import { PhonePreview } from "@/components/PhonePreview";
import { stripHtml } from "@/utils/richText";

interface AmarHishabPreviewProps {
  title: string;
  landingImageUrl: string;
  summary: string;
  detailTitleImageUrl: string;
  detail: string;
  localeLabel: string;
  framed?: boolean;
}

export function AmarHishabPreview({
  title,
  landingImageUrl,
  summary,
  detailTitleImageUrl,
  detail,
  localeLabel,
  framed = true,
}: AmarHishabPreviewProps) {
  const content = (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="h-40 w-full overflow-hidden">
        {landingImageUrl ? (
          <img src={landingImageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-200 text-xs text-slate-500">Landing image</div>
        )}
      </div>
      <div className="flex-1 space-y-3 p-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{stripHtml(summary)}</p>
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="h-32 overflow-hidden rounded-t-lg">
            {detailTitleImageUrl ? (
              <img src={detailTitleImageUrl} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-100 text-xs text-slate-500">Detail image</div>
            )}
          </div>
          <div className="space-y-2 p-3 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: detail }} />
        </div>
      </div>
    </div>
  );

  if (!framed) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-500">{localeLabel}</p>
        <div className="overflow-hidden rounded-xl border border-slate-200">{content}</div>
      </div>
    );
  }

  return <PhonePreview title={localeLabel}>{content}</PhonePreview>;
}
