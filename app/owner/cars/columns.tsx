"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Car } from "@/lib/types/database"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

async function deleteCar(carId: string, token: string | null) {
  const response = await fetch(`/api/owner/cars/${carId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete car');
  }
  return response.json();
}

async function toggleAvailability(carId: string, isAvailable: boolean, token: string | null) {
  const response = await fetch(`/api/owner/cars/${carId}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ is_available: isAvailable }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to ${isAvailable ? 'list' : 'unlist'} car`);
  }
  return response.json();
}

export const columns: ColumnDef<Car>[] = [
  {
    accessorKey: "brand",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Brand
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "price_per_day",
    header: "Price/Day",
    cell: ({ row }) => formatCurrency(row.original.price_per_day),
  },
  {
    accessorKey: "is_available",
    header: "Status",
    cell: ({ row }) => {
        const isAvailable = row.getValue("is_available")
        return <Badge variant={isAvailable ? "default" : "destructive"}>{isAvailable ? "Available" : "Unavailable"}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const car = row.original
      const { session } = useAuth();
      const router = useRouter();

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this car? This action cannot be undone.")) {
            return;
        }
        toast.loading("Deleting car...");
        try {
            await deleteCar(car.id, session?.access_token || null);
            toast.success("Car deleted successfully!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        }
      }

      const handleToggleAvailability = async () => {
        const newAvailability = !car.is_available;
        toast.loading(newAvailability ? "Listing car..." : "Unlisting car...");
        try {
            await toggleAvailability(car.id, newAvailability, session?.access_token || null);
            toast.success(`Car has been ${newAvailability ? 'listed' : 'unlisted'}!`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href={`/owner/cars/edit/${car.id}`}>Edit Car</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleAvailability}>
              {car.is_available ? "Make Unavailable" : "Make Available"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 