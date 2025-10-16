import { z } from "zod";

export type UUID = string;

export interface BaseEntity {
  id: UUID;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface OrderedEntity extends BaseEntity {
  orderIndex: number;
  isActive: boolean;
}

export interface LoginCarouselItem extends OrderedEntity {
  imageUrl: string;
  linkUrl?: string;
}

export type GuestCarouselItem = LoginCarouselItem;

export const tutorialVideoKinds = ["PRIMARY", "GENERIC"] as const;
export type TutorialVideoKind = (typeof tutorialVideoKinds)[number];

export interface TutorialVideo extends OrderedEntity {
  kind: TutorialVideoKind;
  titleEn: string;
  titleBn: string;
  videoUrl: string;
}

export interface SuccessStory extends BaseEntity {
  titleImageUrl: string;
  homeImageUrl: string;
  contentEn: string;
  contentBn: string;
}

export interface ShebaTile extends OrderedEntity {
  homeImageUrl: string;
  titleImageUrl: string;
  detailEn: string;
  detailBn: string;
  visibilityRuleJson?: string;
}

export const serviceCategories = ["LOAN", "SAVINGS"] as const;
export type ServiceCategory = (typeof serviceCategories)[number];

export interface ServiceCard extends OrderedEntity {
  category: ServiceCategory;
  nameEn: string;
  nameBn: string;
  summaryEn: string;
  summaryBn: string;
  detailEn: string;
  detailBn: string;
  imageUrl: string;
}

export type PublishChannel =
  | "LOGIN_CAROUSEL"
  | "GUEST_CAROUSEL"
  | "TUTORIAL"
  | "SUCCESS_STORY"
  | "SHEBA"
  | "SERVICE_CONFIG";

export interface PublishSnapshot extends BaseEntity {
  channel: PublishChannel;
  version: number;
  payload: unknown;
  publishedAt: string;
  publishedBy: string;
}

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "REORDER"
  | "PUBLISH";

export interface ActivityLogEntry extends BaseEntity {
  actor: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  when: string;
  note?: string;
}

export interface PublishContext<T> {
  payload: T;
  version: number;
}

export const bilingualStringSchema = z
  .object({
    en: z.string().min(1),
    bn: z.string().min(1),
  })
  .strict();

export type BilingualString = z.infer<typeof bilingualStringSchema>;

export interface ModuleDashboardInfo {
  id: string;
  nameKey: string;
  itemCount: number;
  lastEditedAt?: string;
  lastEditedBy?: string;
  lastPublishedAt?: string;
  lastPublishedVersion?: number;
  openTo: string;
  publishChannel: PublishChannel;
}
