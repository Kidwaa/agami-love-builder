import { AmarHishabBenefits } from "@/types";
import { delay } from "@/utils/delay";
import { readStorage, writeStorage } from "@/utils/storage";
import { uuid } from "@/utils/uuid";
import { appendActivity } from "@/mocks/activity";

const STORAGE_KEY = "amar-hishab-benefits";

function now() {
  return new Date().toISOString();
}

const FIELD_LABELS: Record<keyof Omit<AmarHishabBenefits, "id" | "createdAt" | "updatedAt" | "updatedBy">, string> = {
  titleEn: "Module Title (EN)",
  titleBn: "Module Title (BN)",
  landingImageUrl: "Landing Page Image",
  summaryEn: "Summary (EN)",
  summaryBn: "Summary (BN)",
  detailTitleImageUrl: "Detail Title Image",
  detailEn: "Detail Text (EN)",
  detailBn: "Detail Text (BN)",
};

export const amarHishabRepo = {
  async get() {
    await delay();
    return readStorage<AmarHishabBenefits | null>(STORAGE_KEY, null);
  },
  async save(input: Omit<AmarHishabBenefits, "id" | "createdAt" | "updatedAt" | "updatedBy"> & Partial<AmarHishabBenefits>) {
    await delay();
    const current = readStorage<AmarHishabBenefits | null>(STORAGE_KEY, null);
    const record: AmarHishabBenefits = {
      id: current?.id ?? uuid(),
      createdAt: current?.createdAt ?? now(),
      updatedAt: now(),
      updatedBy: "Demo User",
      titleEn: input.titleEn ?? current?.titleEn ?? "",
      titleBn: input.titleBn ?? current?.titleBn ?? "",
      landingImageUrl: input.landingImageUrl ?? current?.landingImageUrl ?? "",
      summaryEn: input.summaryEn ?? current?.summaryEn ?? "",
      summaryBn: input.summaryBn ?? current?.summaryBn ?? "",
      detailTitleImageUrl: input.detailTitleImageUrl ?? current?.detailTitleImageUrl ?? "",
      detailEn: input.detailEn ?? current?.detailEn ?? "",
      detailBn: input.detailBn ?? current?.detailBn ?? "",
    };
    writeStorage(STORAGE_KEY, record);

    if (!current) {
      await appendActivity({
        action: "CREATE",
        entityType: "AMAR_HISHAB_BENEFITS",
        entityId: record.id,
        note: "Initial Amar Hishab Benefits created",
        after: record,
      });
    } else {
      const changes = Object.entries(FIELD_LABELS).filter(([key]) => current[key as keyof typeof current] !== record[key as keyof typeof record]);
      await Promise.all(
        changes.map(async ([key, label]) => {
          const fieldKey = key as keyof typeof record;
          await appendActivity({
            action: "UPDATE",
            entityType: "AMAR_HISHAB_BENEFITS",
            entityId: record.id,
            note: `${label} updated`,
            before: { [key]: current[fieldKey] },
            after: { [key]: record[fieldKey] },
          });
        })
      );
    }

    return record;
  },
};
