
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, GripVertical, Link as LinkIcon } from 'lucide-react';
import ConfirmationDialog from './ConfirmationDialog';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  link?: string;
}

interface ImageUploadProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
  allowLinks?: boolean;
  title?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  allowLinks = false,
  title = "Upload Images"
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; imageId: string }>({
    open: false,
    imageId: ''
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        // Show error toast - for now just console.log
        console.error('Please upload JPG or PNG only');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        console.error('The file is too large. Please upload an optimized image');
        return;
      }

      const newImage: ImageItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        link: allowLinks ? '' : undefined
      };

      if (images.length < maxImages) {
        onImagesChange([...images, newImage]);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const handleLinkChange = (imageId: string, link: string) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, link } : img
    );
    onImagesChange(updatedImages);
  };

  const handleDeleteImage = (imageId: string) => {
    setDeleteDialog({ open: true, imageId });
  };

  const confirmDelete = () => {
    const updatedImages = images.filter(img => img.id !== deleteDialog.imageId);
    onImagesChange(updatedImages);
  };

  const handleDragStart = (imageId: string) => {
    setDraggedItem(imageId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = images.findIndex(img => img.id === draggedItem);
    const targetIndex = images.findIndex(img => img.id === targetId);

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Upload up to {maxImages} images (JPG, PNG only, max 5MB each)
        </p>
      </div>

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <Label htmlFor="image-upload" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>Choose Images</span>
            </Button>
          </Label>
          <Input
            id="image-upload"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Or drag and drop images here
          </p>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Images ({images.length}/{maxImages})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card
                key={image.id}
                className="p-4 space-y-3"
                draggable
                onDragStart={() => handleDragStart(image.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image.id)}
              >
                <div className="relative">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div className="absolute top-2 left-2">
                    <GripVertical className="w-4 h-4 text-white bg-black bg-opacity-50 rounded p-0.5" />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {allowLinks && (
                  <div className="space-y-2">
                    <Label className="text-xs">Link (Optional)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        value={image.link || ''}
                        onChange={(e) => handleLinkChange(image.id, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, imageId: '' })}
        title="Delete image"
        message="Deleting this image will remove it from the carousel. Continue?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ImageUpload;
