
'use client';
import { useState } from 'react';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Product, Ingredient, RecipeItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface RecipeEditorProps {
  product: Product;
  allIngredients: Ingredient[];
  isLoadingIngredients: boolean;
}

const recipeFormSchema = z.object({
  recipe: z.array(z.object({
    ingredientId: z.string().min(1, "Vui lòng chọn nguyên liệu."),
    quantity: z.coerce.number().min(0.01, "Số lượng phải lớn hơn 0."),
  }))
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export function RecipeEditor({ product, allIngredients, isLoadingIngredients }: RecipeEditorProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      recipe: product.recipe || [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recipe",
  });

  const getIngredientName = (id: string) => {
    const ingredient = allIngredients.find(i => i.id === id);
    return ingredient ? `${ingredient.name} (${ingredient.unit})` : 'Không rõ';
  };
  
  const onSubmit = async (values: RecipeFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const productRef = doc(firestore, 'cakes', product.id);

    try {
        await setDoc(productRef, { recipe: values.recipe }, { merge: true });
        toast({
            title: "Thành công!",
            description: `Công thức cho sản phẩm "${product.name}" đã được cập nhật.`
        });
    } catch (error) {
        console.error("Error saving recipe: ", error);
        toast({
            variant: 'destructive',
            title: "Lỗi",
            description: "Không thể lưu công thức."
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Công thức cho: {product.name}</CardTitle>
        <CardDescription>Định nghĩa các nguyên liệu và số lượng cần thiết để làm sản phẩm này.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Nguyên liệu</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead className="text-right">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`recipe.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn nguyên liệu..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingIngredients ? <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                                 : allIngredients.map(ing => (
                                  <SelectItem key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                       <FormField
                        control={form.control}
                        name={`recipe.${index}.quantity`}
                        render={({ field }) => (
                           <FormItem>
                                <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                </FormControl>
                                <FormMessage />
                           </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ ingredientId: '', quantity: 0 })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm nguyên liệu
            </Button>
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

