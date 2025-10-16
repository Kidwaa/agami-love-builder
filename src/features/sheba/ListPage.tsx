import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getShebaHeader, shebaTilesRepo, updateShebaHeader } from "./repo";
import { publishSheba } from "./publish";
import { ShebaTile } from "@/types";
import { useTranslation } from "@/vendor/react-i18next";
import { usePageActions } from "@/app/PageActionsContext";
import { useRole } from "@/app/RoleContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/FormActions";
import { toast } from "sonner";
import { SortableList } from "@/components/SortableList";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RichTextEditor } from "@toast-ui/react-editor";
import { Textarea } from "@/components/ui/textarea";
import { uuid } from "@/utils/uuid";
import { PublishDialog } from "@/components/PublishDialog";
import { getLatestSnapshot } from "@/mocks/publish";
import { PhonePreview } from "@/components/PhonePreview";
import { ImagePicker } from "@/components/ImagePicker";
import { LanguageTabs } from "@/components/LanguageTabs";
import { EmptyState } from "@/components/EmptyState";

const headerSchema = z.object({
  titleEn: z.string().min(1, "Required"),
  titleBn: z.string().min(1, "Required"),
});

const tileSchema = z.object({
  titleImageUrl: z.string().url("Required"),
  homeImageUrl: z.string().url("Required"),
  detailEn: z.string().min(1, "Required"),
  detailBn: z.string().min(1, "Required"),
  visibilityRuleJson: z.string().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;
type TileFormValues = z.infer<typeof tileSchema>;

export function ShebaPage() {
  const { t } = useTranslation();
  const { setPublishAction } = usePageActions();
  const { isViewer } = useRole();
  const queryClient = useQueryClient();

  const headerQuery = useQuery({ queryKey: ["sheba-header"], queryFn: () => getShebaHeader() });
  const tilesQuery = useQuery({ queryKey: ["sheba-tiles"], queryFn: () => shebaTilesRepo.list() });

  const headerForm = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: { titleEn: "", titleBn: "" },
  });
  const [tiles, setTiles] = React.useState<ShebaTile[]>([]);
  const [isDirty, setIsDirty] = React.useState(false);
  const [editingTile, setEditingTile] = React.useState<ShebaTile | null>(null);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  React.useEffect(() => {
    if (headerQuery.data) {
      headerForm.reset(headerQuery.data);
    }
  }, [headerQuery.data, headerForm]);

  React.useEffect(() => {
    if (tilesQuery.data) {
      setTiles(tilesQuery.data.sort((a, b) => a.orderIndex - b.orderIndex));
    }
  }, [tilesQuery.data]);

  React.useEffect(() => {
    if (headerForm.formState.isDirty) {
      setIsDirty(true);
    }
  }, [headerForm.formState.isDirty]);

  React.useEffect(() => {
    setPublishAction({
      label: t("actions.publish"),
      onClick: () => setPublishOpen(true),
      disabled: isViewer,
    });
    return () => setPublishAction(undefined);
  }, [setPublishAction, isViewer, t]);

  const saveHeader = headerForm.handleSubmit(async (values) => {
    await updateShebaHeader(values);
    await queryClient.invalidateQueries({ queryKey: ["sheba-header"] });
    toast.success(t("toast.saved"));
  });

  const tileForm = useForm<TileFormValues>({
    resolver: zodResolver(tileSchema),
    defaultValues: { titleImageUrl: "", homeImageUrl: "", detailEn: "", detailBn: "", visibilityRuleJson: "" },
  });

  React.useEffect(() => {
    if (editingTile) {
      tileForm.reset({
        titleImageUrl: editingTile.titleImageUrl,
        homeImageUrl: editingTile.homeImageUrl,
        detailEn: editingTile.detailEn,
        detailBn: editingTile.detailBn,
        visibilityRuleJson: editingTile.visibilityRuleJson ?? "",
      });
    }
  }, [editingTile, tileForm]);

  const handleSaveTile = tileForm.handleSubmit((values) => {
    if (!editingTile) return;
    const now = new Date().toISOString();
    setTiles((prev) =>
      prev.map((tile) =>
        tile.id === editingTile.id
          ? {
              ...tile,
              titleImageUrl: values.titleImageUrl,
              homeImageUrl: values.homeImageUrl,
              detailEn: values.detailEn,
              detailBn: values.detailBn,
              visibilityRuleJson: values.visibilityRuleJson,
              updatedAt: now,
              updatedBy: "Demo User",
            }
          : tile
      )
    );
    setEditingTile(null);
    setIsDirty(true);
  });

  const handleAddTile = () => {
    const now = new Date().toISOString();
    const newTile: ShebaTile = {
      id: uuid(),
      titleImageUrl: "",
      homeImageUrl: "",
      detailEn: "",
      detailBn: "",
      visibilityRuleJson: "",
      isActive: true,
      orderIndex: tiles.length,
      createdAt: now,
      updatedAt: now,
      updatedBy: "Demo User",
    };
    setTiles((prev) => [...prev, newTile]);
    setEditingTile(newTile);
    setIsDirty(true);
  };

  const handleToggle = (id: string, isActive: boolean) => {
    setTiles((prev) => prev.map((tile) => (tile.id === id ? { ...tile, isActive } : tile)));
    setIsDirty(true);
  };

  const handleReorder = (ids: string[]) => {
    const reordered = ids
      .map((id) => tiles.find((tile) => tile.id === id))
      .filter((tile): tile is ShebaTile => Boolean(tile))
      .map((tile, index) => ({ ...tile, orderIndex: index }));
    setTiles(reordered);
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    await shebaTilesRepo.replaceAll(tiles);
    await queryClient.invalidateQueries({ queryKey: ["sheba-tiles"] });
    toast.success(t("toast.saved"));
    setIsDirty(false);
  };

  const handlePublish = async () => {
    if (!headerForm.getValues("titleEn") || !headerForm.getValues("titleBn")) {
      toast.error("Header titles required");
      return;
    }
    if (tiles.filter((tile) => tile.isActive).length === 0) {
      toast.error("At least one active tile required");
      return;
    }
    if (tiles.some((tile) => !tile.titleImageUrl || !tile.homeImageUrl || !tile.detailEn || !tile.detailBn)) {
      toast.error("Fill tile details before publishing");
      return;
    }
    try {
      setIsPublishing(true);
      await updateShebaHeader(headerForm.getValues());
      await shebaTilesRepo.replaceAll(tiles);
      const snapshot = await publishSheba();
      toast.success(t("toast.published", { version: snapshot.version }));
      setPublishOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("toast.error"));
    } finally {
      setIsPublishing(false);
    }
  };

  const headerValues = headerForm.watch();

  const preview = (
    <div className="space-y-4">
      <h3 className="text-center text-sm font-semibold">{headerValues.titleEn}</h3>
      {tiles
        .filter((tile) => tile.isActive)
        .map((tile) => (
          <div key={tile.id} className="rounded-lg border border-slate-200 p-2 text-xs">
            <p className="font-semibold text-slate-700">{tile.detailEn.slice(0, 60)}...</p>
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
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={saveHeader}>
            <h2 className="text-lg font-semibold text-slate-900">Module header</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500">Title (English)</label>
                <Input {...headerForm.register("titleEn")} disabled={isViewer} />
                {headerForm.formState.errors.titleEn ? <p className="text-xs text-red-600">{headerForm.formState.errors.titleEn.message}</p> : null}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Title (Bangla)</label>
                <Input {...headerForm.register("titleBn")} disabled={isViewer} />
                {headerForm.formState.errors.titleBn ? <p className="text-xs text-red-600">{headerForm.formState.errors.titleBn.message}</p> : null}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={isViewer}>
                {t("actions.save")}
              </Button>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Tiles</h2>
              <Button onClick={handleAddTile} disabled={isViewer}>
                {t("actions.add")}
              </Button>
            </div>
            {tiles.length === 0 ? (
              <EmptyState onAction={handleAddTile} disabled={isViewer} />
            ) : (
              <SortableList
                items={tiles}
                onReorder={handleReorder}
                isDisabled={isViewer}
                renderItem={(tile) => (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{tile.detailEn.slice(0, 60) || "New tile"}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingTile(tile)} disabled={isViewer}>
                        {t("actions.edit")}
                      </Button>
                      <Button size="sm" variant={tile.isActive ? "default" : "outline"} onClick={() => handleToggle(tile.id, !tile.isActive)}>
                        {tile.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">{tile.visibilityRuleJson}</p>
                  </div>
                )}
              />
            )}
          </section>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <PhonePreview title={t("preview.sheba")}>{preview}</PhonePreview>
        </div>
      </div>

      <Dialog open={Boolean(editingTile)} onOpenChange={(open) => (!open ? setEditingTile(null) : undefined)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("actions.edit")}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveTile}>
            <div className="grid gap-4 md:grid-cols-2">
              <ImagePicker label="Title image" value={tileForm.watch("titleImageUrl")} onChange={(val) => tileForm.setValue("titleImageUrl", val)} />
              <ImagePicker label="Home image" value={tileForm.watch("homeImageUrl")} onChange={(val) => tileForm.setValue("homeImageUrl", val)} />
            </div>
            <LanguageTabs
              render={(lang) => (
                <RichTextEditor
                  label={lang === "en" ? "Detail (English)" : "Detail (Bangla)"}
                  value={lang === "en" ? tileForm.watch("detailEn") : tileForm.watch("detailBn")}
                  onChange={(val) => tileForm.setValue(lang === "en" ? "detailEn" : "detailBn", val)}
                />
              )}
            />
            <div>
              <label className="text-xs font-medium text-slate-500">Visibility JSON</label>
              <Textarea {...tileForm.register("visibilityRuleJson")} placeholder='{"audience":"all"}' />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingTile(null)}>
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
          header: headerValues,
          tiles: tiles
            .filter((tile) => tile.isActive)
            .map(({ id, homeImageUrl, titleImageUrl, detailEn, detailBn, orderIndex }) => ({
              id,
              homeImageUrl,
              titleImageUrl,
              detailEn,
              detailBn,
              orderIndex,
            })),
        }}
        version={(getLatestSnapshot("SHEBA")?.version ?? 0) + 1}
        title={t("confirm.publish")}
        preview={preview}
      />
    </div>
  );
}
