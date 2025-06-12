import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CarGrid } from "@/components/shared/car-grid";
import { PageSection } from "@/components/layout/page-section";
import { Car } from "@/lib/types/database";
import { User } from "@/lib/types/auth";

export default async function WishlistPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wishlist, error } = await supabase
    .from("wishlists")
    .select("*, car:cars(*)")
    .eq("customer_id", user.id);

  if (error) {
    console.error("Error fetching wishlist:", error);
    // You might want to show an error message to the user
    return (
      <PageSection>
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <p>Could not load your wishlist. Please try again later.</p>
      </PageSection>
    );
  }

  const wishlistedCars = wishlist?.map(item => ({
    ...(item.car as Car),
    is_wishlisted: true, // It's in the wishlist, so this is always true
  })) ?? [];

  // This is a bit of a hack since the CarGrid expects a User object from useAuth,
  // but here we are on the server. For the purpose of the WishlistButton,
  // we only need the user's ID, which we already have.
  const serverUser: User = {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata.full_name || 'User',
    role: user.user_metadata.role || 'customer',
    avatarUrl: user.user_metadata.avatar_url || null,
    createdAt: user.created_at,
  };

  return (
    <PageSection>
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {wishlistedCars.length > 0 ? (
        <CarGrid cars={wishlistedCars} user={serverUser} />
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40">
          <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
          <p className="mt-2 text-muted-foreground">
            Browse cars and click the heart to save them for later.
          </p>
        </div>
      )}
    </PageSection>
  );
}
