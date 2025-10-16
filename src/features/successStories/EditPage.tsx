import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { successStoryRepo } from "./repo";
import { publishSuccessStory } from "./publish";
import { useTranslation } from "@/vendor/react-i18next";
import { useRole } from "@/app/RoleContext";
import { usePageActions } from "@/app/PageActionsContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePicker } from "@/components/ImagePicker";
import { RichTextEditor } from "@toast-ui/react-editor";
import { FormActions } from "@/components/FormActions";
import { toast } from "sonner";
import { PublishDialog } from "@/components/PublishDialog";
import { PhonePreview } from "@/components/PhonePreview";
import { getLatestSnapshot } from "@/mocks/publish";
import { Button } from "@/components/ui/button";
import { LanguageTabs } from "@/components/LanguageTabs";

const storySchema = z.object({
  titleImageUrl: z.string().url("Required"),
  homeImageUrl: z.string().url("Required"),
  contentEn: z.string().min(1, "Required"),
  contentBn: z.string().min(1, "Required"),
});

type StoryFormValues = z.infer<typeof storySchema>;

export function SuccessStoryPage() {
  const { t } = useTranslation();
  const { isViewer } = useRole();
  const { setPublishAction } = usePageActions();
  const queryClient = useQueryClient();
  const storyQuery = useQuery({ queryKey: ["success-story"], queryFn: () => successStoryRepo.get() });
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      titleImageUrl: "",
      homeImageUrl: "",
      contentEn: "",
      contentBn: "",
    },
  });

  React.useEffect(() => {
    if (storyQuery.data) {
      form.reset({
        titleImageUrl: storyQuery.data.titleImageUrl,
        homeImageUrl: storyQuery.data.homeImageUrl,
        contentEn: storyQuery.data.contentEn,
        contentBn: storyQuery.data.contentBn,
      });
    }
  }, [storyQuery.data, form]);

  React.useEffect(() => {
    setPublishAction({
      label: t("actions.publish"),
      onClick: () => setPublishOpen(true),
      disabled: isViewer,
    });
    return () => setPublishAction(undefined);
  }, [setPublishAction, isViewer, t]);

  const handleSaveDraft = form.handleSubmit(async (values) => {
    await successStoryRepo.save({ ...values });
    await queryClient.invalidateQueries({ queryKey: ["success-story"] });
    toast.success(t("toast.saved"));
  });

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await successStoryRepo.save(form.getValues());
      const snapshot = await publishSuccessStory();
      toast.success(t("toast.published", { version: snapshot.version }));
      setPublishOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("toast.error"));
    } finally {
      setIsPublishing(false);
    }
  };

  const values = form.watch();

  const preview = (
    <div className="space-y-3 text-sm">
      {values.homeImageUrl ? (
        <div className="overflow-hidden rounded-md border border-slate-200">
          <img src={values.homeImageUrl} alt="Home" className="h-48 w-full object-cover" />
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="font-semibold">Success Story</p>
        <div className="text-xs text-slate-600" dangerouslySetInnerHTML={{ __html: values.contentEn }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <FormActions
        onSaveDraft={handleSaveDraft}
        onPublish={() => setPublishOpen(true)}
        disabled={isViewer}
        isDirty={form.formState.isDirty}
        isPublishing={isPublishing}
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <form className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSaveDraft}>
          <div className="grid gap-4 md:grid-cols-2">
            <ImagePicker label="Title Image" value={values.titleImageUrl} onChange={(val) => form.setValue("titleImageUrl", val, { shouldDirty: true })} />
            <ImagePicker label="Home Image" value={values.homeImageUrl} onChange={(val) => form.setValue("homeImageUrl", val, { shouldDirty: true })} />
          </div>
          <LanguageTabs
            render={(lang) => (
              <div>
                <RichTextEditor
                  label={lang === "en" ? "Content (English)" : "Content (Bangla)"}
                  value={lang === "en" ? values.contentEn : values.contentBn}
                  onChange={(val) =>
                    form.setValue(lang === "en" ? "contentEn" : "contentBn", val, { shouldDirty: true })
                  }
                />
                {lang === "en" && form.formState.errors.contentEn ? (
                  <p className="text-xs text-red-600">{form.formState.errors.contentEn.message}</p>
                ) : null}
                {lang === "bn" && form.formState.errors.contentBn ? (
                  <p className="text-xs text-red-600">{form.formState.errors.contentBn.message}</p>
                ) : null}
              </div>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isViewer}>
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={isViewer}>
              {t("actions.save")}
            </Button>
          </div>
        </form>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <PhonePreview title={t("preview.success")}>{preview}</PhonePreview>
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={handlePublish}
        payload={{
          titleImageUrl: values.titleImageUrl,
          homeImageUrl: values.homeImageUrl,
          contentEn: values.contentEn,
          contentBn: values.contentBn,
        }}
        version={(getLatestSnapshot("SUCCESS_STORY")?.version ?? 0) + 1}
        title={t("confirm.publish")}
        preview={preview}
      />
    </div>
  );
}
