"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  carId: string;
  ownerId: string;
  initialIsWishlisted: boolean;
  userId: string | null;
  userRole: string | null;
}

export function WishlistButton({ carId, ownerId, initialIsWishlisted, userId, userRole }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleWishlistToggle = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    const previousIsWishlisted = isWishlisted;
    setIsWishlisted(!isWishlisted);

    startTransition(async () => {
      const method = !isWishlisted ? "POST" : "DELETE";
      const url = !isWishlisted
        ? "/api/wishlist"
        : `/api/wishlist/${carId}`;
      
      const body = !isWishlisted ? JSON.stringify({ car_id: carId }) : null;
      const headers = !isWishlisted ? { "Content-Type": "application/json" } : {};

      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
        });

        if (!response.ok) {
          throw new Error("Failed to update wishlist.");
        }
        
        toast.success(isWishlisted ? "Removed from wishlist." : "Added to wishlist.");

        // Optionally revalidate data if needed elsewhere
        router.refresh();

      } catch (error) {
        setIsWishlisted(previousIsWishlisted);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  if (userRole === 'owner' || userId === ownerId) {
    return null;
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white disabled:opacity-70"
      onClick={handleWishlistToggle}
      disabled={isPending}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"
        )}
      />
    </Button>
  );
}
