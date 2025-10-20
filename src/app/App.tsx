import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginCarouselPage } from "@/features/loginCarousel/ListPage";
import { GuestCarouselPage } from "@/features/guestCarousel/ListPage";
import { TutorialsPage } from "@/features/tutorials/ListPage";
import { SuccessStoryPage } from "@/features/successStories/EditPage";
import { ShebaPage } from "@/features/sheba/ListPage";
import { ServiceCatalogPage } from "@/features/serviceCatalog/ListPage";
import { ActivityPage } from "@/features/activity/ActivityPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: { breadcrumb: "Dashboard" }
      },
      {
        path: "cms/login-carousel",
        element: <LoginCarouselPage />,
        handle: { breadcrumb: "Login Carousel" }
      },
      {
        path: "cms/guest-carousel",
        element: <GuestCarouselPage />,
        handle: { breadcrumb: "Guest Carousel" }
      },
      {
        path: "cms/tutorials",
        element: <TutorialsPage />,
        handle: { breadcrumb: "Tutorial Videos" }
      },
      {
        path: "cms/success-stories",
        element: <SuccessStoryPage />,
        handle: { breadcrumb: "Success Stories" }
      },
      {
        path: "cms/sheba",
        element: <ShebaPage />,
        handle: { breadcrumb: "BRAC Sheba Services" }
      },
      {
        path: "cms/service-catalog",
        element: <ServiceCatalogPage />,
        handle: { breadcrumb: "Service Catalog" }
      },
      {
        path: "activity",
        element: <ActivityPage />,
        handle: { breadcrumb: "Activity Log" }
      }
    ]
  }
]);
