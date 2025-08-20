
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '../ImageUpload';
import ConfirmationDialog from '../ConfirmationDialog';

interface CarouselImage {
  id: string;
  file: File;
  preview: string;
  link?: string;
}

const GuestHomepageCarousel = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (files: File[]) => {
    if (images.length + files.length > 10) {
      toast({
        title: "Upload limit exceeded",
        description: "You can upload a maximum of 10 images",
        variant: "destructive",
      });
      return;
    }

    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      link: ''
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleDeleteImage = (imageId: string) => {
    setDeleteImageId(imageId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    setImages(prev => prev.filter(img => img.id !== deleteImageId));
    setDeleteImageId('');
    toast({
      title: "Image deleted",
      description: "The image has been removed from the carousel",
    });
  };

  const handleLinkChange = (imageId: string, link: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, link } : img
    ));
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handlePublish = () => {
    if (images.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one image must be present in the carousel",
        variant: "destructive",
      });
      return;
    }

    const invalidLinks = images.filter(img => img.link && !validateUrl(img.link));
    if (invalidLinks.length > 0) {
      toast({
        title: "Invalid URL",
        description: "This is not a valid URL. Please check the link",
        variant: "destructive",
      });
      return;
    }

    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    setIsPublishing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "✅ Changes published successfully",
        description: "Updates will be visible in the app within one minute",
      });
    } catch (error) {
      toast({
        title: "❌ Publish failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
      setShowPublishDialog(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Guest Homepage Carousel</h1>
        <p className="text-muted-foreground">
          Manage carousel images for the guest homepage
        </p>
      </div>

      {/* Landing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Active Carousel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Number of Images Set:</span>
              <span className="ml-2">{images.length}</span>
            </div>
            <div>
              <span className="font-medium">Last Edited:</span>
              <span className="ml-2">2 hours ago by Admin</span>
            </div>
          </div>
          <Button onClick={() => {}} className="w-full">
            Update Carousel
          </Button>
        </CardContent>
      </Card>

      {/* Update Carousel Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Carousel Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            onUpload={handleImageUpload}
            accept="image/jpeg,image/png"
            maxFiles={10 - images.length}
            multiple
          />

          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Carousel Images ({images.length}/10)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={image.preview}
                        alt="Carousel"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <Label htmlFor={`link-${image.id}`} className="text-sm">
                        Link (Optional)
                      </Label>
                      <Input
                        id={`link-${image.id}`}
                        type="url"
                        placeholder="https://example.com"
                        value={image.link || ''}
                        onChange={(e) => handleLinkChange(image.id, e.target.value)}
                        className="mt-1"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Delete image"
        message="Deleting this image will permanently remove it. Continue?"
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish changes to app"
        subtitle="The images will be visible to all Agami guest users on the homepage"
        question="Do you want to publish now?"
        confirmText="Publish now"
        onConfirm={confirmPublish}
      />
    </div>
  );
};

export default GuestHomepageCarousel;
