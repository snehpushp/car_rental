'use client';

import { UploadCloud, X } from 'lucide-react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import { forwardRef, useState, useImperativeHandle } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: File[];
  onValueChange: (value: File[]) => void;
  dropzoneOptions?: DropzoneOptions;
}

interface FileUploaderRef {
  reset: () => void;
}

const ImageUploader = forwardRef<FileUploaderRef, FileUploaderProps>(
  ({ value, onValueChange, dropzoneOptions, className, ...props }, ref) => {
    const [files, setFiles] = useState<File[]>(value || []);

    const onDrop = (acceptedFiles: File[], rejectedFiles: any) => {
      if (rejectedFiles.length) {
        // You can handle rejected files here, e.g., show a toast
        console.error('Rejected files:', rejectedFiles);
      }

      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      onValueChange(newFiles);
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onValueChange(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      ...dropzoneOptions,
    });

    useImperativeHandle(ref, () => ({
      reset: () => setFiles([]),
    }));

    return (
      <div>
        <div
          {...getRootProps()}
          className={twMerge(
            'group relative grid h-48 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragActive && 'border-primary',
            className
          )}
          {...props}
        >
          <Input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Drag and drop images here, or click to select files.
            </p>
            <p className="text-xs text-muted-foreground">
              (Max 5 images, up to 5MB each)
            </p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file, i) => (
              <div key={i} className="relative aspect-square w-full rounded-md">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  fill
                  className="rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                  onClick={() => removeFile(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ImageUploader.displayName = 'ImageUploader';

export { ImageUploader }; 