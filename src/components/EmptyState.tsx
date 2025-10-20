import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/vendor/react-i18next";

interface EmptyStateProps {
  title?: string;
  onAction: () => void;
  actionLabel?: string;
  disabled?: boolean;
}

export function EmptyState({ title, onAction, actionLabel, disabled }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="mb-4 text-sm text-slate-500">{title ?? t("empty.default")}</p>
      <Button onClick={onAction} disabled={disabled}>
        {actionLabel ?? t("empty.cta")}
      </Button>
    </div>
  );
}
