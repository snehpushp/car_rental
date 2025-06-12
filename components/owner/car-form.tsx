'use client';

import { useForm } from 'react-hook-form';
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

type CarFormValues = z.infer<typeof carFormSchema>;

interface CarFormProps {
  initialData?: Car;
  onSubmit: (data: CarFormValues, token: string | null) => Promise<any>;
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
      ...initialData,
      specs: {
        engine: initialData?.specs?.engine || '',
        horsepower: initialData?.specs?.horsepower || 0,
        seats: initialData?.specs?.seats || 0,
        doors: initialData?.specs?.doors || 0,
      },
      image_files: [],
      // For editing, we'll handle existing images separately
    },
  });

  const handleFormSubmit = async (values: CarFormValues) => {
    setIsSubmitting(true);
    toast.loading(initialData ? 'Updating car...' : 'Creating new car...');
    try {
      await onSubmit(values, session?.access_token || null);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField name="brand" render={({ field }) => (
                <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl><Input placeholder="e.g. Toyota" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField name="model" render={({ field }) => (
                <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl><Input placeholder="e.g. Camry" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="year" render={({ field }) => (
                <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 2023" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="price_per_day" render={({ field }) => (
                <FormItem>
                    <FormLabel>Price per Day ($)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 50" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Details & Specifications</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                <FormField name="type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Car Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                            <SelectContent>{carTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="fuel_type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a fuel type" /></SelectTrigger></FormControl>
                            <SelectContent>{fuelTypes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField name="transmission" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger></FormControl>
                            <SelectContent>{transmissionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
             <CardContent className="grid md:grid-cols-2 gap-6">
                 <FormField name="specs.engine" render={({ field }) => (
                    <FormItem><FormLabel>Engine</FormLabel><FormControl><Input placeholder="e.g. 2.5L 4-Cylinder" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="specs.horsepower" render={({ field }) => (
                    <FormItem><FormLabel>Horsepower</FormLabel><FormControl><Input type="number" placeholder="e.g. 203" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="specs.seats" render={({ field }) => (
                    <FormItem><FormLabel>Seats</FormLabel><FormControl><Input type="number" placeholder="e.g. 5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="specs.doors" render={({ field }) => (
                    <FormItem><FormLabel>Doors</FormLabel><FormControl><Input type="number" placeholder="e.g. 4" {...field} /></FormControl><FormMessage /></FormMessage>
                )} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Location & Description</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <FormField name="location_text" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                         <FormControl><Input placeholder="Enter a full address" {...field} /></FormControl>
                        <FormDescription>We'll convert this to coordinates automatically.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Tell us about your car" className="resize-none" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Car Images</CardTitle></CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="image_files"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Upload Images</FormLabel>
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
            </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : (initialData ? 'Save Changes' : 'Create Car')}
        </Button>
      </form>
    </Form>
  );
} 