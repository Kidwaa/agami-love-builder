import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/vendor/react-i18next";

interface FormActionsProps {
  disabled?: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  isDirty?: boolean;
  isPublishing?: boolean;
}

export function FormActions({ disabled, onSaveDraft, onPublish, isDirty, isPublishing }: FormActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => void onSaveDraft()} disabled={disabled || !isDirty} variant="outline">
        {t("actions.save")}
      </Button>
      <Button onClick={() => void onPublish()} disabled={disabled || isPublishing}>
        {isPublishing ? `${t("actions.publish")}…` : t("actions.publish")}
      </Button>
    </div>
  );
}
