import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OwnerProfileForm } from "@/components/owner/profile-form";

export default async function OwnerProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Handle error, maybe show a message
    console.error("Error fetching profile:", error);
    return <div>Could not load profile.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your personal information and avatar.
          </p>
        </div>

        {/* Profile Form */}
        <div className="space-y-8">
          <OwnerProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
} 