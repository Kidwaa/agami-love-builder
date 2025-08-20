
import React, { useState } from 'react';
import CMSLayout from '@/components/layout/CMSLayout';
import LoginCarousel from '@/components/cms/pages/LoginCarousel';
import TutorialVideo from '@/components/cms/pages/TutorialVideo';

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
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Guest Homepage Carousel</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case 'brac-success-stories':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">BRAC Success Stories</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case 'brac-service-carousel':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">BRAC Sheba / BRAC Service Carousel</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
      case 'service-configuration':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Service Configuration</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );
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
