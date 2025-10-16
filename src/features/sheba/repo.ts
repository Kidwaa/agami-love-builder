import { ShebaTile } from "@/types";
import { createOrderedRepo } from "@/mocks/base";
import { delay } from "@/utils/delay";
import { readStorage, writeStorage } from "@/utils/storage";

const HEADER_KEY = "sheba-header";

export const shebaTilesRepo = createOrderedRepo<ShebaTile>({
  storageKey: "sheba-tiles",
  entity: "SHEBA_TILE",
});

export async function getShebaHeader() {
  await delay();
  return readStorage<{ titleEn: string; titleBn: string } | null>(HEADER_KEY, {
    titleEn: "",
    titleBn: "",
  });
}

export async function updateShebaHeader(input: { titleEn: string; titleBn: string }) {
  await delay();
  writeStorage(HEADER_KEY, input);
  return input;
}
