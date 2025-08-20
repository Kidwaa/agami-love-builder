
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '../ImageUpload';
import ConfirmationDialog from '../ConfirmationDialog';

interface ServiceTile {
  id: string;
  image: File;
  imagePreview: string;
  contentBangla: string;
  contentEnglish: string;
}

const BracServiceCarousel = () => {
  const [titleBangla, setTitleBangla] = useState('BRAC সেবা');
  const [titleEnglish, setTitleEnglish] = useState('BRAC Services');
  const [tiles, setTiles] = useState<ServiceTile[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [deleteTileId, setDeleteTileId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handleAddTile = () => {
    // This would typically open a modal or form for adding a new tile
    // For now, we'll create a placeholder
    const newTile: ServiceTile = {
      id: Math.random().toString(36).substr(2, 9),
      image: new File([''], 'placeholder.jpg'),
      imagePreview: '/placeholder.svg',
      contentBangla: '',
      contentEnglish: ''
    };
    setTiles(prev => [...prev, newTile]);
  };

  const handleImageUpload = (tileId: string, files: File[]) => {
    const file = files[0];
    setTiles(prev => prev.map(tile => 
      tile.id === tileId 
        ? { ...tile, image: file, imagePreview: URL.createObjectURL(file) }
        : tile
    ));
  };

  const handleContentChange = (tileId: string, field: 'contentBangla' | 'contentEnglish', value: string) => {
    setTiles(prev => prev.map(tile => 
      tile.id === tileId ? { ...tile, [field]: value } : tile
    ));
  };

  const handleDeleteTile = (tileId: string) => {
    setDeleteTileId(tileId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTile = () => {
    setTiles(prev => prev.filter(tile => tile.id !== deleteTileId));
    setDeleteTileId('');
    toast({
      title: "Tile deleted",
      description: "The service tile has been removed",
    });
  };

  const handleReorder = () => {
    setShowReorderDialog(true);
  };

  const confirmReorder = () => {
    // This would handle the reorder logic
    setShowPublishDialog(true);
  };

  const handlePublish = () => {
    // Validation
    const tilesWithMissingContent = tiles.filter(tile => 
      !tile.contentBangla.trim() || !tile.contentEnglish.trim()
    );

    if (tilesWithMissingContent.length > 0) {
      toast({
        title: "Validation Error",
        description: "Both Bangla and English detail content required for all tiles",
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
        title: "✅ Services published successfully",
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
        <h1 className="text-3xl font-bold mb-2">BRAC Sheba / BRAC Service Carousel</h1>
        <p className="text-muted-foreground">
          Manage service tiles and module configuration
        </p>
      </div>

      {/* Module Title Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Module Title Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title-bangla">Title Bangla</Label>
              <Input
                id="title-bangla"
                value={titleBangla}
                onChange={(e) => setTitleBangla(e.target.value)}
                placeholder="BRAC সেবা"
              />
            </div>
            <div>
              <Label htmlFor="title-english">Title English</Label>
              <Input
                id="title-english"
                value={titleEnglish}
                onChange={(e) => setTitleEnglish(e.target.value)}
                placeholder="BRAC Services"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Leave blank to use default titles
          </p>
        </CardContent>
      </Card>

      {/* Tile Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Tiles ({tiles.length})</CardTitle>
            <Button onClick={handleAddTile}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {tiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tiles added yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Module will be hidden from app homepage until tiles are published
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tiles.map((tile, index) => (
                <Card key={tile.id} className="border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Tile {index + 1}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleReorder}
                        >
                          <GripVertical className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteTile(tile.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Homepage Image */}
                    <div>
                      <Label className="text-sm font-medium">Homepage Image</Label>
                      {tile.imagePreview !== '/placeholder.svg' ? (
                        <div className="mt-2">
                          <img
                            src={tile.imagePreview}
                            alt="Service"
                            className="w-full max-w-xs h-32 object-cover rounded border"
                          />
                        </div>
                      ) : (
                        <div className="mt-2">
                          <ImageUpload
                            onUpload={(files) => handleImageUpload(tile.id, files)}
                            accept="image/jpeg,image/png"
                            maxFiles={1}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content Editors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`content-bangla-${tile.id}`}>
                          Detail Content (Bangla) <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`content-bangla-${tile.id}`}
                          value={tile.contentBangla}
                          onChange={(e) => handleContentChange(tile.id, 'contentBangla', e.target.value)}
                          placeholder="বাংলা বিস্তারিত..."
                          className="min-h-[100px] mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`content-english-${tile.id}`}>
                          Detail Content (English) <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`content-english-${tile.id}`}
                          value={tile.contentEnglish}
                          onChange={(e) => handleContentChange(tile.id, 'contentEnglish', e.target.value)}
                          placeholder="English details..."
                          className="min-h-[100px] mt-1"
                        />
                      </div>
                    </div>

                    {/* Mobile Preview */}
                    <Tabs defaultValue="bangla" className="w-full">
                      <TabsList>
                        <TabsTrigger value="bangla">Bangla Preview</TabsTrigger>
                        <TabsTrigger value="english">English Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="bangla">
                        <Card className="p-3 max-w-sm">
                          <div className="space-y-2">
                            <img
                              src={tile.imagePreview}
                              alt="Service"
                              className="w-full h-24 object-cover rounded"
                            />
                            <div className="text-sm">
                              {tile.contentBangla || <span className="text-muted-foreground italic">বাংলা প্রিভিউ...</span>}
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                      <TabsContent value="english">
                        <Card className="p-3 max-w-sm">
                          <div className="space-y-2">
                            <img
                              src={tile.imagePreview}
                              alt="Service"
                              className="w-full h-24 object-cover rounded"
                            />
                            <div className="text-sm">
                              {tile.contentEnglish || <span className="text-muted-foreground italic">English preview...</span>}
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tiles.length > 0 && (
            <Button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Tile"
        message="Are you sure you want to delete this service tile?"
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteTile}
      />

      {/* Reorder Confirmation Dialog */}
      <ConfirmationDialog
        open={showReorderDialog}
        onOpenChange={setShowReorderDialog}
        title="Reorder tiles"
        message="Reordering will not apply until you publish. Do you want to publish now?"
        confirmText="Publish now"
        onConfirm={confirmReorder}
      />

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish services"
        subtitle="Tiles and their order will be visible on the homepage"
        question="Do you want to publish now?"
        confirmText="Publish now"
        onConfirm={confirmPublish}
      />
    </div>
  );
};

export default BracServiceCarousel;
