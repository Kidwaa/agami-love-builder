import { LoginCarouselItem } from "@/types";
import { createOrderedRepo } from "@/mocks/base";

const repo = createOrderedRepo<LoginCarouselItem>({
  storageKey: "login-carousel",
  entity: "LOGIN_CAROUSEL_ITEM",
});

export const loginCarouselRepo = {
  ...repo,
};
