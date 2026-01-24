
'use client';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface RecipeEditorProps {
  product: Product;
}

const recipeFormSchema = z.object({
  recipe: z.string().optional(),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export function RecipeEditor({ product }: RecipeEditorProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      recipe: product.recipe || "",
    }
  });

  const onSubmit = async (values: RecipeFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const productRef = doc(firestore, 'cakes', product.id);
    const dataToSave = { recipe: values.recipe };

    try {
        await setDoc(productRef, dataToSave, { merge: true });
        toast({
            title: "Thành công!",
            description: `Công thức cho sản phẩm "${product.name}" đã được cập nhật.`
        });
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: productRef.path,
            operation: 'update',
            requestResourceData: dataToSave
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Công thức cho: {product.name}</CardTitle>
        <CardDescription>Mô tả các thành phần và các bước để làm ra sản phẩm này.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
             <FormField
                control={form.control}
                name="recipe"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Mô tả công thức</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Vd: Lớp 1: Bạt bánh hạnh nhân..."
                        className="min-h-[200px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lưu Công thức'}
              </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
