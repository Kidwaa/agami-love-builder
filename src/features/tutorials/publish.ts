import { tutorialsRepo } from "./repo";
import { recordPublish } from "@/mocks/publish";

export async function publishTutorials() {
  const items = await tutorialsRepo.list();
  const primary = items.find((item) => item.kind === "PRIMARY");
  if (!primary) {
    throw new Error("Primary tutorial is required");
  }
  if (!primary.titleEn || !primary.titleBn || !primary.videoUrl) {
    throw new Error("Primary tutorial must be complete");
  }
  const generic = items
    .filter((item) => item.kind === "GENERIC" && item.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(({ titleEn, titleBn, videoUrl, orderIndex }) => ({
      titleEn,
      titleBn,
      videoUrl,
      orderIndex,
    }));
  const payload = {
    primary: {
      titleEn: primary.titleEn,
      titleBn: primary.titleBn,
      videoUrl: primary.videoUrl,
    },
    generic,
  };
  return recordPublish("TUTORIAL", payload);
}
