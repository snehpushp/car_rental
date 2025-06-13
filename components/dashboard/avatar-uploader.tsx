"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User, Upload } from "lucide-react";

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
    <div className="space-y-6">
      {/* Avatar Display */}
      <div className="flex justify-center">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-border">
            <AvatarImage src={previewUrl || currentAvatarUrl || ""} alt="Profile photo" />
            <AvatarFallback className="text-lg font-medium text-muted-foreground bg-muted">
              {fullName ? getInitials(fullName) : <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          {(previewUrl || currentAvatarUrl) && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            className="inline-flex items-center justify-center h-10 px-4 py-2 bg-background border border-border text-foreground hover:bg-muted font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            {selectedFile ? "Change Photo" : "Choose Photo"}
          </label>

          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="h-10 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          )}
        </div>

        {selectedFile && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, at least 400x400px
          </p>
        </div>
      </div>
    </div>
  );
}
