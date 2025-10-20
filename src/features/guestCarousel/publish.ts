import { guestCarouselRepo } from "./repo";
import { recordPublish } from "@/mocks/publish";

export async function publishGuestCarousel() {
  const items = await guestCarouselRepo.list();
  if (items.length === 0) {
    throw new Error("Guest carousel must contain at least one item");
  }
  const payload = {
    items: items
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(({ imageUrl, linkUrl, orderIndex }) => ({ imageUrl, linkUrl, orderIndex })),
  };
  return recordPublish("GUEST_CAROUSEL", payload);
}
