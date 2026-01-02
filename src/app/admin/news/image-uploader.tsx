'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setIsLoading(true);
        // Simulate upload
        setTimeout(() => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            // In a real app, you would upload to a server/storage and get back a URL
            // For this demo, we'll use a placeholder from picsum.photos
            const fakeUrl = `https://picsum.photos/seed/${Math.random()}/1200/800`;
            onChange(fakeUrl);
            setIsLoading(false);
            toast({ title: "Thành công", description: "Ảnh đã được tải lên." });
          };
          reader.onerror = () => {
            setIsLoading(false);
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể đọc file ảnh." });
          };
          reader.readAsDataURL(file);
        }, 1500);
      }
    },
    [onChange, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
  });

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden">
          <Image src={value} alt="Xem trước ảnh bìa" fill className="object-cover" />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={removeImage}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
           {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'w-full aspect-[3/2] border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors',
            isDragActive && 'border-primary bg-primary/10'
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
              <p className="text-xs text-muted-foreground/80">PNG, JPG, WEBP, ...</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
