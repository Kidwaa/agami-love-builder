import React from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useTranslation } from "@/vendor/react-i18next";

interface DeleteDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ open, onConfirm, onCancel }: DeleteDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      onConfirm={onConfirm}
      onCancel={onCancel}
      title={t("actions.delete")}
      description={t("confirm.delete")}
      confirmLabel={t("actions.delete")}
      cancelLabel={t("actions.cancel")}
    />
  );
}
