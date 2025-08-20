
import React, { useState } from 'react';
import { 
  Settings, 
  Image, 
  Video, 
  FileText, 
  Trophy, 
  Grid3x3,
  CreditCard,
  PiggyBank,
  Target,
  Users,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CMSLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  hasUnsavedChanges?: boolean;
}

const CMSLayout: React.FC<CMSLayoutProps> = ({ 
  children, 
  activeSection, 
  onSectionChange,
  hasUnsavedChanges = false 
}) => {
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingSection, setPendingSection] = useState<string>('');

  const navigationItems = [
    { id: 'campaign-management', label: 'Campaign Management', icon: Target },
    { id: 'task-management', label: 'Task Management', icon: CheckSquare },
    { 
      id: 'cms', 
      label: 'CMS', 
      icon: Settings,
      children: [
        { id: 'login-carousel', label: 'Login Carousel', icon: Image },
        { id: 'tutorial-video', label: 'Tutorial Video', icon: Video },
        { id: 'guest-homepage-carousel', label: 'Guest Homepage Carousel', icon: Image },
        { id: 'brac-success-stories', label: 'BRAC Success Stories', icon: Trophy },
        { id: 'brac-service-carousel', label: 'BRAC Sheba / BRAC Service Carousel', icon: Grid3x3 },
        { id: 'service-configuration', label: 'Service Configuration', icon: Settings }
      ]
    }
  ];

  const handleSectionChange = (sectionId: string) => {
    if (hasUnsavedChanges && sectionId !== activeSection) {
      setPendingSection(sectionId);
      setShowUnsavedDialog(true);
      return;
    }
    onSectionChange(sectionId);
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onSectionChange(pendingSection);
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
    setPendingSection('');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Campaign & Outreach Panel</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id}>
              <div 
                className={`cms-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleSectionChange(item.id)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              
              {item.children && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <div
                      key={child.id}
                      className={`cms-nav-item text-sm ${activeSection === child.id ? 'active' : ''}`}
                      onClick={() => handleSectionChange(child.id)}
                    >
                      <child.icon className="w-4 h-4" />
                      <span>{child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            You have unsaved changes. Do you want to discard or continue editing?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={handleContinueEditing}>
              Continue editing
            </Button>
            <Button variant="destructive" onClick={handleDiscardChanges}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CMSLayout;
