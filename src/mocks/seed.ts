import { uuid } from "@/utils/uuid";
import {
  ActivityLogEntry,
  AmarHishabBenefits,
  GuestCarouselItem,
  LoginCarouselItem,
  PublishSnapshot,
  ShebaTile,
  SuccessStory,
  TutorialVideo,
  ServiceCard,
} from "@/types";
import { ensureStorage, writeStorage } from "@/utils/storage";

const LOGIN_KEY = "login-carousel";
const GUEST_KEY = "guest-carousel";
const TUTORIAL_KEY = "tutorials";
const SUCCESS_KEY = "success-story";
const SHEBA_KEY = "sheba-tiles";
const SHEBA_HEADER_KEY = "sheba-header";
const SERVICE_KEY = "service-cards";
const AMAR_HISHAB_KEY = "amar-hishab-benefits";
const PUBLISH_KEY = "publish-snapshots";
const ACTIVITY_KEY = "activity-log";
const VERSION_KEY = "publish-versions";

function now() {
  return new Date().toISOString();
}

const demoUser = "Seed Bot";

export function runSeed() {
  ensureStorage<LoginCarouselItem[]>(LOGIN_KEY, () => [
    {
      id: uuid(),
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      linkUrl: "https://agami.org",
      orderIndex: 0,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
      updatedBy: demoUser,
    },
    {
      id: uuid(),
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      orderIndex: 1,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
      updatedBy: demoUser,
    },
  ]);

  ensureStorage<GuestCarouselItem[]>(GUEST_KEY, () => [
    {
      id: uuid(),
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      orderIndex: 0,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
      updatedBy: demoUser,
    },
    {
      id: uuid(),
      imageUrl: "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6",
      linkUrl: "https://brac.net",
      orderIndex: 1,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
      updatedBy: demoUser,
    },
  ]);

  ensureStorage<TutorialVideo[]>(TUTORIAL_KEY, () => {
    const base = now();
    return [
      {
        id: uuid(),
        kind: "PRIMARY",
        titleEn: "Getting started with Agami",
        titleBn: "আগামির শুরু",
        videoUrl:
          "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        orderIndex: 0,
        isActive: true,
        createdAt: base,
        updatedAt: base,
        updatedBy: demoUser,
      },
      {
        id: uuid(),
        kind: "GENERIC",
        titleEn: "Savings journey",
        titleBn: "সঞ্চয়ের পথ",
        videoUrl:
          "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        orderIndex: 0,
        isActive: true,
        createdAt: base,
        updatedAt: base,
        updatedBy: demoUser,
      },
      {
        id: uuid(),
        kind: "GENERIC",
        titleEn: "Loan application tips",
        titleBn: "ঋণ আবেদনের টিপস",
        videoUrl:
          "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        orderIndex: 1,
        isActive: true,
        createdAt: base,
        updatedAt: base,
        updatedBy: demoUser,
      },
    ];
  });

  ensureStorage<SuccessStory>(SUCCESS_KEY, () => ({
    id: uuid(),
    titleImageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
    homeImageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
    contentEn:
      "Fatima used Agami to track her savings and unlock a new loan in just 10 days.",
    contentBn: "ফাতিমা আগামি ব্যবহার করে দ্রুত সঞ্চয় ও ঋণ পেয়েছেন মাত্র ১০ দিনে।",
    createdAt: now(),
    updatedAt: now(),
    updatedBy: demoUser,
  }));

  ensureStorage<{ titleEn: string; titleBn: string }>(SHEBA_HEADER_KEY, () => ({
    titleEn: "BRAC Sheba Services",
    titleBn: "ব্র্যাক সেবা সেবা",
  }));

  ensureStorage<ShebaTile[]>(SHEBA_KEY, () => {
    const base = now();
    return [
      {
        id: uuid(),
        homeImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        titleImageUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        detailEn: "Pay utility bills instantly.",
        detailBn: "বিদ্যুৎ বিল দ্রুত পরিশোধ করুন।",
        visibilityRuleJson: '{"audience":"all"}',
        orderIndex: 0,
        isActive: true,
        createdAt: base,
        updatedAt: base,
        updatedBy: demoUser,
      },
      {
        id: uuid(),
        homeImageUrl: "https://images.unsplash.com/photo-1526304640581-178b0bddc0e3",
        titleImageUrl:
          "https://images.unsplash.com/photo-1444653389962-8149286c578a",
        detailEn: "Request doorstep services for elderly members.",
        detailBn: "বয়স্ক সদস্যদের জন্য ঘরে পৌঁছানো সেবা।",
        orderIndex: 1,
        isActive: true,
        createdAt: base,
        updatedAt: base,
        updatedBy: demoUser,
      },
      {
        id: uuid(),
        homeImageUrl: "https://images.unsplash.com/photo-1454165205744-3b78555e5572",
        titleImageUrl:
          "https://images.unsplash.com/photo-1518085250887-2f903c200fee",
        detailEn: "Track loan repayment schedules.",
        detailBn: "ঋণ পরিশোধ সময়সূচি ট্র্যাক করুন।",
        orderIndex: 2,
        isActive: true,
        createdAt: base,
        updatedAt: base,
        updatedBy: demoUser,
      },
    ];
  });

  ensureStorage<ServiceCard[]>(SERVICE_KEY, () => {
    const base = now();
    const createCard = (
      category: ServiceCard["category"],
      orderIndex: number,
      nameEn: string,
      nameBn: string
    ): ServiceCard => ({
      id: uuid(),
      category,
      nameEn,
      nameBn,
      summaryEn: `${nameEn} summary`,
      summaryBn: `${nameBn} সারসংক্ষেপ`,
      detailEn: `${nameEn} detail`,
      detailBn: `${nameBn} বিস্তারিত`,
      imageUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
      orderIndex,
      isActive: true,
      createdAt: base,
      updatedAt: base,
      updatedBy: demoUser,
    });

    return [
      createCard("LOAN", 0, "Business Loan", "ব্যবসায়িক ঋণ"),
      createCard("LOAN", 1, "Emergency Loan", "জরুরি ঋণ"),
      createCard("LOAN", 2, "Education Loan", "শিক্ষা ঋণ"),
      createCard("LOAN", 3, "Agriculture Loan", "কৃষি ঋণ"),
      createCard("SAVINGS", 0, "Daily Savings", "দৈনিক সঞ্চয়"),
      createCard("SAVINGS", 1, "Monthly Savings", "মাসিক সঞ্চয়"),
      createCard("SAVINGS", 2, "Festival Savings", "উৎসব সঞ্চয়"),
      createCard("SAVINGS", 3, "Future Savings", "ভবিষ্যৎ সঞ্চয়"),
    ];
  });

  ensureStorage<PublishSnapshot[]>(PUBLISH_KEY, () => []);
  ensureStorage<ActivityLogEntry[]>(ACTIVITY_KEY, () => []);
  ensureStorage<Record<string, number>>(VERSION_KEY, () => ({}));

  ensureStorage<AmarHishabBenefits>(AMAR_HISHAB_KEY, () => ({
    id: uuid(),
    titleEn: "Amar Hishab Benefits",
    titleBn: "আমার হিসাব বেনিফিটস",
    landingImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    summaryEn: "Stay informed about every benefit available to you in the Amar Hishab program.",
    summaryBn: "আমার হিসাব প্রোগ্রামের প্রতিটি সুবিধা সম্পর্কে সবসময় জানুন।",
    detailTitleImageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    detailEn:
      "<p><strong>Track</strong> your rewards, <em>unlock</em> exclusive offers, and <a href=\"https://agami.org\">access services</a> from anywhere.</p>",
    detailBn:
      "<p><strong>রিওয়ার্ড</strong> অনুসরণ করুন, <em>বিশেষ অফার</em> আনলক করুন এবং <a href=\"https://agami.org\">যেকোনো সময় সেবা নিন</a>।</p>",
    createdAt: now(),
    updatedAt: now(),
    updatedBy: demoUser,
  }));
}

export function initializeStorage() {
  runSeed();
  // ensure storages exist for watchers
  writeStorage("__seeded", true);
}
