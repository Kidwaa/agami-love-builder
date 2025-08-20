
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, GripVertical, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '../ImageUpload';
import ConfirmationDialog from '../ConfirmationDialog';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  link?: string;
}

interface TenorValue {
  id: string;
  value: number;
  unit: 'Years' | 'Months';
}

interface Service {
  id: string;
  serviceImage: ImageItem[];
  purposeImage: ImageItem[];
  titleBangla: string;
  titleEnglish: string;
  tenors: TenorValue[];
  detailBangla: string;
  detailEnglish: string;
}

const ServiceConfiguration = () => {
  const [activeTab, setActiveTab] = useState('loan');
  const [loanServices, setLoanServices] = useState<Service[]>([]);
  const [savingsServices, setSavingsServices] = useState<Service[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const getCurrentServices = () => activeTab === 'loan' ? loanServices : savingsServices;
  const setCurrentServices = (services: Service[]) => {
    if (activeTab === 'loan') {
      setLoanServices(services);
    } else {
      setSavingsServices(services);
    }
  };

  const handleAddService = () => {
    const newService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      serviceImage: [],
      purposeImage: [],
      titleBangla: '',
      titleEnglish: '',
      tenors: [],
      detailBangla: '',
      detailEnglish: ''
    };
    setCurrentServices([...getCurrentServices(), newService]);
  };

  const handleServiceImagesChange = (serviceId: string, field: 'serviceImage' | 'purposeImage', images: ImageItem[]) => {
    const services = getCurrentServices();
    const updatedServices = services.map(service =>
      service.id === serviceId ? { ...service, [field]: images } : service
    );
    setCurrentServices(updatedServices);
  };

  const handleServiceChange = (serviceId: string, field: keyof Service, value: any) => {
    const services = getCurrentServices();
    const updatedServices = services.map(service =>
      service.id === serviceId ? { ...service, [field]: value } : service
    );
    setCurrentServices(updatedServices);
  };

  const handleAddTenor = (serviceId: string) => {
    const services = getCurrentServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const newTenor: TenorValue = {
      id: Math.random().toString(36).substr(2, 9),
      value: 1,
      unit: 'Years'
    };

    const updatedTenors = [...service.tenors, newTenor];
    handleServiceChange(serviceId, 'tenors', updatedTenors);
  };

  const handleTenorChange = (serviceId: string, tenorId: string, field: 'value' | 'unit', value: any) => {
    const services = getCurrentServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const updatedTenors = service.tenors.map(tenor =>
      tenor.id === tenorId ? { ...tenor, [field]: value } : tenor
    );
    handleServiceChange(serviceId, 'tenors', updatedTenors);
  };

  const handleRemoveTenor = (serviceId: string, tenorId: string) => {
    const services = getCurrentServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const updatedTenors = service.tenors.filter(tenor => tenor.id !== tenorId);
    handleServiceChange(serviceId, 'tenors', updatedTenors);
  };

  const handleDeleteService = (serviceId: string) => {
    setDeleteServiceId(serviceId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteService = () => {
    const services = getCurrentServices();
    const updatedServices = services.filter(service => service.id !== deleteServiceId);
    setCurrentServices(updatedServices);
    setDeleteServiceId('');
    toast({
      title: "Service deleted",
      description: "The service has been removed",
    });
  };

  const validateService = (service: Service): string | null => {
    if (service.serviceImage.length === 0) return "Service page image is required";
    if (service.purposeImage.length === 0) return "Purpose page image is required";
    if (!service.titleBangla.trim()) return "Bangla title is required";
    if (!service.titleEnglish.trim()) return "English title is required";
    // Only validate tenors for savings services
    if (activeTab === 'savings') {
      if (service.tenors.length === 0) return "At least one tenor value is required";
      if (service.tenors.some(t => !t.unit)) return "Please select Years or Months for each tenor value";
    }
    if (!service.detailBangla.trim()) return "Bangla detail content is required";
    if (!service.detailEnglish.trim()) return "English detail content is required";
    return null;
  };

  const handlePublish = () => {
    const services = getCurrentServices();
    
    for (const service of services) {
      const error = validateService(service);
      if (error) {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
    }

    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    setIsPublishing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const serviceType = activeTab === 'loan' ? 'loan' : 'savings';
      toast({
        title: `✅ ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} services published successfully`,
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

  const renderServiceForm = (service: Service, index: number) => (
    <Card key={service.id} className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {activeTab === 'loan' ? 'Loan' : 'Savings'} Service {index + 1}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
            >
              <GripVertical className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteService(service.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium">
              Service Page Image <span className="text-destructive">*</span>
            </Label>
            <div className="mt-2">
              <ImageUpload
                images={service.serviceImage}
                onImagesChange={(images) => handleServiceImagesChange(service.id, 'serviceImage', images)}
                maxImages={1}
                title="Upload Service Image"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">
              Purpose Page Image <span className="text-destructive">*</span>
            </Label>
            <div className="mt-2">
              <ImageUpload
                images={service.purposeImage}
                onImagesChange={(images) => handleServiceImagesChange(service.id, 'purposeImage', images)}
                maxImages={1}
                title="Upload Purpose Image"
              />
            </div>
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`title-bangla-${service.id}`}>
              Title (Bangla) <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`title-bangla-${service.id}`}
              value={service.titleBangla}
              onChange={(e) => handleServiceChange(service.id, 'titleBangla', e.target.value)}
              placeholder="বাংলা শিরোনাম"
            />
          </div>
          <div>
            <Label htmlFor={`title-english-${service.id}`}>
              Title (English) <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`title-english-${service.id}`}
              value={service.titleEnglish}
              onChange={(e) => handleServiceChange(service.id, 'titleEnglish', e.target.value)}
              placeholder="English Title"
            />
          </div>
        </div>

        {/* Tenor Management - Only show for savings services */}
        {activeTab === 'savings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Tenor Values <span className="text-destructive">*</span>
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddTenor(service.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tenor
              </Button>
            </div>
            
            {service.tenors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tenor values added yet</p>
            ) : (
              <div className="space-y-2">
                {service.tenors.map((tenor) => (
                  <div key={tenor.id} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={tenor.value}
                      onChange={(e) => handleTenorChange(service.id, tenor.id, 'value', parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <Select
                      value={tenor.unit}
                      onValueChange={(value) => handleTenorChange(service.id, tenor.id, 'unit', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Years">Years</SelectItem>
                        <SelectItem value="Months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="secondary">
                      {tenor.value} {tenor.unit}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveTenor(service.id, tenor.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`detail-bangla-${service.id}`}>
              Detail Content (Bangla) <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`detail-bangla-${service.id}`}
              value={service.detailBangla}
              onChange={(e) => handleServiceChange(service.id, 'detailBangla', e.target.value)}
              placeholder="বাংলা বিস্তারিত..."
              className="min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor={`detail-english-${service.id}`}>
              Detail Content (English) <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`detail-english-${service.id}`}
              value={service.detailEnglish}
              onChange={(e) => handleServiceChange(service.id, 'detailEnglish', e.target.value)}
              placeholder="English details..."
              className="min-h-[100px]"
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
                {service.serviceImage.length > 0 && (
                  <img
                    src={service.serviceImage[0].url}
                    alt="Service"
                    className="w-full h-24 object-cover rounded"
                  />
                )}
                <div className="font-medium text-sm">{service.titleBangla || 'বাংলা শিরোনাম'}</div>
                {activeTab === 'savings' && (
                  <div className="text-xs">
                    {service.tenors.map(t => `${t.value} ${t.unit}`).join(', ') || 'টেনর তথ্য'}
                  </div>
                )}
                <div className="text-xs">
                  {service.detailBangla || 'বিস্তারিত তথ্য...'}
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="english">
            <Card className="p-3 max-w-sm">
              <div className="space-y-2">
                {service.serviceImage.length > 0 && (
                  <img
                    src={service.serviceImage[0].url}
                    alt="Service"
                    className="w-full h-24 object-cover rounded"
                  />
                )}
                <div className="font-medium text-sm">{service.titleEnglish || 'English Title'}</div>
                {activeTab === 'savings' && (
                  <div className="text-xs">
                    {service.tenors.map(t => `${t.value} ${t.unit}`).join(', ') || 'Tenor information'}
                  </div>
                )}
                <div className="text-xs">
                  {service.detailEnglish || 'Detail information...'}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Service Configuration</h1>
        <p className="text-muted-foreground">
          Manage loan and savings services with tenor flexibility
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="loan">Loan Purpose</TabsTrigger>
          <TabsTrigger value="savings">Savings Services</TabsTrigger>
        </TabsList>

        <TabsContent value="loan" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Loan Purpose ({loanServices.length})</CardTitle>
                <Button onClick={handleAddService}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Loan Purpose
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loanServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No loan purposes added yet</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {loanServices.map((service, index) => renderServiceForm(service, index))}
                </div>
              )}

              {loanServices.length > 0 && (
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Loan Purposes'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Savings Services ({savingsServices.length})</CardTitle>
                <Button onClick={handleAddService}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Savings Service
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {savingsServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No savings services added yet</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {savingsServices.map((service, index) => renderServiceForm(service, index))}
                </div>
              )}

              {savingsServices.length > 0 && (
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Savings Services'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Service"
        message="Deleting this service will remove it from both the Service Page and the Purpose Page. Continue?"
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDeleteService}
      />

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title={`Publish ${activeTab} services`}
        subtitle={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} services will be visible in both Service Page and Application Purpose Page.`}
        question="Do you want to publish now?"
        confirmText="Publish now"
        onConfirm={confirmPublish}
      />
    </div>
  );
};

export default ServiceConfiguration;
