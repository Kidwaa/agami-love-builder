import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/vendor/react-i18next";
import { useRole } from "@/app/RoleContext";
import { usePageActions } from "@/app/PageActionsContext";
import { amarHishabRepo } from "./repo";
import { publishAmarHishabBenefits } from "./publish";
import { FormActions } from "@/components/FormActions";
import { ImagePicker } from "@/components/ImagePicker";
import { LanguageTabs } from "@/components/LanguageTabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { PublishDialog } from "@/components/PublishDialog";
import { AmarHishabPreview } from "./Preview";
import { sanitizeRichText, containsInvalidLinks, richTextLength } from "@/utils/richText";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { toast } from "sonner";
import { getLatestSnapshot } from "@/mocks/publish";
import { Input } from "@/components/ui/input";

const IMAGE_MESSAGE = "Must be a JPG or PNG URL";

const richTextSchema = (maxLength?: number) =>
  z
    .string()
    .min(1, "Required")
    .superRefine((value, ctx) => {
      const sanitized = sanitizeRichText(value);
      const length = richTextLength(sanitized);
      if (typeof maxLength === "number" && length > maxLength) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Must be ${maxLength} characters or fewer` });
      }
      if (containsInvalidLinks(sanitized)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Links must be http or https" });
      }
    });

const formSchema = z.object({
  titleEn: z.string().min(1, "Required"),
  titleBn: z.string().min(1, "Required"),
  landingImageUrl: z.string().url("Valid URL required").refine((value) => /\.(jpe?g|png)$/i.test(value), {
    message: IMAGE_MESSAGE,
  }),
  summaryEn: richTextSchema(300),
  summaryBn: richTextSchema(300),
  detailTitleImageUrl: z.string().url("Valid URL required").refine((value) => /\.(jpe?g|png)$/i.test(value), {
    message: IMAGE_MESSAGE,
  }),
  detailEn: richTextSchema(),
  detailBn: richTextSchema(),
});

export type AmarHishabFormValues = z.infer<typeof formSchema>;

export function AmarHishabBenefitsPage() {
  const { t } = useTranslation();
  const { isViewer } = useRole();
  const { setPublishAction } = usePageActions();
  const queryClient = useQueryClient();
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [landingUploadProgress, setLandingUploadProgress] = React.useState(100);
  const [detailUploadProgress, setDetailUploadProgress] = React.useState(100);

  const recordQuery = useQuery({ queryKey: ["amar-hishab"], queryFn: () => amarHishabRepo.get() });

  const form = useForm<AmarHishabFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      titleEn: "",
      titleBn: "",
      landingImageUrl: "",
      summaryEn: "",
      summaryBn: "",
      detailTitleImageUrl: "",
      detailEn: "",
      detailBn: "",
    },
    shouldFocusError: false,
  });

  React.useEffect(() => {
    if (recordQuery.data) {
      form.reset({
        titleEn: recordQuery.data.titleEn,
        titleBn: recordQuery.data.titleBn,
        landingImageUrl: recordQuery.data.landingImageUrl,
        summaryEn: recordQuery.data.summaryEn,
        summaryBn: recordQuery.data.summaryBn,
        detailTitleImageUrl: recordQuery.data.detailTitleImageUrl,
        detailEn: recordQuery.data.detailEn,
        detailBn: recordQuery.data.detailBn,
      });
      void form.trigger();
    }
  }, [recordQuery.data, form]);

  React.useEffect(() => {
    return () => setPublishAction(undefined);
  }, [setPublishAction]);

  const watchAll = form.watch();
  const debouncedValues = useDebouncedValue(watchAll, 300);

  const summaryRemainingEn = Math.max(0, 300 - richTextLength(sanitizeRichText(watchAll.summaryEn ?? "")));
  const summaryRemainingBn = Math.max(0, 300 - richTextLength(sanitizeRichText(watchAll.summaryBn ?? "")));

  const triggerUpload = React.useCallback((setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(5);
    let progress = 5;
    const interval = setInterval(() => {
      progress += 20;
      setter((current) => {
        const next = Math.min(100, progress);
        return next;
      });
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 120);
  }, []);

  const handleLandingChange = (value: string) => {
    form.setValue("landingImageUrl", value, { shouldDirty: true, shouldValidate: true });
    triggerUpload(setLandingUploadProgress);
  };

  const handleDetailImageChange = (value: string) => {
    form.setValue("detailTitleImageUrl", value, { shouldDirty: true, shouldValidate: true });
    triggerUpload(setDetailUploadProgress);
  };

  const handleRichChange = (field: keyof Pick<AmarHishabFormValues, "summaryEn" | "summaryBn" | "detailEn" | "detailBn">) =>
    (value: string) => {
      const sanitized = sanitizeRichText(value);
      form.setValue(field, sanitized, { shouldDirty: true, shouldValidate: true });
    };

  const saveDraft = form.handleSubmit(async (values) => {
    if (isViewer) return;
    await amarHishabRepo.save(values);
    await queryClient.invalidateQueries({ queryKey: ["amar-hishab"] });
    toast.success(t("toast.saved"));
  });

  const openPublish = React.useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) {
      toast.error(t("amarHishab.validationError"));
      return;
    }
    if (landingUploadProgress < 100 || detailUploadProgress < 100) {
      toast.error(t("amarHishab.uploadInProgress"));
      return;
    }
    setPublishOpen(true);
  }, [form, landingUploadProgress, detailUploadProgress, t]);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const values = form.getValues();
      await amarHishabRepo.save(values);
      const snapshot = await publishAmarHishabBenefits();
      toast.success(t("toast.published", { version: snapshot.version }));
      setPublishOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("toast.error"));
    } finally {
      setIsPublishing(false);
    }
  };

  const publishDisabled =
    isViewer ||
    !form.formState.isValid ||
    landingUploadProgress < 100 ||
    detailUploadProgress < 100 ||
    isPublishing;

  React.useEffect(() => {
    if (isViewer) {
      setPublishAction(undefined);
      return;
    }
    setPublishAction({
      label: t("actions.publish"),
      onClick: openPublish,
      disabled: publishDisabled,
    });
  }, [setPublishAction, publishDisabled, isViewer, t, openPublish]);

  const errors = React.useMemo(() => {
    const collect = (error: unknown): string[] => {
      if (!error || typeof error !== "object") return [];
      if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
        return [(error as { message: string }).message];
      }
      return Object.values(error as Record<string, unknown>).flatMap((value) => collect(value));
    };
    return Array.from(new Set(collect(form.formState.errors)));
  }, [form.formState.errors]);

  if (isViewer) {
    return (
      <div className="rounded-lg border border-rose-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-rose-600">{t("amarHishab.accessDenied")}</h2>
        <p className="mt-2 text-sm text-slate-600">{t("amarHishab.accessDeniedHelper")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormActions
        onSaveDraft={saveDraft}
        onPublish={openPublish}
        disabled={isViewer || !form.formState.isValid}
        isDirty={form.formState.isDirty}
        isPublishing={isPublishing}
      />

      {errors.length ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
          <p className="font-semibold">{t("amarHishab.errorSummary")}</p>
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <form className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={saveDraft}>
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">{t("amarHishab.sectionTitles")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="titleEn">
                  {t("amarHishab.titleEn")}
                </label>
                <Input id="titleEn" type="text" {...form.register("titleEn")}
                  className="mt-1" />
                {form.formState.errors.titleEn ? (
                  <p className="text-xs text-red-600">{form.formState.errors.titleEn.message}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="titleBn">
                  {t("amarHishab.titleBn")}
                </label>
                <Input id="titleBn" type="text" {...form.register("titleBn")} className="mt-1" />
                {form.formState.errors.titleBn ? (
                  <p className="text-xs text-red-600">{form.formState.errors.titleBn.message}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">{t("amarHishab.sectionLanding")}</h2>
            <ImagePicker
              label={t("amarHishab.landingImage")}
              description={t("amarHishab.imageHint")}
              value={watchAll.landingImageUrl}
              onChange={handleLandingChange}
            />
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${landingUploadProgress}%` }}
                aria-label={t("amarHishab.landingProgress")}
              />
            </div>
            {landingUploadProgress < 100 ? (
              <p className="text-xs text-slate-500">{t("amarHishab.uploading", { progress: landingUploadProgress })}</p>
            ) : null}
            {form.formState.errors.landingImageUrl ? (
              <p className="text-xs text-red-600">{form.formState.errors.landingImageUrl.message}</p>
            ) : null}
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">{t("amarHishab.sectionSummary")}</h2>
            <LanguageTabs
              render={(lang) => (
                <div className="space-y-2">
                  <RichTextEditor
                    label={lang === "en" ? t("amarHishab.summaryEn") : t("amarHishab.summaryBn")}
                    value={lang === "en" ? watchAll.summaryEn : watchAll.summaryBn}
                    onChange={handleRichChange(lang === "en" ? "summaryEn" : "summaryBn")}
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      {lang === "en" ? summaryRemainingEn : summaryRemainingBn} {t("amarHishab.charactersLeft")}
                    </span>
                    {lang === "en" && form.formState.errors.summaryEn ? (
                      <span className="text-red-600">{form.formState.errors.summaryEn.message}</span>
                    ) : null}
                    {lang === "bn" && form.formState.errors.summaryBn ? (
                      <span className="text-red-600">{form.formState.errors.summaryBn.message}</span>
                    ) : null}
                  </div>
                </div>
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">{t("amarHishab.sectionDetail")}</h2>
            <ImagePicker
              label={t("amarHishab.detailImage")}
              description={t("amarHishab.imageHint")}
              value={watchAll.detailTitleImageUrl}
              onChange={handleDetailImageChange}
            />
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${detailUploadProgress}%` }}
                aria-label={t("amarHishab.detailProgress")}
              />
            </div>
            {detailUploadProgress < 100 ? (
              <p className="text-xs text-slate-500">{t("amarHishab.uploading", { progress: detailUploadProgress })}</p>
            ) : null}
            {form.formState.errors.detailTitleImageUrl ? (
              <p className="text-xs text-red-600">{form.formState.errors.detailTitleImageUrl.message}</p>
            ) : null}
            <LanguageTabs
              render={(lang) => (
                <div className="space-y-2">
                  <RichTextEditor
                    label={lang === "en" ? t("amarHishab.detailEn") : t("amarHishab.detailBn")}
                    value={lang === "en" ? watchAll.detailEn : watchAll.detailBn}
                    onChange={handleRichChange(lang === "en" ? "detailEn" : "detailBn")}
                  />
                  {lang === "en" && form.formState.errors.detailEn ? (
                    <span className="text-xs text-red-600">{form.formState.errors.detailEn.message}</span>
                  ) : null}
                  {lang === "bn" && form.formState.errors.detailBn ? (
                    <span className="text-xs text-red-600">{form.formState.errors.detailBn.message}</span>
                  ) : null}
                </div>
              )}
            />
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset(recordQuery.data ?? form.getValues())}>
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={!form.formState.isDirty || !form.formState.isValid}>
              {t("actions.save")}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <AmarHishabPreview
            title={debouncedValues.titleEn}
            landingImageUrl={debouncedValues.landingImageUrl}
            summary={debouncedValues.summaryEn}
            detailTitleImageUrl={debouncedValues.detailTitleImageUrl}
            detail={debouncedValues.detailEn}
            localeLabel={t("amarHishab.previewEn")}
          />
          <AmarHishabPreview
            title={debouncedValues.titleBn}
            landingImageUrl={debouncedValues.landingImageUrl}
            summary={debouncedValues.summaryBn}
            detailTitleImageUrl={debouncedValues.detailTitleImageUrl}
            detail={debouncedValues.detailBn}
            localeLabel={t("amarHishab.previewBn")}
          />
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={handlePublish}
        preview={
          <div className="space-y-4">
            <AmarHishabPreview
              title={debouncedValues.titleEn}
              landingImageUrl={debouncedValues.landingImageUrl}
              summary={debouncedValues.summaryEn}
              detailTitleImageUrl={debouncedValues.detailTitleImageUrl}
              detail={debouncedValues.detailEn}
              localeLabel={t("amarHishab.previewEn")}
              framed={false}
            />
            <AmarHishabPreview
              title={debouncedValues.titleBn}
              landingImageUrl={debouncedValues.landingImageUrl}
              summary={debouncedValues.summaryBn}
              detailTitleImageUrl={debouncedValues.detailTitleImageUrl}
              detail={debouncedValues.detailBn}
              localeLabel={t("amarHishab.previewBn")}
              framed={false}
            />
          </div>
        }
        payload={{
          title: { en: watchAll.titleEn, bn: watchAll.titleBn },
          landingImageUrl: watchAll.landingImageUrl,
          summary: { en: watchAll.summaryEn, bn: watchAll.summaryBn },
          detailTitleImageUrl: watchAll.detailTitleImageUrl,
          detail: { en: watchAll.detailEn, bn: watchAll.detailBn },
        }}
        version={(getLatestSnapshot("AMAR_HISHAB_BENEFITS")?.version ?? 0) + 1}
        title={t("amarHishab.publishTitle")}
        subtitle={t("amarHishab.publishSubtitle")}
      />
    </div>
  );
}
