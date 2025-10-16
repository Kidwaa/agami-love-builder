import { GuestCarouselItem } from "@/types";
import { createOrderedRepo } from "@/mocks/base";

const repo = createOrderedRepo<GuestCarouselItem>({
  storageKey: "guest-carousel",
  entity: "GUEST_CAROUSEL_ITEM",
});

export const guestCarouselRepo = { ...repo };
