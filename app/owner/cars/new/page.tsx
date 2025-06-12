import CarForm from "@/components/owner/car-form";
import { createCarAction } from "../actions";

export default function NewCarPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add a New Car</h1>
        <p className="text-muted-foreground mb-8">
          Fill out the details below to list your car on the platform. High-quality images and a detailed description will attract more renters.
        </p>
        <CarForm onSubmit={createCarAction} />
      </div>
    </div>
  );
} 