
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import type { ProductCategory } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { generateSlug } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự." }),
  subtitle: z.string().min(2, { message: "Tiêu đề phụ phải có ít nhất 2 ký tự." }),
  description: z.string().min(10, { message: "Mô tả phải có ít nhất 10 ký tự." }),
});

export type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
}

export function CategoryForm({ isOpen, onClose, category }: CategoryFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen && category) {
      form.reset(category);
    } else if (isOpen) {
      form.reset({
        title: "",
        subtitle: "",
        description: "",
      });
    }
  }, [isOpen, category, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);

    const id = category ? category.id : `cat-${Date.now()}`;
    const slug = generateSlug(values.title);
    const docRef = doc(firestore, 'categories', id);
    const dataToSave = { id, slug, ...values };

    try {
      await setDoc(docRef, dataToSave, { merge: !!category });
      toast({
        title: category ? "Cập nhật thành công!" : "Thêm thành công!",
        description: `Danh mục "${values.title}" đã được lưu.`,
      });
      onClose();
    } catch (error) {
       const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: category ? 'update' : 'create',
          requestResourceData: dataToSave
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho danh mục sản phẩm.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl><Input placeholder="Bánh Sinh Nhật" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="subtitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề phụ</FormLabel>
                  <FormControl><Input placeholder="DÀNH CHO 2-10 NGƯỜI" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl><Textarea placeholder="Mô tả chi tiết về danh mục này..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
