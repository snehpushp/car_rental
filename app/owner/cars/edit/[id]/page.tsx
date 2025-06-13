import CarForm from "@/components/owner/car-form";
import { updateCarAction } from "../../actions";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Car } from "@/lib/types/database";

interface EditCarPageProps {
    params: {
        id: string;
    }
}

async function getCarData(carId: string): Promise<Car | null> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: car, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();
    
    if (error) {
        console.error("Failed to fetch car for editing:", error);
        return null;
    }

    return car;
}


export default async function EditCarPage({ params }: EditCarPageProps) {
  const carData = await getCarData(params.id);

  if (!carData) {
    notFound();
  }

  // Bind the carId to the update action
  const updateActionWithId = updateCarAction.bind(null, params.id);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Your Car</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update the details for your car. Keeping your listing accurate helps attract the right customers.
          </p>
        </div>
        
        {/* Car Form */}
        <CarForm 
            initialData={carData}
            onSubmit={updateActionWithId} 
        />
      </div>
    </div>
  );
} 