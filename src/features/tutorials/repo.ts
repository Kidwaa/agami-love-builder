import { TutorialVideo } from "@/types";
import { createOrderedRepo } from "@/mocks/base";

const repo = createOrderedRepo<TutorialVideo>({
  storageKey: "tutorials",
  entity: "TUTORIAL_VIDEO",
});

export const tutorialsRepo = {
  ...repo,
};
