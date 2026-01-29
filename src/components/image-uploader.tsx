'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string; // The imageUrl
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/api/upload-cloudinary', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          const { imageUrl } = await response.json();
          onChange(imageUrl);
          toast({ title: "Thành công", description: "Ảnh đã được tải lên." });

        } catch (error) {
          toast({
            variant: "destructive",
            title: "Lỗi tải lên",
            description: (error as Error).message || "Không thể tải ảnh lên. Vui lòng thử lại.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [onChange, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.gif'] },
    multiple: false,
    disabled: isLoading || disabled,
  });

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden border">
          <Image src={value} alt="Xem trước ảnh" fill className="object-cover" />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={removeImage}
              disabled={isLoading || disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'w-full aspect-[4/3] border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors',
            isDragActive && 'border-primary bg-primary/10',
            (isLoading || disabled) && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Đang tải lên...</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Kéo thả ảnh vào đây, hoặc <span className="text-primary">bấm để chọn file</span>
              </p>
              <p className="text-xs text-muted-foreground/80">PNG, JPG, GIF, WEBP</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
