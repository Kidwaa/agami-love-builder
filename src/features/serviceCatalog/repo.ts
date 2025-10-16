import { ServiceCard } from "@/types";
import { createOrderedRepo } from "@/mocks/base";

export const serviceCatalogRepo = createOrderedRepo<ServiceCard>({
  storageKey: "service-cards",
  entity: "SERVICE_CARD",
});
