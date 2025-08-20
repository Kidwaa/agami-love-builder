
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import ConfirmationDialog from '../ConfirmationDialog';
import { toast } from 'sonner';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
}

const LoginCarousel: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleImagesChange = (newImages: ImageItem[]) => {
    setImages(newImages);
    setHasUnsavedChanges(true);
  };

  const handlePublish = async () => {
    if (images.length === 0) {
      toast.error('At least one image must be present in the carousel');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('✅ Changes published successfully. Updates will be visible in the app within one minute');
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('❌ Publish failed. Please try again');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Login Carousel</h1>
        <p className="text-muted-foreground">
          Manage the image carousel that appears on the login page
        </p>
      </div>

      {/* Current Status Card */}
      <Card className="cms-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Active Carousel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{images.length}</span> Images Set
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Last Edited: <span className="font-medium">2 hours ago</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Last Edited By: <span className="font-medium">Admin User</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Carousel Form */}
      <Card className="cms-card">
        <CardHeader>
          <CardTitle>Update Carousel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            images={images}
            onImagesChange={handleImagesChange}
            maxImages={10}
            title="Carousel Images"
          />

          <div className="flex justify-end">
            <Button 
              onClick={() => setShowPublishDialog(true)}
              className="bg-primary hover:bg-primary/90"
              disabled={images.length === 0}
            >
              Publish
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish changes to app"
        subtitle="The images will be visible to all Agami users who view the login page"
        question="Are you ready to publish?"
        confirmText="Publish now"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handlePublish}
      />
    </div>
  );
};

export default LoginCarousel;
