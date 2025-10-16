import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/vendor/react-i18next";
import { guestCarouselRepo } from "./repo";
import { publishGuestCarousel } from "./publish";
import { GuestCarouselItem } from "@/types";
import { Button } from "@/components/ui/button";
import { usePageActions } from "@/app/PageActionsContext";
import { useRole } from "@/app/RoleContext";
import { toast } from "sonner";
import { SortableList } from "@/components/SortableList";
import { Switch } from "@/components/ui/switch";
import { DeleteDialog } from "@/components/DeleteDialog";
import { PublishDialog } from "@/components/PublishDialog";
import { PhonePreview } from "@/components/PhonePreview";
import { EmptyState } from "@/components/EmptyState";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormActions } from "@/components/FormActions";
import { uuid } from "@/utils/uuid";
import { getLatestSnapshot } from "@/mocks/publish";

const itemSchema = z.object({
  imageUrl: z.string().url({ message: "Valid URL required" }),
  linkUrl: z.string().url().optional().or(z.literal("")),
});

const addSchema = z.object({
  items: z.array(itemSchema).min(1),
});

type AddFormValues = z.infer<typeof addSchema>;

type EditFormValues = z.infer<typeof itemSchema> & { isActive: boolean };

export function GuestCarouselPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const itemsQuery = useQuery({ queryKey: ["guest-carousel"], queryFn: () => guestCarouselRepo.list() });
  const { setPublishAction } = usePageActions();
  const { isViewer } = useRole();

  const [draftItems, setDraftItems] = useState<GuestCarouselItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editItem, setEditItem] = useState<GuestCarouselItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (itemsQuery.data) {
      setDraftItems(itemsQuery.data.sort((a, b) => a.orderIndex - b.orderIndex));
      setIsDirty(false);
    }
  }, [itemsQuery.data]);

  useEffect(() => {
    setPublishAction({
      label: t("actions.publish"),
      onClick: () => setPublishOpen(true),
      disabled: isViewer || draftItems.length === 0,
    });
    return () => setPublishAction(undefined);
  }, [setPublishAction, draftItems.length, isViewer, t]);

  const handleReorder = (ids: string[]) => {
    const reordered = ids
      .map((id) => draftItems.find((item) => item.id === id))
      .filter((item): item is GuestCarouselItem => Boolean(item))
      .map((item, index) => ({ ...item, orderIndex: index }));
    setDraftItems(reordered);
    setIsDirty(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    setDraftItems((prev) => prev.map((item) => (item.id === id ? { ...item, isActive } : item)));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    await guestCarouselRepo.replaceAll(draftItems);
    await queryClient.invalidateQueries({ queryKey: ["guest-carousel"] });
    toast.success(t("toast.saved"));
    setIsDirty(false);
  };

  const handlePublish = async () => {
    await guestCarouselRepo.replaceAll(draftItems);
    try {
      setIsPublishing(true);
      const snapshot = await publishGuestCarousel();
      toast.success(t("toast.published", { version: snapshot.version }));
      setPublishOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("toast.error"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
    setIsDirty(true);
    setDeleteId(null);
  };

  const addForm = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { items: [{ imageUrl: "", linkUrl: "" }] },
  });
  const addArray = useFieldArray({ control: addForm.control, name: "items" });

  const submitAdd = addForm.handleSubmit((values) => {
    const baseIndex = draftItems.length;
    const now = new Date().toISOString();
    const newItems: GuestCarouselItem[] = values.items.map((item, index) => ({
      id: uuid(),
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl || undefined,
      orderIndex: baseIndex + index,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      updatedBy: "Demo User",
    }));
    setDraftItems((prev) => [...prev, ...newItems]);
    setIsDirty(true);
    setAddOpen(false);
    addForm.reset({ items: [{ imageUrl: "", linkUrl: "" }] });
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(itemSchema.extend({ isActive: z.boolean() })),
    defaultValues: { imageUrl: "", linkUrl: "", isActive: true },
  });

  useEffect(() => {
    if (editItem) {
      editForm.reset({
        imageUrl: editItem.imageUrl,
        linkUrl: editItem.linkUrl ?? "",
        isActive: editItem.isActive,
      });
    }
  }, [editItem, editForm]);

  const submitEdit = editForm.handleSubmit((values) => {
    if (!editItem) return;
    const updated = draftItems.map((item) =>
      item.id === editItem.id
        ? {
            ...item,
            imageUrl: values.imageUrl,
            linkUrl: values.linkUrl || undefined,
            isActive: values.isActive,
            updatedAt: new Date().toISOString(),
            updatedBy: "Demo User",
          }
        : item
    );
    setDraftItems(updated);
    setIsDirty(true);
    setEditItem(null);
  });

  const preview = (
    <div className="space-y-2">
      {draftItems.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-md border border-slate-200">
          <img src={item.imageUrl} alt="preview" className="h-44 w-full object-cover" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => setAddOpen(true)} disabled={isViewer}>
          {t("actions.add")} images
        </Button>
        <FormActions
          onSaveDraft={handleSaveDraft}
          onPublish={() => setPublishOpen(true)}
          disabled={isViewer}
          isDirty={isDirty}
          isPublishing={isPublishing}
        />
      </div>
      {draftItems.length === 0 ? (
        <EmptyState onAction={() => setAddOpen(true)} disabled={isViewer} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <SortableList
              items={draftItems}
              onReorder={handleReorder}
              isDisabled={isViewer}
              renderItem={(item) => (
                <div className="flex items-start gap-4">
                  <img src={item.imageUrl} alt="carousel" className="h-24 w-24 rounded-md object-cover" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-slate-700">{item.imageUrl}</p>
                    <p className="text-xs text-slate-500">{item.linkUrl}</p>
                    <div className="flex items-center gap-2">
                      <Switch checked={item.isActive} onChange={(e) => handleToggleActive(item.id, e.target.checked)} disabled={isViewer} />
                      <span className="text-xs text-slate-600">Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="outline" onClick={() => setEditItem(item)} disabled={isViewer}>
                        {t("actions.edit")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(item.id)} disabled={isViewer}>
                        {t("actions.delete")}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      {t("label.lastEditedBy")}: {item.updatedBy} — {new Date(item.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <PhonePreview title={t("preview.guest")}>{preview}</PhonePreview>
          </div>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("actions.add")}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitAdd}>
            {addArray.fields.map((field, index) => (
              <div key={field.id} className="space-y-2 rounded-md border border-slate-200 p-4">
                <label className="text-xs font-medium text-slate-500">Image URL</label>
                <Input {...addForm.register(`items.${index}.imageUrl` as const)} placeholder="https://" />
                {addForm.formState.errors.items?.[index]?.imageUrl ? (
                  <p className="text-xs text-red-600">{addForm.formState.errors.items[index]?.imageUrl?.message}</p>
                ) : null}
                <label className="text-xs font-medium text-slate-500">Link URL</label>
                <Input {...addForm.register(`items.${index}.linkUrl` as const)} placeholder="https://" />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addArray.remove(index)}
                    disabled={addArray.fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => addArray.append({ imageUrl: "", linkUrl: "" })}>
                Add row
              </Button>
              <Button type="submit">{t("actions.add")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editItem)} onOpenChange={(open) => (!open ? setEditItem(null) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.edit")}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submitEdit}>
            <div>
              <label className="text-xs font-medium text-slate-500">Image URL</label>
              <Input {...editForm.register("imageUrl")} />
              {editForm.formState.errors.imageUrl ? (
                <p className="text-xs text-red-600">{editForm.formState.errors.imageUrl.message}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Link URL</label>
              <Input {...editForm.register("linkUrl")} />
              {editForm.formState.errors.linkUrl ? (
                <p className="text-xs text-red-600">{editForm.formState.errors.linkUrl.message}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editForm.watch("isActive")} onChange={(e) => editForm.setValue("isActive", e.target.checked)} />
              <span className="text-xs text-slate-600">Active</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditItem(null)}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit">{t("actions.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={Boolean(deleteId)} onCancel={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)} />

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={handlePublish}
        payload={{ items: draftItems.map(({ imageUrl, linkUrl, orderIndex }) => ({ imageUrl, linkUrl, orderIndex })) }}
        version={(getLatestSnapshot("GUEST_CAROUSEL")?.version ?? 0) + 1}
        title={t("confirm.publish")}
        preview={preview}
      />
    </div>
  );
}
