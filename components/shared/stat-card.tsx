import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
}

export default function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
          <Skeleton className="h-8 w-24 mb-2 bg-gray-200" />
          <Skeleton className="h-3 w-32 bg-gray-100" />
        </div>
        <div className="ml-4 p-3 bg-gray-50 rounded-lg">
          <Skeleton className="h-5 w-5 bg-gray-200" />
        </div>
      </div>
    </div>
  );
} 