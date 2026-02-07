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
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BirthdayCakeSize } from "@/lib/types";
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

const formSchema = z.object({
  name: z.string().min(2, { message: "Tên cỡ bánh phải có ít nhất 2 ký tự." }),
  price: z.coerce.number().min(0, { message: "Giá không được là số âm." }),
  serving: z.string().min(2, { message: "Khẩu phần phải có ít nhất 2 ký tự." }),
  order: z.coerce.number().int({ message: "Thứ tự phải là số nguyên." }),
});

export type SizeFormValues = z.infer<typeof formSchema>;

interface SizeFormProps {
  isOpen: boolean;
  onClose: () => void;
  size: BirthdayCakeSize | null;
}

export function SizeForm({ isOpen, onClose, size }: SizeFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      serving: "",
      order: 0,
    },
  });

  useEffect(() => {
    if (isOpen && size) {
      form.reset(size);
    } else if (isOpen) {
      form.reset({
        name: "",
        price: 0,
        serving: "",
        order: 0,
      });
    }
  }, [isOpen, size, form]);

  const onSubmit = async (values: SizeFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);

    const id = size ? size.id : `size-${Date.now()}`;
    const docRef = doc(firestore, 'birthday_cake_sizes', id);
    const dataToSave = { id, ...values };

    try {
      await setDoc(docRef, dataToSave, { merge: !!size });
      toast({
        title: size ? "Cập nhật thành công!" : "Thêm thành công!",
        description: `Cỡ bánh "${values.name}" đã được lưu.`,
      });
      onClose();
    } catch (error) {
       const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: size ? 'update' : 'create',
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
          <DialogTitle>{size ? "Chỉnh sửa cỡ bánh" : "Thêm cỡ bánh mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho một cỡ bánh sinh nhật chuẩn.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên cỡ bánh</FormLabel>
                  <FormControl><Input placeholder="VD: Mini (R10 - Cao 10cm)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Giá</FormLabel>
                    <FormControl><Input type="number" placeholder="100000" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField control={form.control} name="order" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Thứ tự hiển thị</FormLabel>
                    <FormControl><Input type="number" placeholder="1" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField control={form.control} name="serving" render={({ field }) => (
                <FormItem>
                  <FormLabel>Khẩu phần</FormLabel>
                  <FormControl><Input placeholder="VD: 1-2 người ăn" {...field} /></FormControl>
                   <FormDescription>Gợi ý số người ăn cho khách hàng.</FormDescription>
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
