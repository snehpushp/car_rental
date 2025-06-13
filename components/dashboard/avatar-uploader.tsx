"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  onUploadSuccess: (newAvatarUrl: string) => void;
  fullName: string | null;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

export function AvatarUploader({
  currentAvatarUrl,
  onUploadSuccess,
  fullName,
  previewUrl,
  setPreviewUrl,
}: AvatarUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Avatar upload failed");
      }

      const { avatar_url } = await response.json();
      onUploadSuccess(avatar_url);
      toast.success("Avatar updated successfully.");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={previewUrl || currentAvatarUrl || ""} alt="Avatar" />
        <AvatarFallback>
          {fullName ? getInitials(fullName) : <User className="w-8 h-8" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center space-x-2">
        <Input
          type="file"
          id="avatar-upload"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label
          htmlFor="avatar-upload"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
        >
          {selectedFile ? "Change Image" : "Select Image"}
        </label>

        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        )}
      </div>
      {selectedFile && (
        <p className="text-sm text-muted-foreground truncate max-w-xs">
          Selected: {selectedFile.name}
        </p>
      )}
    </div>
  );
}
