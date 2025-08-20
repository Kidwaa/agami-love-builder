
import React, { useState } from 'react';
import CMSLayout from '@/components/layout/CMSLayout';
import LoginCarousel from '@/components/cms/pages/LoginCarousel';
import TutorialVideo from '@/components/cms/pages/TutorialVideo';
import GuestHomepageCarousel from '@/components/cms/pages/GuestHomepageCarousel';
import BracSuccessStories from '@/components/cms/pages/BracSuccessStories';
import BracServiceCarousel from '@/components/cms/pages/BracServiceCarousel';
import ServiceConfiguration from '@/components/cms/pages/ServiceConfiguration';

const Index = () => {
  const [activeSection, setActiveSection] = useState('cms');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'login-carousel':
        return <LoginCarousel />;
      case 'tutorial-video':
        return <TutorialVideo />;
      case 'guest-homepage-carousel':
        return <GuestHomepageCarousel />;
      case 'brac-success-stories':
        return <BracSuccessStories />;
      case 'brac-service-carousel':
        return <BracServiceCarousel />;
      case 'service-configuration':
        return <ServiceConfiguration />;
      case 'campaign-management':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Campaign Management</h1>
            <p className="text-muted-foreground">Manage your campaigns here...</p>
          </div>
        );
      case 'task-management':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Task Management</h1>
            <p className="text-muted-foreground">Manage your tasks here...</p>
          </div>
        );
      default:
        return (
          <div className="p-8 space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold mb-2">Agami Content Management System</h1>
              <p className="text-muted-foreground text-lg">
                Welcome to the Campaign & Outreach Panel. Manage your content with ease.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="cms-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                   onClick={() => setActiveSection('login-carousel')}>
                <h3 className="font-semibold mb-2">Login Carousel</h3>
                <p className="text-sm text-muted-foreground">Manage login page carousel images</p>
              </div>
              
              <div className="cms-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                   onClick={() => setActiveSection('tutorial-video')}>
                <h3 className="font-semibold mb-2">Tutorial Videos</h3>
                <p className="text-sm text-muted-foreground">Upload and manage tutorial content</p>
              </div>
              
              <div className="cms-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                   onClick={() => setActiveSection('guest-homepage-carousel')}>
                <h3 className="font-semibold mb-2">Guest Homepage</h3>
                <p className="text-sm text-muted-foreground">Configure guest homepage carousel</p>
              </div>

              <div className="cms-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                   onClick={() => setActiveSection('brac-success-stories')}>
                <h3 className="font-semibold mb-2">BRAC Success Stories</h3>
                <p className="text-sm text-muted-foreground">Manage success stories content</p>
              </div>

              <div className="cms-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                   onClick={() => setActiveSection('brac-service-carousel')}>
                <h3 className="font-semibold mb-2">BRAC Services</h3>
                <p className="text-sm text-muted-foreground">Configure service carousel tiles</p>
              </div>

              <div className="cms-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                   onClick={() => setActiveSection('service-configuration')}>
                <h3 className="font-semibold mb-2">Service Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage loan and savings services</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <CMSLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      hasUnsavedChanges={hasUnsavedChanges}
    >
      {renderContent()}
    </CMSLayout>
  );
};

export default Index;
