import { serviceCatalogRepo } from "./repo";
import { recordPublish } from "@/mocks/publish";

export async function publishServiceCatalog() {
  const cards = await serviceCatalogRepo.list();
  const active = cards.filter((card) => card.isActive);
  if (active.length === 0) {
    throw new Error("No active cards available to publish");
  }
  const sorted = active.sort((a, b) => a.orderIndex - b.orderIndex);
  const payload = {
    loans: sorted.filter((card) => card.category === "LOAN"),
    savings: sorted.filter((card) => card.category === "SAVINGS"),
  };
  return recordPublish("SERVICE_CONFIG", payload);
}
