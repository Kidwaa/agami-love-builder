import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhonePreview } from "@/components/PhonePreview";
import { useTranslation } from "@/vendor/react-i18next";
import { cn } from "@/utils/cn";

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  preview: React.ReactNode;
  payload: unknown;
  version: number;
  title: string;
  subtitle?: string;
}

export function PublishDialog({ open, onClose, onConfirm, preview, payload, version, title, subtitle }: PublishDialogProps) {
  const { t } = useTranslation();
  const [viewJson, setViewJson] = React.useState(false);

  const json = React.useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">
              {subtitle ?? `${t("publish.summary")} ${t("publish.version")} ${version}`}
            </p>
            {subtitle ? (
              <p className="text-xs text-slate-500">
                {t("publish.summary")} {t("publish.version")} {version}
              </p>
            ) : null}
          </div>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <PhonePreview title={t("label.mobilePreview")}>{preview}</PhonePreview>
          </div>
          <div className="space-y-3">
            <Button variant="outline" onClick={() => setViewJson((prev) => !prev)}>
              {viewJson ? t("actions.close") : t("actions.viewJson")}
            </Button>
            <pre className={cn("max-h-[420px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100", viewJson ? "block" : "hidden md:block")}>{json}</pre>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={onConfirm}>{t("actions.publish")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
