import { recordPublish } from "@/mocks/publish";
import { amarHishabRepo } from "./repo";
import { writeStorage } from "@/utils/storage";

export async function publishAmarHishabBenefits() {
  const record = await amarHishabRepo.get();
  if (!record) {
    throw new Error("No Amar Hishab Benefits draft found");
  }

  const payload = {
    title: {
      en: record.titleEn,
      bn: record.titleBn,
    },
    landingImageUrl: record.landingImageUrl,
    summary: {
      en: record.summaryEn,
      bn: record.summaryBn,
    },
    detailTitleImageUrl: record.detailTitleImageUrl,
    detail: {
      en: record.detailEn,
      bn: record.detailBn,
    },
    publishedAt: new Date().toISOString(),
  };

  const snapshot = await recordPublish("AMAR_HISHAB_BENEFITS", payload);
  writeStorage("amar-hishab-cache-bust", Date.now());
  return snapshot;
}
