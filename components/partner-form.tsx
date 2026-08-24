'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface FormData {
  companyName: string;
  companyType: string;
  city: string;
  country: string;
  businessNature: string;
  partnershipDescription: string;
  email: string;
  websiteUrl: string;
  contactNumber: string;
}

export default function PartnerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyType: '',
    city: '',
    country: '',
    businessNature: '',
    partnershipDescription: '',
    email: '',
    websiteUrl: '',
    contactNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission for static site
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({
        companyName: '',
        companyType: '',
        city: '',
        country: '',
        businessNature: '',
        partnershipDescription: '',
        email: '',
        websiteUrl: '',
        contactNumber: '',
      });
      setIsSubmitting(false);
    }, 1000);
  };

  if (submitStatus === 'success') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Application Submitted!</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Thank you for your interest in partnering with Gamana. Our team will review your application and get back to you within 2-3 business days.
            </p>
            <Button
              onClick={() => setSubmitStatus('idle')}
              className="mt-4 bg-gradient-to-r from-[#1A5F7A] to-[#37B8AF]"
            >
              Submit Another Application
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Partner Application Form</CardTitle>
        <CardDescription>
          Fill out the form below to express your interest in partnering with Gamana. We&apos;ll review your application and reach out soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyType">Type of Company *</Label>
            <Input
              id="companyType"
              name="companyType"
              value={formData.companyType}
              onChange={handleInputChange}
              placeholder="e.g., Tour Operator, Hotel, Restaurant"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessNature">Nature of Business *</Label>
            <Select
              value={formData.businessNature}
              onValueChange={(value) => handleSelectChange('businessNature', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tour-operator">Tour Operator</SelectItem>
                <SelectItem value="accommodation">Accommodation (Hotel/Hostel/Guesthouse)</SelectItem>
                <SelectItem value="restaurant">Restaurant/Cafe</SelectItem>
                <SelectItem value="transport">Transportation Services</SelectItem>
                <SelectItem value="attraction">Tourist Attraction/Museum</SelectItem>
                <SelectItem value="local-guide">Local Guide/Expert</SelectItem>
                <SelectItem value="content-creator">Content Creator/Narrator</SelectItem>
                <SelectItem value="event-organizer">Event/Festival Organizer</SelectItem>
                <SelectItem value="retail">Retail/Souvenir Shop</SelectItem>
                <SelectItem value="technology">Technology Provider</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnershipDescription">Partnership Description *</Label>
            <Textarea
              id="partnershipDescription"
              name="partnershipDescription"
              value={formData.partnershipDescription}
              onChange={handleInputChange}
              placeholder="Describe the kind of partnership you're looking for and how you envision working with Gamana..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#1A5F7A] to-[#37B8AF] hover:from-[#164d5f] hover:to-[#2d9488]"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            * Required fields
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
