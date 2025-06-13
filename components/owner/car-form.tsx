'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { carFormSchema } from '@/lib/validation/schemas';
import { Car } from '@/lib/types/database';
import { ImageUploader } from './image-uploader';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { LocationPicker } from '@/components/maps/location-picker';

export type CarFormValues = z.infer<typeof carFormSchema>;

interface CarFormProps {
  initialData?: Car;
  onSubmit: (data: CarFormValues) => Promise<any>;
}

// TODO: These should ideally come from a central config or database
const carTypes = ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'truck', 'van'];
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid'];
const transmissionTypes = ['manual', 'automatic'];

export default function CarForm({ initialData, onSubmit }: CarFormProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      type: initialData?.type || '',
      fuel_type: initialData?.fuel_type || '',
      transmission: initialData?.transmission || '',
      price_per_day: initialData?.price_per_day || 0,
      location_text: initialData?.location_text || '',
      description: initialData?.description || '',
      latitude: initialData?.latitude || 0,
      longitude: initialData?.longitude || 0,
      specs: {
        engine: initialData?.specs?.engine || '',
        horsepower: initialData?.specs?.horsepower || 0,
        seats: initialData?.specs?.seats || 4,
        doors: initialData?.specs?.doors || 4,
      },
      image_files: [],
      image_urls: initialData?.image_urls || [],
    },
  });

  const handleFormSubmit = async (values: CarFormValues) => {
    setIsSubmitting(true);
    toast.loading(initialData ? 'Updating car...' : 'Creating new car...');
    try {
      await onSubmit(values);
      toast.success(initialData ? 'Car updated successfully!' : 'Car created successfully!');
      router.push('/owner/cars');
      router.refresh(); // To show the new/updated car in the list
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <p className="text-sm text-gray-600 mt-1">Enter the essential details about your vehicle</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <FormField name="brand" render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Brand *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Toyota, BMW, Mercedes" 
                              {...field} 
                              className="mt-2 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                      </FormItem>
                  )} />
                </div>
                <div className="space-y-1">
                  <FormField name="model" render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Model *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Camry, X5, C-Class" 
                              {...field} 
                              className="mt-2 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                      </FormItem>
                  )} />
                </div>
                <div className="space-y-1">
                  <FormField name="year" render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Year *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 2023" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value, 10))} 
                              className="mt-2 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                      </FormItem>
                  )} />
                </div>
                <div className="space-y-1">
                  <FormField name="price_per_day" render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Daily Rate *</FormLabel>
                          <FormControl>
                            <div className="relative mt-2">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">$</span>
                              </div>
                              <Input 
                                type="number" 
                                placeholder="50" 
                                {...field} 
                                className="pl-8 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                      </FormItem>
                  )} />
                </div>
              </div>
            </div>
          </div>

          {/* Details & Specifications */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Details & Specifications</h3>
                  <p className="text-sm text-gray-600 mt-1">Provide detailed specifications to help customers make informed decisions</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Vehicle Type & Drivetrain */}
              <div className="mb-8">
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Vehicle Type & Drivetrain
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <FormField name="type" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">Car Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="mt-2 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                                    <SelectValue placeholder="Select vehicle type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {carTypes.map(t => (
                                    <SelectItem key={t} value={t} className="capitalize">
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                  </div>
                  <div className="space-y-1">
                    <FormField name="fuel_type" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">Fuel Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="mt-2 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                                    <SelectValue placeholder="Select fuel type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fuelTypes.map(f => (
                                    <SelectItem key={f} value={f} className="capitalize">
                                      {f}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                  </div>
                  <div className="space-y-1">
                    <FormField name="transmission" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">Transmission *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="mt-2 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                                    <SelectValue placeholder="Select transmission" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {transmissionTypes.map(t => (
                                    <SelectItem key={t} value={t} className="capitalize">
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Engine & Performance */}
              <div className="mb-8">
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Engine & Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <FormField name="specs.engine" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Engine</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. 2.5L 4-Cylinder Turbo" 
                              {...field} 
                              className="mt-2 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                  </div>
                  <div className="space-y-1">
                    <FormField name="specs.horsepower" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Horsepower</FormLabel>
                          <FormControl>
                            <div className="relative mt-2">
                              <Input 
                                type="number" 
                                placeholder="203" 
                                {...field} 
                                className="pr-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">HP</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Capacity & Features */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Capacity & Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <FormField name="specs.seats" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Seating Capacity</FormLabel>
                          <FormControl>
                            <div className="relative mt-2">
                              <Input 
                                type="number" 
                                placeholder="5" 
                                {...field} 
                                className="pr-16 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">seats</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                  </div>
                  <div className="space-y-1">
                    <FormField name="specs.doors" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">Number of Doors</FormLabel>
                          <FormControl>
                            <div className="relative mt-2">
                              <Input 
                                type="number" 
                                placeholder="4" 
                                {...field} 
                                className="pr-16 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">doors</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Location & Description</h3>
              <p className="text-sm text-gray-600 mt-1">Set your car's location and provide a detailed description</p>
            </div>
            <div className="p-6 space-y-6">
                <LocationPicker />
                <FormField name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                        <FormControl><Textarea placeholder="Tell us about your car" className="resize-none mt-1" rows={4} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
          </div>

          {/* Car Images */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Car Images</h3>
              <p className="text-sm text-gray-600 mt-1">Upload high-quality photos of your car to attract more customers</p>
            </div>
            <div className="p-6">
                <FormField
                    control={form.control}
                    name="image_files"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Upload Images</FormLabel>
                        <FormControl>
                            <ImageUploader
                                value={field.value}
                                onValueChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
            >
              {isSubmitting ? 'Submitting...' : (initialData ? 'Save Changes' : 'Create Car')}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
} 