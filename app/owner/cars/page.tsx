import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

const createServerFetch = () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  return async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(options.headers);
    if (session) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }
    
    const fullUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const response = await fetch(fullUrl.toString(), {
      ...options,
      headers,
      cache: 'no-store', // Ensure fresh data for the management table
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error:', response.status, errorBody);
      throw new Error(`Failed to fetch ${url}`);
    }
    
    return response.json();
  };
};

async function CarsDataTable() {
  const serverFetch = createServerFetch();
  const response = await serverFetch('/api/owner/cars');
  
  // The API returns { data: cars, pagination: ... }
  // So we pass response.data to the DataTable
  const cars = response.data || [];

  return <DataTable columns={columns} data={cars} />;
}

export default function CarManagementPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Cars</h1>
        <Link href="/owner/cars/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CarsDataTable />
      </Suspense>
    </div>
  );
} 