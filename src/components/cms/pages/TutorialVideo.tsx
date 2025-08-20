
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Plus, Eye, Trash2, Upload } from 'lucide-react';
import ConfirmationDialog from '../ConfirmationDialog';
import { toast } from 'sonner';

interface VideoItem {
  id: string;
  titleBangla: string;
  titleEnglish: string;
  file?: File;
  url?: string;
  type: 'primary' | 'generic';
}

const TutorialVideo: React.FC = () => {
  const [primaryVideo, setPrimaryVideo] = useState<VideoItem | null>(null);
  const [genericVideos, setGenericVideos] = useState<VideoItem[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ open: boolean; videoId: string; type: 'primary' | 'generic' }>({
    open: false,
    videoId: '',
    type: 'generic'
  });
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const handlePrimaryVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Must be MP4 or supported format');
      return;
    }

    if (primaryVideo) {
      setShowReplaceDialog(true);
      return;
    }

    setPrimaryVideo({
      id: 'primary-' + Date.now(),
      titleBangla: '',
      titleEnglish: '',
      file,
      url: URL.createObjectURL(file),
      type: 'primary'
    });

    event.target.value = '';
  };

  const handleReplacePrimary = () => {
    const fileInput = document.getElementById('primary-video-replace') as HTMLInputElement;
    fileInput?.click();
  };

  const confirmReplacePrimary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPrimaryVideo({
      id: 'primary-' + Date.now(),
      titleBangla: '',
      titleEnglish: '',
      file,
      url: URL.createObjectURL(file),
      type: 'primary'
    });

    event.target.value = '';
  };

  const handleAddGenericVideo = () => {
    const fileInput = document.getElementById('generic-video-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const handleGenericVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Must be MP4 or supported format');
      return;
    }

    const newVideo: VideoItem = {
      id: 'generic-' + Date.now(),
      titleBangla: '',
      titleEnglish: '',
      file,
      url: URL.createObjectURL(file),
      type: 'generic'
    };

    setGenericVideos([...genericVideos, newVideo]);
    event.target.value = '';
  };

  const handleDeleteVideo = (videoId: string, type: 'primary' | 'generic') => {
    setShowDeleteDialog({ open: true, videoId, type });
  };

  const confirmDelete = () => {
    if (showDeleteDialog.type === 'primary') {
      setPrimaryVideo(null);
    } else {
      setGenericVideos(genericVideos.filter(v => v.id !== showDeleteDialog.videoId));
    }
  };

  const handlePublish = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('✅ Videos published successfully');
    } catch (error) {
      toast.error('❌ Publish failed. Please try again');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tutorial Video Management</h1>
        <p className="text-muted-foreground">
          Manage tutorial videos for app onboarding and user guidance
        </p>
      </div>

      {/* Primary App Tutorial Video */}
      <Card className="cms-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Primary App Tutorial Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {primaryVideo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title (Bangla)</Label>
                  <Input
                    value={primaryVideo.titleBangla}
                    onChange={(e) => setPrimaryVideo({ ...primaryVideo, titleBangla: e.target.value })}
                    placeholder="বাংলা শিরোনাম"
                  />
                </div>
                <div>
                  <Label>Title (English)</Label>
                  <Input
                    value={primaryVideo.titleEnglish}
                    onChange={(e) => setPrimaryVideo({ ...primaryVideo, titleEnglish: e.target.value })}
                    placeholder="English Title"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <video src={primaryVideo.url} controls className="w-48 h-32 object-cover rounded-md" />
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={handleReplacePrimary}>
                    <Upload className="w-4 h-4 mr-2" />
                    Replace Video
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteVideo(primaryVideo.id, 'primary')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Video className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="primary-video-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Upload Primary Video</span>
                </Button>
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                MP4 format recommended
              </p>
            </div>
          )}

          <Input
            id="primary-video-upload"
            type="file"
            accept="video/*"
            onChange={handlePrimaryVideoUpload}
            className="hidden"
          />
          <Input
            id="primary-video-replace"
            type="file"
            accept="video/*"
            onChange={confirmReplacePrimary}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Generic Tutorial Videos */}
      <Card className="cms-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Generic Tutorial Videos
            </CardTitle>
            <Button onClick={handleAddGenericVideo}>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {genericVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No generic tutorial videos added yet
            </div>
          ) : (
            <div className="space-y-4">
              {genericVideos.map((video) => (
                <Card key={video.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <video src={video.url} controls className="w-32 h-20 object-cover rounded-md" />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={video.titleBangla}
                          onChange={(e) => {
                            const updated = genericVideos.map(v => 
                              v.id === video.id ? { ...v, titleBangla: e.target.value } : v
                            );
                            setGenericVideos(updated);
                          }}
                          placeholder="বাংলা শিরোনাম"
                        />
                        <Input
                          value={video.titleEnglish}
                          onChange={(e) => {
                            const updated = genericVideos.map(v => 
                              v.id === video.id ? { ...v, titleEnglish: e.target.value } : v
                            );
                            setGenericVideos(updated);
                          }}
                          placeholder="English Title"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id, 'generic')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Input
            id="generic-video-upload"
            type="file"
            accept="video/*"
            onChange={handleGenericVideoUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Publish Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowPublishDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          Publish
        </Button>
      </div>

      {/* Replace Primary Video Dialog */}
      <ConfirmationDialog
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
        title="Replace Primary Video"
        message="Uploading a new video will permanently replace the current primary tutorial video. Continue?"
        confirmText="Replace"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleReplacePrimary}
      />

      {/* Delete Video Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog.open}
        onOpenChange={(open) => setShowDeleteDialog({ open, videoId: '', type: 'generic' })}
        title={showDeleteDialog.type === 'primary' ? 'Delete Primary Video' : 'Delete Video'}
        message="Are you sure you want to delete this video?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Publish Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish tutorial videos"
        subtitle="Primary video will be used in onboarding and appear first. Generic videos will follow."
        question="Do you want to publish these changes?"
        confirmText="Publish"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handlePublish}
      />
    </div>
  );
};

export default TutorialVideo;
