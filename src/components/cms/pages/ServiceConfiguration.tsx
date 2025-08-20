
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Edit, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '../ImageUpload';
import ConfirmationDialog from '../ConfirmationDialog';

interface TenorValue {
  id: string;
  value: number;
  unit: 'years' | 'months';
}

interface Service {
  id: string;
  image1: File | null;
  image1Preview: string;
  image2: File | null;
  image2Preview: string;
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
  const [publishType, setPublishType] = useState<'loan' | 'savings'>('loan');
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
      image1: null,
      image1Preview: '',
      image2: null,
      image2Preview: '',
      titleBangla: '',
      titleEnglish: '',
      tenors: [],
      detailBangla: '',
      detailEnglish: ''
    };

    setCurrentServices([...getCurrentServices(), newService]);
  };

  const handleImageUpload = (serviceId: string, imageType: 'image1' | 'image2', files: File[]) => {
    const file = files[0];
    const services = getCurrentServices();
    const updatedServices = services.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            [imageType]: file,
            [`${imageType}Preview`]: URL.createObjectURL(file)
          }
        : service
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
    const newTenor: TenorValue = {
      id: Math.random().toString(36).substr(2, 9),
      value: 0,
      unit: activeTab === 'loan' ? 'years' : 'years'
    };

    const services = getCurrentServices();
    const updatedServices = services.map(service => 
      service.id === serviceId 
        ? { ...service, tenors: [...service.tenors, newTenor] }
        : service
    );
    setCurrentServices(updatedServices);
  };

  const handleTenorChange = (serviceId: string, tenorId: string, field: 'value' | 'unit', value: any) => {
    const services = getCurrentServices();
    const updatedServices = services.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            tenors: service.tenors.map(tenor => 
              tenor.id === tenorId ? { ...tenor, [field]: value } : tenor
            )
          }
        : service
    );
    setCurrentServices(updatedServices);
  };

  const handleDeleteTenor = (serviceId: string, tenorId: string) => {
    const services = getCurrentServices();
    const updatedServices = services.map(service => 
      service.id === serviceId 
        ? { ...service, tenors: service.tenors.filter(tenor => tenor.id !== tenorId) }
        : service
    );
    setCurrentServices(updatedServices);
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
      description: "The service has been removed from both pages",
    });
  };

  const validateService = (service: Service): string[] => {
    const errors: string[] = [];
    
    if (!service.image1) errors.push('Thumbnail for Services Page is required');
    if (!service.image2) errors.push('Thumbnail for Purpose Page is required');
    if (!service.titleBangla.trim()) errors.push('Title Bangla is required');
    if (!service.titleEnglish.trim()) errors.push('Title English is required');
    if (!service.detailBangla.trim()) errors.push('Detail Editor Bangla is required');
    if (!service.detailEnglish.trim()) errors.push('Detail Editor English is required');
    if (service.tenors.length === 0) errors.push('At least one tenor value must be provided');
    
    const invalidTenors = service.tenors.filter(tenor => !tenor.value || tenor.value <= 0);
    if (invalidTenors.length > 0) errors.push('All tenor values must be greater than 0');

    const tenorsWithoutUnit = service.tenors.filter(tenor => !tenor.unit);
    if (tenorsWithoutUnit.length > 0) errors.push('Please select Years or Months for each tenor value');

    return errors;
  };

  const handlePublish = () => {
    const services = getCurrentServices();
    
    if (services.length === 0) {
      toast({
        title: "No services to publish",
        description: "Add at least one service before publishing",
        variant: "destructive",
      });
      return;
    }

    const validationErrors: string[] = [];
    services.forEach((service, index) => {
      const errors = validateService(service);
      if (errors.length > 0) {
        validationErrors.push(`Service ${index + 1}: ${errors.join(', ')}`);
      }
    });

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }

    setPublishType(activeTab as 'loan' | 'savings');
    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    setIsPublishing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: `✅ ${publishType === 'loan' ? 'Loan' : 'Savings'} services published successfully`,
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

  const renderServiceForm = (service: Service) => (
    <Card key={service.id} className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {service.titleEnglish || service.titleBangla || 'New Service'}
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">
              <GripVertical className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Edit className="w-4 h-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">
              Thumbnail for Services Page <span className="text-destructive">*</span>
            </Label>
            {service.image1Preview ? (
              <img
                src={service.image1Preview}
                alt="Services Page"
                className="w-full h-32 object-cover rounded border mt-2"
              />
            ) : (
              <div className="mt-2">
                <ImageUpload
                  onUpload={(files) => handleImageUpload(service.id, 'image1', files)}
                  accept="image/jpeg,image/png"
                  maxFiles={1}
                />
              </div>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">
              Thumbnail for Purpose Page <span className="text-destructive">*</span>
            </Label>
            {service.image2Preview ? (
              <img
                src={service.image2Preview}
                alt="Purpose Page"
                className="w-full h-32 object-cover rounded border mt-2"
              />
            ) : (
              <div className="mt-2">
                <ImageUpload
                  onUpload={(files) => handleImageUpload(service.id, 'image2', files)}
                  accept="image/jpeg,image/png"
                  maxFiles={1}
                />
              </div>
            )}
          </div>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`title-bangla-${service.id}`}>
              Title Bangla <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`title-bangla-${service.id}`}
              value={service.titleBangla}
              onChange={(e) => handleServiceChange(service.id, 'titleBangla', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`title-english-${service.id}`}>
              Title English <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`title-english-${service.id}`}
              value={service.titleEnglish}
              onChange={(e) => handleServiceChange(service.id, 'titleEnglish', e.target.value)}
            />
          </div>
        </div>

        {/* Tenor Management */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">
              Tenor Management <span className="text-destructive">*</span>
            </Label>
            <Button 
              size="sm" 
              onClick={() => handleAddTenor(service.id)}
            >
              <Plus className="w-4 h-4 mr-1" />
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
                    value={tenor.value || ''}
                    onChange={(e) => handleTenorChange(service.id, tenor.id, 'value', parseInt(e.target.value) || 0)}
                    placeholder="Enter value"
                    className="w-24"
                  />
                  <Select 
                    value={tenor.unit}
                    onValueChange={(value) => handleTenorChange(service.id, tenor.id, 'unit', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      {activeTab === 'loan' && <SelectItem value="months">Months</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTenor(service.id, tenor.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`detail-bangla-${service.id}`}>
              Detail Editor Bangla <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`detail-bangla-${service.id}`}
              value={service.detailBangla}
              onChange={(e) => handleServiceChange(service.id, 'detailBangla', e.target.value)}
              placeholder="বাংলা বিস্তারিত..."
              className="min-h-[100px] mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`detail-english-${service.id}`}>
              Detail Editor English <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`detail-english-${service.id}`}
              value={service.detailEnglish}
              onChange={(e) => handleServiceChange(service.id, 'detailEnglish', e.target.value)}
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
                {service.image1Preview && (
                  <img
                    src={service.image1Preview}
                    alt="Service"
                    className="w-full h-24 object-cover rounded"
                  />
                )}
                <h4 className="font-medium text-sm">{service.titleBangla}</h4>
                <div className="text-xs">
                  {service.tenors.map(tenor => `${tenor.value} ${tenor.unit === 'years' ? 'বছর' : 'মাস'}`).join(', ')}
                </div>
                <div className="text-sm">
                  {service.detailBangla || <span className="text-muted-foreground italic">বাংলা প্রিভিউ...</span>}
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="english">
            <Card className="p-3 max-w-sm">
              <div className="space-y-2">
                {service.image1Preview && (
                  <img
                    src={service.image1Preview}
                    alt="Service"
                    className="w-full h-24 object-cover rounded"
                  />
                )}
                <h4 className="font-medium text-sm">{service.titleEnglish}</h4>
                <div className="text-xs">
                  {service.tenors.map(tenor => `${tenor.value} ${tenor.unit}`).join(', ')}
                </div>
                <div className="text-sm">
                  {service.detailEnglish || <span className="text-muted-foreground italic">English preview...</span>}
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
          Manage loan and savings services
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="loan">Loan Services</TabsTrigger>
          <TabsTrigger value="savings">Savings Services</TabsTrigger>
        </TabsList>

        <TabsContent value="loan" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Loan Services ({loanServices.length})</h2>
            <Button onClick={handleAddService}>
              <Plus className="w-4 h-4 mr-2" />
              Add Loan
            </Button>
          </div>

          {loanServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No loan services added yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {loanServices.map(renderServiceForm)}
              <Button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full"
              >
                {isPublishing ? 'Publishing...' : 'Publish Loan Services'}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Savings Services ({savingsServices.length})</h2>
            <Button onClick={handleAddService}>
              <Plus className="w-4 h-4 mr-2" />
              Add Savings
            </Button>
          </div>

          {savingsServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No savings services added yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {savingsServices.map(renderServiceForm)}
              <Button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full"
              >
                {isPublishing ? 'Publishing...' : 'Publish Savings Services'}
              </Button>
            </div>
          )}
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
        title={`Publish ${publishType} services`}
        subtitle={`${publishType === 'loan' ? 'Loan services (with tenor values in years or months)' : 'Savings services'} will be visible in both Service Page and Application Purpose Page.`}
        confirmText="Publish now"
        onConfirm={confirmPublish}
      />
    </div>
  );
};

export default ServiceConfiguration;
