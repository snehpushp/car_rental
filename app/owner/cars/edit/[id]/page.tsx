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
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Your Car</h1>
        <p className="text-muted-foreground mb-8">
          Update the details for your car. Keeping your listing accurate helps attract the right customers.
        </p>
        <CarForm 
            initialData={carData}
            onSubmit={updateActionWithId} 
        />
      </div>
    </div>
  );
} 