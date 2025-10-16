import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceCatalogRepo } from "./repo";
import { publishServiceCatalog } from "./publish";
import { ServiceCard } from "@/types";
import { useTranslation } from "@/vendor/react-i18next";
import { usePageActions } from "@/app/PageActionsContext";
import { useRole } from "@/app/RoleContext";
import { FormActions } from "@/components/FormActions";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/SortableList";
import { uuid } from "@/utils/uuid";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@toast-ui/react-editor";
import { PublishDialog } from "@/components/PublishDialog";
import { getLatestSnapshot } from "@/mocks/publish";
import { PhonePreview } from "@/components/PhonePreview";
import { ImagePicker } from "@/components/ImagePicker";
import { LanguageTabs } from "@/components/LanguageTabs";

const cardSchema = {
  nameEn: (value: string) => value.trim().length > 0,
  nameBn: (value: string) => value.trim().length > 0,
  summaryEn: (value: string) => value.trim().length > 0,
  summaryBn: (value: string) => value.trim().length > 0,
  detailEn: (value: string) => value.trim().length > 0,
  detailBn: (value: string) => value.trim().length > 0,
  imageUrl: (value: string) => /^https?:\/\//.test(value),
};

export function ServiceCatalogPage() {
  const { t } = useTranslation();
  const { setPublishAction } = usePageActions();
  const { isViewer } = useRole();
  const queryClient = useQueryClient();

  const cardsQuery = useQuery({ queryKey: ["service-cards"], queryFn: () => serviceCatalogRepo.list() });
  const [loans, setLoans] = React.useState<ServiceCard[]>([]);
  const [savings, setSavings] = React.useState<ServiceCard[]>([]);
  const [activeTab, setActiveTab] = React.useState<"LOAN" | "SAVINGS">("LOAN");
  const [editingCard, setEditingCard] = React.useState<ServiceCard | null>(null);
  const [isDirty, setIsDirty] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  React.useEffect(() => {
    if (cardsQuery.data) {
      setLoans(cardsQuery.data.filter((card) => card.category === "LOAN").sort((a, b) => a.orderIndex - b.orderIndex));
      setSavings(cardsQuery.data.filter((card) => card.category === "SAVINGS").sort((a, b) => a.orderIndex - b.orderIndex));
    }
  }, [cardsQuery.data]);

  React.useEffect(() => {
    setPublishAction({
      label: t("actions.publish"),
      onClick: () => setPublishOpen(true),
      disabled: isViewer,
    });
    return () => setPublishAction(undefined);
  }, [setPublishAction, isViewer, t]);

  const handleAddCard = (category: "LOAN" | "SAVINGS") => {
    const now = new Date().toISOString();
    const newCard: ServiceCard = {
      id: uuid(),
      category,
      nameEn: "",
      nameBn: "",
      summaryEn: "",
      summaryBn: "",
      detailEn: "",
      detailBn: "",
      imageUrl: "",
      orderIndex: (category === "LOAN" ? loans : savings).length,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      updatedBy: "Demo User",
    };
    if (category === "LOAN") {
      setLoans((prev) => [...prev, newCard]);
    } else {
      setSavings((prev) => [...prev, newCard]);
    }
    setEditingCard(newCard);
    setIsDirty(true);
  };

  const handleToggle = (card: ServiceCard) => {
    if (card.category === "LOAN") {
      setLoans((prev) => prev.map((item) => (item.id === card.id ? { ...item, isActive: !item.isActive } : item)));
    } else {
      setSavings((prev) => prev.map((item) => (item.id === card.id ? { ...item, isActive: !item.isActive } : item)));
    }
    setIsDirty(true);
  };

  const handleReorder = (category: "LOAN" | "SAVINGS", ids: string[]) => {
    const source = category === "LOAN" ? loans : savings;
    const reordered = ids
      .map((id) => source.find((item) => item.id === id))
      .filter((item): item is ServiceCard => Boolean(item))
      .map((item, index) => ({ ...item, orderIndex: index }));
    if (category === "LOAN") setLoans(reordered);
    else setSavings(reordered);
    setIsDirty(true);
  };

  const handleDelete = (card: ServiceCard) => {
    if (card.category === "LOAN") setLoans((prev) => prev.filter((item) => item.id !== card.id));
    else setSavings((prev) => prev.filter((item) => item.id !== card.id));
    setIsDirty(true);
  };

  const [editValues, setEditValues] = React.useState<ServiceCard | null>(null);

  React.useEffect(() => {
    if (editingCard) {
      setEditValues(editingCard);
    }
  }, [editingCard]);

  const updateEditField = (field: keyof ServiceCard, value: string) => {
    if (!editValues) return;
    setEditValues({ ...editValues, [field]: value });
  };

  const saveEditCard = () => {
    if (!editValues) return;
    const validators = Object.entries(cardSchema) as [keyof typeof cardSchema, (val: string) => boolean][];
    for (const [key, validator] of validators) {
      const field = key as keyof ServiceCard;
      const value = String(editValues[field] ?? "");
      if (!validator(value)) {
        toast.error(`${String(key)} invalid`);
        return;
      }
    }
    const now = new Date().toISOString();
    const update = { ...editValues, updatedAt: now, updatedBy: "Demo User" };
    if (update.category === "LOAN") {
      setLoans((prev) => prev.map((item) => (item.id === update.id ? update : item)));
    } else {
      setSavings((prev) => prev.map((item) => (item.id === update.id ? update : item)));
    }
    setEditingCard(null);
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    await serviceCatalogRepo.replaceAll([...loans, ...savings]);
    await queryClient.invalidateQueries({ queryKey: ["service-cards"] });
    toast.success(t("toast.saved"));
    setIsDirty(false);
  };

  const handlePublish = async () => {
    const invalid = [...loans, ...savings].filter((card) => card.isActive).some((card) => !card.nameEn || !card.nameBn || !card.summaryEn || !card.summaryBn || !card.detailEn || !card.detailBn || !card.imageUrl);
    if (invalid) {
      toast.error("Complete all active cards before publishing");
      return;
    }
    try {
      setIsPublishing(true);
      await serviceCatalogRepo.replaceAll([...loans, ...savings]);
      const snapshot = await publishServiceCatalog();
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
    <div className="space-y-3 text-sm">
      <h3 className="font-semibold text-slate-700">Loans</h3>
      {loans
        .filter((card) => card.isActive)
        .map((card) => (
          <div key={card.id} className="rounded border border-slate-200 p-2">
            <p className="font-semibold">{card.nameEn}</p>
            <p className="text-xs text-slate-500">{card.summaryEn}</p>
          </div>
        ))}
      <h3 className="font-semibold text-slate-700">Savings</h3>
      {savings
        .filter((card) => card.isActive)
        .map((card) => (
          <div key={card.id} className="rounded border border-slate-200 p-2">
            <p className="font-semibold">{card.nameEn}</p>
            <p className="text-xs text-slate-500">{card.summaryEn}</p>
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
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Service cards</h2>
            <Button onClick={() => handleAddCard(activeTab)} disabled={isViewer}>
              {t("actions.add")}
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "LOAN" | "SAVINGS")}> 
            <TabsList>
              <TabsTrigger value="LOAN">Loans</TabsTrigger>
              <TabsTrigger value="SAVINGS">Savings</TabsTrigger>
            </TabsList>
            <TabsContent value="LOAN">
              <SortableList
                items={loans}
                onReorder={(ids) => handleReorder("LOAN", ids)}
                isDisabled={isViewer}
                renderItem={(card) => (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{card.nameEn || "New card"}</p>
                    <p className="text-xs text-slate-500">{card.summaryEn}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingCard(card)} disabled={isViewer}>
                        {t("actions.edit")}
                      </Button>
                      <Button size="sm" variant={card.isActive ? "default" : "outline"} onClick={() => handleToggle(card)}>
                        {card.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(card)} disabled={isViewer}>
                        {t("actions.delete")}
                      </Button>
                    </div>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="SAVINGS">
              <SortableList
                items={savings}
                onReorder={(ids) => handleReorder("SAVINGS", ids)}
                isDisabled={isViewer}
                renderItem={(card) => (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{card.nameEn || "New card"}</p>
                    <p className="text-xs text-slate-500">{card.summaryEn}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingCard(card)} disabled={isViewer}>
                        {t("actions.edit")}
                      </Button>
                      <Button size="sm" variant={card.isActive ? "default" : "outline"} onClick={() => handleToggle(card)}>
                        {card.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(card)} disabled={isViewer}>
                        {t("actions.delete")}
                      </Button>
                    </div>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <PhonePreview title={t("preview.service")}>{preview}</PhonePreview>
        </div>
      </div>

      <Dialog open={Boolean(editingCard)} onOpenChange={(open) => (!open ? setEditingCard(null) : undefined)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("actions.edit")}</DialogTitle>
          </DialogHeader>
          {editValues ? (
            <div className="space-y-4">
              <ImagePicker label="Image" value={editValues.imageUrl} onChange={(val) => updateEditField("imageUrl", val)} />
              <LanguageTabs
                render={(lang) => (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-slate-500">
                      {lang === "en" ? "Name (English)" : "Name (Bangla)"}
                    </label>
                    <Input
                      value={lang === "en" ? editValues.nameEn : editValues.nameBn}
                      onChange={(event) => updateEditField(lang === "en" ? "nameEn" : "nameBn", event.target.value)}
                    />
                    <label className="text-xs font-medium text-slate-500">
                      {lang === "en" ? "Summary (English)" : "Summary (Bangla)"}
                    </label>
                    <Textarea
                      value={lang === "en" ? editValues.summaryEn : editValues.summaryBn}
                      onChange={(event) =>
                        updateEditField(lang === "en" ? "summaryEn" : "summaryBn", event.target.value)
                      }
                    />
                    <RichTextEditor
                      label={lang === "en" ? "Detail (English)" : "Detail (Bangla)"}
                      value={lang === "en" ? editValues.detailEn : editValues.detailBn}
                      onChange={(val) => updateEditField(lang === "en" ? "detailEn" : "detailBn", val)}
                    />
                  </div>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingCard(null)}>
                  {t("actions.cancel")}
                </Button>
                <Button type="button" onClick={saveEditCard}>
                  {t("actions.save")}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={handlePublish}
        payload={{
          loans: loans.filter((card) => card.isActive),
          savings: savings.filter((card) => card.isActive),
        }}
        version={(getLatestSnapshot("SERVICE_CONFIG")?.version ?? 0) + 1}
        title={t("confirm.publish")}
        preview={preview}
      />
    </div>
  );
}
