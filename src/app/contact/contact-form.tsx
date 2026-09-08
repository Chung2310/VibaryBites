'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  name: z.string().min(2, "Tên quá ngắn"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  message: z.string().min(10, "Tin nhắn phải có ít nhất 10 ký tự"),
});


export function ContactForm() {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    console.log(values);
    alert("Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ liên hệ lại với bạn sớm.");
    form.reset({ name: "", email: "", message: ""});
  }


return (<Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên</FormLabel>
                                        <FormControl><Input placeholder="Tên của bạn" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>

                                        <FormControl><Input type="email" placeholder="email@cuaban.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="message" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tin nhắn</FormLabel>
                                        <FormControl><Textarea placeholder="Chúng tôi có thể giúp gì cho bạn?" {...field} rows={5} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit">Gửi Tin Nhắn</Button>
                            </form>
                        </Form>);
}
