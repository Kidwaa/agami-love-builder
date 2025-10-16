import { SuccessStory } from "@/types";
import { delay } from "@/utils/delay";
import { readStorage, writeStorage } from "@/utils/storage";
import { uuid } from "@/utils/uuid";
import { appendActivity } from "@/mocks/activity";

const STORAGE_KEY = "success-story";

function now() {
  return new Date().toISOString();
}

export const successStoryRepo = {
  async get() {
    await delay();
    return readStorage<SuccessStory | null>(STORAGE_KEY, null);
  },
  async save(input: Omit<SuccessStory, "id" | "createdAt" | "updatedAt" | "updatedBy"> & Partial<SuccessStory>) {
    await delay();
    const current = readStorage<SuccessStory | null>(STORAGE_KEY, null);
    const record: SuccessStory = {
      id: current?.id ?? uuid(),
      createdAt: current?.createdAt ?? now(),
      updatedAt: now(),
      updatedBy: "Demo User",
      titleImageUrl: input.titleImageUrl ?? current?.titleImageUrl ?? "",
      homeImageUrl: input.homeImageUrl ?? current?.homeImageUrl ?? "",
      contentEn: input.contentEn ?? current?.contentEn ?? "",
      contentBn: input.contentBn ?? current?.contentBn ?? "",
    };
    writeStorage(STORAGE_KEY, record);
    await appendActivity({
      action: current ? "UPDATE" : "CREATE",
      entityType: "SUCCESS_STORY",
      entityId: record.id,
    });
    return record;
  },
};
