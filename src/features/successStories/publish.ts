import { successStoryRepo } from "./repo";
import { recordPublish } from "@/mocks/publish";

export async function publishSuccessStory() {
  const story = await successStoryRepo.get();
  if (!story) {
    throw new Error("Success story must be created first");
  }
  if (!story.titleImageUrl || !story.homeImageUrl || !story.contentEn || !story.contentBn) {
    throw new Error("Success story requires images and content in both languages");
  }
  const payload = {
    titleImageUrl: story.titleImageUrl,
    homeImageUrl: story.homeImageUrl,
    contentEn: story.contentEn,
    contentBn: story.contentBn,
  };
  return recordPublish("SUCCESS_STORY", payload);
}
