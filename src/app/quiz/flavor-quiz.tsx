"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { recommendCake } from "@/ai/flows/flavor-recommendation-quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Product } from "@/lib/types";

const formSchema = z.object({
  preferredFruits: z.string().min(1, "Vui lòng nhập ít nhất một loại trái cây."),
  sweetnessLevel: z.enum(["not_too_sweet", "moderately_sweet", "very_sweet"], {
    required_error: "Vui lòng chọn mức độ ngọt ưa thích của bạn.",
  }),
  occasion: z.enum(["birthday", "anniversary", "casual", "gift"], {
    required_error: "Vui lòng chọn một dịp.",
  }),
  personalityTraits: z.string().min(1, "Vui lòng mô tả tính cách của bạn."),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: "step1", fields: ["preferredFruits"] },
  { id: "step2", fields: ["sweetnessLevel"] },
  { id: "step3", fields: ["occasion"] },
  { id: "step4", fields: ["personalityTraits"] },
];

export function FlavorQuiz() {
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'cakes') : null, [firestore]);
  const { data: products } = useCollection<Product>(productsCollection);

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    cakeName: string;
    reason: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredFruits: "",
      sweetnessLevel: undefined,
      occasion: undefined,
      personalityTraits: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const result = await recommendCake(data);
      const recommendedProductName = result.cakeRecommendation.split('(')[0].trim();
      setRecommendation({ cakeName: recommendedProductName, reason: result.addCartLink });
    } catch (error) {
      console.error("Lỗi khi nhận đề xuất:", error);
      // Handle error state in UI
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = async () => {
    const fields = steps[currentStep].fields as (keyof FormData)[];
    const output = await form.trigger(fields, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
        await form.handleSubmit(onSubmit)();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const recommendedProduct = products?.find(p => p.name.toLowerCase() === recommendation?.cakeName.toLowerCase());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground font-headline">Đang tìm chiếc bánh hoàn hảo cho bạn...</p>
      </div>
    );
  }

  if (recommendation) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Chúng tôi đã tìm thấy chiếc bánh hoàn hảo cho bạn!</CardTitle>
          <CardDescription>{recommendation.reason}</CardDescription>
        </CardHeader>
        <CardContent>
            {recommendedProduct ? (
                <ProductCard product={recommendedProduct} />
            ) : (
                <p className="text-center text-muted-foreground">Không tìm thấy sản phẩm được đề xuất. Nhưng chúng tôi nghĩ bạn sẽ thích lựa chọn của chúng tôi!</p>
            )}
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={() => { setRecommendation(null); setCurrentStep(0); form.reset(); }}>
                Làm lại trắc nghiệm
            </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-center text-3xl">
          Tìm Hương Vị Hoàn Hảo Của Bạn
        </CardTitle>
        <CardDescription className="text-center">
          Trả lời một vài câu hỏi và chúng tôi sẽ giới thiệu chiếc bánh Entremet hoàn hảo cho bạn.
        </CardDescription>
        <Progress value={(currentStep + 1) * 25} className="mt-4" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            {currentStep === 0 && (
              <FormField
                control={form.control}
                name="preferredFruits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Loại trái cây yêu thích của bạn là gì? (ví dụ: dâu, xoài, chanh dây)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập loại trái cây yêu thích của bạn..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {currentStep === 1 && (
              <FormField
                control={form.control}
                name="sweetnessLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg">Bạn thích món tráng miệng ngọt đến mức nào?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="not_too_sweet" />
                          </FormControl>
                          <FormLabel className="font-normal">Không quá ngọt, tôi thích có vị chua nhẹ.</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="moderately_sweet" />
                          </FormControl>
                          <FormLabel className="font-normal">Cân bằng và ngọt vừa phải.</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="very_sweet" />
                          </FormControl>
                          <FormLabel className="font-normal">Tôi là người hảo ngọt, cứ mang ra đây!</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
             {currentStep === 2 && (
              <FormField
                control={form.control}
                name="occasion"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg">Dịp này là gì?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="birthday" />
                          </FormControl>
                          <FormLabel className="font-normal">Một bữa tiệc sinh nhật</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="anniversary" />
                          </FormControl>
                          <FormLabel className="font-normal">Một ngày kỷ niệm lãng mạn hoặc buổi hẹn hò</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="casual" />
                          </FormControl>
                          <FormLabel className="font-normal">Một món ăn vặt cho bản thân hoặc với bạn bè</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="gift" />
                          </FormControl>
                          <FormLabel className="font-normal">Một món quà thanh lịch cho người đặc biệt</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {currentStep === 3 && (
                 <FormField
                    control={form.control}
                    name="personalityTraits"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-lg">Mô tả tính cách của bạn bằng một vài từ. (ví dụ: thích phiêu lưu, cổ điển, tinh tế)</FormLabel>
                        <FormControl>
                        <Input placeholder="Nhập một vài đặc điểm tính cách..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
          Trước
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Nhận Đề Xuất" : "Tiếp theo"}
        </Button>
      </CardFooter>
    </Card>
  );
}
