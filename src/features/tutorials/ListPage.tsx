import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tutorialsRepo } from "./repo";
import { publishTutorials } from "./publish";
import { TutorialVideo } from "@/types";
import { useTranslation } from "@/vendor/react-i18next";
import { usePageActions } from "@/app/PageActionsContext";
import { useRole } from "@/app/RoleContext";
import { FormActions } from "@/components/FormActions";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/SortableList";
import { uuid } from "@/utils/uuid";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PublishDialog } from "@/components/PublishDialog";
import { getLatestSnapshot } from "@/mocks/publish";
import { PhonePreview } from "@/components/PhonePreview";
import { EmptyState } from "@/components/EmptyState";
import { LanguageTabs } from "@/components/LanguageTabs";

const primarySchema = z.object({
  titleEn: z.string().min(1, "Required"),
  titleBn: z.string().min(1, "Required"),
  videoUrl: z
    .string()
    .url("Valid URL")
    .refine((value) => value.toLowerCase().endsWith(".mp4"), "MP4 link required"),
});

const genericSchema = primarySchema;

type PrimaryFormValues = z.infer<typeof primarySchema>;
type GenericFormValues = z.infer<typeof genericSchema>;

export function TutorialsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { setPublishAction } = usePageActions();
  const { isViewer } = useRole();

  const tutorialsQuery = useQuery({ queryKey: ["tutorials"], queryFn: () => tutorialsRepo.list() });
  const [primary, setPrimary] = React.useState<TutorialVideo | null>(null);
  const [generics, setGenerics] = React.useState<TutorialVideo[]>([]);
  const [isDirty, setIsDirty] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [editingGeneric, setEditingGeneric] = React.useState<TutorialVideo | null>(null);

  React.useEffect(() => {
    if (tutorialsQuery.data) {
      const prim = tutorialsQuery.data.find((video) => video.kind === "PRIMARY") ?? null;
      const genericItems = tutorialsQuery.data
        .filter((video) => video.kind === "GENERIC")
        .sort((a, b) => a.orderIndex - b.orderIndex);
      setPrimary(prim);
      setGenerics(genericItems);
      setIsDirty(false);
    }
  }, [tutorialsQuery.data]);

  React.useEffect(() => {
    setPublishAction({
      label: t("actions.publish"),
      onClick: () => setPublishOpen(true),
      disabled: isViewer || !primary,
    });
    return () => setPublishAction(undefined);
  }, [setPublishAction, primary, isViewer, t]);

  const primaryForm = useForm<PrimaryFormValues>({
    resolver: zodResolver(primarySchema),
    defaultValues: {
      titleEn: "",
      titleBn: "",
      videoUrl: "",
    },
  });

  React.useEffect(() => {
    if (primary) {
      primaryForm.reset({
        titleEn: primary.titleEn,
        titleBn: primary.titleBn,
        videoUrl: primary.videoUrl,
      });
    }
  }, [primary, primaryForm]);

  const handleSavePrimary = primaryForm.handleSubmit((values) => {
    const now = new Date().toISOString();
    const updated: TutorialVideo = {
      id: primary?.id ?? uuid(),
      kind: "PRIMARY",
      titleEn: values.titleEn,
      titleBn: values.titleBn,
      videoUrl: values.videoUrl,
      isActive: true,
      orderIndex: 0,
      createdAt: primary?.createdAt ?? now,
      updatedAt: now,
      updatedBy: "Demo User",
    };
    setPrimary(updated);
    setIsDirty(true);
  });

  const handleAddGeneric = () => {
    const now = new Date().toISOString();
    const newItem: TutorialVideo = {
      id: uuid(),
      kind: "GENERIC",
      titleEn: "",
      titleBn: "",
      videoUrl: "",
      isActive: true,
      orderIndex: generics.length,
      createdAt: now,
      updatedAt: now,
      updatedBy: "Demo User",
    };
    setGenerics((prev) => [...prev, newItem]);
    setEditingGeneric(newItem);
    setIsDirty(true);
  };

  const handleReorder = (ids: string[]) => {
    const reordered = ids
      .map((id) => generics.find((item) => item.id === id))
      .filter((item): item is TutorialVideo => Boolean(item))
      .map((item, index) => ({ ...item, orderIndex: index }));
    setGenerics(reordered);
    setIsDirty(true);
  };

  const handleDelete = (id: string) => {
    setGenerics((prev) => prev.filter((item) => item.id !== id));
    setIsDirty(true);
  };

  const editForm = useForm<GenericFormValues>({
    resolver: zodResolver(genericSchema),
    defaultValues: { titleEn: "", titleBn: "", videoUrl: "" },
  });

  React.useEffect(() => {
    if (editingGeneric) {
      editForm.reset({
        titleEn: editingGeneric.titleEn,
        titleBn: editingGeneric.titleBn,
        videoUrl: editingGeneric.videoUrl,
      });
    }
  }, [editingGeneric, editForm]);

  const submitGeneric = editForm.handleSubmit((values) => {
    if (!editingGeneric) return;
    const now = new Date().toISOString();
    setGenerics((prev) =>
      prev.map((item) =>
        item.id === editingGeneric.id
          ? {
              ...item,
              titleEn: values.titleEn,
              titleBn: values.titleBn,
              videoUrl: values.videoUrl,
              updatedAt: now,
              updatedBy: "Demo User",
            }
          : item
      )
    );
    setEditingGeneric(null);
    setIsDirty(true);
  });

  const handleSaveDraft = async () => {
    if (!primary) {
      toast.error(t("toast.error"));
      return;
    }
    const items: TutorialVideo[] = [
      { ...primary, orderIndex: 0 },
      ...generics.map((item, index) => ({ ...item, kind: "GENERIC", orderIndex: index })),
    ];
    await tutorialsRepo.replaceAll(items);
    await queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    toast.success(t("toast.saved"));
    setIsDirty(false);
  };

  const handlePublish = async () => {
    if (!primary || !primary.titleEn || !primary.titleBn || !primary.videoUrl) {
      toast.error("Primary tutorial must be complete");
      return;
    }
    if (generics.some((item) => !item.titleEn || !item.titleBn || !item.videoUrl)) {
      toast.error("Generic tutorials require titles and video links");
      return;
    }
    try {
      setIsPublishing(true);
      await tutorialsRepo.replaceAll([
        { ...primary, orderIndex: 0 },
        ...generics.map((item, index) => ({ ...item, orderIndex: index })),
      ]);
      const snapshot = await publishTutorials();
      toast.success(t("toast.published", { version: snapshot.version }));
      setPublishOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("toast.error"));
    } finally {
      setIsPublishing(false);
    }
  };

  const preview = (
    <div className="space-y-3">
      {primary ? (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm">
          <p className="font-semibold text-indigo-700">{primary.titleEn}</p>
          <p className="text-xs text-indigo-600">{primary.titleBn}</p>
        </div>
      ) : null}
      {generics.map((item) => (
        <div key={item.id} className="rounded border border-slate-200 p-2 text-sm">
          <p className="font-medium text-slate-700">{item.titleEn}</p>
          <p className="text-xs text-slate-500">{item.titleBn}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <FormActions
        onSaveDraft={handleSaveDraft}
        onPublish={() => setPublishOpen(true)}
        disabled={isViewer}
        isDirty={isDirty}
        isPublishing={isPublishing}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Primary Tutorial</h2>
            <form className="mt-4 space-y-4" onSubmit={handleSavePrimary}>
              <LanguageTabs
                render={(lang) => (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">
                      {lang === "en" ? "Title (English)" : "Title (Bangla)"}
                    </label>
                    <Input {...primaryForm.register(lang === "en" ? "titleEn" : "titleBn")} disabled={isViewer} />
                    {lang === "en" && primaryForm.formState.errors.titleEn ? (
                      <p className="text-xs text-red-600">{primaryForm.formState.errors.titleEn.message}</p>
                    ) : null}
                    {lang === "bn" && primaryForm.formState.errors.titleBn ? (
                      <p className="text-xs text-red-600">{primaryForm.formState.errors.titleBn.message}</p>
                    ) : null}
                  </div>
                )}
              />
              <div>
                <label className="text-xs font-medium text-slate-500">Video URL</label>
                <Input {...primaryForm.register("videoUrl")} disabled={isViewer} placeholder="https://...mp4" />
                {primaryForm.formState.errors.videoUrl ? (
                  <p className="text-xs text-red-600">{primaryForm.formState.errors.videoUrl.message}</p>
                ) : null}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isViewer}>
                  {t("actions.save")}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Generic Tutorials</h2>
              <Button onClick={handleAddGeneric} disabled={isViewer}>
                {t("actions.add")}
              </Button>
            </div>
            {generics.length === 0 ? (
              <EmptyState onAction={handleAddGeneric} disabled={isViewer} />
            ) : (
              <SortableList
                items={generics}
                onReorder={handleReorder}
                isDisabled={isViewer}
                renderItem={(item) => (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{item.titleEn || "Untitled"}</p>
                    <p className="text-xs text-slate-500">{item.titleBn}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingGeneric(item)} disabled={isViewer}>
                        {t("actions.edit")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} disabled={isViewer}>
                        {t("actions.delete")}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">{item.videoUrl}</p>
                  </div>
                )}
              />
            )}
          </section>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <PhonePreview title={t("preview.tutorials")}>{preview}</PhonePreview>
        </div>
      </div>

      <Dialog open={Boolean(editingGeneric)} onOpenChange={(open) => (!open ? setEditingGeneric(null) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.edit")}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submitGeneric}>
            <LanguageTabs
              render={(lang) => (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">
                    {lang === "en" ? "Title (English)" : "Title (Bangla)"}
                  </label>
                  <Input {...editForm.register(lang === "en" ? "titleEn" : "titleBn")} />
                  {lang === "en" && editForm.formState.errors.titleEn ? (
                    <p className="text-xs text-red-600">{editForm.formState.errors.titleEn.message}</p>
                  ) : null}
                  {lang === "bn" && editForm.formState.errors.titleBn ? (
                    <p className="text-xs text-red-600">{editForm.formState.errors.titleBn.message}</p>
                  ) : null}
                </div>
              )}
            />
            <div>
              <label className="text-xs font-medium text-slate-500">Video URL</label>
              <Input {...editForm.register("videoUrl")} placeholder="https://...mp4" />
              {editForm.formState.errors.videoUrl ? (
                <p className="text-xs text-red-600">{editForm.formState.errors.videoUrl.message}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingGeneric(null)}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit">{t("actions.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={handlePublish}
        payload={{
          primary: primary ? { titleEn: primary.titleEn, titleBn: primary.titleBn, videoUrl: primary.videoUrl } : null,
          generic: generics.map(({ titleEn, titleBn, videoUrl, orderIndex }) => ({ titleEn, titleBn, videoUrl, orderIndex })),
        }}
        version={(getLatestSnapshot("TUTORIAL")?.version ?? 0) + 1}
        title={t("confirm.publish")}
        preview={preview}
      />
    </div>
  );
}
