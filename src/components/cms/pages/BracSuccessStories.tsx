import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '../ImageUpload';
import ConfirmationDialog from '../ConfirmationDialog';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  link?: string;
}

const BracSuccessStories = () => {
  const [homepageImages, setHomepageImages] = useState<ImageItem[]>([]);
  const [contentBangla, setContentBangla] = useState('');
  const [contentEnglish, setContentEnglish] = useState('');
  const [showRemoveImageDialog, setShowRemoveImageDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handleRemoveImage = () => {
    setShowRemoveImageDialog(true);
  };

  const confirmRemoveImage = () => {
    setHomepageImages([]);
    toast({
      title: "Image removed",
      description: "Homepage image has been removed",
    });
  };

  const handlePublish = () => {
    if (homepageImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "Homepage image is required",
        variant: "destructive",
      });
      return;
    }

    if (!contentBangla.trim()) {
      toast({
        title: "Validation Error",
        description: "Bangla content is required",
        variant: "destructive",
      });
      return;
    }

    if (!contentEnglish.trim()) {
      toast({
        title: "Validation Error",
        description: "English content is required",
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
        title: "✅ Content published successfully",
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
        <h1 className="text-3xl font-bold mb-2">BRAC Success Stories</h1>
        <p className="text-muted-foreground">
          Manage success stories content and homepage image
        </p>
      </div>

      {/* Landing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Active Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <span className="font-medium">Last Edited:</span>
            <span className="ml-2">3 hours ago by Admin</span>
          </div>
          <Button onClick={() => {}} className="w-full">
            Update Content
          </Button>
        </CardContent>
      </Card>

      {/* Update Content Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Success Stories Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Homepage Image Upload */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Homepage Image <span className="text-destructive">*</span>
            </Label>
            
            {homepageImages.length > 0 ? (
              <div className="relative">
                <img
                  src={homepageImages[0].url}
                  alt="Homepage"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <ImageUpload
                images={homepageImages}
                onImagesChange={setHomepageImages}
                maxImages={1}
                title="Upload Homepage Image"
              />
            )}
          </div>

          {/* Content Editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="content-bangla" className="text-base font-medium">
                Content (Bangla) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content-bangla"
                placeholder="বাংলা সফলতার গল্প লিখুন..."
                value={contentBangla}
                onChange={(e) => setContentBangla(e.target.value)}
                className="min-h-[300px] mt-1"
              />
            </div>
            <div>
              <Label htmlFor="content-english" className="text-base font-medium">
                Content (English) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content-english"
                placeholder="Write your success stories content here..."
                value={contentEnglish}
                onChange={(e) => setContentEnglish(e.target.value)}
                className="min-h-[300px] mt-1"
              />
            </div>
          </div>

          {/* Mobile Preview */}
          <Tabs defaultValue="bangla" className="w-full">
            <TabsList>
              <TabsTrigger value="bangla">Bangla Preview</TabsTrigger>
              <TabsTrigger value="english">English Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="bangla" className="mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  {homepageImages.length > 0 && (
                    <img
                      src={homepageImages[0].url}
                      alt="Homepage"
                      className="w-full max-w-lg h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="prose prose-sm max-w-none">
                    {contentBangla ? (
                      <div className="whitespace-pre-wrap">{contentBangla}</div>
                    ) : (
                      <p className="text-muted-foreground italic">বাংলা প্রিভিউ এখানে দেখাবে...</p>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="english" className="mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  {homepageImages.length > 0 && (
                    <img
                      src={homepageImages[0].url}
                      alt="Homepage"
                      className="w-full max-w-lg h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="prose prose-sm max-w-none">
                    {contentEnglish ? (
                      <div className="whitespace-pre-wrap">{contentEnglish}</div>
                    ) : (
                      <p className="text-muted-foreground italic">Content preview will appear here...</p>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="desktop" className="mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  {homepageImages.length > 0 && (
                    <img
                      src={homepageImages[0].url}
                      alt="Homepage"
                      className="w-full max-w-lg h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="prose prose-sm max-w-none">
                    {contentEnglish ? (
                      <div className="whitespace-pre-wrap">{contentEnglish}</div>
                    ) : (
                      <p className="text-muted-foreground italic">Content preview will appear here...</p>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="mobile" className="mt-4">
              <div className="max-w-sm mx-auto">
                <Card className="p-3">
                  <div className="space-y-3">
                    {homepageImages.length > 0 && (
                      <img
                        src={homepageImages[0].url}
                        alt="Homepage"
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <div className="text-sm">
                      {contentEnglish ? (
                        <div className="whitespace-pre-wrap">{contentEnglish}</div>
                      ) : (
                        <p className="text-muted-foreground italic">Mobile content preview...</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </CardContent>
      </Card>

      {/* Remove Image Confirmation Dialog */}
      <ConfirmationDialog
        open={showRemoveImageDialog}
        onOpenChange={setShowRemoveImageDialog}
        title="Remove Image"
        message="Module requires a homepage image. Do you want to remove the current image?"
        confirmText="Remove"
        variant="warning"
        onConfirm={confirmRemoveImage}
      />

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish content"
        subtitle="The updated content and image will be visible in BRAC Success Stories and on the homepage module"
        question="Ready to publish?"
        confirmText="Publish now"
        onConfirm={confirmPublish}
      />
    </div>
  );
};

export default BracSuccessStories;
