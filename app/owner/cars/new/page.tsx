import CarForm from "@/components/owner/car-form";
import { createCarAction } from "../actions";

export default function NewCarPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add a New Car</h1>
          <p className="text-sm text-gray-600 mt-1">
            Fill out the details below to list your car on the platform. High-quality images and a detailed description will attract more renters.
          </p>
        </div>
        
        {/* Car Form */}
        <CarForm onSubmit={createCarAction} />
      </div>
    </div>
  );
} 