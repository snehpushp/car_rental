"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AvatarUploader } from "../dashboard/avatar-uploader";

type Profile = {
  id: string;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

interface OwnerProfileFormProps {
  profile: Profile;
}

const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." })
    .max(50, { message: "Full name must not exceed 50 characters." }),
  avatar_url: z.string().url().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function OwnerProfileForm({ profile }: OwnerProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      avatar_url: profile.avatar_url || null,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Your profile has been updated successfully.");
      router.refresh(); // Refresh the page to show new data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (newAvatarUrl: string) => {
    form.setValue("avatar_url", newAvatarUrl, { shouldValidate: true, shouldDirty: true });
    setPreviewUrl(null); // Clear preview to show the new avatar from the server
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-sm font-medium text-foreground">
                  Profile Photo
                </FormLabel>
                <FormControl>
                  <AvatarUploader
                    currentAvatarUrl={field.value}
                    onUploadSuccess={handleAvatarUpload}
                    fullName={form.watch("full_name")}
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground">
                  Full name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    className="h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600" />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !form.formState.isDirty}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-medium text-base shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 