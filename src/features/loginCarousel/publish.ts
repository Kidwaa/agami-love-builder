import { loginCarouselRepo } from "./repo";
import { recordPublish } from "@/mocks/publish";

export async function publishLoginCarousel() {
  const items = await loginCarouselRepo.list();
  if (items.length === 0) {
    throw new Error("Login carousel must contain at least one item");
  }
  const payload = {
    items: items
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(({ imageUrl, linkUrl, orderIndex }) => ({ imageUrl, linkUrl, orderIndex })),
  };
  return recordPublish("LOGIN_CAROUSEL", payload);
}
