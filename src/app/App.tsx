import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginCarouselPage } from "@/features/loginCarousel/ListPage";
import { GuestCarouselPage } from "@/features/guestCarousel/ListPage";
import { TutorialsPage } from "@/features/tutorials/ListPage";
import { SuccessStoryPage } from "@/features/successStories/EditPage";
import { ShebaPage } from "@/features/sheba/ListPage";
import { ServiceCatalogPage } from "@/features/serviceCatalog/ListPage";
import { ActivityPage } from "@/features/activity/ActivityPage";
import { AmarHishabBenefitsPage } from "@/features/amarHishab/EditPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} handle={{ breadcrumb: "Dashboard" }} />
        <Route path="cms">
          <Route path="login-carousel" element={<LoginCarouselPage />} handle={{ breadcrumb: "Login Carousel" }} />
          <Route path="guest-carousel" element={<GuestCarouselPage />} handle={{ breadcrumb: "Guest Carousel" }} />
          <Route path="tutorials" element={<TutorialsPage />} handle={{ breadcrumb: "Tutorial Videos" }} />
          <Route path="success-stories" element={<SuccessStoryPage />} handle={{ breadcrumb: "Success Stories" }} />
          <Route path="sheba" element={<ShebaPage />} handle={{ breadcrumb: "BRAC Sheba Services" }} />
          <Route path="service-catalog" element={<ServiceCatalogPage />} handle={{ breadcrumb: "Service Catalog" }} />
        </Route>
        <Route path="campaign-outreach" handle={{ breadcrumb: "Campaign & Outreach" }}>
          <Route path="cms" handle={{ breadcrumb: "CMS" }}>
            <Route
              path="amar-hishab-benefits"
              element={<AmarHishabBenefitsPage />}
              handle={{ breadcrumb: "Amar Hishab Benefits" }}
            />
          </Route>
        </Route>
        <Route path="activity" element={<ActivityPage />} handle={{ breadcrumb: "Activity Log" }} />
      </Route>
    </Routes>
  );
}

export default App;
