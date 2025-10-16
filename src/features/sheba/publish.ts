import { getShebaHeader, shebaTilesRepo } from "./repo";
import { recordPublish } from "@/mocks/publish";

export async function publishSheba() {
  const header = await getShebaHeader();
  const tiles = await shebaTilesRepo.list();
  if (!header?.titleEn || !header?.titleBn) {
    throw new Error("Module header must be completed");
  }
  const activeTiles = tiles
    .filter((tile) => tile.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(({ id, homeImageUrl, titleImageUrl, detailEn, detailBn, orderIndex }) => ({
      id,
      homeImageUrl,
      titleImageUrl,
      detailEn,
      detailBn,
      orderIndex,
    }));
  if (activeTiles.length === 0) {
    throw new Error("At least one active tile required to publish");
  }
  const payload = {
    header: {
      titleEn: header.titleEn,
      titleBn: header.titleBn,
    },
    tiles: activeTiles,
  };
  return recordPublish("SHEBA", payload);
}
