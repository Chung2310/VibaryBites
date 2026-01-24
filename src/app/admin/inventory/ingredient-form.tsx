
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
import type { Ingredient } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }),
  stock: z.coerce.number().min(0, { message: "Tồn kho không được là số âm." }),
  unit: z.enum(["g", "kg", "ml", "l", "units"], { required_error: "Vui lòng chọn đơn vị." }),
  parLevel: z.coerce.number().min(0, { message: "Ngưỡng không được là số âm." }),
});

export type IngredientFormValues = z.infer<typeof formSchema>;

interface IngredientFormProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
}

export function IngredientForm({ isOpen, onClose, ingredient }: IngredientFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      stock: 0,
      parLevel: 0,
      unit: "g",
    },
  });

  useEffect(() => {
    if (isOpen && ingredient) {
      form.reset(ingredient);
    } else if (isOpen) {
      form.reset({
        name: "",
        stock: 0,
        parLevel: 0,
        unit: "g",
      });
    }
  }, [isOpen, ingredient, form]);

  const onSubmit = async (values: IngredientFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);

    const id = ingredient ? ingredient.id : `ing-${Date.now()}`;
    const docRef = doc(firestore, 'ingredients', id);
    const dataToSave = { id, ...values };

    try {
      await setDoc(docRef, dataToSave, { merge: !!ingredient });
      toast({
        title: ingredient ? "Cập nhật thành công!" : "Thêm thành công!",
        description: `Nguyên liệu "${values.name}" đã được lưu.`,
      });
      onClose();
    } catch (error) {
       const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: ingredient ? 'update' : 'create',
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
          <DialogTitle>{ingredient ? "Chỉnh sửa nguyên liệu" : "Thêm nguyên liệu mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho nguyên liệu trong kho của bạn.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nguyên liệu</FormLabel>
                  <FormControl><Input placeholder="Kem tươi (Whipping Cream)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tồn kho</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">g (gram)</SelectItem>
                        <SelectItem value="kg">kg (kilogram)</SelectItem>
                        <SelectItem value="ml">ml (milliliter)</SelectItem>
                        <SelectItem value="l">l (liter)</SelectItem>
                        <SelectItem value="units">units (đơn vị)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField control={form.control} name="parLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngưỡng báo hết hàng</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
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
